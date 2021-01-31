// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import React from 'react';

import { ModalityEditorContainer } from './ModalityEditorContainer';
import { CommonModalityEditorProps } from './types';

const AttachmentModalityEditor = React.memo(
  ({ removeModalityDisabled: disableRemoveModality, onRemoveModality }: CommonModalityEditorProps) => {
    return (
      <ModalityEditorContainer
        contentDescription="attachment help text"
        contentTitle={formatMessage('Response Variations')}
        disableRemoveModality={disableRemoveModality}
        modalityTitle={formatMessage('Attachments')}
        modalityType="attachments"
        onRemoveModality={onRemoveModality}
      ></ModalityEditorContainer>
    );
  }
);

export { AttachmentModalityEditor };
