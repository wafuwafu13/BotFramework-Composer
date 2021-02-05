// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { FieldLabel, useFormData } from '@bfc/adaptive-form';
import { LgEditor, LgEditorMode } from '@bfc/code-editor';
import { FieldProps, useShellApi } from '@bfc/extension-client';
import { filterTemplateDiagnostics } from '@bfc/indexers';
import { CodeEditorSettings, LgMetaData, LgTemplateRef, LgType } from '@bfc/shared';
import { OpenConfirmModal } from '@bfc/ui-shared';
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import React, { useCallback, useEffect, useState } from 'react';

import { locateLgTemplatePosition } from './locateLgTemplatePosition';

const structuredResponseDocumentUrl =
  'https://docs.microsoft.com/en-us/azure/bot-service/language-generation/language-generation-structured-response-template?view=azure-bot-service-4.0';
const linkStyles = {
  root: { fontSize: 12, ':hover': { textDecoration: 'none' }, ':active': { textDecoration: 'none' } },
};

const confirmDialogContentStyles = {
  root: { marginBottom: 16 },
};

const confirmDialogContentTokens = {
  childrenGap: 16,
};

const lspServerPath = '/lg-language-server';

const tryGetLgMetaDataType = (lgText: string): string | null => {
  const lgRef = LgTemplateRef.parse(lgText);
  if (lgRef === null) return null;

  const lgMetaData = LgMetaData.parse(lgRef.name);
  if (lgMetaData === null) return null;

  return lgMetaData.type;
};

const getInitialTemplate = (fieldName: string, formData?: string): string => {
  const lgText = formData || '';

  // Field content is already a ref created by composer.
  if (tryGetLgMetaDataType(lgText) === fieldName) {
    return '';
  }
  return lgText.startsWith('-') ? lgText : `- ${lgText}`;
};

