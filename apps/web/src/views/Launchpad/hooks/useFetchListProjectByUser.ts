import { useQuery } from "@tanstack/react-query"
import { Address } from "viem"
import { fetchListProjectByUser } from "../apis"

export const useFetchListProjectByUser = (_user?: Address) => {
	return useQuery({
    queryKey: ['fetchListProjectByUser', _user],
		queryFn: async () => {
			const res = await fetchListProjectByUser(_user)
			return res?.data
		},
		enabled: Boolean(_user),
		retry: 3,
		retryDelay: 3000,
		refetchOnMount: true,
		refetchOnReconnect: false,
		refetchOnWindowFocus: false,
  })
}