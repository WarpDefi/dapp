import { useQuery } from "@tanstack/react-query"
import { Address } from "viem"
import { fetchListLaunchpad } from "../apis"

export const useFetchListLaunchpad = (page: number, search: string, status: string | null, address?: Address) => {
	return useQuery({
    queryKey: ['fetchListLaunchpad', page, search, status, address],
		queryFn: () => {
			return fetchListLaunchpad(page, search, status, address)
		},
		retry: 3,
		retryDelay: 3000,
		refetchOnMount: true,
		refetchOnReconnect: false,
		refetchOnWindowFocus: false,
  })
}