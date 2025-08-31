import { CurrencyAmount, CAVAX, JSBI, ChainId } from '@pangolindex/sdk'
import { MIN_ETH } from '../constants'

/**
 * Given some token amount, return the max that can be spent of it
 * @param currencyAmount to return max of
 */
export function maxAmountSpend(currencyAmount?: CurrencyAmount, chainId?: ChainId): CurrencyAmount | undefined {
  if (!currencyAmount) return undefined
  if (currencyAmount.currency === CAVAX[chainId ?? ChainId.AVALANCHE]) {
    if (JSBI.greaterThan(currencyAmount.raw, MIN_ETH)) {
      return CurrencyAmount.ether(JSBI.subtract(currencyAmount.raw, MIN_ETH), chainId ?? ChainId.AVALANCHE)
    } else {
      return CurrencyAmount.ether(JSBI.BigInt(0), chainId ?? ChainId.AVALANCHE)
    }
  }
  return currencyAmount
}
