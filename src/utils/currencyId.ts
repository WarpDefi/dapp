import { Currency, CAVAX, Token } from '@pangolindex/sdk'

export function currencyId(currency: Currency): string {
  if (currency === CAVAX[43114]) return 'AVAX'
  if (currency instanceof Token) return currency.address
  throw new Error('invalid currency')
}
