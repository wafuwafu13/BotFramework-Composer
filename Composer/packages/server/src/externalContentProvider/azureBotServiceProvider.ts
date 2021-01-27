// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { join } from 'path';
import { createWriteStream } from 'fs';

import fetch, { RequestInit } from 'node-fetch';
import { remove, ensureDirSync } from 'fs-extra';
import AdmZip from 'adm-zip';

// import { authService } from '../services/auth/auth';

import { IContentProviderMetadata, ExternalContentProvider } from './externalContentProvider';

// function prettyPrintError(err: string | Error): string {
//   if (typeof err === 'string') {
//     return err;
//   }
//   if (err?.message) {
//     return err.message;
//   }
//   return '';
// }

export type AzureBotServiceMetadata = IContentProviderMetadata & {
  /** ABS channel ID */
  botId?: string;
  /** bot name */
  botName?: string;
  /** Azure App Id */
  appId: string;
  /** keyvault id for Azure App password */
  appPasswordHint: string;
  /** Azure Subscription Id */
  subscriptionId: string;
  /** Azure resource group name */
  resourceGroup?: string;
  /** ABS Channel uniq ID */
  resourceId: string;
  tags?: {
    /** serviceName */
    webapp?: string;
  };
};

export class AzureBotServiceProvider extends ExternalContentProvider<AzureBotServiceMetadata> {
  private tempBotAssetsDir = join(process.env.COMPOSER_TEMP_DIR as string, 'abs-assets');
  private botName = '';

  constructor(metadata: AzureBotServiceMetadata) {
    super(metadata);
  }

  public async downloadBotContent() {
    const options: RequestInit = {
      method: 'GET',
      headers: await this.getRequestHeaders(),
    };

    // download
    if (!this.metadata.tags || !this.metadata.tags.webapp) {
      throw { message: 'No webapp available', status: 404 };
    }
    const url = this.getBotContentUrl(this.metadata);
    const result = await fetch(url, options);
    if (!result || !result.body) {
      throw new Error('Response containing zip does not have a body');
    }

    ensureDirSync(this.tempBotAssetsDir);
    const zipPath = join(this.tempBotAssetsDir, `bot-assets-${this.metadata.botName}-${Date.now()}.zip`);
    const writeStream = createWriteStream(zipPath);
    await new Promise((resolve, reject) => {
      writeStream.once('finish', resolve);
      writeStream.once('error', reject);
      result.body.pipe(writeStream);
    });
    await this.syncWithProjectContent(zipPath);

    return {
      zipPath: zipPath,
      eTag: '',
      urlSuffix: this.getDeepLink(),
    };
  }

  public async cleanUp() {
    await remove(this.tempBotAssetsDir);
  }

  private async syncWithProjectContent(zipPath: string) {
    const zip = new AdmZip(zipPath);

    // Read botName from zip file
    const botprojEntries = zip.getEntries().filter((entry) => entry.entryName.endsWith('.botproj'));
    if (botprojEntries.length) {
      this.botName = botprojEntries[0].entryName;
    } else {
      this.botName = '';
    }

    // Write publish profile to settings.publishTargets.
    // Alternation: in client's creation modal, create publish profile by using payload in url params
    const appsettingsEntry = zip.getEntry('settings/appsettings.json');
    const appsettings: any = JSON.parse(appsettingsEntry.getData().toString());
    const profile = this.profileMapping();

    const newProfile = {
      name: `abs-${this.metadata.botName}`,
      type: 'azurePublish',
      configuration: JSON.stringify(profile),
    };
    if (Array.isArray(appsettings.publishTargets)) {
      // check existed
      const origin = appsettings.publishTargets.findIndex((item) => item.name === newProfile.name);
      if (origin >= 0) {
        // replace
        appsettings.publishTargets[origin] = newProfile;
      } else {
        appsettings.publishTargets.push(newProfile);
      }
    } else {
      appsettings.publishTargets = [newProfile];
    }
    appsettingsEntry.setData(JSON.stringify(appsettings, null, '\t'));

    zip.writeZip(zipPath);
  }

  public async getAlias() {
    // To load correct project, alias should be project name as the project's URI.
    console.log(this.botName);
    return `abs-${this.metadata.botName}-${this.metadata.appId}`;
  }
  public async authenticate() {
    return await this.getAccessToken();
  }

