import { DeserializedFarmsState, DeserializedFarmUserData } from '@pancakeswap/farms'
import { getFarmConfig } from '@pancakeswap/farms/constants'
import { useQuery } from '@tanstack/react-query'
import { SLOW_INTERVAL } from 'config/constants'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch } from 'state'
import { getMasterChefContract } from 'utils/contractHelpers'
import { useBCakeProxyContractAddress } from 'views/Farms/hooks/useBCakeProxyContractAddress'

import { ChainId } from '@pancakeswap/sdk'
import { CAKE } from '@pancakeswap/tokens'
import { formatUnits } from '@pancakeswap/utils/viem/formatUnits'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useTokenContract } from 'hooks/useContract'
import { useAccount } from 'wagmi'
import { fetchFarmsPublicDataAsync, fetchFarmUserDataAsync } from '.'
import {
  farmSelector,
  makeFarmFromPidSelector,
  makeLpTokenPriceFromLpSymbolSelector,
  makeUserFarmFromPidSelector,
} from './selectors'

const QUERY_SETTINGS_IMMUTABLE = {
  retry: 3,
  retryDelay: 3000,
  keepPreviousData: true,
  refetchOnMount: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
}
export function useFarmsLength() {
  const { chainId } = useActiveChainId()
  return useQuery({
    queryKey: ['farmsLength', chainId],

    queryFn: async () => {
      const mc = getMasterChefContract(undefined, chainId)
      return Number(await mc.read.poolLength())
    },

    enabled: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
}

export function useRewardBalance() {
  const { address: account } = useAccount()
  const wRewardContract = useTokenContract(CAKE[ChainId.U2U_NEBULAS].address)

  return useQuery({
    queryKey: ['rewardBalance', account],

    queryFn: async () => {
      const balance = await wRewardContract?.read.balanceOf([account])
      return formatUnits(balance, CAKE[ChainId.U2U_NEBULAS].decimals)
    },

    enabled: Boolean(account),
    ...QUERY_SETTINGS_IMMUTABLE,
    refetchInterval: 3000,
  })
}

export function useFarmV2PublicAPI() {
  const { chainId } = useActiveChainId()
  return useQuery({
    queryKey: ['farm-v2-pubic-api', chainId],

    queryFn: async () => {
      return fetch(`https://farms-api.pancakeswap.com/${chainId}`)
        .then((res) => res.json())
        .then((res) => res.data)
    },

    enabled: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
}

export const usePollFarmsWithUserData = () => {
  const dispatch = useAppDispatch()
  const { account, chainId } = useAccountActiveChain()
  const {
    proxyAddress,
    proxyCreated,
    isLoading: isProxyContractLoading,
  } = useBCakeProxyContractAddress(account, chainId)

  useQuery({
    queryKey: ['publicFarmData', chainId],

    queryFn: async () => {
      if (!chainId) {
        throw new Error('ChainId is not defined')
      }
      const farmsConfig = await getFarmConfig(chainId)
      if (!farmsConfig) {
        throw new Error('Failed to fetch farm config')
      }
      const pids = farmsConfig.map((farmToFetch) => farmToFetch.pid)

      dispatch(fetchFarmsPublicDataAsync({ pids, chainId }))
      return null
    },

    enabled: false,
    refetchInterval: SLOW_INTERVAL,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  const name = proxyCreated
    ? ['farmsWithUserData', account, proxyAddress, chainId]
    : ['farmsWithUserData', account, chainId]

  useQuery({
    queryKey: name,

    queryFn: async () => {
      if (!account || !chainId) return

      const farmsConfig = await getFarmConfig(chainId)

      if (!farmsConfig) return
      const pids = farmsConfig.map((farmToFetch) => farmToFetch.pid)
      const params = proxyCreated ? { account, pids, proxyAddress, chainId } : { account, pids, chainId }
      dispatch(fetchFarmUserDataAsync(params))
    },
    enabled: Boolean(account && chainId && !isProxyContractLoading),
    refetchInterval: SLOW_INTERVAL,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
}

export const useFarms = (): DeserializedFarmsState => {
  const { chainId } = useActiveChainId()
  return useSelector(useMemo(() => farmSelector(chainId), [chainId]))
}

export const useFarmFromPid = (pid: number) => {
  const farmFromPid = useMemo(() => makeFarmFromPidSelector(pid), [pid])
  return useSelector(farmFromPid)
}

export const useFarmUser = (pid): DeserializedFarmUserData => {
  const farmFromPidUser = useMemo(() => makeUserFarmFromPidSelector(pid), [pid])
  return useSelector(farmFromPidUser)
}

export const useLpTokenPrice = (symbol: string) => {
  const lpTokenPriceFromLpSymbol = useMemo(() => makeLpTokenPriceFromLpSymbolSelector(symbol), [symbol])
  return useSelector(lpTokenPriceFromLpSymbol)
}
