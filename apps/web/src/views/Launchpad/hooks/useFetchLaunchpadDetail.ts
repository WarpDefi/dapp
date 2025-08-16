import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/router"
import { fetchLaunchpadDetail } from "../apis"

export const useFetchLaunchpadDetail = (_contract: string) => {
	const router = useRouter()
	return useQuery({
    queryKey: ['fetchLaunchpadDetail', _contract],
		queryFn: async () => {
			const res = await fetchLaunchpadDetail(_contract)
			if(!res.status) {
				router.push('/404')
			}
			return res?.status ? res.data : null
		},
		enabled: Boolean(_contract),
		retry: 3,
		retryDelay: 3000,
		refetchOnMount: true,
		refetchOnReconnect: false,
		refetchOnWindowFocus: false,
		// refetchInterval: 60000,
  })
}