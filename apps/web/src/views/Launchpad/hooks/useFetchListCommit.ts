import { useQuery } from "@tanstack/react-query"
import { Address } from "viem"
import { fetchListCommitted } from "../apis"

export const useFetchListCommit = (_user: Address, _launchpadManager: Address) => {
	return useQuery({
    queryKey: ['fetchListUserCommit', _user, _launchpadManager],
		queryFn: async () => {
			const res = await fetchListCommitted(_user, _launchpadManager)
			return res.data
		},
		enabled: Boolean(_user) && Boolean(_launchpadManager),
		retry: 3,
		retryDelay: 3000,
		refetchOnMount: true,
		refetchOnReconnect: false,
		refetchOnWindowFocus: false,
  })
}