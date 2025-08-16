import { useQuery } from "@tanstack/react-query"
import dayjs from "dayjs"
import { Address } from "viem"
import { fetchUserInfo } from "../api"
import { TimeType } from "../types"


export const useFetchUserInfo = (address: Address | undefined, txtFilter: number | undefined, customTime?: {
	startDate: number | null,
	endDate: number | null
}) => {
	const currentDate = dayjs().utc().set('hour', 0).set('minute', 0).set('second', 0)
	let query = ''
	if(txtFilter === TimeType.PREV) {
		query = `from=${Math.floor(dayjs(currentDate).subtract(1, 'day').valueOf()/ 1000)}&to=${Math.floor(dayjs(currentDate).subtract(1, 'day').valueOf() / 1000)}`
	}
	if(txtFilter === TimeType.WEEK) {
		query = `from=${Math.floor(dayjs(currentDate).subtract(7, 'days').valueOf()/ 1000)}&to=${Math.floor(dayjs(currentDate).valueOf() / 1000)}`
	}

	if(txtFilter === TimeType.MONTH) {
		query = `from=${Math.floor(dayjs(currentDate).subtract(30, 'days').valueOf()/ 1000)}&to=${Math.floor(dayjs(currentDate).valueOf() / 1000)}`
	}

	if(txtFilter === TimeType.CUSTOM && customTime?.startDate && customTime?.endDate) {
		query = `from=${customTime.startDate}&to=${customTime.endDate}`
	}

	return useQuery({ 
		queryKey: ['fetchUserInfo', address, txtFilter, customTime],
		queryFn: () => { return fetchUserInfo(address, query)},
		retry: 3,
		enabled: Boolean(address && ((txtFilter && txtFilter !== TimeType.CUSTOM && !customTime?.startDate) || (txtFilter === TimeType.CUSTOM && customTime?.startDate && customTime.endDate))),
		retryDelay: 3000,
		refetchOnMount: true,
		refetchOnReconnect: false,
		refetchOnWindowFocus: false,
  })
}