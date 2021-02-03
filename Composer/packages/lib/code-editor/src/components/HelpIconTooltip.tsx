// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FluentTheme, NeutralColors } from '@uifabric/fluent-theme';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import * as React from 'react';

import { withTooltip } from '../utils/withTooltip';

const iconStyles = {
  root: {
    cursor: 'default',
    lineHeight: '12px',
    fontSize: FluentTheme.fonts.small.fontSize,
    color: NeutralColors.gray130,
  },
};

export const HelpIconTooltip = React.memo(
  ({ tooltipId, helpMessage }: { tooltipId: string; helpMessage: string | JSX.Element | JSX.Element[] }) => {
    const TooltipIcon = withTooltip({ content: helpMessage, id: tooltipId }, Icon);
    return <TooltipIcon iconName={'Unknown'} styles={iconStyles} />;
  }
);
