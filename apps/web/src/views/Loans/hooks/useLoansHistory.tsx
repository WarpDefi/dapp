import { useQuery } from "@tanstack/react-query"
import useActiveWeb3React from "hooks/useActiveWeb3React"
import { fetchLoansHistory } from "../data/fetchLoansHistory"

const QUERY_SETTINGS_IMMUTABLE = {
  retry: 3,
  retryDelay: 3000,
  refetchInterval: 10000, // milliseconds
  refetchOnMount: true,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
}
// Approve contract borrow
export const useLoansHistory = (page: number, sortField: string, sortDirection: boolean ) => {
  const { account } = useActiveWeb3React()
  const { data, isLoading, refetch } = useQuery({
    queryKey: [`fetchLoansHistory`, account, page, sortField, sortDirection],
    queryFn: () => fetchLoansHistory(account?.toLowerCase(), page, sortField, sortDirection),
    ...QUERY_SETTINGS_IMMUTABLE,
  })
  return {data: data?.data, isLoading, refetch}
}
