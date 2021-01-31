// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import styled from '@emotion/styled';
import { NeutralColors } from '@uifabric/fluent-theme/lib/fluent/FluentColors';
import formatMessage from 'format-message';
import { CommandBarButton } from 'office-ui-fabric-react/lib/Button';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { OverflowSet } from 'office-ui-fabric-react/lib/OverflowSet';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import React, { useMemo } from 'react';

import { ModalityType } from '../types';

import { ModalityEditorTitle } from './ModalityEditorTitle';

const Root = styled.div({
  width: '100%',
});

const HeaderContainer = styled.div({
  borderBottom: `1px solid ${NeutralColors.gray30}`,
  padding: '8px 0 4px 4px',
  width: '100%',
});

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
  contentTitle: string;
  contentDescription?: string;
  disableRemoveModality: boolean;
  menuItems?: IContextualMenuItem[];
  modalityTitle: string;
  modalityType: ModalityType;
  onRemoveModality: () => void;
};

const ModalityEditorContainer: React.FC<Props> = ({
  children,
  modalityType,
  contentDescription,
  disableRemoveModality,
  menuItems = [],
  modalityTitle,
  contentTitle,
  onRemoveModality,
}) => {
  const overflowMenuItems: IContextualMenuItem[] = useMemo(
    () => [
      ...menuItems,
      {
        key: 'remove',
        disabled: disableRemoveModality,
        text: formatMessage('Remove {modality} modality', { modality: modalityTitle?.toLowerCase() }),
        onClick: () => onRemoveModality(),
      },
    ],
    [menuItems]
  );

  return (
    <Root>
      <HeaderContainer>
        <Stack horizontal horizontalAlign="space-between">
          <ModalityEditorTitle
            helpMessage={contentDescription ?? ''}
            modalityType={modalityType}
            title={contentTitle}
          />
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
