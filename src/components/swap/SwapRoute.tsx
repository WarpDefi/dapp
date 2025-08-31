import { ElixirTrade, Trade } from '@pangolindex/sdk';
import { Fragment, memo, useContext } from 'react';
import { Flex } from 'rebass';
import { ThemeContext } from 'styled-components';
import { TYPE } from '../../theme';
import CurrencyLogo from '../CurrencyLogoV3';
import { Icons } from '../icons';

export default memo(function SwapRoute({ trade }: { trade: Trade | ElixirTrade }) {
  const theme = useContext(ThemeContext);

  return (
    <div className="flex items-center justify-center border rounded-lg px-4 py-2">
      {trade.route.path.map((token, i, path) => {
        const isLastItem: boolean = i === path.length - 1;
        return (
          <Fragment key={i}>
            <div className="flex items-center shrink-0 gap-2 px-2">
              <CurrencyLogo currency={token} size={24} imageSize={48} />
              <small>{token.symbol}</small>
            </div>
            {isLastItem ? null : <Icons.chevronRight className="size-4" />}
          </Fragment>
        );
      })}
    </div>
  );
});
