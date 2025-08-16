import { useQuery } from "@tanstack/react-query"
import { fetchPoolCandleByInterval } from "state/swap/fetch/fetchPoolCandle"

const QUERY_SETTINGS_IMMUTABLE = {
  retry: 3,
  retryDelay: 3000,
  keepPreviousData: true,
  refetchOnMount: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
}
export function usePoolCandle(pairs: Array<string>, from: number, to: number, resolution: string | number) {
  const { data } = useQuery({
    queryKey: [pairs, resolution, 'candle-interval'],
    queryFn: () => fetchPoolCandleByInterval(pairs, from, to, resolution),
    enabled: Boolean(pairs && resolution && from),
    ...QUERY_SETTINGS_IMMUTABLE,
    refetchInterval: 10000,
  })
  return data
}