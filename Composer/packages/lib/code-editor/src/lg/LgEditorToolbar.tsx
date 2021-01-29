// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LgTemplate } from '@botframework-composer/types';
import { NeutralColors, FluentTheme } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { CommandBar, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import { VerticalDivider } from 'office-ui-fabric-react/lib/Divider';
import * as React from 'react';

import { withTooltip } from '../utils/withTooltip';

import { ToolbarButtonMenu } from './ToolbarButtonMenu';
import { useLgEditorToolbarItems } from './useLgEditorToolbarItems';

const menuHeight = 32;

const dividerStyles = {
  divider: {
    height: 'calc(100% - 12px)',
  },
};

const moreButtonStyles = {
  root: {
    fontSize: FluentTheme.fonts.small.fontSize,
    height: menuHeight,
  },
};

const commandBarStyles = {
  root: {
    height: menuHeight,
    border: `1px solid ${NeutralColors.gray120}`,
    borderBottom: 'none',
    padding: 0,
    fontSize: FluentTheme.fonts.small.fontSize,
  },
};

export type LgEditorToolbarProps = {
  lgTemplates?: readonly LgTemplate[];
  properties?: readonly string[];
  onSelectToolbarMenuItem: (itemText: string) => void;
  moreToolbarItems?: readonly ICommandBarItemProps[];
};

export const LgEditorToolbar = React.memo((props: LgEditorToolbarProps) => {
  const { properties, lgTemplates, moreToolbarItems, onSelectToolbarMenuItem } = props;

  const { functionRefPayload, propertyRefPayload, templateRefPayload } = useLgEditorToolbarItems(
    lgTemplates ?? [],
    properties ?? [],
    onSelectToolbarMenuItem
  );

  const TooltipTemplateButton = React.useMemo(
    () => withTooltip({ content: formatMessage('Insert a template reference') }, ToolbarButtonMenu),
    []
  );
  const TooltipPropertyButton = React.useMemo(
    () => withTooltip({ content: formatMessage('Insert a property reference in memory') }, ToolbarButtonMenu),
    []
  );
  const TooltipFunctionButton = React.useMemo(
    () =>
      withTooltip({ content: formatMessage('Insert an adaptive expression pre-built function') }, ToolbarButtonMenu),
    []
  );

  const fixedItems: ICommandBarItemProps[] = React.useMemo(
    () => [
      {
        key: 'templateRef',
        disabled: !templateRefPayload?.data?.templates?.length,
        commandBarButtonAs: () => <TooltipTemplateButton key="templateRef" payload={templateRefPayload} />,
      },
      {
        key: 'propertyRef',
        disabled: !propertyRefPayload?.data?.properties?.length,
        commandBarButtonAs: () => <TooltipPropertyButton key="propertyRef" payload={propertyRefPayload} />,
      },
      {
        key: 'functionRef',
        commandBarButtonAs: () => <TooltipFunctionButton key="functionRef" payload={functionRefPayload} />,
      },
    ],
    [
      TooltipTemplateButton,
      TooltipPropertyButton,
      TooltipFunctionButton,
      templateRefPayload,
      propertyRefPayload,
      functionRefPayload,
    ]
  );

  const moreItems = React.useMemo(
    () =>
      moreToolbarItems?.map<ICommandBarItemProps>((itemProps) => ({ ...itemProps, buttonStyles: moreButtonStyles })) ??
      [],
    [moreToolbarItems]
  );

  const items = React.useMemo(
    () => [
      ...fixedItems,
      ...(moreItems.length
        ? [{ key: 'divider', commandBarButtonAs: () => <VerticalDivider styles={dividerStyles} /> }]
        : []),
      ...moreItems,
    ],
    [fixedItems, moreItems]
  );

  return <CommandBar items={items} styles={commandBarStyles} />;
});