  private profileMapping() {
    if (this.metadata) {
      return {
        hostname: this.metadata.tags?.webapp,
        runtimeIdentifier: 'win-x64',
        settings: {
          MicrosoftAppId: this.metadata.appId,
          MicrosoftAppPassword: this.metadata.appPassword || '',
        },
        abs: this.metadata,
      };
    }
    return null;
  }
  private async getAccessToken(): Promise<string> {
    return 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Im5PbzNaRHJPRFhFSzFqS1doWHNsSFJfS1hFZyIsImtpZCI6Im5PbzNaRHJPRFhFSzFqS1doWHNsSFJfS1hFZyJ9.eyJhdWQiOiJodHRwczovL21hbmFnZW1lbnQuY29yZS53aW5kb3dzLm5ldC8iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC83MmY5ODhiZi04NmYxLTQxYWYtOTFhYi0yZDdjZDAxMWRiNDcvIiwiaWF0IjoxNjExNjQ2MTM0LCJuYmYiOjE2MTE2NDYxMzQsImV4cCI6MTYxMTY1MDAzNCwiX2NsYWltX25hbWVzIjp7Imdyb3VwcyI6InNyYzEifSwiX2NsYWltX3NvdXJjZXMiOnsic3JjMSI6eyJlbmRwb2ludCI6Imh0dHBzOi8vZ3JhcGgud2luZG93cy5uZXQvNzJmOTg4YmYtODZmMS00MWFmLTkxYWItMmQ3Y2QwMTFkYjQ3L3VzZXJzLzhhZGU1NWQ3LWE1MzYtNDE2NS1hYTJmLTgwZWNmNzBjMzZmMy9nZXRNZW1iZXJPYmplY3RzIn19LCJhY3IiOiIxIiwiYWlvIjoiQVVRQXUvOFNBQUFBZWZnc1kycXA4NXJGTlZsQXZqbXpzNHE4Vjk1TWpkS2doOVVVcFpSbjVxeTZVUkRBQ3RvNEJ3Q2pqWGZMSXZmQzlDdHMzVVVDNDdLNkJPQW5xS0JuZVE9PSIsImFtciI6WyJyc2EiLCJtZmEiXSwiYXBwaWQiOiIwNGIwNzc5NS04ZGRiLTQ2MWEtYmJlZS0wMmY5ZTFiZjdiNDYiLCJhcHBpZGFjciI6IjAiLCJkZXZpY2VpZCI6ImZiZTI0ZWI0LTI2YTItNGNkZC05YmE0LTE4ZjNmNGEyMWJmNyIsImZhbWlseV9uYW1lIjoiTHVvIiwiZ2l2ZW5fbmFtZSI6IldlbnlpIiwiaXBhZGRyIjoiMTY3LjIyMC4yMzMuMSIsIm5hbWUiOiJXZW55aSBMdW8iLCJvaWQiOiI4YWRlNTVkNy1hNTM2LTQxNjUtYWEyZi04MGVjZjcwYzM2ZjMiLCJvbnByZW1fc2lkIjoiUy0xLTUtMjEtMjE0Njc3MzA4NS05MDMzNjMyODUtNzE5MzQ0NzA3LTIyNTAzNzIiLCJwdWlkIjoiMTAwM0JGRkRBMjg4MEZGMSIsInJoIjoiMC5BUm9BdjRqNWN2R0dyMEdScXkxODBCSGJSNVYzc0FUYmpScEd1LTRDLWVHX2UwWWFBT0EuIiwic2NwIjoidXNlcl9pbXBlcnNvbmF0aW9uIiwic3ViIjoiOHRZQ1V6WndWMmlXVHNxYlFxVkVLME1NWFlSSzZMMkNBVTY2VU14ekt2MCIsInRpZCI6IjcyZjk4OGJmLTg2ZjEtNDFhZi05MWFiLTJkN2NkMDExZGI0NyIsInVuaXF1ZV9uYW1lIjoid2VueWx1b0BtaWNyb3NvZnQuY29tIiwidXBuIjoid2VueWx1b0BtaWNyb3NvZnQuY29tIiwidXRpIjoicEk4SEZ0UFdja2FZTFdiUnY2Y05BUSIsInZlciI6IjEuMCIsIndpZHMiOlsiYjc5ZmJmNGQtM2VmOS00Njg5LTgxNDMtNzZiMTk0ZTg1NTA5Il0sInhtc190Y2R0IjoxMjg5MjQxNTQ3fQ.Pq94w2JOQlzGgIvrsWrrzWllg-Pne8uxfwVT5ygJfzyJVJhn8qSaKpTpJD3EsQp-XTTY2j3vdmlS0r2ptTjKbb-qA4wEVU3d6nplzWVsoWJ7X6KZ-aFW88mE9FfOYUtFXe-o-EKgzZPGRLcBsgq314MGFnBmH8pyGdYDzq8WGx3YVnEQZw3PENJm98WdPJFkNoSbM2KtQDekKaajslr7__EFmRkSWBUNpCEDwlg4VUUiGjUOQX9dlsyUYlCNtzxIu8ssfyC1i77htCHjrt7oA8wQ-bIWrL-ShlfpaHpyub1cr6HsSf-YApRswvt2azdXxOiE1EaAZRVVj5-clKAq8w';
    // try {
    //   // TODO: impl Azure auth
    //   const accessToken = await authService.getAccessToken({
    //     targetResource: 'https://management.core.windows.net/',
    //   });
    //   if (accessToken === '') {
    //     throw 'User cancelled login flow.';
    //   }
    //   return accessToken;
    // } catch (error) {
    //   throw `Error while trying to get access token: ${prettyPrintError(error)}`;
    // }
  }

  private getBotContentUrl(metadata: AzureBotServiceMetadata) {
    const { tags } = metadata;
    const botServiceHost = `https://${tags?.webapp}.scm.azurewebsites.net`;
    // TODO: make sure the publish profile lives in there.
    const downloadZipUrl = `${botServiceHost}/api/zip/site/wwwroot/ComposerDialogs`;
    return downloadZipUrl;
  }

  private async getRequestHeaders() {
    const { tenantId } = this.metadata;
    const token = await this.getAccessToken();
    return {
      Authorization: `Bearer ${token}`,
      'X-CCI-TenantId': tenantId,
      'X-CCI-Routing-TenantId': tenantId,
    };
  }

  private getDeepLink(): string {
    // use metadata (if provided) to create a deep link to a specific dialog / trigger / action etc. after opening bot.
    let deepLink = '';
    const { dialogId, triggerId, actionId = '' } = this.metadata;

    if (dialogId) {
      deepLink += `dialogs/${dialogId}`;
    }
    if (dialogId && triggerId) {
      deepLink += `?selected=triggers[${encodeURIComponent(`"${triggerId}"`)}]`;
    }
    if (dialogId && triggerId && actionId) {
      deepLink += `&focused=triggers[${encodeURIComponent(`"${triggerId}"`)}].actions[${encodeURIComponent(
        `"${actionId}"`
      )}]`;
    }
    // base64 encode to make parsing on the client side easier
    return Buffer.from(deepLink, 'utf-8').toString('base64');
  }
}