const LgField: React.FC<FieldProps<string>> = (props) => {
  const { label, id, description, value, name, uiOptions, required } = props;
  const { designerId, currentDialog, lgFiles, shellApi, projectId, locale, userSettings } = useShellApi();
  const formData = useFormData();

  const [editorMode, setEditorMode] = React.useState<LgEditorMode>('codeEditor');

  let lgType = name;
  const $kind = formData?.$kind;
  if ($kind) {
    lgType = new LgType($kind, name).toString();
  }

  const lgTemplateRef = LgTemplateRef.parse(value);
  const lgName = lgTemplateRef ? lgTemplateRef.name : new LgMetaData(lgType, designerId || '').toString();

  const relatedLgFile = locateLgTemplatePosition(lgFiles, lgName, locale);

  const fallbackLgFileId = `${currentDialog.lgFile}.${locale}`;
  const lgFile = relatedLgFile ?? lgFiles.find((f) => f.id === fallbackLgFileId);
  const lgFileId = lgFile?.id ?? fallbackLgFileId;

  const [memoryVariables, setMemoryVariables] = useState<string[] | undefined>();
  useEffect(() => {
    const abortController = new AbortController();
    (async () => {
      try {
        const variables = await shellApi.getMemoryVariables(projectId, { signal: abortController.signal });
        setMemoryVariables(variables);
      } catch (e) {
        // error can be due to abort
      }
    })();

    // clean up pending async request
    () => {
      abortController.abort();
    };
  }, [projectId]);

  const availableLgTemplates = React.useMemo(
    () =>
      (lgFiles.find((lgFile) => lgFile.id === lgFileId)?.allTemplates || [])
        .filter((t) => t.name !== lgTemplateRef?.name)
        .sort(),
    [lgFileId, lgFiles]
  );

  const updateLgTemplate = useCallback(
    async (body: string) => {
      await shellApi.debouncedUpdateLgTemplate(lgFileId, lgName, body);
    },
    [lgName, lgFileId]
  );

  const template = lgFile?.templates?.find((template) => {
    return template.name === lgName;
  }) || {
    name: lgName,
    parameters: [],
    body: getInitialTemplate(name, value),
  };

  const diagnostics = lgFile ? filterTemplateDiagnostics(lgFile, template.name) : [];

  const lgOption = {
    projectId,
    fileId: lgFileId,
    templateId: lgName,
  };

  const onChange = (body: string) => {
    if (designerId) {
      if (body) {
        updateLgTemplate(body).then(() => {
          if (lgTemplateRef) {
            shellApi.commitChanges();
          }
        });
        props.onChange(new LgTemplateRef(lgName).toString());
      } else {
        shellApi.removeLgTemplate(lgFileId, lgName).then(() => {
          props.onChange();
        });
      }
    }
  };

  const handleSettingsChange = (settings: Partial<CodeEditorSettings>) => {
    shellApi.updateUserSettings({ codeEditor: settings });
  };

  // TODO: update this logic to decide if the LG template is eligible for response editor view.
  const structuredResponse = true;

  const renderConfirmDialogContent = React.useCallback(
    (text: string) => (
      <Stack styles={confirmDialogContentStyles} tokens={confirmDialogContentTokens}>
        {text}
      </Stack>
    ),
    []
  );

  const modeChange = React.useCallback(async () => {
    let changeMode = true;
    if (editorMode === 'codeEditor' && !structuredResponse) {
      changeMode = await OpenConfirmModal(
        formatMessage('Warning'),
        formatMessage.rich(
          '<text>To use Response editor, the LG template needs to be an activity response template. <a>Visit this document</a> to learn more.</text><text>If you proceed to switch to Response editor, you will lose your current template content, and start with a blank response. Do you want to continue?</text>',
          {
            a: ({ children }) => (
              <Link href={structuredResponseDocumentUrl} target="_blank">
                {children}
              </Link>
            ),
            text: ({ children }) => <Text>{children}</Text>,
          }
        ),
        { confirmText: formatMessage('Confirm'), onRenderContent: renderConfirmDialogContent }
      );
    }
    if (changeMode) {
      setEditorMode(editorMode === 'codeEditor' ? 'responseEditor' : 'codeEditor');
    }
  }, [editorMode, structuredResponse]);

  const navigateToLgPage = React.useCallback(
    (lgFileId: string) => {
      // eslint-disable-next-line security/detect-non-literal-regexp
      const pattern = new RegExp(`.${locale}`, 'g');
      lgFileId = lgFileId.replace(pattern, '');
      shellApi.navigateTo(`/bot/${projectId}/language-generation/${lgFileId}`);
    },
    [shellApi, projectId, locale]
  );

  const handleModalityChange = React.useCallback(
    async (modality: string, body?: string) => {
      if (designerId) {
        if (body) {
          await shellApi.debouncedUpdateLgTemplate(lgFileId, `${lgName}_${modality}`, body);
        } else {
          shellApi.removeLgTemplate(lgFileId, `${lgName}_${modality}`);
        }
      }
    },
    [designerId, lgFileId, lgName, shellApi]
  );

  return (
    <React.Fragment>
      <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
        <FieldLabel
          description={description}
          helpLink={uiOptions?.helpLink}
          id={id}
          label={label}
          required={required}
        />
        <Link as="button" styles={linkStyles} onClick={modeChange}>
          {editorMode === 'codeEditor'
            ? formatMessage('switch to response editor')
            : formatMessage('switch to code editor')}
        </Link>
      </Stack>
      <LgEditor
        hidePlaceholder
        diagnostics={diagnostics}
        editorSettings={userSettings.codeEditor}
        height={225}
        languageServer={{
          path: lspServerPath,
        }}
        lgOption={lgOption}
        lgTemplates={availableLgTemplates}
        memoryVariables={memoryVariables}
        mode={editorMode}
        value={template.body}
        onChange={onChange}
        onChangeSettings={handleSettingsChange}
        onModalityChange={handleModalityChange}
        onNavigateToLgPage={navigateToLgPage}
      />
    </React.Fragment>
  );
};

export { LgField };
