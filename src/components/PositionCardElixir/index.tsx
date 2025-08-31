import { Bound } from '@/components/LiquidityChartRangeInput/types';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import useIsTickAtLimit, { getPriceOrderingFromPositionForUI, usePool } from '@/hooks/common';
import { useUSDCPrice } from '@/hooks/useUSDCPrice/evm';
import { useTranslation } from '@/locales';
//import { useChainId } from '@/provider';
import { formatTickPrice } from '@/utils/formatTickPrice';
import { unwrappedTokenV3 } from '@/utils/wrappedCurrency';
import { CurrencyAmount, Fraction, Position } from '@pangolindex/sdk';
import numeral from 'numeral';
import { useMemo } from 'react';
import { DoubleCurrencyLogoV2 } from '../DoubleLogoNew';
import { PositionCardProps } from './types';
import { cn } from '@/utils';
import { getBonusRewardEndTime, getBonusRewardTokens } from '@/hooks/evm';
import { getTokenLogoURL } from '../CurrencyLogoV3/getTokenLogoURL';
;
import { useActiveWeb3React } from '@/hooks';
import { useChainId } from '@/provider';

const PositionCard = ({
  tokenId,
  token0,
  token1,
  feeAmount,
  liquidity,
  onClick,
  tickLower,
  tickUpper,
}: PositionCardProps) => {
  const chainId = useChainId();
  const { t } = useTranslation();
  const currency0 = token0 && unwrappedTokenV3(token0, chainId);
  const currency1 = token1 && unwrappedTokenV3(token1, chainId);

  const bonusEndTime = getBonusRewardEndTime(token0, token1, feeAmount);
  const bonusTokens = getBonusRewardTokens(token0, token1, feeAmount);

  const listItems = bonusTokens?.[0]?.map((address: string) => {
    const logoUrl = bonusTokens[0].length > 0 ? getTokenLogoURL(address, chainId, 24) : undefined;

    return (
      <div key={address}>
        <img src={logoUrl} alt="token logo" />
      </div>
    );
  });

  // construct Position from details returned
  const [, pool] = usePool(currency0 ?? undefined, currency1 ?? undefined, feeAmount);
  const position = useMemo(() => {
    if (pool) {
      return new Position({ pool, liquidity: liquidity.toString(), tickLower, tickUpper });
    }
    return undefined;
  }, [liquidity, pool, tickLower, tickUpper]);
  const tickAtLimit = useIsTickAtLimit(feeAmount, tickLower, tickUpper);
  const { priceLower, priceUpper } = getPriceOrderingFromPositionForUI(position);
  // check if price is within range
  const outOfRange: boolean = pool ? pool.tickCurrent < tickLower || pool.tickCurrent >= tickUpper : false;
  const closed: boolean = liquidity.isZero();

  const minPrice = formatTickPrice({
    price: priceLower,
    atLimit: tickAtLimit,
    direction: Bound.LOWER,
  });

  const maxPrice = formatTickPrice({
    price: priceUpper,
    atLimit: tickAtLimit,
    direction: Bound.UPPER,
  });

  const nativePosition = useMemo(() => {
    if (
      pool &&
      position?.liquidity &&
      typeof position?.tickLower === 'number' &&
      typeof position?.tickUpper === 'number'
    ) {
      return new Position({
        pool,
        liquidity: position?.liquidity.toString(),
        tickLower: position?.tickLower,
        tickUpper: position?.tickUpper,
      });
    }
    return undefined;
  }, [position?.liquidity, pool, position?.tickLower, position?.tickUpper]);

  const price0 = useUSDCPrice(token0 ?? undefined);
  const price1 = useUSDCPrice(token1 ?? undefined);

  const fiatValueOfLiquidity: CurrencyAmount | null = useMemo(() => {
    if (!price0 || !price1 || !nativePosition) return null;
    const amount0 = price0.quote(nativePosition?.amount0, chainId);
    const amount1 = price1.quote(nativePosition?.amount1, chainId);
    return amount0.add(amount1);
  }, [price0, price1, nativePosition]);

  const userLiquidity = {
    stat: fiatValueOfLiquidity?.greaterThan(new Fraction('1', '10000'))
      ? numeral(fiatValueOfLiquidity?.toFixed(2)).format('$0.00a')
      : '0',
  };

  const liquidityData = [
    {
      stat: nativePosition?.amount0 ? numeral(nativePosition?.amount0?.toFixed(6)).format('0.00a') : '0',
      currency: currency0,
    },
    {
      stat: nativePosition?.amount1 ? numeral(nativePosition?.amount1?.toFixed(6)).format('0.00a') : '0',
      currency: currency1,
    },
  ];

  return (
    <div
      className={cn(
        'bg-slate-50 dark:bg-muted border rounded-lg p-4 flex justify-between cursor-pointer flex-col md:flex-row gap-4',
        closed && 'bg-gradient-to-tl from-destructive to-slate-50 from-0% to-70% border-destructive dark:to-background',
      )}
      onClick={onClick}
    >
      <div className="flex gap-4 items-start">
        {currency0 && currency1 && <DoubleCurrencyLogoV2 size={32} currency0={currency0} currency1={currency1} />}
        <div className="flex flex-col gap-4 md:gap-2">
          <div className="flex items-center gap-3">
            <h4>
              {currency0?.symbol}-{currency1?.symbol}
            </h4>
            <span className="muted">(#{tokenId.toString()})</span>
            <Badge>{pool ? pool?.fee / 10 ** 4 : 0}%</Badge>
            {Number(bonusEndTime) > Date.now() / 1000 && Number(bonusEndTime) != 0 && (
              <div className="neon-wrapper small">
                <div className="neon-title">Bonus Rewards</div>
                <div className="neon-container">{listItems}</div>
              </div>
            )}
          </div>
          <small>
            {t('common.min')} {minPrice} / {t('common.max')}: {maxPrice} of {currency1?.symbol} per {currency0?.symbol}
          </small>
          <small>
            {userLiquidity.stat} ({liquidityData[0].stat} {currency0?.symbol} / {liquidityData[1].stat}{' '}
            {currency1?.symbol})
          </small>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <Tooltip>
            <TooltipTrigger>
              <Badge variant={!closed ? 'success' : 'destructive'}>
                {!closed ? t('common.open') : t('common.closed')}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {!closed ? t('elixir.positionCard.openTooltipContent') : t('elixir.positionCard.closedTooltipContent')}
            </TooltipContent>
          </Tooltip>
          {!closed && (
            <Tooltip>
              <TooltipTrigger>
                <Badge className="ml-2" variant={outOfRange ? 'destructive' : undefined}>
                  {outOfRange ? t('elixir.positionCard.outOfRange') : t('elixir.positionCard.inRange')}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                {outOfRange
                  ? t('elixir.positionCard.outOfRangeTooltipContent')
                  : t('elixir.positionCard.inRangeTooltipContent')}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
};

export default PositionCard;
