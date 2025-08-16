import { getStakingContract } from 'utils/contractHelpers'

export const stake = async (stakingContract: ReturnType<typeof getStakingContract>, amount: string, contractId: string) => {
  if (!stakingContract.account) return undefined
  return stakingContract.write.stake([contractId], {
    // gas: DEFAULT_GAS_LIMIT,
    // gasPrice,
    account: stakingContract.account,
    chain: stakingContract.chain,
    value: amount,
  })
}

export const unStake = async (stakingContract: ReturnType<typeof getStakingContract>, tokenId: string) => {
  if (!stakingContract.account) return undefined
  return stakingContract.write.unStake([tokenId.toString()])
}

export const withdraw = async (stakingContract: ReturnType<typeof getStakingContract>, tokenId: string) => {
  if (!stakingContract.account) return undefined
  return stakingContract.write.withdraw([tokenId.toString()])
}

export const claimReward = async (stakingContract: ReturnType<typeof getStakingContract>, tokenId: string) => {
  try {
    return stakingContract.write.claimReward([tokenId])
  } catch (e) {
    console.error(e)
    return undefined
  }
}

/// Read Proxy
export const validator = async (stakingContract: ReturnType<typeof getStakingContract>) => {
  try {
    return stakingContract.read.validator() // id
  } catch (e) {
    console.error(e)
    return undefined
  }
}

export const withdrawalPeriodTime = async (stakingContract: ReturnType<typeof getStakingContract>) => {
  try {
    return stakingContract.read.withdrawalPeriodTime() // seconds
  } catch (e) {
    console.error(e)
    return undefined
  }
}

export const pendingReward = async (stakingContract: ReturnType<typeof getStakingContract>, tokenId: string) => {
  try {
    return stakingContract.read.pendingReward([tokenId.toString()]) // bigint
  } catch (e) {
    console.error(e)
    return undefined
  }
}
