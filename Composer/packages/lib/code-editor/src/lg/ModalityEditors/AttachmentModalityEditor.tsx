// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import formatMessage from 'format-message';

import { ModalityEditorContainer } from './ModalityEditorContainer';
import { ModalityEditorProps } from './types';

const AttachmentModalityEditor = React.memo(
  ({ disableRemoveModality, title, onRemoveModality }: ModalityEditorProps) => {
    return (
      <ModalityEditorContainer
        disableRemoveModality={disableRemoveModality}
        modality={formatMessage('Attachments')}
        title={title}
        onRemoveModality={onRemoveModality}
      ></ModalityEditorContainer>
    );
  }
);

export { AttachmentModalityEditor };
