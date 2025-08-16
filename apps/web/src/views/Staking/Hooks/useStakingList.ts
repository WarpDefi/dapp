import { bigIntToBigNumber } from '@pancakeswap/utils/bigNumber'
import { useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { gql } from 'graphql-request'
import { useStakingContract } from 'hooks/useContract'
import { pendingReward, withdrawalPeriodTime } from 'utils/calls/staking'
import { ammStakingClients } from 'utils/graphql'
import { useAccount } from 'wagmi'
import useStakingConfig from './useStakingConfig'

export interface StakedInfo {
  id: string
  amount: string
  amountDisplay: string
  timestamp: number
  reward: BigNumber
  rewardDisplay: string
}

export interface StakingResponse {
  id: string
  totalPackage: number
  totalStakedAmount: BigNumber
  totalStakedDisplay: string
  totalReward: BigNumber
  totalRewardDisplay: string
  staked: StakedInfo[]
  unStake: StakedInfo[]
}

export function useStakingList() {
  const { address: account } = useAccount()
  const stakingContract = useStakingContract()
  const { currency, isWrongNetwork } = useStakingConfig()

  const formatAmount = (value: BigNumber) => {
    const rawValue: BigNumber = value.dividedBy(bigIntToBigNumber(10n ** BigInt(currency?.decimals ?? 18)))
    return BigNumber(rawValue.toFixed(6, BigNumber.ROUND_DOWN)).toString()
  }

  async function fetchWithdrawPeriodTime() {
    const value = await withdrawalPeriodTime(stakingContract)
    return Number(value)
  }

  async function fetchRewards(dataList: StakedInfo[]) {
    const results: any[] = []
    for (const e of dataList) {
      results.push(pendingReward(stakingContract, e.id))
    }
    return Promise.all(results)
  }

  async function fetchStakingList(address: string | undefined) {
    const periodTime = await fetchWithdrawPeriodTime()
    if (address == null) {
      return {
        user: null,
        periodTime: Number.NaN,
        error: true
      }
    }
    try {
      const STAKING_LIST_QUERY = gql`
        query getStakingList($address: String!) {
          user(id: $address) {
            id
            staked(orderDirection: desc, orderBy: timestamp) {
              id
              amount
              timestamp
            }
            unStake(orderDirection: desc, orderBy: timestamp) {
              id
              amount
              timestamp
            }
          }
        }
      `

      const { user } = await ammStakingClients.request<{ user: StakingResponse | null }>(STAKING_LIST_QUERY, {
        address,
      })
      if (user == null) {
        return {
          user,
          periodTime,
        }
      }

      user.totalPackage = user.staked.length + user.unStake.length
      user.totalStakedAmount = BigNumber(0)
      user.totalReward = BigNumber(0)

      const stakedRewardLi = await fetchRewards(user.staked)
      for (let i = 0; i < user.staked.length; ++i) {
        user.staked[i].amountDisplay = formatAmount(new BigNumber(user.staked[i].amount))
        user.staked[i].reward = bigIntToBigNumber(stakedRewardLi[i] as bigint)
        user.staked[i].rewardDisplay = formatAmount(user.staked[i].reward)

        // total
        user.totalStakedAmount = user.totalStakedAmount.plus(BigNumber(user.staked[i].amount))
        user.totalReward = user.totalReward.plus(user.staked[i].reward)
      }

      const unStakeRewardLi = await fetchRewards(user.unStake)
      for (let i = 0; i < user.unStake.length; ++i) {
        user.unStake[i].amountDisplay = formatAmount(new BigNumber(user.unStake[i].amount))
        user.unStake[i].reward = bigIntToBigNumber(unStakeRewardLi[i] as bigint)
        user.unStake[i].rewardDisplay = formatAmount(user.unStake[i].reward)

        // total
        user.totalReward = user.totalReward.plus(user.unStake[i].reward)
      }

      user.totalStakedDisplay = formatAmount(user.totalStakedAmount)
      user.totalRewardDisplay = formatAmount(user.totalReward)
      return {
        user,
        periodTime,
      }
    } catch (e) {
      console.error(e)
      return {
        user: null,
        periodTime: Number.NaN,
        error: true
      }
    }
  }

  const { data, refetch, isPending, isFetching, error } = useQuery({
    queryKey: ['amm-subgraphs/staking/list', currency.chainId, account],
    queryFn: async () => {
      return fetchStakingList(account?.toLowerCase())
    },
    enabled: Boolean(account) && !isWrongNetwork,
    refetchInterval: 30000, // milliseconds
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: 3000,
    refetchOnMount: true,
  })
  
  return {
    refresh: refetch,
    data: data?.user,
    loading: (isPending || isWrongNetwork) && account,
    syncing: isFetching,
    periodTime: data?.periodTime,
    error,
  }
}
