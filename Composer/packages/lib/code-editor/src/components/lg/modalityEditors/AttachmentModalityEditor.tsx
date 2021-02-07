// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import React from 'react';

import { CommonModalityEditorProps } from '../types';

import { ModalityEditorContainer } from './ModalityEditorContainer';

const AttachmentModalityEditor = React.memo(
  ({ removeModalityDisabled: disableRemoveModality, onRemoveModality }: CommonModalityEditorProps) => {
    return (
      <ModalityEditorContainer
        contentDescription="List of attachments to send to users. Multiple attachments will be displayed simultaneously."
        contentTitle={formatMessage('Attachments')}
        disableRemoveModality={disableRemoveModality}
        modalityTitle={formatMessage('Attachments')}
        modalityType="attachments"
        removeModalityOptionText={formatMessage('Remove all attachments')}
        onRemoveModality={onRemoveModality}
      ></ModalityEditorContainer>
    );
  }
);

export { AttachmentModalityEditor };
