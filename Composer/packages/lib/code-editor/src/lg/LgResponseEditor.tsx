// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';

import { LgCodeEditorProps } from './LgCodeEditor';
import { ModalityPivot } from './ModalityPivot';

export const LgResponseEditor = (props: LgCodeEditorProps) => {
  return <ModalityPivot {...props} />;
};
