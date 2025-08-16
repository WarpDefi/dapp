import { Currency } from '@pancakeswap/sdk'
import { useAtom } from 'jotai'
import { useCallback } from 'react'
import { swapReducerAtom } from 'state/swap/reducer'
import {
  Field,
  selectCurrency,
  selectPair,
  setRecipient,
  switchCurrencies,
  typeInput,
  updateTransactionHash,
} from './actions'

export function useSwapActionHandlers(): {
  onCurrencySelection: (field: Field, currency: Currency) => void
  onSwitchTokens: () => void
  onUserInput: (field: Field, typedValue: string) => void
  onChangeRecipient: (recipient: string | null) => void
  onSelectPair: (inputCurrencyId: string, outputCurrencyId: string) => void
  onUpdateTransactionHash: (hash: string) => void
} {
  const [, dispatch] = useAtom(swapReducerAtom)

  const onSwitchTokens = useCallback(() => {
    dispatch(switchCurrencies())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSelectPair = useCallback((inputCurrencyId: string, outputCurrencyId: string) => {
    dispatch(selectPair({ inputCurrencyId, outputCurrencyId }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onCurrencySelection = useCallback((field: Field, currency: Currency) => {
    dispatch(
      selectCurrency({
        field,
        currencyId: currency?.isToken ? currency.address : currency?.isNative ? currency.symbol : '',
      }),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onUserInput = useCallback((field: Field, typedValue: string) => {
    dispatch(typeInput({ field, typedValue }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onChangeRecipient = useCallback((recipient: string | null) => {
    dispatch(setRecipient({ recipient }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onUpdateTransactionHash = useCallback((hash: string) => {
    dispatch(updateTransactionHash({ hash }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
    onChangeRecipient,
    onSelectPair,
    onUpdateTransactionHash,
  }
}
