import { useQuery } from "@tanstack/react-query"
import { Address } from "viem"
import { fetchListHistory } from "../apis"

export const useFetchTransactionHistory = (_user: Address, _launchpadManager: Address, page: number) => {
	return useQuery({
    queryKey: ['fetchTransactionHistory', _user, _launchpadManager, page],
		queryFn: async () => {
			const res = await fetchListHistory(_user, _launchpadManager, page)
			return res.data || []
		},
		enabled: Boolean(_user) && Boolean(_launchpadManager),
		retry: 3,
		retryDelay: 3000,
		refetchOnMount: true,
		refetchOnReconnect: false,
		refetchOnWindowFocus: false,
  })
}