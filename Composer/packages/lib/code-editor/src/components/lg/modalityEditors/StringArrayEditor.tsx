// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useCallback, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Link, ILinkStyles } from 'office-ui-fabric-react/lib/Link';
import { NeutralColors } from '@uifabric/fluent-theme/lib/fluent/FluentColors';
import { TextField, ITextField, ITextFieldStyles } from 'office-ui-fabric-react/lib/TextField';
import formatMessage from 'format-message';
import { FluentTheme } from '@uifabric/fluent-theme';

const Item = styled(TextField)({
  borderBottom: `1px solid ${NeutralColors.gray30}`,
  padding: '8px 0 8px 4px',
  width: '100%',
});

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
  value: string;
  onBlur: () => void;
  onChange: (event, value?: string) => void;
  onShowCallout: (target) => void;
};

const ArrayItem = React.memo(({ value, onBlur, onChange, onShowCallout }: ArrayItemProps) => {
  const itemRef = useRef<ITextField | null>(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!value) {
      itemRef.current?.focus();
    }
  }, []);

  const handleFocus = () => {
    onShowCallout(containerRef.current);
  };

  const handleKeyDown = (ev) => {
    if (ev.key === 'Escape') {
      onShowCallout(null);
    }
  };

  return (
    <div ref={containerRef}>
      <Item
        componentRef={(ref) => (itemRef.current = ref)}
        styles={styles.textInput}
        value={value}
        onBlur={onBlur}
        onFocus={handleFocus}
        onChange={onChange}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
});

type StringArrayEditorProps = {
  items: string[];
  onChange: (items: string[]) => void;
  onShowCallout: (target) => void;
};

const StringArrayEditor = React.memo(({ items, onChange, onShowCallout }: StringArrayEditorProps) => {
  const [visible, setVisible] = useState(true);

  const handleChange = useCallback(
    (index: number) => (_, newValue?: string) => {
      const updatedItems = [...items];
      updatedItems[index] = newValue ?? '';
      onChange(updatedItems);
    },
    [items, onChange]
  );

  const handleBlur = useCallback(() => {
    onChange(items.filter(Boolean));
    setVisible(true);
  }, [items, onChange]);

  const handleClickAddVariation = useCallback(() => {
    onChange([...items, '']);
    setVisible(false);
  }, [items, onChange]);

  return (
    <React.Fragment>
      {items.map((value, key) => (
        <ArrayItem
          key={key}
          value={value}
          onBlur={handleBlur}
          onChange={handleChange(key)}
          onShowCallout={onShowCallout}
        />
      ))}
      {visible && (
        <Link as="button" styles={styles.link} onClick={handleClickAddVariation}>
          {formatMessage('Add new variation')}
        </Link>
      )}
    </React.Fragment>
  );
});

export { StringArrayEditor };
