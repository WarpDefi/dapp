import { useQuery } from '@tanstack/react-query'
import { BigNumber } from 'ethers'

export function useGetHolders({ contractaddress }) {
  return useQuery({
    queryKey: [`getHolders/${contractaddress}`],
    queryFn: async () => {
      const res = await Promise.all([
        fetch(`https://testnet.u2uscan.xyz/api?module=token&action=getToken&contractaddress=${contractaddress}`),
        fetch(
          `https://testnet.u2uscan.xyz/api?module=token&action=getTokenHolders&contractaddress=${contractaddress}&page=1&offset=10`,
        ),
      ])
      const token = await res[0]?.json()
      const listHolders = await res[1]?.json()
      let totalTopHolder = BigNumber.from(0)
      listHolders?.result.forEach((item) => {
        totalTopHolder = totalTopHolder.add(item.value)
      })
      const listHoldersResult =
        listHolders?.result?.length > 0
          ? [
              ...listHolders?.result,
              {
                address: 'Remaining Holders',
                value: token?.result?.totalSupply
                  ? BigNumber.from(token?.result.totalSupply).sub(totalTopHolder).toString()
                  : 0,
              },
            ]
          : []

      return {
        token: token?.result,
        listHolders: listHoldersResult,
      }
    },
    enabled: Boolean(contractaddress),
    retry: 3,
    retryDelay: 3000,
  })
}
