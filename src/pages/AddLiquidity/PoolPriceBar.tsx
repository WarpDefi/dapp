import { Currency, Percent, Price } from '@pangolindex/sdk';
import { useContext } from 'react';
import { Text } from 'rebass';
import { ThemeContext } from 'styled-components';
import { AutoColumn } from '../../components/Column';
import { AutoRow } from '../../components/Row';
import { ONE_BIPS } from '../../constants';
import { Field } from '../../state/mint/actions';
import { TYPE } from '../../theme';

export function PoolPriceBar({
  currencies,
  noLiquidity,
  poolTokenPercentage,
  price,
}: {
  currencies: { [field in Field]?: Currency };
  noLiquidity?: boolean;
  poolTokenPercentage?: Percent;
  price?: Price;
}) {
  const theme = useContext(ThemeContext);

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="flex flex-col items-center">
        <h4>{price?.toSignificant(6) ?? '-'}</h4>
        <small className="muted">
          {currencies[Field.CURRENCY_B]?.symbol} per {currencies[Field.CURRENCY_A]?.symbol}
        </small>
      </div>
      <div className="flex flex-col items-center">
        <h4>{price?.invert()?.toSignificant(6) ?? '-'}</h4>
        <small className="muted">
          {currencies[Field.CURRENCY_A]?.symbol} per {currencies[Field.CURRENCY_B]?.symbol}
        </small>
      </div>
      <div className="flex flex-col items-center">
        <h4>
          {noLiquidity && price
            ? '100'
            : ((poolTokenPercentage?.lessThan(ONE_BIPS) ? '<0.01' : poolTokenPercentage?.toFixed(2)) ?? '0')}
          %
        </h4>
        <small className="muted">Share of Pool</small>
      </div>
    </div>
  );
}
