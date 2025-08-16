import { useQuery } from '@tanstack/react-query'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import forEach from 'lodash/forEach'

import { publicClient } from 'utils/wagmi'
import { erc20ABI } from 'wagmi'

export const useFetchListBalance = (listToken: any) => {
	const { account , chainId } = useAccountActiveChain()
	const client = publicClient({ chainId })
  return useQuery({
    queryKey: ['fetchListBalance', account],
    queryFn: async () => {
			const listContract: any = listToken.map((item) => {
				return {
					address: item.contractAddress,
					abi: erc20ABI,
					functionName: 'balanceOf',
					args: [account] 
				}
			})
			const results = await client.multicall({
				contracts: listContract
			})
			const listBalanceById: any = {}
			forEach(listToken, (item, index) => {
				listBalanceById[item.contractAddress] = {...results[index], symbol: item.symbol}
			})
			return listBalanceById
    },

    enabled: Boolean(account) && listToken.length > 0,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  })

}
