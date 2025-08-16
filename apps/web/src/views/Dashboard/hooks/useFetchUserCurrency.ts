import { useQuery } from "@tanstack/react-query"
import { fetchUserCurrency } from "../api"


export const useFetchUserCurrency = () => {
	return useQuery({ 
		queryKey: ['useFetchUserCurrency'],
		queryFn: fetchUserCurrency,
		retry: 3,
		retryDelay: 3000,
		refetchOnMount: true,
		refetchOnReconnect: false,
		refetchOnWindowFocus: false,
  })
}