import { AutoColumn } from '@/components/Column';
import CurrencyLogo from '@/components/CurrencyLogoV3';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field } from '@/state/swap/actions';
import { cn, isAddress, shortenAddress } from '@/utils';
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown, warningSeverity } from '@/utils/prices';
import { ElixirTrade, Trade, TradeType } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { AlertTriangle, ArrowDown } from 'react-feather';

export default function SwapModalHeader({
  trade,
  allowedSlippage,
  recipient,
  showAcceptChanges,
  onAcceptChanges,
}: {
  trade: Trade | ElixirTrade;
  allowedSlippage: number;
  recipient: string | null;
  showAcceptChanges: boolean;
  onAcceptChanges: () => void;
}) {
  const slippageAdjustedAmounts = computeSlippageAdjustedAmounts(trade, allowedSlippage);
  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade);
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee);

  return (
    <div className='flex flex-col gap-4'>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <CurrencyLogo currency={trade.inputAmount.currency} size={24} imageSize={48} />
          <h3
            className={cn(
              'w-full truncate',
              showAcceptChanges && trade.tradeType === TradeType.EXACT_OUTPUT ? 'text-primary' : '',
            )}
          >
            {trade.inputAmount.toSignificant(6)}
          </h3>
        </div>
        <h3>{trade.inputAmount.currency.symbol}</h3>
      </div>
      <div className="p-1">
        <ArrowDown className="size-4 text-muted-foreground" />
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <CurrencyLogo currency={trade.outputAmount.currency} size={24} imageSize={48} />
          <h3
            className={cn(
              'w-full truncate',
              priceImpactSeverity > 2
                ? 'text-destructive'
                : showAcceptChanges && trade.tradeType === TradeType.EXACT_INPUT
                  ? 'text-primary'
                  : '',
            )}
          >
            {trade.outputAmount.toSignificant(6)}
          </h3>
        </div>
        <h3>{trade.outputAmount.currency.symbol}</h3>
      </div>
      {showAcceptChanges ? (
        <Alert variant="warning">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={20} />
              <AlertTitle>Price updated</AlertTitle>
            </div>
            <Button onClick={onAcceptChanges}>Accept price</Button>
          </div>
        </Alert>
      ) : null}
      <AutoColumn justify="flex-start" gap="sm" style={{ padding: '12px 0 0 0px' }}>
        {trade.tradeType === TradeType.EXACT_INPUT ? (
          <span className='italic' style={{ width: '100%' }}>
            {`Output is estimated. You will receive at least `}
            <b>
              {slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(6)} {trade.outputAmount.currency.symbol}
            </b>
            {' or the transaction will revert.'}
          </span>
        ) : (
          <span className='italic' style={{ width: '100%' }}>
            {`Input is estimated. You will sell at most `}
            <b>
              {slippageAdjustedAmounts[Field.INPUT]?.toSignificant(6)} {trade.inputAmount.currency.symbol}
            </b>
            {' or the transaction will revert.'}
          </span>
        )}
      </AutoColumn>
      {recipient !== null ? (
        <AutoColumn justify="flex-start" gap="sm" style={{ padding: '12px 0 0 0px' }}>
          <p>
            Output will be sent to{' '}
            <b title={recipient}>{isAddress(recipient) ? shortenAddress(recipient) : recipient}</b>
          </p>
        </AutoColumn>
      ) : null}
    </div>
  );
}
