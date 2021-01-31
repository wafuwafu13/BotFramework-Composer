// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FluentTheme, NeutralColors } from '@uifabric/fluent-theme';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import * as React from 'react';

const iconStyles = {
  root: {
    cursor: 'default',
    lineHeight: '12px',
    fontSize: FluentTheme.fonts.small.fontSize,
    color: NeutralColors.gray130,
  },
};

export const HelpIconTooltip = React.memo(
  (props: { tooltipId: string; helpMessage: string | JSX.Element | JSX.Element[] }) => {
    return (
      <TooltipHost content={props.helpMessage} id={props.tooltipId}>
        <Icon iconName={'Unknown'} styles={iconStyles} />
      </TooltipHost>
    );
  }
);
