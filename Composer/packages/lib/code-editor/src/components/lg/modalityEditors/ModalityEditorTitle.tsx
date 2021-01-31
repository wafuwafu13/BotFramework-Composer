// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Label } from 'office-ui-fabric-react/lib/Label';
import React from 'react';

import { ItemWithTooltip } from '../../ItemWithTooltip';
import { ModalityType } from '../types';

type Props = {
  title: string | JSX.Element | JSX.Element[];
  modalityType: ModalityType;
  helpMessage: string | JSX.Element | JSX.Element[];
};

export const ModalityEditorTitle = React.memo(({ title, modalityType, helpMessage }: Props) => (
  <ItemWithTooltip
    helpMessage={helpMessage}
    itemText={<Label>{title}</Label>}
    tooltipId={`${modalityType}ModalityTitle`}
  />
));
