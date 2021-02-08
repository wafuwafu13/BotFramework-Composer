// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LgTemplate } from '@bfc/shared';
import { FluentTheme } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { ILinkStyles, Link } from 'office-ui-fabric-react/lib/Link';
import React from 'react';

import { LGOption } from '../../../utils';
import { jsLgToolbarMenuClassName } from '../constants';

import { StringArrayItem } from './StringArrayItem';

const submitKeys = ['Enter', 'Esc'];

const styles: { link: ILinkStyles } = {
  link: {
    root: {
      height: 32,
      paddingLeft: 13,
      fontSize: FluentTheme.fonts.small.fontSize,
      ':hover': { textDecoration: 'none' },
      ':active': { textDecoration: 'none' },
    },
  },
};

type AttachmentArrayEditorProps = {
  items: string[];
  selectedKey: string;
  lgTemplates?: readonly LgTemplate[];
  memoryVariables?: readonly string[];
  lgOption?: LGOption;
  onChange: (items: string[]) => void;
};

const AttachmentArrayEditor = React.memo(
  ({ items, lgOption, lgTemplates, memoryVariables, onChange }: AttachmentArrayEditorProps) => {
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const [currentIndex, setCurrentIndex] = React.useState<number | null>(null);

    const handleChange = React.useCallback(
      (index: number) => (_, newValue?: string) => {
        const updatedItems = [...items];
        updatedItems[index] = newValue ?? '';
        onChange(updatedItems);
      },
      [items, onChange]
    );

    const handleFocus = React.useCallback(
      (index: number) => () => {
        setCurrentIndex(index);
      },
      [setCurrentIndex]
    );

    const handleRemove = React.useCallback(
      (index: number) => () => {
        const newItems = items.slice();
        newItems.splice(index, 1);
        onChange(newItems);
      },
      [items, onChange]
    );

    React.useEffect(() => {
      const keydownHandler = (e: KeyboardEvent) => {
        if (submitKeys.includes(e.key)) {
          setCurrentIndex(null);
        }
      };

      const focusHandler = (e: FocusEvent) => {
        console.log(e.target, containerRef.current);
        if (containerRef.current?.contains(e.target as Node)) {
          return;
        }
        console.log(
          !e
            .composedPath()
            .filter((n) => n instanceof Element)
            .map((n) => (n as Element).className)
            .some((c) => c.indexOf(jsLgToolbarMenuClassName) !== -1)
        );
        if (
          !e
            .composedPath()
            .filter((n) => n instanceof Element)
            .map((n) => (n as Element).className)
            .some((c) => c.indexOf(jsLgToolbarMenuClassName) !== -1)
        ) {
          setCurrentIndex(null);
          // Remove empty variations
          onChange(items.filter(Boolean));
        }
      };

      document.addEventListener('keydown', keydownHandler);
      document.addEventListener('focusin', focusHandler);

      return () => {
        document.removeEventListener('keydown', keydownHandler);
        document.removeEventListener('focusin', focusHandler);
      };
    }, [items, onChange]);

    React.useEffect(() => {
      console.log(currentIndex);
    }, [currentIndex]);

    return (
      <div ref={containerRef}>
        {items.map((value, key) => (
          <StringArrayItem
            key={key}
            editorMode="editor"
            lgOption={lgOption}
            lgTemplates={lgTemplates}
            memoryVariables={memoryVariables}
            mode={key === currentIndex ? 'edit' : 'view'}
            value={value}
            onChange={handleChange(key)}
            onFocus={handleFocus(key)}
            onRemove={handleRemove(key)}
          />
        ))}
        {currentIndex === null && (
          <Link as="button" styles={styles.link} onClick={() => {}}>
            {formatMessage('Add new variation')}
          </Link>
        )}
      </div>
    );
  }
);

export { AttachmentArrayEditor };
