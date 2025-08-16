import { Token } from '@pancakeswap/sdk'
import { describe, expect, it } from 'vitest'
import { FeeAmount } from '../constants'
import { computePoolAddress } from './computePoolAddress'

describe('#computePoolAddress', () => {
  const deployerAddress = '0x498B984411D5211fF1F17531697b896a03Ffd7a8'
  it('should correctly compute the pool address', () => {
    const tokenA = new Token(1, '0x9a0359e8432C856e1EEfc6F2E242b5dfEd41B3ec', 18, 'USDC', 'USD Coin')
    const tokenB = new Token(1, '0x4B9F8077856d81c5E97948dbeC8960024D4908C1', 18, 'DAI', 'DAI Stablecoin')
    const result = computePoolAddress({
      deployerAddress,
      fee: FeeAmount.LOW,
      tokenA,
      tokenB,
      initCodeHashManualOverride: '0x34fe98aefc7b111647fe0dfe9c361b57b704a434f64c749daef6d539a8c086fc',
    })

    expect(result).toEqual('0xe63b700c87b8058f439189732c4e8a90baf180ae')
  })
})
