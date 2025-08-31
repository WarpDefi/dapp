// hooks/useV3PoolAddress.ts
import { useMemo } from 'react'
import { CHAINS, Currency, Token, WAVAX } from '@pangolindex/sdk'          // veya '@uniswap/sdk-core'
import { FeeAmount, computePoolAddress } from '@pangolindex/sdk' // veya '@uniswap/v3-sdk'
import { FACTORY_ADDRESS } from '@/constants'     // zincire göre factory adresleri

/**
 * İki token ve ücret parametresi alır, deterministik V3 havuz adresini döner.
 */
export const useV3PoolAddress = (
  tokenA?: Currency,
  tokenB?: Currency,
  fee: FeeAmount = FeeAmount.MEDIUM,   // 0.3 %
): string | undefined =>
  useMemo(() => {
    const tokenAt = currencyToToken(tokenA);
    const tokenBt = currencyToToken(tokenB);
    if (!tokenAt || !tokenBt) return undefined

    const [token0, token1] =
    tokenAt.address.toLowerCase() < tokenBt.address.toLowerCase()
        ? [tokenAt, tokenBt]
        : [tokenBt, tokenAt]

    try {
      return computePoolAddress({
        factoryAddress: CHAINS[token0.chainId]?.contracts?.elixir?.factory,
        tokenA: token0,
        tokenB: token1,
        fee,
        initCodeHashManualOverride: undefined,
        chainId: token0.chainId,
      })
    } catch {
      return undefined
    }
  }, [tokenA, tokenB, fee])

  export function currencyToToken(
    currency?: Currency | Token,
  ): Token | undefined {
    if (!currency) return undefined
  
    if (currency instanceof Token) return currency;

      return WAVAX[43114];
}
