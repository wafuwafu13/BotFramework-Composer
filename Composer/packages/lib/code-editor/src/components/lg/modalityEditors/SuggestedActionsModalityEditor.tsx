// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import React from 'react';

import { ModalityEditorContainer } from './ModalityEditorContainer';
import { CommonModalityEditorProps } from './types';

const SuggestedActionsModalityEditor = React.memo(
  ({ removeModalityDisabled: disableRemoveModality, onRemoveModality }: CommonModalityEditorProps) => {
    return (
      <ModalityEditorContainer
        contentDescription="This list of actions will be rendered as suggestions to user."
        contentTitle={formatMessage('Actions')}
        disableRemoveModality={disableRemoveModality}
        modalityTitle={formatMessage('Suggested Actions')}
        modalityType="suggestedActions"
        onRemoveModality={onRemoveModality}
      />
    );
  }
);

export { SuggestedActionsModalityEditor };
