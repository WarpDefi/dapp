import { Token } from '@pancakeswap/swap-sdk-core'
import { describe, expect, it } from 'vitest'
import tryParseAmount from './tryParseAmount'

describe('utils/tryParseAmount', () => {
  it('should be undefined when no valid input', () => {
    expect(tryParseAmount()).toBeUndefined()
  })
  it('should be undefined when input is 0', () => {
    expect(tryParseAmount('0.00')).toBeUndefined()
  })

  it('should pared value', () => {
    expect(
      tryParseAmount(
        '100',
        new Token(
          56,
          '0x6d7ce523d59C59De27BB755A1981f4043e79C70E',
          18,
          'CAKE',
          'GroFi DEX Token',
          'https://pancakeswap.finance/',
        ),
      ),
    ).toBeTruthy()
  })
})
