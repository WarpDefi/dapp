import { atom, useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

const userChartAtom = atomWithStorage('pcs:user-chart', true)
const mobileUserChartAtom = atom(true)

export function useUserChart(isMobile: boolean) {
  return useAtom(isMobile ? mobileUserChartAtom : userChartAtom)
}
