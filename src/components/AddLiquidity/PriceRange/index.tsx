import { Icons } from '@/components/icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useChainId } from '@/provider';
import { wrappedCurrency } from '@/utils/wrappedCurrency';
import { useTranslation } from 'react-i18next';
import { Bound } from 'src/state/mint/atom';
import PriceInput from './PriceInput';
import { PriceRangeProps } from './types';
import { Button } from '@/components/ui/button';

const PriceRange: React.FC<PriceRangeProps> = props => {
  const {
    priceLower,
    priceUpper,
    onLeftRangeInput,
    onRightRangeInput,
    getDecrementLower,
    getIncrementLower,
    getDecrementUpper,
    getIncrementUpper,
    onClickFullRange,
    currencyA,
    currencyB,
    feeAmount,
    ticksAtLimit,
  } = props;
  const { t } = useTranslation();
  const chainId = useChainId();

  const tokenA = currencyA ? wrappedCurrency(currencyA, chainId) : undefined;
  const tokenB = currencyB ? wrappedCurrency(currencyB, chainId) : undefined;

  const isSorted = tokenA && tokenB && !tokenA.equals(tokenB) && tokenA.sortsBefore(tokenB);

  const leftPrice = isSorted ? priceLower : priceUpper?.invert();
  const rightPrice = isSorted ? priceUpper : priceLower?.invert();

  return (
    <div className="border border-muted rounded-lg p-3 flex flex-col gap-2 bg-slate-50 dark:bg-muted">
      <div className="flex items-center justify-between">
        <h4>Set price range</h4>
        <div className="flex flex-row items-center justify-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Icons.info className="size-4" />
            </TooltipTrigger>
            <TooltipContent align="end">
              The amount may adjust to fit tick size when setting a price range.
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" className="flex gap-2" onClick={onClickFullRange}>
                Full Range
                <Icons.code className="size-4 cursor-pointer" />
              </Button>
            </TooltipTrigger>
            <TooltipContent align="end">Click to choose full range</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="grid grid-rows-2 md:grid-cols-2 md:grid-rows-1 gap-4">
        <PriceInput
          value={ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER] ? '0' : (leftPrice?.toSignificant(5) ?? '')}
          onUserInput={onLeftRangeInput}
          width="48%"
          decrement={isSorted ? getDecrementLower : getIncrementUpper}
          increment={isSorted ? getIncrementLower : getDecrementUpper}
          decrementDisabled={ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER]}
          incrementDisabled={ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER]}
          feeAmount={feeAmount}
          label={leftPrice ? `${currencyB?.symbol}` : '-'}
          title="Min price"
          tokenA={currencyA?.symbol}
          tokenB={currencyB?.symbol}
        />
        <PriceInput
          value={ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER] ? '∞' : (rightPrice?.toSignificant(5) ?? '')}
          onUserInput={onRightRangeInput}
          width="48%"
          decrement={isSorted ? getDecrementUpper : getIncrementLower}
          increment={isSorted ? getIncrementUpper : getDecrementLower}
          incrementDisabled={ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER]}
          decrementDisabled={ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER]}
          feeAmount={feeAmount}
          label={rightPrice ? `${currencyB?.symbol}` : '-'}
          title="Max price"
          tokenA={currencyA?.symbol}
          tokenB={currencyB?.symbol}
        />
      </div>
    </div>
  );
};

export default PriceRange;
