// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';

import { LgCodeEditor } from './components/lg/LgCodeEditor';
import { LgResponseEditor } from './components/lg/LgResponseEditor';
import { LgCodeEditorProps } from './types';

export type LgEditorMode = 'codeEditor' | 'responseEditor';

export type LgEditorProps = LgCodeEditorProps & {
  mode: LgEditorMode;
  codeEditorToolbarHidden?: boolean;
};

export const LgEditor = (props: LgEditorProps) => {
  const { mode, codeEditorToolbarHidden = false, ...editorProps } = props;

  return mode === 'codeEditor' ? (
    <LgCodeEditor toolbarHidden={codeEditorToolbarHidden} {...editorProps} />
  ) : (
    <LgResponseEditor {...editorProps} />
  );
};
