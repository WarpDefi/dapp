import { Currency, CurrencyAmount, Fraction, Percent } from '@pangolindex/sdk';
import { Text } from 'rebass';
import { ButtonPrimary } from '../../components/Button';
import CurrencyLogo from '../../components/CurrencyLogo';
import { RowBetween, RowFixed } from '../../components/Row';
import { Field } from '../../state/mint/actions';

export function ConfirmAddModalBottom({
  noLiquidity,
  price,
  currencies,
  parsedAmounts,
  poolTokenPercentage,
  onAdd,
}: {
  noLiquidity?: boolean;
  price?: Fraction;
  currencies: { [field in Field]?: Currency };
  parsedAmounts: { [field in Field]?: CurrencyAmount };
  poolTokenPercentage?: Percent;
  onAdd: () => void;
}) {
  return (
    <div className="pb-20">
      <RowBetween>
        <p>{currencies[Field.CURRENCY_A]?.symbol} Deposited</p>
        <RowFixed>
          <CurrencyLogo currency={currencies[Field.CURRENCY_A]} style={{ marginRight: '8px' }} />
          <p>{parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}</p>
        </RowFixed>
      </RowBetween>
      <RowBetween>
        <p>{currencies[Field.CURRENCY_B]?.symbol} Deposited</p>
        <RowFixed>
          <CurrencyLogo currency={currencies[Field.CURRENCY_B]} style={{ marginRight: '8px' }} />
          <p>{parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}</p>
        </RowFixed>
      </RowBetween>
      <RowBetween>
        <p>Rates</p>
        <p>
          {`1 ${currencies[Field.CURRENCY_A]?.symbol} = ${price?.toSignificant(4)} ${
            currencies[Field.CURRENCY_B]?.symbol
          }`}
        </p>
      </RowBetween>
      <RowBetween style={{ justifyContent: 'flex-end' }}>
        <p>
          {`1 ${currencies[Field.CURRENCY_B]?.symbol} = ${price?.invert().toSignificant(4)} ${
            currencies[Field.CURRENCY_A]?.symbol
          }`}
        </p>
      </RowBetween>
      <RowBetween>
        <p>Share of Pool:</p>
        <p>{noLiquidity ? '100' : poolTokenPercentage?.toSignificant(4)}%</p>
      </RowBetween>
      <ButtonPrimary style={{ margin: '20px 0 0 0' }} onClick={onAdd}>
        <Text fontWeight={500} fontSize={20}>
          {noLiquidity ? 'Create Pool & Supply' : 'Confirm Supply'}
        </Text>
      </ButtonPrimary>
    </div>
  );
}
