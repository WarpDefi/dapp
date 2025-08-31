// src/hooks/usePoolMetrics.ts
import { useMemo } from 'react';
import { usePoolDatasN } from '@/data/pools/poolDataN';
//import { useChainId } from '@/provider';
import { useActiveWeb3React, useUnderlyingTokensHook } from '@/hooks';
import { getBonusRewardEndTime, getBonusRewardTokens } from '@/hooks/evm';
import { CurrencyAmount, Fraction, FeeAmount, Token } from '@pangolindex/sdk';
import { useUSDCPriceHook } from './useUSDCPrice';
import { useChainId } from '@/provider';
;

export function calcVolume(data): number {
  if (!data) return 0;
  const arr = Object.values(data);
  return arr.length ? Number(arr[0].volumeUSD.toFixed(0)) : 0;
}

export function calcTVL(data, price0, price1, u0, u1, chainId): number {
  /*if (!data || !price0 || !price1 || !u0 || !u1) return 0;
  const total = price0.quote(u0, chainId).add(price1.quote(u1, chainId));
  return total.greaterThan(new Fraction('1','100'))
    ? parseFloat(total.toFixed(2))
    : 0;*/
    if (!data) return 0;
  const arr = Object.values(data);
  return arr.length ? Number(arr[0].tvlUSD.toFixed(0)) : 0;
}

export function calcAPR(
  volumeUSD,
  volumeUSDWeek,
  tvl,
  feeTier
): number {
  if (!volumeUSD || tvl <= 0) return 0;
  const volume = volumeUSD > (volumeUSDWeek / 7) ? volumeUSD : volumeUSDWeek / 7;
  const feePercent = Number(feeTier) / 10000;
  const dailyFees  = volume * feePercent;
  return (dailyFees * 365) / tvl;
}



/**
 * Returns the 24h volume in USD (rounded to integer).
 */
export function useVolume(
  token0: Token,
  token1: Token,
  initialFee: FeeAmount
): number {
  const { loading, error, data } = usePoolDatasN(token0, token1, initialFee);

  if (loading || error || !data) return 0;

  const poolsArray = Object.values(data);
  if (poolsArray.length === 0) return 0;

  return Number(poolsArray[0].volumeUSD.toFixed(0));
}

/**
 * Returns the total value locked (TVL) in USD (with 2 decimal precision).
 */
export function useTVL(
  token0: Token,
  token1: Token,
  initialFee: FeeAmount
): number {
  const chainId = useChainId();
  const useUSDCPrice = useUSDCPriceHook[chainId];
  const useUnderlyingTokens = useUnderlyingTokensHook[chainId];

  const price0 = useUSDCPrice(token0);
  const price1 = useUSDCPrice(token1);
  const [underlying0, underlying1] = useUnderlyingTokens(token0, token1, initialFee);

  const total = useMemo<CurrencyAmount | null>(() => {
    if (!price0 || !price1 || !underlying0 || !underlying1) return null;
    const amt0 = price0.quote(underlying0, chainId);
    const amt1 = price1.quote(underlying1, chainId);
    return amt0.add(amt1);
  }, [price0, price1, underlying0, underlying1, chainId]);

  if (!total || !total.greaterThan(new Fraction('1', '100'))) return 0;
  return parseFloat(total.toFixed(2));
}

/**
 * Returns the APR percentage (e.g. 12.34 for 12.34%).
 */
export function useAPR(
  token0: Token,
  token1: Token,
  initialFee: FeeAmount,
  feeTier: FeeAmount
): number {
  const { loading, error, data } = usePoolDatasN(token0, token1, initialFee);
  const chainId = useChainId();
  const useUSDCPrice = useUSDCPriceHook[chainId];
  const useUnderlyingTokens = useUnderlyingTokensHook[chainId];

  const price0 = useUSDCPrice(token0);
  const price1 = useUSDCPrice(token1);
  const [underlying0, underlying1] = useUnderlyingTokens(token0, token1, initialFee);

  // calculate TVL
  const tvl = useMemo<number>(() => {
    if (!price0 || !price1 || !underlying0 || !underlying1) return 0;
    const amt0 = price0.quote(underlying0, chainId);
    const amt1 = price1.quote(underlying1, chainId);
    const sum = amt0.add(amt1);
    return parseFloat(sum.toFixed(2));
  }, [token0, token1, initialFee, useUSDCPrice, useUnderlyingTokens, chainId]);

  if (loading || error || !data || tvl <= 0) return 0;

  const poolsArray = Object.values(data);
  if (poolsArray.length === 0) return 0;

  const volumeUSD = parseFloat(poolsArray[0].volumeUSD);
  const feePercent = Number(feeTier) / 10000;
  const dailyFees = volumeUSD * feePercent;

  // APR = (dailyFees * 365 / 100) / tvl * 100
  return (dailyFees * 365) / tvl;
}

/**
 * Returns the bonus reward end time as a string.
 */
export function useEndTimeBonus(
  token0: Token,
  token1: Token,
  initialFee: FeeAmount
): number {
  return getBonusRewardEndTime(token0, token1, initialFee);
}

/**
 * Returns the bonus reward tokens string.
 */
export function useBonusTokens(
  token0: Token,
  token1: Token,
  initialFee: FeeAmount
): string {
  return getBonusRewardTokens(token0, token1, initialFee);
}
