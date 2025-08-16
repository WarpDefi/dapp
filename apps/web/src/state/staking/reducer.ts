import { createReducer } from '@reduxjs/toolkit'
import { atomWithReducer } from 'jotai/utils'
import { replaceStakingState, resetStakingState, updateCalculateApr, updateSlippagePercent, updateStakingAmountError } from './actions'

export interface StakingState {
  readonly stakingAmount: string
  readonly stakingAmountError: string
  readonly slippagePercent: number | undefined
  readonly apr: string // % | NaN
  readonly estimatedRewards: string // % | NaN
}

const initialState: StakingState = {
  stakingAmount: '',
  stakingAmountError: '',
  apr: 'NaN',
  estimatedRewards: 'NaN',
  slippagePercent: undefined,
}

const reducer = createReducer<StakingState>(initialState, (builder) =>
  builder
    .addCase(replaceStakingState, (state, { payload: { amount, amountError, percent } }) => {
      return {
        stakingAmount: amount,
        stakingAmountError: amountError,
        slippagePercent: percent,
        apr: state.apr,
        estimatedRewards: state.estimatedRewards,
      }
    })
    .addCase(updateSlippagePercent, (state, { payload: percent }) => {
      state.slippagePercent = percent
    })
    .addCase(updateStakingAmountError, (state, { payload: msg }) => {
      state.stakingAmountError = msg
    })
    .addCase(updateCalculateApr, (state, { payload: { apr, estimatedRewards} }) => {
      state.apr = apr ?? 'NaN'
      state.estimatedRewards = estimatedRewards ?? 'NaN'
    })
    .addCase(resetStakingState, () => initialState),
)

export const stakingReducerAtom = atomWithReducer(initialState, reducer)
