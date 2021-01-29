// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import formatMessage from 'format-message';

import { ModalityEditorContainer } from './ModalityEditorContainer';
import { ModalityEditorProps } from './types';
import { StringArrayEditor } from './StringArrayEditor';

const SpeakModalityEditor = React.memo(({ title, onRemoveModality }: ModalityEditorProps) => {
  const [items, setItems] = useState<string[]>([]);

  return (
    <ModalityEditorContainer modality={formatMessage('Speak')} title={title} onRemoveModality={onRemoveModality}>
      <StringArrayEditor items={items} onChange={setItems} />
    </ModalityEditorContainer>
  );
});

export { SpeakModalityEditor };
