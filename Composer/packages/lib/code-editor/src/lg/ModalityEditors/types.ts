// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type ModalityEditorProps = {
  disableRemoveModality: boolean;
  template?: any;
  title: string;
  onModalityChange: (body: string) => void;
  onRemoveModality: () => void;
};
