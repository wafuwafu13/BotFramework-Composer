// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import React from 'react';

import { CommonModalityEditorProps } from '../types';

import { ModalityEditorContainer } from './ModalityEditorContainer';
import { StringArrayEditor } from './StringArrayEditor';

const SuggestedActionsModalityEditor = React.memo(
  ({
    lgOption,
    lgTemplates,
    memoryVariables,
    template,
    templateId,
    removeModalityDisabled: disableRemoveModality,
    onTemplateChange,
    onRemoveModality,
  }: CommonModalityEditorProps) => {
    const [items, setItems] = React.useState<string[]>(
      template?.body
        ?.replace(/- /g, '')
        .split('|')
        .map((item) => item.trim()) || []
    );

    const handleChange = React.useCallback(
      (newItems: string[]) => {
        setItems(newItems);
        onTemplateChange(templateId, '- ' + newItems.map((item) => item).join(' | '));
      },
      [setItems, templateId, onTemplateChange]
    );

    return (
      <ModalityEditorContainer
        contentDescription="This list of actions will be rendered as suggestions to user."
        contentTitle={formatMessage('Actions')}
        disableRemoveModality={disableRemoveModality}
        modalityTitle={formatMessage('Suggested Actions')}
        modalityType="suggestedActions"
        removeModalityOptionText={formatMessage('Remove all suggested actions')}
        onRemoveModality={onRemoveModality}
      >
        <StringArrayEditor
          items={items}
          lgOption={lgOption}
          lgTemplates={lgTemplates}
          memoryVariables={memoryVariables}
          selectedKey="text"
          onChange={handleChange}
        />
      </ModalityEditorContainer>
    );
  }
);

export { SuggestedActionsModalityEditor };
