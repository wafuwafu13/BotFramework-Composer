// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LgTemplate } from '@bfc/shared';
import styled from '@emotion/styled';
import { FluentTheme } from '@uifabric/fluent-theme';
import { NeutralColors } from '@uifabric/fluent-theme/lib/fluent/FluentColors';
import formatMessage from 'format-message';
import { Callout, DirectionalHint } from 'office-ui-fabric-react/lib/Callout';
import { ILinkStyles, Link } from 'office-ui-fabric-react/lib/Link';
import { ITextField, ITextFieldStyles, TextField } from 'office-ui-fabric-react/lib/TextField';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { LGOption } from '../../../utils';
import { jsLgToolbarMenuClassName } from '../constants';
import { LgEditorToolbar } from '../LgEditorToolbar';
import { LgSpeakModalityToolbar, SSMLTagType } from '../LgSpeakModalityToolbar';

const Item = styled(TextField)(({ focused }: { focused: boolean }) => ({
  borderBottom: `1px solid ${NeutralColors.gray30}`,
  padding: '8px 0 8px 4px',
  width: '100%',
  position: 'relative',
  '& input': {
    fontSize: FluentTheme.fonts.small.fontSize,
  },
  '& .ms-TextField-fieldGroup::after': focused
    ? {
        content: '""',
        position: 'absolute',
        left: -1,
        top: -1,
        right: -1,
        bottom: -1,
        pointerEvents: 'none',
        borderRadius: 2,
        border: `2px solid ${FluentTheme.palette.themePrimary}`,
        zIndex: 1,
      }
    : null,
}));

const styles: { link: ILinkStyles; textInput: Partial<ITextFieldStyles> } = {
  link: {
    root: {
      fontSize: FluentTheme.fonts.small.fontSize,
      ':hover': { textDecoration: 'none' },
      ':active': { textDecoration: 'none' },
    },
  },
  textInput: {
    fieldGroup: {
      borderColor: 'transparent',
      transition: 'border-color 0.1s linear',
      selectors: {
        ':hover': {
          borderColor: NeutralColors.gray30,
        },
      },
    },
  },
};

type ArrayItemProps = {
  focused: boolean;
  value: string;
  onBlur: () => void;
  onChange: (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string) => void;
  onFocus: () => void;
  onShowCallout: (target) => void;
};

const ArrayItem = React.memo(({ focused, value, onBlur, onChange, onFocus, onShowCallout }: ArrayItemProps) => {
  const itemRef = useRef<ITextField | null>(null);

  useEffect(() => {
    if (!value) {
      itemRef.current?.focus();
    }
  }, []);

  const handleFocus = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      e.stopPropagation();
      onShowCallout(e.target as HTMLInputElement);
      onFocus();
    },
    [onShowCallout]
  );

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLInputElement>) => {
      e.stopPropagation();
      onShowCallout(e.target as HTMLInputElement);
    },
    [onShowCallout]
  );

  return (
    <Item
      componentRef={(ref) => (itemRef.current = ref)}
      focused={focused}
      styles={styles.textInput}
      value={value}
      onBlur={onBlur}
      onChange={onChange}
      onClick={handleClick}
      onFocus={handleFocus}
    />
  );
});

type StringArrayEditorProps = {
  items: string[];
  selectedKey: string;
  lgTemplates?: readonly LgTemplate[];
  memoryVariables?: readonly string[];
  lgOption?: LGOption;
  onChange: (items: string[]) => void;
};

