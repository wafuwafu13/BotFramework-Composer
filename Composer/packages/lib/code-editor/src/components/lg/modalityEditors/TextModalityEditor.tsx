// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import React, { useCallback, useState } from 'react';

import { CommonModalityEditorProps } from '../types';

import { ModalityEditorContainer } from './ModalityEditorContainer';
import { StringArrayEditor } from './StringArrayEditor';

const TextModalityEditor = React.memo(
  ({
    removeModalityDisabled: disableRemoveModality,
    template,
    lgOption,
    lgTemplates,
    memoryVariables,
    onModalityChange,
    onRemoveModality,
  }: CommonModalityEditorProps) => {
    const [items, setItems] = useState<string[]>(template?.body?.replace(/- /g, '').split('\n') || []);

    const handleChange = useCallback(
      (newItems: string[]) => {
        setItems(newItems);
        onModalityChange(newItems.map((item) => `- ${item}`).join('\n'));
      },
      [setItems, onModalityChange]
    );

    return (
      <ModalityEditorContainer
        contentDescription={formatMessage(
          'One of the variations added below will be selected at random by the LG library.'
        )}
        contentTitle={formatMessage('Response Variations')}
        disableRemoveModality={disableRemoveModality}
        modalityTitle={formatMessage('Text')}
        modalityType="text"
        removeModalityOptionText={formatMessage('Remove all text responses')}
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

export { TextModalityEditor };
