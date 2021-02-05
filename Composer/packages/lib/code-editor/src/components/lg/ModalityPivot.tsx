// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LgTemplate } from '@bfc/shared';
import { FluentTheme, FontSizes } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import {
  ContextualMenuItemType,
  IContextualMenuItem,
  IContextualMenuItemProps,
  IContextualMenuItemRenderFunctions,
  IContextualMenuProps,
} from 'office-ui-fabric-react/lib/ContextualMenu';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { IPivotStyles, Pivot, PivotItem } from 'office-ui-fabric-react/lib/Pivot';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import { LgResponseEditorProps } from '../../types';
import { LGOption } from '../../utils';
import { ItemWithTooltip } from '../ItemWithTooltip';

import { AttachmentModalityEditor } from './modalityEditors/AttachmentModalityEditor';
import { SpeechModalityEditor } from './modalityEditors/SpeechModalityEditor';
import { SuggestedActionsModalityEditor } from './modalityEditors/SuggestedActionsModalityEditor';
import { TextModalityEditor } from './modalityEditors/TextModalityEditor';
import { ModalityType, modalityTypes } from './types';

const modalityDocumentUrl =
  'https://docs.microsoft.com/en-us/azure/bot-service/language-generation/language-generation-structured-response-template?view=azure-bot-service-4.0';

const getModalityTooltipText = (modality: ModalityType) => {
  switch (modality) {
    case 'attachments':
      return formatMessage(
        'List of attachments with their type. Used by channels to render as UI cards or other generic file attachment types.'
      );
    case 'speak':
      return formatMessage('Spoken text used by the channel to render audibly.');
    case 'suggestedActions':
      return formatMessage('List of actions rendered as suggestions to user.');
    case 'text':
      return formatMessage('Display text used by the channel to render visually.');
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
  onInputHintChange: (inputHintString) => void,
  modalityTemplates: Record<ModalityType, LgTemplate>,
  disableRemoveModality: boolean,
  lgOption?: LGOption,
  lgTemplates?: readonly LgTemplate[],
  memoryVariables?: readonly string[]
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
          lgOption={lgOption}
          lgTemplates={lgTemplates}
          memoryVariables={memoryVariables}
          removeModalityDisabled={disableRemoveModality}
          template={modalityTemplates.speak}
          onInputHintChange={onInputHintChange}
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
          lgOption={lgOption}
          lgTemplates={lgTemplates}
          memoryVariables={memoryVariables}
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

const ModalityPivot = React.memo((props: LgResponseEditorProps) => {
  const { lgOption, lgTemplates, memoryVariables, onModalityChange = () => {} } = props;
  const modalityTemplates = useMemo(
    () =>
      modalityTypes.reduce((acc, modality) => {
        const template = lgTemplates?.find(({ name }) => name === `${lgOption?.templateId}_${modality}`);
        return template ? { ...acc, [modality]: template } : acc;
      }, {} as Record<ModalityType, LgTemplate>),
    [lgTemplates, lgOption?.templateId]
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const [modalities, setModalities] = useState<ModalityType[]>(getInitialModalities(modalityTemplates));
  const [selectedKey, setSelectedKey] = useState<ModalityType>(modalities[0]);

  const renderMenuItemContent = React.useCallback(
    (itemProps: IContextualMenuItemProps, defaultRenders: IContextualMenuItemRenderFunctions) =>
      itemProps.item.itemType === ContextualMenuItemType.Header ? (
        <ItemWithTooltip
          itemText={defaultRenders.renderItemName(itemProps)}
          tooltipId="modality-add-menu-header"
          tooltipText={formatMessage.rich('To learn more about modalities, <a>go to this document</a>.', {
            a: ({ children }) => (
              <Link key="modality-add-menu-header-link" href={modalityDocumentUrl} target="_blank">
                {children}
              </Link>
            ),
          })}
        />
      ) : (
        <ItemWithTooltip
          itemText={defaultRenders.renderItemName(itemProps)}
          tooltipId={itemProps.item.key}
          tooltipText={getModalityTooltipText(itemProps.item.key as ModalityType)}
        />
      ),
    []
  );

  const items = useMemo<IContextualMenuItem[]>(
    () => [
      {
        key: 'header',
        itemType: ContextualMenuItemType.Header,
        text: formatMessage('Add modality to this response'),
        onRenderContent: renderMenuItemContent,
      },
      {
        key: 'text',
        text: formatMessage('Text'),
        onRenderContent: renderMenuItemContent,
        style: { fontSize: FluentTheme.fonts.small.fontSize },
      },
      {
        key: 'speak',
        text: formatMessage('Speech'),
        onRenderContent: renderMenuItemContent,
        style: { fontSize: FluentTheme.fonts.small.fontSize },
      },
      {
        key: 'attachments',
        text: formatMessage('Attachments'),
        onRenderContent: renderMenuItemContent,
        style: { fontSize: FluentTheme.fonts.small.fontSize },
      },
      {
        key: 'suggestedActions',
        text: formatMessage('Suggested Actions'),
        onRenderContent: renderMenuItemContent,
        style: { fontSize: FluentTheme.fonts.small.fontSize },
      },
    ],
    [renderMenuItemContent]
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
        onModalityChange(modality);
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

  const handleInputHintChange = useCallback((inputHint: string) => {}, []);

  const addMenuProps = React.useMemo<IContextualMenuProps>(
    () => ({
      items: menuItems,
      onItemClick: handleItemClick,
    }),
    [menuItems, handleItemClick]
  );

  return (
    <Stack>
      <Stack horizontal verticalAlign="center">
        <Pivot headersOnly selectedKey={selectedKey} styles={styles.tabs} onLinkClick={handleLinkClicked}>
          {pivotItems.map(({ key, text }) => (
            <PivotItem key={key} headerText={text} itemKey={key} />
          ))}
        </Pivot>
        {menuItems.filter((item) => item.itemType !== ContextualMenuItemType.Header).length && (
          <IconButton iconProps={addButtonIconProps} menuProps={addMenuProps} onRenderMenuIcon={() => null} />
        )}
      </Stack>

      <div ref={containerRef}>
        {renderModalityEditor(
          selectedKey,
          handleRemoveModality,
          onModalityChange,
          handleInputHintChange,
          modalityTemplates,
          modalities.length === 1,
          lgOption,
          lgTemplates,
          memoryVariables
        )}
      </div>
    </Stack>
  );
});

export { ModalityPivot };
