import { Contract } from '@ethersproject/contracts'
import { CHAINS, WAVAX } from '@pangolindex/sdk'
import { GOVERNANCE_ADDRESS, MINICHEFSP_ADDRESS, MINICHEFSPV2_ADDRESS, PNG } from '../constants'
import { abi as ICanaryPairABI } from '@canarydex/exchange-contracts/artifacts/contracts/canary-core/interfaces/ICanaryPair.sol/ICanaryPair.json'
import GovernorAlpha from '@pangolindex/governance/artifacts/contracts/GovernorAlpha.sol/GovernorAlpha.json'
import Png from '@pangolindex/governance/artifacts/contracts/PNG.sol/Png.json'
import { abi as STAKING_REWARDS_ABI_OLD } from '../artifacts/contracts/StakingRewards.sol/StakingRewards.json'
import { abi as STAKING_REWARDS_ABI } from '../artifacts/contracts/StakingDoubleRewards.sol/StakingDoubleRewards.json'
import { abi as STAKING_REWARDS_NFT_ABI } from '../artifacts/contracts/StakingRewardsNFT.sol/StakingRewardsNFT.json'
import { abi as AIRDROP_ABI } from '../artifacts/contracts/MerkleAirdrop.sol/MerkleAirdrop.json'
import { abi as AUTOCOMPOUND_ABI } from '../artifacts/contracts/CNRAutocompound.sol/CNRAutocompound.json'
import { abi as AUTOCOMPOUNDPAIR_ABI } from '../artifacts/contracts/Autocompound.sol/Autocompound.json'
import { abi as BURNCNR_ABI } from '../artifacts/contracts/StakingRewards.sol/StakingRewards.json'
import { abi as PREDICTION_ABI } from '../artifacts/contracts/PRDC.sol/PRDC.json'
import { abi as MiniChefV2 } from './MiniChefV2.sol/MiniChefV2.json';
import { abi as MiniChefV2SPV2 } from './MiniChefV2.sol/MiniChefV2SPV2.json';
import  MCJ3_ABI  from '../constants/abis/MCJ3.json'
import MiniChef_ABI from '../constants/abis/MiniChef.json'
import  Rewarder_ABI  from '../constants/abis/Rewarder.json'
import { useMemo } from 'react'
import ENS_PUBLIC_RESOLVER_ABI from '../constants/abis/ens-public-resolver.json'
import { ERC20_BYTES32_ABI } from '../constants/abis/erc20'
import ERC20_ABI from '../constants/abis/erc20.json'
import PANGOLIN_V3_REWARDER_ABI from '../constants/abis/PangolinV3Rewarder.json'
import ERC721_ABI from '../constants/abis/erc721.json'
import { MIGRATOR_ABI, MIGRATOR_ADDRESS } from '../constants/abis/migrator'
import WETH_ABI from '../constants/abis/weth.json'
import { MULTICALL_ABI, MULTICALL_NETWORKS } from '../constants/multicall'
import { MINICHEF_ADDRESS, ZERO_ADDRESS } from '../constants'
import { getContract } from '../utils'
import { useActiveWeb3React } from './index'
import { AIRDROP_ADDRESS } from '../constants'
import { AUTOCOMPOUND_ADDRESS } from '../constants'
import { BURNCNR_ADDRESS } from '../constants'
import { PREDICTION_ADDRESS } from '../constants'
import { MULTICALL_ABI_V3, MULTICALL_NETWORKS_V3 } from '@/constants/multicallv3'
;

import NonFungiblePositionManager from 'src/constants/abis/nonfungiblePositionManager.json';
import { useChainId } from '@/provider'

// returns null on errors
export function useContract(address: string | undefined, ABI: any, withSignerIfPossible = true): Contract | null {
  const { library, account } = useActiveWeb3React()

  return useMemo(() => {
    if (!address || !ABI || !library || (address === ZERO_ADDRESS)) return null
    try {
      return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, ABI, library, withSignerIfPossible, account])
}

export function useV2MigratorContract(): Contract | null {
  return useContract(MIGRATOR_ADDRESS, MIGRATOR_ABI, true)
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useNFTTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC721_ABI, withSignerIfPossible)
}

export function useWETHContractBackup(withSignerIfPossible?: boolean): Contract | null {
  return useContract(/*chainId == ChainId.SCROLL ? '0x5300000000000000000000000000000000000004' :*/ '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7', WETH_ABI, withSignerIfPossible)
}

export function useWETHContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? WAVAX[chainId].address : undefined, WETH_ABI, withSignerIfPossible)
}

export function useENSResolverContract(address: string | undefined, withSignerIfPossible?: boolean): Contract | null {
  return useContract(address, ENS_PUBLIC_RESOLVER_ABI, withSignerIfPossible)
}

export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible)
}

export function usePairContract(pairAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(pairAddress, ICanaryPairABI, withSignerIfPossible)
}

export function useMulticallContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId && MULTICALL_NETWORKS[chainId], MULTICALL_ABI, false)
}

export function useMulticallContractV3(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId && MULTICALL_NETWORKS_V3[chainId], MULTICALL_ABI_V3, false)
}

export function usePangolinV3Rewarder(address: string | undefined): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId && address, PANGOLIN_V3_REWARDER_ABI, false)
}

export function useNPM(): Contract | null {
  const chainId = useChainId();
  return useContract(chainId && CHAINS[chainId]?.contracts?.elixir?.nftManager, NonFungiblePositionManager.abi, true)
}

export function useGovernanceContract(): Contract | null {
  return useContract(GOVERNANCE_ADDRESS, GovernorAlpha.abi, true)
}

export function usePngContract(): Contract | null {
  const chainId = useChainId()
  return useContract(chainId ? PNG[chainId].address : undefined, Png.abi, true)
}

export function useStakingContract(stakingAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(stakingAddress, STAKING_REWARDS_ABI, withSignerIfPossible)
}

export function useStakingContractOld(stakingAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(stakingAddress, STAKING_REWARDS_ABI_OLD, withSignerIfPossible)
}

export function useStakingContractNFT(stakingAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(stakingAddress, STAKING_REWARDS_NFT_ABI, withSignerIfPossible)
}

export function useMCJContract(mcjAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(mcjAddress, MCJ3_ABI, withSignerIfPossible)
}

export function useMiniChefContractOld(mcAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(mcAddress, MiniChef_ABI, withSignerIfPossible)
}

export function useMiniChefContract() {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? MINICHEF_ADDRESS[chainId] : undefined, MiniChefV2, true);
}

export function useMiniChefSPContract() {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? MINICHEFSP_ADDRESS[chainId] : undefined, MiniChefV2, true);
}

export function useMiniChefSPV2Contract() {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? MINICHEFSPV2_ADDRESS[chainId] : undefined, MiniChefV2SPV2, true);
}

export function useRewarderContract(rewAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(rewAddress, Rewarder_ABI, withSignerIfPossible)
}

export function useAirdropContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? AIRDROP_ADDRESS[chainId] : undefined, AIRDROP_ABI, true)
}

export function useAutocompoundContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? AUTOCOMPOUND_ADDRESS[chainId] : undefined, AUTOCOMPOUND_ABI, true)
}

export function useAutocompoundPairContract(address: string | undefined): Contract | null {
  //const { chainId } = useActiveWeb3React()
  return useContract(address, AUTOCOMPOUNDPAIR_ABI, true)
}

export function useBurnCNRContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? BURNCNR_ADDRESS[chainId] : undefined, BURNCNR_ABI, true)
}

export function usePredictionContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? PREDICTION_ADDRESS[chainId] : undefined, PREDICTION_ABI, true)
}