const StringArrayEditor = React.memo(
  ({ items, lgTemplates, memoryVariables, selectedKey, onChange }: StringArrayEditorProps) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [addButtonVisible, setAddButtonVisible] = useState(true);
    const [currentIndex, setCurrentIndex] = useState<number | null>(null);
    const [calloutTargetElement, setCalloutTargetElement] = useState<HTMLInputElement | null>(null);

    const handleChange = useCallback(
      (index: number) => (_, newValue?: string) => {
        const updatedItems = [...items];
        updatedItems[index] = newValue ?? '';
        onChange(updatedItems);
      },
      [items, onChange]
    );

    const handleBlur = useCallback(() => {
      setAddButtonVisible(true);
    }, [items, onChange]);

    const handleFocus = useCallback(
      (index: number) => () => {
        setCurrentIndex(index);
      },
      [setCurrentIndex]
    );

    const handleClickAddVariation = useCallback(() => {
      onChange([...items, '']);
      setAddButtonVisible(false);
    }, [items, onChange]);

    const handleShowCallout = useCallback((targetElement: HTMLInputElement) => {
      setCalloutTargetElement(targetElement);
    }, []);

    useEffect(() => {
      const keydownHandler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setCalloutTargetElement(null);
          setCurrentIndex(null);
        }
      };

      const focusHandler = (e: FocusEvent) => {
        if (containerRef.current?.contains(e.target as Node)) {
          return;
        }

        if (
          !e
            .composedPath()
            .filter((n) => n instanceof Element)
            .map((n) => (n as Element).className)
            .some((c) => c.indexOf(jsLgToolbarMenuClassName) !== -1)
        ) {
          setCalloutTargetElement(null);
          setCurrentIndex(null);
        }
      };

      document.addEventListener('keydown', keydownHandler);
      document.addEventListener('focusin', focusHandler);

      return () => {
        document.removeEventListener('keydown', keydownHandler);
        document.removeEventListener('focusin', focusHandler);
      };
    }, []);

    const selectToolbarMenuItem = React.useCallback(
      (insertText: string) => {
        if (typeof currentIndex === 'number' && currentIndex < items.length) {
          const updatedItems = [...items];

          if (typeof calloutTargetElement?.selectionStart === 'number') {
            const item = updatedItems[currentIndex];
            const start = calloutTargetElement.selectionStart;
            const end =
              typeof calloutTargetElement?.selectionEnd === 'number'
                ? calloutTargetElement.selectionEnd
                : calloutTargetElement.selectionStart;
            updatedItems[currentIndex] = [item.slice(0, start), insertText, item.slice(end)].join('');
            onChange(updatedItems);

            setTimeout(() => {
              calloutTargetElement.setSelectionRange(
                updatedItems[currentIndex].length,
                updatedItems[currentIndex].length
              );
            }, 0);
          }

          calloutTargetElement?.focus();
        }
      },
      [calloutTargetElement, currentIndex, items, onChange]
    );

    const insertSSMLTag = React.useCallback(
      (ssmlTagType: SSMLTagType) => {
        if (typeof currentIndex === 'number' && currentIndex < items.length) {
          const updatedItems = [...items];

          if (
            typeof calloutTargetElement?.selectionStart === 'number' &&
            typeof calloutTargetElement?.selectionEnd === 'number'
          ) {
            const item = updatedItems[currentIndex];
            const start = calloutTargetElement.selectionStart;
            const end = calloutTargetElement.selectionEnd;
            updatedItems[currentIndex] = [
              item.slice(0, start),
              `<${ssmlTagType}>`,
              item.slice(start, end),
              `</${ssmlTagType}>`,
              item.slice(end),
            ].join('');
            onChange(updatedItems);

            setTimeout(() => {
              calloutTargetElement.setSelectionRange(
                updatedItems[currentIndex].length,
                updatedItems[currentIndex].length
              );
            }, 0);
          }

          calloutTargetElement?.focus();
        }
      },
      [calloutTargetElement, currentIndex, items, onChange]
    );

    const toolbar = React.useMemo(
      () =>
        selectedKey === 'speak' ? (
          <LgSpeakModalityToolbar
            key="lg-speak-toolbar"
            lgTemplates={lgTemplates}
            properties={memoryVariables}
            onInsertSSMLTag={insertSSMLTag}
            onSelectToolbarMenuItem={selectToolbarMenuItem}
          />
        ) : (
          <LgEditorToolbar
            key="lg-toolbar"
            lgTemplates={lgTemplates}
            properties={memoryVariables}
            onSelectToolbarMenuItem={selectToolbarMenuItem}
          />
        ),
      [selectedKey, lgTemplates, memoryVariables, insertSSMLTag, selectToolbarMenuItem]
    );

    return (
      <div ref={containerRef}>
        {items.map((value, key) => (
          <ArrayItem
            key={key}
            focused={key === currentIndex}
            value={value}
            onBlur={handleBlur}
            onChange={handleChange(key)}
            onFocus={handleFocus(key)}
            onShowCallout={handleShowCallout}
          />
        ))}
        {addButtonVisible && (
          <Link as="button" styles={styles.link} onClick={handleClickAddVariation}>
            {formatMessage('Add new variation')}
          </Link>
        )}
        {calloutTargetElement && (
          <Callout
            directionalHint={DirectionalHint.topLeftEdge}
            gapSpace={2}
            isBeakVisible={false}
            target={calloutTargetElement}
          >
            {toolbar}
          </Callout>
        )}
      </div>
    );
  }
);

export { StringArrayEditor };
