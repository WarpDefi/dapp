import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useActiveWeb3React, usePoolsHook } from '@/hooks';
import { PoolState } from '@/hooks/types';
import usePrevious from '@/hooks/usePrevious';
//import { useChainId } from '@/provider';
import { cn } from '@/utils';
import { FeeAmount } from '@pangolindex/sdk';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useFeeTierDistributionHook } from '../../../hooks/FeeTier';
import FeeOption from './FeeOption';
import { FeeTierPercentageBadge } from './FeeTierPercentageBadge';
import { FEE_AMOUNT_DETAIL } from './shared';
import { FeeSelectorProps } from './types';
import { useChainId } from '@/provider';
;

const FeeSelector: FC<FeeSelectorProps> = ({
  disabled = false,
  feeAmount,
  handleFeePoolSelect,
  currency0,
  currency1,
}) => {
  const chainId = useChainId();
  const usePools = usePoolsHook[chainId];
  const useFeeTierDistribution = useFeeTierDistributionHook[chainId];

  const { isLoading, isError, largestUsageFeeTier, distributions } = useFeeTierDistribution(currency0, currency1);

  // get pool data on-chain for latest states
  const pools = usePools([
    [currency0, currency1, FeeAmount.LOWEST],
    [currency0, currency1, FeeAmount.LOW],
    [currency0, currency1, FeeAmount.MEDIUM],
    [currency0, currency1, FeeAmount.HIGH],
  ]);

  const poolsByFeeTier: Record<FeeAmount, PoolState> = useMemo(
    () =>
      pools.reduce(
        (acc, [curPoolState, curPool]) => {
          acc = {
            ...acc,
            ...{ [curPool?.initialFee as FeeAmount]: curPoolState },
          };
          return acc;
        },
        {
          // default all states to NOT_EXISTS
          [FeeAmount.LOWEST]: PoolState.NOT_EXISTS,
          [FeeAmount.LOW]: PoolState.NOT_EXISTS,
          [FeeAmount.MEDIUM]: PoolState.NOT_EXISTS,
          [FeeAmount.HIGH]: PoolState.NOT_EXISTS,
        },
      ),
    [pools],
  );

  const [showOptions, setShowOptions] = useState(true);
  const [pulsing, setPulsing] = useState(false);

  const previousFeeAmount = usePrevious(feeAmount);

  const handleFeePoolSelectWithEvent = useCallback(
    (fee: FeeAmount) => {
      handleFeePoolSelect(fee);
    },
    [handleFeePoolSelect],
  );

  useEffect(() => {
    if (feeAmount || isLoading || isError) {
      return;
    }

    if (!largestUsageFeeTier) {
      // cannot recommend, open options
      setShowOptions(true);
    } else {
      setShowOptions(false);

      handleFeePoolSelect(largestUsageFeeTier);
    }
  }, [feeAmount, isLoading, isError, largestUsageFeeTier, handleFeePoolSelect]);

  useEffect(() => {
    setShowOptions(isError);
  }, [isError]);

  useEffect(() => {
    if (feeAmount && previousFeeAmount !== feeAmount) {
      setPulsing(true);
    }
  }, [previousFeeAmount, feeAmount]);

  return (
    <div className="flex flex-col gap-2 border border-muted rounded-lg p-3 bg-slate-50 dark:bg-muted">
      <div className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <h4>Select fee tier</h4>
          {feeAmount && distributions && (
            <div>
              <FeeTierPercentageBadge
                distributions={distributions}
                feeAmount={feeAmount}
                poolState={poolsByFeeTier[feeAmount]}
              />
            </div>
          )}
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Icons.info className="size-4" />
          </TooltipTrigger>
          <TooltipContent>Select your pool earnings percentage. Note that swaps favor lowest fee rates.</TooltipContent>
        </Tooltip>
      </div>
      <div
        className={cn(
          'flex flex-col gap-4',
          disabled ? 'pointer-events-none opacity-20' : 'pointer-events-auto opacity-100',
        )}
      >
        <div className="flex items-center justify-between gap-4">
          {!feeAmount ? (
            <>
              <h4>Fee tier</h4>
              <small>Earn fees</small>
            </>
          ) : (
            <p className="large font-medium">{FEE_AMOUNT_DETAIL[feeAmount].label}% fee tier</p>
          )}
          {feeAmount && (
            <>
              <Button variant="outline" onClick={() => setShowOptions(!showOptions)}>
                {showOptions ? <Icons.eyeOff className="size-4 mr-2" /> : <Icons.edit className="size-4 mr-2" />}
                {showOptions ? `Hide` : `Edit`}
              </Button>
            </>
          )}
        </div>

        {showOptions && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[FeeAmount.LOWEST, FeeAmount.LOW, FeeAmount.MEDIUM, FeeAmount.HIGH].map(_feeAmount => {
              return (
                <FeeOption
                  feeAmount={_feeAmount}
                  active={feeAmount === _feeAmount}
                  onClick={() => handleFeePoolSelectWithEvent(_feeAmount)}
                  distributions={distributions}
                  poolState={poolsByFeeTier[_feeAmount]}
                  key={_feeAmount}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeeSelector;
