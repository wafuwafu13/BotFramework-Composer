// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LgTemplate } from '@bfc/shared';
import { FontSizes } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { IContextualMenuItem, IContextualMenuItemProps } from 'office-ui-fabric-react/lib/ContextualMenu';
import { IPivotStyles, Pivot, PivotItem } from 'office-ui-fabric-react/lib/Pivot';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import React, { useCallback, useMemo, useState } from 'react';

import { ItemWithTooltip } from '../ItemWithTooltip';

import { LgCodeEditorProps } from './LgCodeEditor';
import { AttachmentModalityEditor } from './modalityEditors/AttachmentModalityEditor';
import { SpeechModalityEditor } from './modalityEditors/SpeechModalityEditor';
import { SuggestedActionsModalityEditor } from './modalityEditors/SuggestedActionsModalityEditor';
import { TextModalityEditor } from './modalityEditors/TextModalityEditor';
import { ModalityType, modalityTypes } from './types';

const getModalityTooltipText = (modality: ModalityType) => {
  switch (modality) {
    case 'attachments':
      return formatMessage('Attachment tooltip');
    case 'speak':
      return formatMessage('Speak tooltip');
    case 'suggestedActions':
      return formatMessage('Suggested actions tooltip');
    case 'text':
      return formatMessage('Text tooltip');
  }
};

const addButtonIconProps = { iconName: 'Add', styles: { root: { fontSize: FontSizes.size14 } } };

const styles: { tabs: Partial<IPivotStyles> } = {
  tabs: {
    link: {
      fontSize: FontSizes.size12,
    },
    linkIsSelected: {
      fontSize: FontSizes.size12,
    },
  },
};

const renderModalityEditor = (
  modality: ModalityType,
  onRemoveModality: (modality: ModalityType) => () => void,
  onModalityChange: (modality: ModalityType, body: string) => void,
  modalityTemplates: Record<ModalityType, LgTemplate>,
  disableRemoveModality: boolean
) => {
  switch (modality) {
    case 'attachments':
      return (
        <AttachmentModalityEditor
          removeModalityDisabled={disableRemoveModality}
          onModalityChange={(body: string) => onModalityChange('attachments', body)}
          onRemoveModality={onRemoveModality('attachments')}
        />
      );
    case 'speak':
      return (
        <SpeechModalityEditor
          removeModalityDisabled={disableRemoveModality}
          template={modalityTemplates.speak}
          onModalityChange={(body: string) => onModalityChange('speak', body)}
          onRemoveModality={onRemoveModality('speak')}
        />
      );
    case 'suggestedActions':
      return (
        <SuggestedActionsModalityEditor
          removeModalityDisabled={disableRemoveModality}
          onModalityChange={(body: string) => onModalityChange('suggestedActions', body)}
          onRemoveModality={onRemoveModality('suggestedActions')}
        />
      );
    case 'text':
      return (
        <TextModalityEditor
          removeModalityDisabled={disableRemoveModality}
          template={modalityTemplates.text}
          onModalityChange={(body: string) => onModalityChange('text', body)}
          onRemoveModality={onRemoveModality('text')}
        />
      );
  }
};

const getInitialModalities = (modalityTemplates: Record<ModalityType, LgTemplate>): ModalityType[] => {
  const modalities = Object.keys(modalityTemplates);
  return modalities.length ? (modalities as ModalityType[]) : ['text'];
};

const ModalityPivot = React.memo(({ lgOption, lgTemplates, onModalityChange = () => {} }: LgCodeEditorProps) => {
  const modalityTemplates = useMemo(
    () =>
      modalityTypes.reduce((acc, modality) => {
        const template = lgTemplates?.find(({ name }) => name === `${lgOption?.templateId}_${modality}`);
        return template ? { ...acc, [modality]: template } : acc;
      }, {} as Record<ModalityType, LgTemplate>),
    [lgTemplates, lgOption?.templateId]
  );

  const [modalities, setModalities] = useState<ModalityType[]>(getInitialModalities(modalityTemplates));
  const [selectedKey, setSelectedKey] = useState<ModalityType>(modalities[0]);

  const items = useMemo<IContextualMenuItem[]>(
    () => [
      {
        key: 'text',
        text: formatMessage('Text'),
      },
      {
        key: 'speak',
        text: formatMessage('Speech'),
      },
      {
        key: 'attachments',
        text: formatMessage('Attachments'),
      },
      {
        key: 'suggestedActions',
        text: formatMessage('Suggested Actions'),
      },
    ],
    []
  );

  const pivotItems = useMemo(
    () =>
      modalities.map((modality) => items.find(({ key }) => key === modality)).filter(Boolean) as IContextualMenuItem[],
    [items, modalities]
  );
  const menuItems = useMemo(() => items.filter(({ key }) => !modalities.includes(key as ModalityType)), [
    items,
    modalities,
  ]);

  const handleRemoveModality = useCallback(
    (modality: ModalityType) => () => {
      if (modalities.length > 1) {
        const updatedModalities = modalities.filter((item) => item !== modality);
        setModalities(updatedModalities);
        setSelectedKey(updatedModalities[0]);
      }
    },
    [modalities, setModalities, setSelectedKey]
  );

  const handleItemClick = useCallback(
    (_, item?: IContextualMenuItem) => {
      if (item?.key) {
        setModalities((current) => [...current, item.key as ModalityType]);
        setSelectedKey(item.key as ModalityType);
      }
    },
    [setModalities]
  );

  const handleLinkClicked = useCallback((item?: PivotItem) => {
    if (item?.props.itemKey) {
      setSelectedKey(item?.props.itemKey as ModalityType);
    }
  }, []);

  const renderPivotAddMenu = React.useCallback((itemProps: IContextualMenuItemProps) => {
    return (
      <ItemWithTooltip
        helpMessage={getModalityTooltipText(itemProps.item.key as ModalityType)}
        itemText={itemProps.item.text ?? ''}
        tooltipId={itemProps.item.key}
      />
    );
  }, []);

  const addMenuProps = React.useMemo(
    () => ({ items: menuItems, onItemClick: handleItemClick, contextualMenuItemAs: renderPivotAddMenu }),
    [menuItems, handleItemClick, renderPivotAddMenu]
  );

  return (
    <Stack>
      <Stack horizontal verticalAlign="center">
        <Pivot headersOnly selectedKey={selectedKey} styles={styles.tabs} onLinkClick={handleLinkClicked}>
          {pivotItems.map(({ key, text }) => (
            <PivotItem key={key} headerText={text} itemKey={key} />
          ))}
        </Pivot>
        {menuItems.length && (
          <IconButton iconProps={addButtonIconProps} menuProps={addMenuProps} onRenderMenuIcon={() => null} />
        )}
      </Stack>
      {renderModalityEditor(
        selectedKey,
        handleRemoveModality,
        onModalityChange,
        modalityTemplates,
        modalities.length === 1
      )}
    </Stack>
  );
});

export { ModalityPivot };
