import { createReducer } from '@reduxjs/toolkit'
import { atomWithReducer } from 'jotai/utils'
import {
  Field,
  replaceSwapState,
  selectCurrency,
  selectPair,
  setRecipient,
  switchCurrencies,
  typeInput,
  updateDerivedPairData,
  updatePairData,
  updateTransactionHash,
  updateTypeSwap,
} from './actions'
import { DerivedPairDataNormalized, PairDataNormalized } from './types'

export interface SwapState {
  readonly independentField: Field
  readonly typedValue: string
  readonly [Field.INPUT]: {
    readonly currencyId: string | undefined
  }
  readonly [Field.OUTPUT]: {
    readonly currencyId: string | undefined
  }
  // the typed recipient address or ENS name, or null if swap should go to sender
  readonly recipient: string | null
  readonly pairDataById: Record<number, Record<string, PairDataNormalized>> | null
  readonly derivedPairDataById: Record<number, Record<string, DerivedPairDataNormalized>> | null
  readonly typeSwap: number
  readonly hash: string
}

export const TYPE_SWAP = {
  BUY: 0,
  SELL: 1,
}

const initialState: SwapState = {
  independentField: Field.INPUT,
  typedValue: '',
  [Field.INPUT]: {
    currencyId: '',
  },
  [Field.OUTPUT]: {
    currencyId: '',
  },
  pairDataById: {},
  derivedPairDataById: {},
  recipient: null,
  typeSwap: TYPE_SWAP.BUY,
  hash: '',
}

const reducer = createReducer<SwapState>(initialState, (builder) =>
  builder
    .addCase(
      replaceSwapState,
      (state, { payload: { typedValue, recipient, field, inputCurrencyId, outputCurrencyId } }) => {
        return {
          [Field.INPUT]: {
            currencyId: inputCurrencyId,
          },
          [Field.OUTPUT]: {
            currencyId: outputCurrencyId,
          },
          independentField: field,
          typedValue,
          recipient,
          pairDataById: state.pairDataById,
          derivedPairDataById: state.derivedPairDataById,
          typeSwap: TYPE_SWAP.BUY,
          hash: '',
        }
      },
    )
    .addCase(selectCurrency, (state, { payload: { currencyId, field } }) => {
      const otherField = field === Field.INPUT ? Field.OUTPUT : Field.INPUT
      if (currencyId === state[otherField].currencyId) {
        // the case where we have to swap the order
        return {
          ...state,
          independentField: state.independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT,
          [field]: { currencyId },
          [otherField]: { currencyId: state[field].currencyId },
        }
      }
      // the normal case
      return {
        ...state,
        [field]: { currencyId },
      }
    })
    .addCase(switchCurrencies, (state) => {
      return {
        ...state,
        independentField: state.independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT,
        [Field.INPUT]: { currencyId: state[Field.OUTPUT].currencyId },
        [Field.OUTPUT]: { currencyId: state[Field.INPUT].currencyId },
      }
    })
    .addCase(typeInput, (state, { payload: { field, typedValue } }) => {
      return {
        ...state,
        independentField: field,
        typedValue,
      }
    })
    .addCase(setRecipient, (state, { payload: { recipient } }) => {
      state.recipient = recipient
    })
    .addCase(updatePairData, (state, { payload: { pairData, pairId, timeWindow } }) => {
      if (!state.pairDataById) state.pairDataById = {}
      if (!state.pairDataById?.[pairId]) {
        state.pairDataById[pairId] = {}
      }
      state.pairDataById[pairId][timeWindow] = pairData
    })
    .addCase(updateDerivedPairData, (state, { payload: { pairData, pairId, timeWindow } }) => {
      if (!state.derivedPairDataById) state.derivedPairDataById = {}
      if (!state.derivedPairDataById[pairId]) {
        state.derivedPairDataById[pairId] = {}
      }
      state.derivedPairDataById[pairId][timeWindow] = pairData
    })
    .addCase(updateTypeSwap, (state, { payload: { typeSwap } }) => {
      state.typeSwap = typeSwap
    })
    .addCase(selectPair, (state, { payload: { inputCurrencyId, outputCurrencyId } }) => {
      state[Field.INPUT].currencyId = inputCurrencyId
      state[Field.OUTPUT].currencyId = outputCurrencyId
    })
    .addCase(updateTransactionHash, (state, { payload: { hash } }) => {
      state.hash = hash
    }),
)

export const swapReducerAtom = atomWithReducer(initialState, reducer)
