import { ElixirTrade, Trade, TradeType } from '@pangolindex/sdk';
import { useContext, useState } from 'react';
import { Repeat } from 'react-feather';
import { Text } from 'rebass';
import { ThemeContext } from 'styled-components';
import { Field } from '../../state/swap/actions';
import {
  computeSlippageAdjustedAmounts,
  computeTradePriceBreakdown,
  formatExecutionPrice,
  warningSeverity,
} from '../../utils/prices';
import { AutoColumn } from '../Column';
import QuestionHelper from '../QuestionHelper';
import { RowBetween, RowFixed } from '../Row';
import { Button } from '@/components/ui/button';
import FormattedPriceImpact from './FormattedPriceImpact';
import { StyledBalanceMaxMini, SwapCallbackError } from './styleds';

export default function SwapModalFooter({
  trade,
  onConfirm,
  allowedSlippage,
  swapErrorMessage,
  disabledConfirm,
}: {
  trade: Trade | ElixirTrade;
  allowedSlippage: number;
  onConfirm: () => void;
  swapErrorMessage: string | undefined;
  disabledConfirm: boolean;
}) {
  //const chainId = useChainId();
  const [showInverted, setShowInverted] = useState<boolean>(false);
  const theme = useContext(ThemeContext);
  /*const slippageAdjustedAmounts = useMemo(
    () => computeSlippageAdjustedAmounts(trade, allowedSlippage),
    [allowedSlippage, trade],
  );
  const { priceImpactWithoutFee, realizedLPFee } = useMemo(
    () => computeTradePriceBreakdown(trade),
    [chainId, trade],
  );*/
  const slippageAdjustedAmounts = computeSlippageAdjustedAmounts(trade, allowedSlippage);
  const { priceImpactWithoutFee, realizedLPFee } = computeTradePriceBreakdown(trade);
  const severity = warningSeverity(priceImpactWithoutFee);

  return (
    <>
      <AutoColumn gap="0px">
        <RowBetween align="center">
          <Text fontWeight={400} fontSize={14}>
            Price
          </Text>
          <Text
            fontWeight={500}
            fontSize={14}
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              display: 'flex',
              textAlign: 'right',
              paddingLeft: '10px',
            }}
          >
            {formatExecutionPrice(trade as Trade, showInverted)}
            <StyledBalanceMaxMini onClick={() => setShowInverted(!showInverted)}>
              <Repeat size={14} />
            </StyledBalanceMaxMini>
          </Text>
        </RowBetween>

        <RowBetween>
          <RowFixed>
            <span>{trade.tradeType === TradeType.EXACT_INPUT ? 'Minimum received' : 'Maximum sold'}</span>
            <QuestionHelper text="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed." />
          </RowFixed>
          <RowFixed>
            <span>
              {trade.tradeType === TradeType.EXACT_INPUT
                ? (slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4) ?? '-')
                : (slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4) ?? '-')}
            </span>
            <span>
              {trade.tradeType === TradeType.EXACT_INPUT
                ? trade.outputAmount.currency.symbol
                : trade.inputAmount.currency.symbol}
            </span>
          </RowFixed>
        </RowBetween>
        <RowBetween>
          <RowFixed>
            <span>Price Impact</span>
            <QuestionHelper text="The difference between the market price and your price due to trade size." />
          </RowFixed>
          <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
        </RowBetween>
        <RowBetween>
          <RowFixed>
            <span>Liquidity Provider Fee</span>
          </RowFixed>
          <span>{realizedLPFee ? realizedLPFee?.toSignificant(6) + ' ' + trade.inputAmount.currency.symbol : '-'}</span>
        </RowBetween>
      </AutoColumn>

      <Button
        variant={severity > 2 ? 'destructive' : 'default'}
        onClick={onConfirm}
        disabled={disabledConfirm}
        id="confirm-swap-or-send"
      >
        {severity > 2 ? 'Swap Anyway' : 'Confirm Swap'}
      </Button>

      {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
    </>
  );
}
