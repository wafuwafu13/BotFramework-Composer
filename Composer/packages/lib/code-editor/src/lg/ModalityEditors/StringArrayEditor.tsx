// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback } from 'react';
import styled from '@emotion/styled';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { NeutralColors } from '@uifabric/fluent-theme/lib/fluent/FluentColors';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import formatMessage from 'format-message';
import set from 'lodash/set';

const Item = styled(TextField)({
  borderBottom: `1px solid ${NeutralColors.gray30}`,
  padding: '8px 0 8px 4px',
  width: '100%',
});

const styles = {
  link: { root: { fontSize: 12, ':hover': { textDecoration: 'none' }, ':active': { textDecoration: 'none' } } },
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

type Props = {
  items: string[];
  onChange: (items: string[]) => void;
};

const StringArrayEditor = React.memo(({ items, onChange }: Props) => {
  const handleChange = useCallback(
    (index: number) => (_, newValue?: string) => {
      onChange(set(items, index, newValue));
    },
    [items, onChange]
  );

  const handleBlur = useCallback(() => {
    onChange(items.filter(Boolean));
  }, [items, onChange]);

  const handleClickAddVariation = useCallback(() => {
    onChange([...items, '']);
  }, [items, onChange]);

  return (
    <React.Fragment>
      {items.map((value, key) => (
        <Item key={key} styles={styles.textInput} value={value} onBlur={handleBlur} onChange={handleChange(key)} />
      ))}
      <Link as="button" styles={styles.link} onClick={handleClickAddVariation}>
        {formatMessage('Add new variation')}
      </Link>
    </React.Fragment>
  );
});

export { StringArrayEditor };
