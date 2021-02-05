// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import styled from '@emotion/styled';
import { FluentTheme } from '@uifabric/fluent-theme';
import { NeutralColors } from '@uifabric/fluent-theme/lib/fluent/FluentColors';
import formatMessage from 'format-message';
import { CommandBarButton, DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { Dialog, DialogFooter, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { OverflowSet } from 'office-ui-fabric-react/lib/OverflowSet';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import React from 'react';

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

const styles = {
  dropdown: {
    caretDown: { fontSize: FluentTheme.fonts.xSmall.fontSize, color: FluentTheme.palette.accent },
    dropdownOptionText: { ...FluentTheme.fonts.small },
    title: {
      border: 'none',
      ...FluentTheme.fonts.small,
      color: FluentTheme.palette.accent,
    },
  },
};

const onRenderOverflowButton = (overflowItems?: IContextualMenuItem[]): JSX.Element => {
  return (
    <CommandBarButton
      menuIconProps={{ iconName: 'MoreVertical' }}
      menuProps={overflowItems && { items: overflowItems }}
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
  dropdownOptions?: IDropdownOption[];
  menuItems?: IContextualMenuItem[];
  modalityTitle: string;
  modalityType: ModalityType;
  removeModalityOptionText: string;
  onRemoveModality: () => void;
  onDropdownChange?: (_: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => void;
};

const ModalityEditorContainer: React.FC<Props> = ({
  children,
  modalityType,
  contentDescription,
  disableRemoveModality,
  dropdownOptions,
  menuItems = [],
  removeModalityOptionText,
  modalityTitle,
  contentTitle,
  onDropdownChange,
  onRemoveModality,
}) => {
  const [showDialog, setShowDialog] = React.useState(false);

  const handleToggleShowDialog = React.useCallback(() => {
    setShowDialog((current) => !current);
  }, [setShowDialog]);

  const overflowMenuItems: IContextualMenuItem[] = React.useMemo(
    () => [
      ...menuItems,
      {
        key: 'remove',
        disabled: disableRemoveModality,
        text: removeModalityOptionText,
        onClick: () => handleToggleShowDialog(),
      },
    ],
    [menuItems, handleToggleShowDialog]
  );

  const renderTitle = React.useCallback(
    (optionProps?: IDropdownOption[], defaultRender?: (optionProps?: IDropdownOption[]) => JSX.Element | null) => (
      <Text variant="small">
        {formatMessage('Input hint: ')}
        {defaultRender?.(optionProps)}
      </Text>
    ),
    []
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
          <Stack horizontal verticalAlign="center">
            {dropdownOptions && onDropdownChange && (
              <Dropdown
                options={dropdownOptions}
                placeholder={formatMessage('Select input hint')}
                styles={styles.dropdown}
                onChange={onDropdownChange}
                onRenderTitle={renderTitle}
              />
            )}
            <OverflowSet
              items={[]}
              overflowItems={overflowMenuItems}
              onRenderItem={() => null}
              onRenderOverflowButton={onRenderOverflowButton}
            />
          </Stack>
        </Stack>
      </HeaderContainer>
      {children}
      <Dialog
        hidden={!showDialog}
        onDismiss={handleToggleShowDialog}
        dialogContentProps={{
          type: DialogType.normal,
          title: formatMessage('Removing a modality from this action node'),
          closeButtonAriaLabel: formatMessage('Close'),
          subText: formatMessage(
            'You are about to remove {modalityTitle} modality from this action node. The content in the tab will be lost. Do you want to continue?',
            { modalityTitle }
          ),
        }}
        modalProps={{
          isBlocking: true,
        }}
      >
        <DialogFooter>
          <PrimaryButton onClick={() => onRemoveModality()} text={formatMessage('Confirm')} />
          <DefaultButton onClick={handleToggleShowDialog} text={formatMessage('Cancel')} />
        </DialogFooter>
      </Dialog>
    </Root>
  );
};

export { ModalityEditorContainer };
