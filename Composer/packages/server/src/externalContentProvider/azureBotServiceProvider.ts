// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { join } from 'path';
import { createWriteStream } from 'fs';

import fetch, { RequestInit } from 'node-fetch';
import { remove, ensureDirSync } from 'fs-extra';
import AdmZip from 'adm-zip';

import { IContentProviderMetadata, ExternalContentProvider } from './externalContentProvider';

function prettyPrintError(err: string | Error): string {
  if (typeof err === 'string') {
    return err;
  }
  if (err && err.message) {
    return err.message;
  }
  return '';
}

export type AzureBotServiceMetadata = IContentProviderMetadata & {
  /** ABS channel ID */
  botId?: string;
  /** ABS channel name */
  botName?: string;
  /** Azure App Id */
  appId: string;
  /** Azure Subscription Id */
  subscriptionId: string;
  /** Azure resource group Id */
  resourceGroup?: string;
  /** ? */
  keyvaultSecret?: string;
  /** ABS Channel uniq ID */
  resourceId: string;
  /** Service URI */
  serviceHost?: string;
};

export class AzureBotServiceProvider extends ExternalContentProvider<AzureBotServiceMetadata> {
  private tempBotAssetsDir = join(process.env.COMPOSER_TEMP_DIR as string, 'abs-assets');
  private projectId = '';

  constructor(metadata: AzureBotServiceMetadata) {
    super(metadata);
  }

  public async downloadBotContent() {
    const url = this.getBotContentUrl(this.metadata);
    const options: RequestInit = {
      method: 'GET',
      headers: await this.getRequestHeaders(),
    };

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
    await this.loadProjectContent(zipPath);

    return {
      zipPath: zipPath,
      eTag: '',
      urlSuffix: this.getDeepLink(),
    };
  }

  public async cleanUp() {
    await remove(this.tempBotAssetsDir);
  }

  private async loadProjectContent(zipPath: string) {
    // read projectId from zip file
    const zip = new AdmZip(zipPath);
    const botprojEntries = zip.getEntries().filter((entry) => entry.entryName.endsWith('.botproj'));
    if (botprojEntries.length) {
      this.projectId = botprojEntries[0].entryName;
    } else {
      this.projectId = '';
    }
  }

  public async getAlias() {
    // To load correct project, alias should be project name as the project's URI.
    return `abs-${this.projectId}`;
  }
  public async authenticate() {
    return await this.getAccessToken();
  }

  private async getAccessToken(): Promise<string> {
    try {
      // TODO: impl Azure auth
      // const accessToken = await authService.getAccessToken({
      //   targetResource: 'https://management.core.windows.net/',
      // });
      // if (accessToken === '') {
      //   throw 'User cancelled login flow.';
      // }
      // return accessToken;
      return '<TestToken>';
    } catch (error) {
      throw `Error while trying to get access token: ${prettyPrintError(error)}`;
    }
  }

  private getBotContentUrl(metadata: AzureBotServiceMetadata) {
    const { botName } = metadata;
    const botServiceHost = `https://${botName}.scm.azurewebsites.net`;
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
