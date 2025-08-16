import { useQuery } from "@tanstack/react-query"
import useActiveWeb3React from "hooks/useActiveWeb3React"
import { fetchListBorrowing } from "../data/fetchListBorrowing"

const QUERY_SETTINGS_IMMUTABLE = {
  retry: 3,
  retryDelay: 3000,
  refetchInterval: 30000, // milliseconds
  refetchOnMount: true,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
}
// Approve contract borrow
export const useListBorrowing = () => {
  const { account } = useActiveWeb3React()
  const { data, isLoading, refetch } = useQuery({
    queryKey: [`fetchListBorrowing`, account],
    queryFn: () => fetchListBorrowing(account),
    ...QUERY_SETTINGS_IMMUTABLE,
  })
  return {data: data?.data, isLoading, refetch}
}
