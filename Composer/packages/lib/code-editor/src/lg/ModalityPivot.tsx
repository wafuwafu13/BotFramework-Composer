// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback, useMemo, useState } from 'react';
import { FontSizes } from '@uifabric/fluent-theme';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Pivot, PivotItem, IPivotStyles } from 'office-ui-fabric-react/lib/Pivot';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import formatMessage from 'format-message';

import { AttachmentModalityEditor } from './ModalityEditors/AttachmentModalityEditor';
import { SpeakModalityEditor } from './ModalityEditors/SpeakModalityEditor';
import { SuggestedActionsModalityEditor } from './ModalityEditors/SuggestedActionsModalityEditor';
import { TextModalityEditor } from './ModalityEditors/TextModalityEditor';

export enum ModalityTypes {
  Text = 'text',
  Speak = 'speak',
  Attachments = 'attachments',
  SuggestedActions = 'suggestedActions',
}

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

const renderModalityEditor = (modality: ModalityTypes, onRemoveModality: (modality: ModalityTypes) => () => void) => {
  const title = formatMessage('Response Variations');

  switch (modality) {
    case ModalityTypes.Attachments:
      return <AttachmentModalityEditor title={title} onRemoveModality={onRemoveModality(ModalityTypes.Attachments)} />;
    case ModalityTypes.Speak:
      return <SpeakModalityEditor title={title} onRemoveModality={onRemoveModality(ModalityTypes.Speak)} />;
    case ModalityTypes.SuggestedActions:
      return (
        <SuggestedActionsModalityEditor
          title={title}
          onRemoveModality={onRemoveModality(ModalityTypes.SuggestedActions)}
        />
      );
    case ModalityTypes.Text:
      return <TextModalityEditor title={title} onRemoveModality={onRemoveModality(ModalityTypes.Text)} />;
  }
};

const ModalityPivot = React.memo(() => {
  const [modalities, setModalities] = useState<ModalityTypes[]>([ModalityTypes.Text]);
  const [selectedKey, setSelectedKey] = useState<ModalityTypes>(modalities[0]);

  const items = useMemo<IContextualMenuItem[]>(
    () => [
      {
        key: ModalityTypes.Text,
        text: formatMessage('Text'),
      },
      {
        key: ModalityTypes.Speak,
        text: formatMessage('Speak'),
      },
      {
        key: ModalityTypes.Attachments,
        text: formatMessage('Attachments'),
      },
      {
        key: ModalityTypes.SuggestedActions,
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
      {renderModalityEditor(selectedKey, handleRemoveModality)}
    </Stack>
  );
});

export { ModalityPivot };
