// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';

import { LgResponseEditorProps } from '../../types';

import { ModalityPivot } from './ModalityPivot';

export const LgResponseEditor = React.memo((props: LgResponseEditorProps) => {
  return <ModalityPivot {...props} />;
});
