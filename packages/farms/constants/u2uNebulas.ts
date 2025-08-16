import { u2uNebulasTokens } from '@pancakeswap/tokens'
import { FeeAmount } from '@pancakeswap/v3-sdk'
import { defineFarmV3Configs } from '../src/defineFarmV3Configs'

export const farmsV3 = defineFarmV3Configs([
  // {
  //   pid: 3,
  //   lpAddress: '0xb7ff2cd12acfb9d175407d05066661b7b95dba51',
  //   token0: u2uNebulasTokens.cake,
  //   token1: u2uNebulasTokens.usdc,
  //   feeAmount: FeeAmount.LOW,
  // },
  {
    pid: 1,
    lpAddress: '0x5a44b5dc588018e7f9f1bc39b72d476a6355db89',
    token0: u2uNebulasTokens.wu2u,
    token1: u2uNebulasTokens.usdt,
    feeAmount: FeeAmount.HIGH,
  },
  {
    pid: 2,
    lpAddress: '0x546B56f6a294750ea44d0b58cA2BB0a7201518e6',
    token0: u2uNebulasTokens.wu2u,
    token1: u2uNebulasTokens.usdt,
    feeAmount: FeeAmount.LOW,
  },
  {
    pid: 3,
    lpAddress: '0xfb61397fa89da0e8eeb717a2f8d0565317ce4de6',
    token0: u2uNebulasTokens.wbtc,
    token1: u2uNebulasTokens.usdt,
    feeAmount: FeeAmount.LOW,
  }
  // {
  //   pid: 2,
  //   lpAddress: '0x0d71d040dccc62ad8faf1a66c13ac5526eae35ac',
  //   token0: u2uNebulasTokens.wu2u,
  //   token1: u2uNebulasTokens.cake,
  //   feeAmount: FeeAmount.LOW,
  // },
])
