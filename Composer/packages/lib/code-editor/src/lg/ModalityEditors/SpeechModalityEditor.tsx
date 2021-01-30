// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback, useState } from 'react';
import formatMessage from 'format-message';

import { ModalityEditorContainer } from './ModalityEditorContainer';
import { ModalityEditorProps } from './types';
import { StringArrayEditor } from './StringArrayEditor';

const SpeechModalityEditor = React.memo(
  ({ disableRemoveModality, template, title, onModalityChange, onRemoveModality }: ModalityEditorProps) => {
    const [items, setItems] = useState<string[]>(template?.body?.replaceAll('- ', '').split('\n') || []);

    const handleChange = useCallback(
      (newItems: string[]) => {
        setItems(newItems);
        onModalityChange(newItems.map((item) => `- ${item}`).join('\n'));
      },
      [setItems, onModalityChange]
    );

    return (
      <ModalityEditorContainer
        disableRemoveModality={disableRemoveModality}
        modality={formatMessage('Speech')}
        title={title}
        onRemoveModality={onRemoveModality}
      >
        <StringArrayEditor items={items} onChange={handleChange} />
      </ModalityEditorContainer>
    );
  }
);

export { SpeechModalityEditor };
