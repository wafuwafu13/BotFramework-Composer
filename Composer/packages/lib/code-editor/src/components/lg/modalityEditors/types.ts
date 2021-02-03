// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LgTemplate } from '@botframework-composer/types';

export type CommonModalityEditorProps = {
  removeModalityDisabled: boolean;
  template?: LgTemplate;
  onModalityChange: (body: string) => void;
  onShowCallout: (target: HTMLElement | null) => void;
  onRemoveModality: () => void;
};
