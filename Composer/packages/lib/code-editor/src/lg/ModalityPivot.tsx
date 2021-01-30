// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback, useMemo, useState } from 'react';
import { FontSizes } from '@uifabric/fluent-theme';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { LgTemplate } from '@bfc/shared';
import { Pivot, PivotItem, IPivotStyles } from 'office-ui-fabric-react/lib/Pivot';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import formatMessage from 'format-message';

import { AttachmentModalityEditor } from './ModalityEditors/AttachmentModalityEditor';
import { LgCodeEditorProps } from './LgCodeEditor';
import { SpeechModalityEditor } from './ModalityEditors/SpeechModalityEditor';
import { SuggestedActionsModalityEditor } from './ModalityEditors/SuggestedActionsModalityEditor';
import { TextModalityEditor } from './ModalityEditors/TextModalityEditor';

const modalityTypes = ['text', 'speak', 'attachments', 'suggestedActions'] as const;

type ModalityTypes = typeof modalityTypes[number];

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
  modality: ModalityTypes,
  onRemoveModality: (modality: ModalityTypes) => () => void,
  onModalityChange: (modality: ModalityTypes, body: string) => void,
  modalityTemplates: Record<ModalityTypes, LgTemplate>,
  disableRemoveModality: boolean
) => {
  const title = formatMessage('Response Variations');

  switch (modality) {
    case 'attachments':
      return (
        <AttachmentModalityEditor
          disableRemoveModality={disableRemoveModality}
          title={title}
          onModalityChange={(body: string) => onModalityChange('attachments', body)}
          onRemoveModality={onRemoveModality('attachments')}
        />
      );
    case 'speak':
      return (
        <SpeechModalityEditor
          disableRemoveModality={disableRemoveModality}
          template={modalityTemplates['speak']}
          title={title}
          onModalityChange={(body: string) => onModalityChange('speak', body)}
          onRemoveModality={onRemoveModality('speak')}
        />
      );
    case 'suggestedActions':
      return (
        <SuggestedActionsModalityEditor
          disableRemoveModality={disableRemoveModality}
          title={title}
          onModalityChange={(body: string) => onModalityChange('suggestedActions', body)}
          onRemoveModality={onRemoveModality('suggestedActions')}
        />
      );
    case 'text':
      return (
        <TextModalityEditor
          disableRemoveModality={disableRemoveModality}
          template={modalityTemplates['text']}
          title={title}
          onModalityChange={(body: string) => onModalityChange('text', body)}
          onRemoveModality={onRemoveModality('text')}
        />
      );
  }
};

const getInitialModalities = (modalityTemplates: Record<ModalityTypes, any>): ModalityTypes[] => {
  const modalities = Object.keys(modalityTemplates);
  return modalities.length ? (modalities as ModalityTypes[]) : ['text'];
};

const ModalityPivot = React.memo(({ lgOption, lgTemplates, onModalityChange = () => {} }: LgCodeEditorProps) => {
  const modalityTemplates = useMemo(
    () =>
      modalityTypes.reduce((acc, modality) => {
        const template = lgTemplates?.find(({ name }) => name === `${lgOption?.templateId}_${modality}`);
        return template ? { ...acc, [modality]: template } : acc;
      }, {} as Record<ModalityTypes, LgTemplate>),
    [lgTemplates, lgOption?.templateId]
  );

  const [modalities, setModalities] = useState<ModalityTypes[]>(getInitialModalities(modalityTemplates));
  const [selectedKey, setSelectedKey] = useState<ModalityTypes>(modalities[0]);

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
  const menuItems = useMemo(() => items.filter(({ key }) => !modalities.includes(key as ModalityTypes)), [
    items,
    modalities,
  ]);

  const handleRemoveModality = useCallback(
    (modality: ModalityTypes) => () => {
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
        setModalities((current) => [...current, item.key as ModalityTypes]);
        setSelectedKey(item.key as ModalityTypes);
      }
    },
    [setModalities]
  );

  const handleLinkClicked = useCallback((item?: PivotItem) => {
    if (item?.props.itemKey) {
      setSelectedKey(item?.props.itemKey as any);
    }
  }, []);

  return (
    <Stack>
      <Stack horizontal verticalAlign="center">
        <Pivot headersOnly selectedKey={selectedKey} styles={styles.tabs} onLinkClick={handleLinkClicked}>
          {pivotItems.map(({ key, text }) => (
            <PivotItem key={key} headerText={text} itemKey={key} />
          ))}
        </Pivot>
        {menuItems.length && (
          <IconButton
            iconProps={{ iconName: 'Add', styles: { root: { fontSize: FontSizes.size14 } } }}
            menuProps={{ items: menuItems, onItemClick: handleItemClick }}
            onRenderMenuIcon={() => null}
          />
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
