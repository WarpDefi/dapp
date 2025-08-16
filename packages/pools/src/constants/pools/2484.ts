import { u2uNebulasTokens } from '@pancakeswap/tokens'
import { getAddress } from 'viem'

import { PoolCategory, SerializedPool } from '../../types'

export const livePools: SerializedPool[] = [
  {
    sousId: 0,
    stakingToken: u2uNebulasTokens.wu2u,
    earningToken: u2uNebulasTokens.usdt,
    contractAddress: '0x6d096E37A7eC4f933fE66155c6F14Fb40556975C',
    poolCategory: PoolCategory.CORE,
    tokenPerBlock: '0.01',
    isFinished: false,
  },
].map((p) => ({
  ...p,
  contractAddress: getAddress(p.contractAddress, 97),
  stakingToken: p.stakingToken.serialize,
  earningToken: p.earningToken.serialize,
}))

// known finished pools
export const finishedPools: SerializedPool[] = []

export const pools: SerializedPool[] = [...livePools, ...finishedPools]
