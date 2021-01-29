// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useMemo } from 'react';
import styled from '@emotion/styled';
import { CommandBarButton } from 'office-ui-fabric-react/lib/Button';
import { DirectionalHint, TooltipDelay } from 'office-ui-fabric-react/lib/Tooltip';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { NeutralColors } from '@uifabric/fluent-theme/lib/fluent/FluentColors';
import { OverflowSet } from 'office-ui-fabric-react/lib/OverflowSet';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import formatMessage from 'format-message';

import { withTooltip } from '../../utils/withTooltip';

const Root = styled.div({
  width: '100%',
});

const HeaderContainer = styled.div({
  borderBottom: `1px solid ${NeutralColors.gray30}`,
  padding: '8px 0 4px 4px',
  width: '100%',
});

const getInfoTooltip = (title: string, description?: string) =>
  withTooltip(
    {
      delay: TooltipDelay.zero,
      directionalHint: DirectionalHint.bottomAutoEdge,
      styles: { root: { display: 'inline-block' } },
      tooltipProps: {
        styles: { root: { width: '288px', padding: '17px 28px' } },
        onRenderContent: () => (
          <div>
            <h3 aria-label={title + '.'} style={{ fontSize: '20px', margin: '0', marginBottom: '10px' }}>
              {title}
            </h3>
            <p>{description}</p>
          </div>
        ),
      },
    },
    Icon
  );

const onRenderOverflowButton = (overflowItems?: IContextualMenuItem[]): JSX.Element => {
  return (
    <CommandBarButton
      menuIconProps={{ iconName: 'MoreVertical' }}
      menuProps={{ items: overflowItems! }}
      role="menuitem"
      styles={{ root: { padding: '4px 0 4px 0' } }}
      title={formatMessage('Options')}
    />
  );
};

type Props = {
  description?: string;
  title: string;
  menuItems?: IContextualMenuItem[];
  modality: string;
  onRemoveModality: () => void;
};

const ModalityEditorContainer: React.FC<Props> = ({
  children,
  description,
  menuItems = [],
  modality,
  title,
  onRemoveModality,
}) => {
  const overflowMenuItems: IContextualMenuItem[] = useMemo(
    () => [
      ...menuItems,
      {
        key: 'remove',
        text: formatMessage('Remove {modality} modality', { modality: modality?.toLowerCase() }),
        onClick: () => onRemoveModality(),
      },
    ],
    [menuItems]
  );

  const Tooltip = useMemo(() => getInfoTooltip(title, description), [title, description]);

  return (
    <Root>
      <HeaderContainer>
        <Stack horizontal horizontalAlign="space-between">
          <Stack horizontal verticalAlign="center">
            <Label>{title}</Label>
            {description && (
              <Tooltip
                iconName={'Unknown'}
                styles={{
                  root: {
                    color: NeutralColors.gray160,
                    fontSize: '12px',
                    paddingLeft: '4px',
                  },
                }}
              />
            )}
          </Stack>
          <OverflowSet
            items={[]}
            overflowItems={overflowMenuItems}
            onRenderItem={() => null}
            onRenderOverflowButton={onRenderOverflowButton}
          />
        </Stack>
      </HeaderContainer>
      {children}
    </Root>
  );
};

export { ModalityEditorContainer };
