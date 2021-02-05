// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import React, { useCallback, useState } from 'react';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';

import { ModalityEditorContainer } from './ModalityEditorContainer';
import { StringArrayEditor } from './StringArrayEditor';
import { CommonModalityEditorProps } from '../types';

const SpeechModalityEditor = React.memo(
  ({
    removeModalityDisabled: disableRemoveModality,
    template,
    lgOption,
    lgTemplates,
    memoryVariables,
    onInputHintChange,
    onModalityChange,
    onRemoveModality,
  }: CommonModalityEditorProps) => {
    const [items, setItems] = useState<string[]>(template?.body?.replace(/- /g, '').split('\n') || []);

    const handleChange = useCallback(
      (newItems: string[]) => {
        setItems(newItems);
        onModalityChange(newItems.map((item) => `- ${item}`).join('\n'));
      },
      [setItems, onModalityChange]
    );

    const inputHintOptions = React.useMemo<IDropdownOption[]>(
      () => [
        {
          key: 'undefined',
          text: formatMessage('Input hint: undefined'),
          selected: true,
        },
        {
          key: 'acceptingInput',
          text: formatMessage('Input hint: Accepting'),
        },
        {
          key: 'ignoringInput',
          text: formatMessage('Input hint: Ignoring'),
        },
        {
          key: 'expectingInput',
          text: formatMessage('Input hint: Expecting'),
        },
      ],
      []
    );

    const handleInputHintChange = useCallback((_: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
      if (option) {
        typeof onInputHintChange === 'function' && onInputHintChange(option.key as string);
      }
    }, []);

    return (
      <ModalityEditorContainer
        contentDescription="One of the variations added below will be selected at random by the LG library."
        contentTitle={formatMessage('Response Variations')}
        disableRemoveModality={disableRemoveModality}
        dropdownOptions={inputHintOptions}
        modalityTitle={formatMessage('Suggested Actions')}
        modalityType="suggestedActions"
        onDropdownChange={handleInputHintChange}
        onRemoveModality={onRemoveModality}
      >
        <StringArrayEditor
          items={items}
          lgOption={lgOption}
          lgTemplates={lgTemplates}
          memoryVariables={memoryVariables}
          selectedKey="speak"
          onChange={handleChange}
        />
      </ModalityEditorContainer>
    );
  }
);

export { SpeechModalityEditor };
