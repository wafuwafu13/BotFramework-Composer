// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import React, { useCallback, useState } from 'react';

import { ModalityEditorContainer } from './ModalityEditorContainer';
import { StringArrayEditor } from './StringArrayEditor';
import { CommonModalityEditorProps } from './types';

const TextModalityEditor = React.memo(
  ({
    removeModalityDisabled: disableRemoveModality,
    template,
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
        onRemoveModality={onRemoveModality}
      >
        <StringArrayEditor items={items} onChange={handleChange} />
      </ModalityEditorContainer>
    );
  }
);

export { TextModalityEditor };
