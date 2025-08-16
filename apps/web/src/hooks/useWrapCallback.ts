import { useTranslation } from '@pancakeswap/localization'
import { ChainId, Currency, WNATIVE } from '@pancakeswap/sdk'
import { CAKE } from '@pancakeswap/tokens'
import tryParseAmount from '@pancakeswap/utils/tryParseAmount'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useMemo } from 'react'
import { Field } from 'state/swap/actions'
import { useTransactionAdder } from 'state/transactions/hooks'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { useCallWithGasPrice } from './useCallWithGasPrice'
import { useWNativeContractByAddress } from './useContract'

export enum WrapType {
  NOT_APPLICABLE,
  WRAP,
  UNWRAP,
}

const NOT_APPLICABLE = { wrapType: WrapType.NOT_APPLICABLE }
/**
 * Given the selected input and output currency, return a wrap callback
 * @param inputCurrency the selected input currency
 * @param outputCurrency the selected output currency
 * @param typedValue the user input value
 */
export default function useWrapCallback(
  inputCurrency: Currency | undefined | null,
  outputCurrency: Currency | undefined | null,
  typedValue: string | undefined,
  onUserInput?: (field: Field, typedValue: string) => void | undefined
): { wrapType: WrapType; execute?: undefined | (() => Promise<void>); inputError?: string } {
  const { t } = useTranslation()
  const { account, chainId } = useAccountActiveChain()
  const { callWithGasPrice } = useCallWithGasPrice()
  const balance = useCurrencyBalance(account ?? undefined, inputCurrency)
  // we can always parse the amount typed as the input currency, since wrapping is 1:1
  const inputAmount = useMemo(() => tryParseAmount(typedValue, inputCurrency), [inputCurrency, typedValue])
  const addTransaction = useTransactionAdder()
  const address =
    outputCurrency &&
    inputCurrency &&
    (CAKE[ChainId.U2U_NEBULAS]?.equals(outputCurrency) || CAKE[ChainId.U2U_NEBULAS]?.equals(inputCurrency))
      ? CAKE[ChainId.U2U_NEBULAS].address
      : undefined
  const wbnbContract = useWNativeContractByAddress(address)

  return useMemo(() => {
    if (!wbnbContract || !chainId || !inputCurrency || !outputCurrency) return NOT_APPLICABLE

    const sufficientBalance = inputAmount && balance && !balance.lessThan(inputAmount)
    const WRAP_TOKEN =
      WNATIVE[chainId]?.equals(outputCurrency) || WNATIVE[chainId]?.equals(inputCurrency)
        ? WNATIVE[chainId]
        : CAKE[ChainId.U2U_NEBULAS]

    if (
      inputCurrency?.isNative &&
      (WNATIVE[chainId]?.equals(outputCurrency) || CAKE[ChainId.U2U_NEBULAS]?.equals(outputCurrency))
    ) {
      return {
        wrapType: WrapType.WRAP,
        execute:
          sufficientBalance && inputAmount
            ? async () => {
                try {
                  const txReceipt = await callWithGasPrice(wbnbContract, 'deposit', undefined, {
                    value: inputAmount.quotient,
                  })
                  const amount = inputAmount.toSignificant(6)
                  const native = inputCurrency.symbol
                  const wrap = WRAP_TOKEN.symbol
                  addTransaction(txReceipt, {
                    summary: `Wrap ${amount} ${native} to ${wrap}`,
                    translatableSummary: { text: 'Wrap %amount% %native% to %wrap%', data: { amount, native, wrap } },
                    type: 'wrap',
                  })
                  if(onUserInput !== undefined) {
                    onUserInput(Field.INPUT, '')
                  }
                } catch (error) {
                  console.error('Could not deposit', error)
                }
              }
            : undefined,
        inputError: sufficientBalance
          ? undefined
          : t('Insufficient %symbol% balance', { symbol: inputCurrency.symbol }),
      }
    }
    if (
      (WNATIVE[chainId]?.equals(inputCurrency) || CAKE[ChainId.U2U_NEBULAS]?.equals(inputCurrency)) &&
      outputCurrency?.isNative
    ) {
      return {
        wrapType: WrapType.UNWRAP,
        execute:
          sufficientBalance && inputAmount
            ? async () => {
                try {
                  const txReceipt = await callWithGasPrice(wbnbContract, 'withdraw', [inputAmount.quotient])
                  const amount = inputAmount.toSignificant(6)
                  const wrap = WRAP_TOKEN.symbol
                  const native = outputCurrency.symbol
                  addTransaction(txReceipt, {
                    summary: `Unwrap ${amount} ${wrap} to ${native}`,
                    translatableSummary: { text: 'Unwrap %amount% %wrap% to %native%', data: { amount, wrap, native } },
                  })
                  if(onUserInput !== undefined) {
                    onUserInput(Field.INPUT, '')
                  }
                } catch (error) {
                  console.error('Could not withdraw', error)
                }
              }
            : undefined,
        inputError: sufficientBalance
          ? undefined
          : t('Insufficient %symbol% balance', { symbol: inputCurrency.symbol }),
      }
    }
    return NOT_APPLICABLE
  }, [wbnbContract, chainId, inputCurrency, outputCurrency, t, inputAmount, balance, addTransaction, callWithGasPrice])
}

export function useIsWrapping(
  currencyA: Currency | undefined | null,
  currencyB: Currency | undefined | null,
  value?: string,
) {
  const { wrapType } = useWrapCallback(currencyA, currencyB, value)

  return wrapType !== WrapType.NOT_APPLICABLE
}
