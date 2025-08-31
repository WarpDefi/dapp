import { ElixirTrade, Trade, TradeType } from '@pangolindex/sdk';
import { useContext } from 'react';
import { ThemeContext } from 'styled-components';
import { useActiveWeb3React } from '../../hooks';
import { Field } from '../../state/swap/actions';
import { useUserSlippageTolerance } from '../../state/user/hooks';
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown } from '../../utils/prices';
import { AutoColumn } from '../Column';
import QuestionHelper from '../QuestionHelper';
import { RowBetween, RowFixed } from '../Row';
import { Separator } from '@/components/ui/separator';
import FormattedPriceImpact from './FormattedPriceImpact';
import SwapRoute from './SwapRoute';
import { useChainId } from '@/provider';
;

function TradeSummary({ trade, allowedSlippage }: { trade: Trade | ElixirTrade; allowedSlippage: number }) {
  const theme = useContext(ThemeContext);
  const chainId = useChainId();
  const { priceImpactWithoutFee, realizedLPFee } = computeTradePriceBreakdown(trade as Trade);
  const isExactIn = trade.tradeType === TradeType.EXACT_INPUT;
  const slippageAdjustedAmounts = computeSlippageAdjustedAmounts(trade, allowedSlippage);

  return (
    <div className="mt-6">
      <RowBetween>
        <RowFixed>
          <span>{isExactIn ? 'Minimum received' : 'Maximum sold'}</span>
          <QuestionHelper text="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed." />
        </RowFixed>
        <RowFixed>
          <span>
            {isExactIn
              ? (`${slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4)} ${trade.outputAmount.currency.symbol}` ??
                '-')
              : (`${slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4)} ${trade.inputAmount.currency.symbol}` ??
                '-')}
          </span>
        </RowFixed>
      </RowBetween>
      <RowBetween>
        <RowFixed>
          <span>Price Impact</span>
          <QuestionHelper text="The difference between the market price and estimated price due to trade size." />
        </RowFixed>
        <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
      </RowBetween>

      <RowBetween>
        <RowFixed>
          <span>Liquidity Provider Fee</span>
        </RowFixed>
        <span>{realizedLPFee ? `${realizedLPFee.toSignificant(4)} ${trade.inputAmount.currency.symbol}` : '-'}</span>
      </RowBetween>
    </div>
  );
}

export interface AdvancedSwapDetailsProps {
  trade?: Trade | ElixirTrade;
}

export function AdvancedSwapDetails({ trade }: AdvancedSwapDetailsProps) {
  const theme = useContext(ThemeContext);

  const [allowedSlippage] = useUserSlippageTolerance();

  const showRoute = Boolean(trade && trade.route.path.length > 2);

  return (
    <>
      {trade && (
        <>
          <TradeSummary trade={trade} allowedSlippage={allowedSlippage} />
          {showRoute && (
            <>
              <Separator />
              <div className="py-2">
                <div className="flex items-center">
                  <span>Route</span>
                  <QuestionHelper text="Routing through these tokens resulted in the best price for your trade." />
                </div>
                <SwapRoute trade={trade} />
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
