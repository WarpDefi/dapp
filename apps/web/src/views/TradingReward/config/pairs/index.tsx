import { ChainId } from '@pancakeswap/chains'
import { farmsV3 } from '@pancakeswap/farms/constants/u2uNebulas'
import { ComputedFarmConfigV3, FarmV3SupportedChainId } from '@pancakeswap/farms/src'

// Edge Case Farms

export const tradingRewardPairConfigChainMap: Record<FarmV3SupportedChainId, ComputedFarmConfigV3[]> = {
  [ChainId.U2U_NEBULAS]: [...farmsV3],
}
