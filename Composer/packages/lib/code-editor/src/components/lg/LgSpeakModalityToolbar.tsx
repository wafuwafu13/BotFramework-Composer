// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FluentTheme } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import {
  ContextualMenuItemType,
  IContextualMenuItemProps,
  IContextualMenuItemRenderFunctions,
} from 'office-ui-fabric-react/lib/ContextualMenu';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import * as React from 'react';

import { HelpIconTooltip } from '../HelpIconTooltip';

import { LgEditorToolbar, LgEditorToolbarProps } from './LgEditorToolbar';

const headerContainerTokens = { childrenGap: 4 };

const menuItemStyles = {
  fontSize: FluentTheme.fonts.small.fontSize,
};

export type SSMLTagType = 'break' | 'prosody' | 'audio';

type Props = Omit<LgEditorToolbarProps, 'moreMenuItems'> & {
  id: string;
  onInsertSSMLTag: (tagType: SSMLTagType) => void;
};

export const LgSpeakModalityToolbar = React.memo((props: Props) => {
  const { id, onInsertSSMLTag, ...restProps } = props;

  const renderHeaderContent = React.useCallback(
    (itemProps: IContextualMenuItemProps, defaultRenders: IContextualMenuItemRenderFunctions) => (
      <Stack horizontal tokens={headerContainerTokens} verticalAlign="center">
        {defaultRenders.renderItemName(itemProps)}
        <HelpIconTooltip
          helpMessage={formatMessage.rich('To learn more about SSML Tags, <a>go to this document</a>.', {
            a: ({ children }) => (
              <Link href="#" target="_blank">
                {children}
              </Link>
            ),
          })}
          tooltipId={id}
        />
      </Stack>
    ),
    [id]
  );

  const subMenuProps = React.useMemo(
    () => ({
      items: [
        {
          key: 'header',
          text: formatMessage('Insert SSML tag'),
          itemType: ContextualMenuItemType.Header,
          onRenderContent: renderHeaderContent,
        },
        { text: 'break', key: 'break', onClick: () => onInsertSSMLTag('break'), style: menuItemStyles },
        { text: 'prosody', key: 'prosody', onClick: () => onInsertSSMLTag('prosody'), style: menuItemStyles },
        { text: 'audio', key: 'audio', onClick: () => onInsertSSMLTag('audio'), style: menuItemStyles },
      ],
    }),
    [renderHeaderContent, onInsertSSMLTag]
  );

  return (
    <LgEditorToolbar
      {...restProps}
      moreToolbarItems={[{ key: 'ssmlTag', text: formatMessage('SSML tag'), subMenuProps }]}
    />
  );
});
