// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import React from 'react';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';

import { CommonModalityEditorProps } from '../types';

import { ModalityEditorContainer } from './ModalityEditorContainer';
import { AttachmentArrayEditor } from './AttachmentArrayEditor';

const AttachmentModalityEditor = React.memo(
  ({
    lgOption,
    lgTemplates,
    memoryVariables,
    removeModalityDisabled: disableRemoveModality,
    onAttachmentLayoutChange,
    onRemoveModality,
    onTemplateChange,
  }: CommonModalityEditorProps) => {
    const [items, setItems] = React.useState<string[]>([]);

    const handleChange = React.useCallback(
      (newItems: string[]) => {
        setItems(newItems);
        // onTemplateChange(newItems.map((item) => `- ${item}`).join('\n'));
      },
      [setItems]
    );

    const attachmentLayoutOptions = React.useMemo<IDropdownOption[]>(
      () => [
        {
          key: 'list',
          text: formatMessage('List'),
          selected: true,
        },
        {
          key: 'carousal',
          text: formatMessage('Carousal'),
        },
      ],
      []
    );

    const handleAttachmentStyleChange = React.useCallback(
      (_: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
        if (option) {
          onAttachmentLayoutChange?.(option.key as string);
        }
      },
      []
    );

    return (
      <ModalityEditorContainer
        contentDescription="List of attachments to send to users. Multiple attachments will be displayed simultaneously."
        contentTitle={formatMessage('Attachments')}
        disableRemoveModality={disableRemoveModality}
        dropdownOptions={attachmentLayoutOptions}
        dropdownPrefix={formatMessage('Layout: ')}
        modalityTitle={formatMessage('Attachments')}
        modalityType="attachments"
        removeModalityOptionText={formatMessage('Remove all attachments')}
        onDropdownChange={handleAttachmentStyleChange}
        onRemoveModality={onRemoveModality}
      >
        <AttachmentArrayEditor
          items={items}
          lgOption={lgOption}
          lgTemplates={lgTemplates}
          memoryVariables={memoryVariables}
          selectedKey="text"
          onChange={handleChange}
          onTemplateChange={onTemplateChange}
        />
      </ModalityEditorContainer>
    );
  }
);

export { AttachmentModalityEditor };
