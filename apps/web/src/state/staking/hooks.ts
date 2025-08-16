import { useAtomValue } from 'jotai'
import { stakingReducerAtom } from './reducer'

export function useStakingState() {
  return useAtomValue(stakingReducerAtom)
}
