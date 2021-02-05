// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import styled from '@emotion/styled';
import { FluentTheme } from '@uifabric/fluent-theme';
import { ITextField, TextField } from 'office-ui-fabric-react/lib/TextField';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import React, { useCallback, useEffect, useRef } from 'react';
import formatMessage from 'format-message';

import { withTooltip } from '../../../utils/withTooltip';

const removeIconClassName = 'string-array-item-remove-icon';

const Root = styled(Stack)({
  height: 48,
  borderBottom: `1px solid ${FluentTheme.palette.neutralLight}`,
});

const TextViewItemRoot = styled(Stack)({
  transition: 'background 0.1s ease',
  '& .ms-Button i': {
    visibility: 'hidden',
  },
  '&:hover .ms-Button i': {
    visibility: 'visible',
  },
  '&:hover': {
    background: FluentTheme.palette.neutralLighter,
  },
});

const Input = styled(TextField)({
  padding: '8px 0 8px 4px',
  width: '100%',
  position: 'relative',
  '& input': {
    fontSize: FluentTheme.fonts.small.fontSize,
  },
  '& .ms-TextField-fieldGroup::after': {
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
  },
});

const textViewContainerStyles = {
  root: { height: 48, padding: '0 0 0 13px', userSelect: 'none', cursor: 'pointer' },
};
const textViewRootTokens = { childrenGap: 8 };

const textFieldStyles = {
  fieldGroup: {
    borderColor: 'transparent',
    transition: 'border-color 0.1s linear',
    selectors: {
      ':hover': {
        borderColor: FluentTheme.palette.neutralLight,
      },
    },
  },
};

type Props = {
  mode: 'edit' | 'view';
  value: string;
  onRemove: () => void;
  onBlur: () => void;
  onFocus: () => void;
  onChange: (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string) => void;
  onShowCallout: (target: HTMLInputElement) => void;
};

type TextViewItemProps = Pick<Props, 'value' | 'onRemove' | 'onFocus'>;

const TextViewItem = React.memo(({ value, onRemove, onFocus }: TextViewItemProps) => {
  const remove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.stopPropagation();
      e.preventDefault();
      onRemove();
    },
    [onRemove]
  );

  const handleFocus = React.useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      e.stopPropagation();
      onFocus();
    },
    [onFocus]
  );

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      onFocus();
    },
    [onFocus]
  );

  const RemoveIcon = React.useMemo(() => withTooltip({ content: formatMessage('Remove variation') }, IconButton), []);

  return (
    <TextViewItemRoot horizontal tokens={textViewRootTokens} verticalAlign="center">
      <Stack grow styles={textViewContainerStyles} verticalAlign="center" onClick={handleClick} onFocus={handleFocus}>
        <Text variant="small">{value}</Text>
      </Stack>
      <RemoveIcon className={removeIconClassName} iconProps={{ iconName: 'Trash' }} onClick={remove} />
    </TextViewItemRoot>
  );
});

type TextFieldItemProps = Omit<Props, 'onRemove' | 'mode' | 'onFocus'>;

const TextFieldItem = React.memo(({ onBlur, value, onShowCallout, onChange }: TextFieldItemProps) => {
  const itemRef = useRef<ITextField | null>(null);

  useEffect(() => {
    itemRef.current?.focus();
  }, []);

  const handleFocus = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      e.stopPropagation();
      onShowCallout(e.target as HTMLInputElement);
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
    <Input
      componentRef={(ref) => (itemRef.current = ref)}
      styles={textFieldStyles}
      value={value}
      onBlur={onBlur}
      onChange={onChange}
      onClick={handleClick}
      onFocus={handleFocus}
    />
  );
});

export const StringArrayItem = (props: Props) => {
  const { mode, onBlur, onChange, onShowCallout, onRemove, onFocus, value } = props;
  return (
    <Root verticalAlign="center">
      {mode === 'edit' ? (
        <TextFieldItem value={value} onBlur={onBlur} onChange={onChange} onShowCallout={onShowCallout} />
      ) : (
        <TextViewItem value={value} onFocus={onFocus} onRemove={onRemove} />
      )}
    </Root>
  );
};
