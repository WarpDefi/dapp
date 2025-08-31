import { Interface } from '@ethersproject/abi'
import { abi as STAKING_REWARDS_ABI } from '../../artifacts/contracts/StakingDoubleRewards.sol/StakingDoubleRewards.json'
import { abi as STAKING_REWARDS_ABI_S } from '../../artifacts/contracts/StakingDoubleRewards.sol/StakingDoubleRewards_s.json'

const STAKING_REWARDS_INTERFACE = new Interface(STAKING_REWARDS_ABI)
const STAKING_REWARDS_INTERFACE_S = new Interface(STAKING_REWARDS_ABI_S)

export { STAKING_REWARDS_INTERFACE }
export { STAKING_REWARDS_INTERFACE_S }

