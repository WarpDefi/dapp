/* eslint-disable @typescript-eslint/no-unused-vars */
import { useTranslation } from '@pancakeswap/localization'
import { Currency, CurrencyAmount, Percent } from '@pancakeswap/sdk'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import replaceBrowserHistory from '@pancakeswap/utils/replaceBrowserHistory'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'

import CurrencyInputPanel from 'components/CurrencyInputPanel'
import { CommonBasesType } from 'components/SearchModal/types'
import { useCurrency } from 'hooks/Tokens'
import { Field, updateTypeSwap } from 'state/swap/actions'
import { useDefaultsFromURLSearch, useSwapState } from 'state/swap/hooks'
import { useSwapActionHandlers } from 'state/swap/useSwapActionHandlers'
import { useCurrencyBalances } from 'state/wallet/hooks'
import { currencyId } from 'utils/currencyId'
import { maxAmountSpend } from 'utils/maxAmountSpend'

import { Tab, TabMenu } from '@pancakeswap/uikit'
import { useAtom } from 'jotai'
import { TYPE_SWAP, swapReducerAtom } from 'state/swap/reducer'
import { useAccount } from 'wagmi'
import useWarningImport from '../../hooks/useWarningImport'
import { FormContainer } from '../components'
import { useIsWrapping } from '../hooks'
import { FlipButton } from './FlipButton'
import { Recipient } from './Recipient'
import { RiskCheck } from './RiskCheck'

interface Props {
  inputAmount?: CurrencyAmount<Currency>
  outputAmount?: CurrencyAmount<Currency>
  tradeLoading?: boolean
  pricingAndSlippage?: ReactNode
  swapCommitButton?: ReactNode
}

export function FormMain({ pricingAndSlippage, inputAmount, outputAmount, tradeLoading, swapCommitButton }: Props) {
  const { address: account } = useAccount()
  const { t } = useTranslation()
  const warningSwapHandler = useWarningImport()
  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    typeSwap,
  } = useSwapState()
  const [, dispatch] = useAtom(swapReducerAtom)
  const isWrapping = useIsWrapping()
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  const { onCurrencySelection, onUserInput, onSwitchTokens } = useSwapActionHandlers()
  const [inputBalance] = useCurrencyBalances(account, [inputCurrency, outputCurrency])
  const [outputBalance] = useCurrencyBalances(account, [outputCurrency, inputCurrency])
  const maxAmountInput = useMemo(() => maxAmountSpend(inputBalance), [inputBalance])
  const maxAmountOutput = useMemo(() => maxAmountSpend(outputBalance), [outputBalance])
  const loadedUrlParams = useDefaultsFromURLSearch()

  const handleTypeInput = useCallback((value: string) => onUserInput(Field.INPUT, value), [onUserInput])
  const handleTypeOutput = useCallback((value: string) => onUserInput(Field.OUTPUT, value), [onUserInput])

  const handlePercentInput = useCallback(
    (percent: number) => {
      if (maxAmountInput || maxAmountOutput) {
        const amountAmount = typeSwap === TYPE_SWAP.BUY ? maxAmountOutput : maxAmountInput
        onUserInput(
          typeSwap === TYPE_SWAP.BUY ? Field.OUTPUT : Field.INPUT,
          amountAmount.multiply(new Percent(percent, 100)).toExact(),
        )
      }
    },
    [maxAmountInput, maxAmountOutput, onUserInput, typeSwap],
  )

  const handleMaxInput = useCallback(() => {
    if (maxAmountInput) {
      onUserInput(Field.INPUT, maxAmountInput.toExact())
    }
  }, [maxAmountInput, onUserInput])

  const handleMaxOutput = useCallback(() => {
    if (maxAmountOutput) {
      onUserInput(Field.OUTPUT, maxAmountOutput.toExact())
    }
  }, [maxAmountOutput, onUserInput])

  const handleCurrencySelect = useCallback(
    (newCurrency: Currency, field: Field, currentInputCurrencyId: string, currentOutputCurrencyId: string) => {
      onCurrencySelection(field, newCurrency)

      warningSwapHandler(newCurrency)

      const isInput = field === Field.INPUT
      const oldCurrencyId = isInput ? currentInputCurrencyId : currentOutputCurrencyId
      const otherCurrencyId = isInput ? currentOutputCurrencyId : currentInputCurrencyId
      const newCurrencyId = currencyId(newCurrency)
      if (newCurrencyId === otherCurrencyId) {
        replaceBrowserHistory(isInput ? 'outputCurrency' : 'inputCurrency', oldCurrencyId)
      }
      replaceBrowserHistory(isInput ? 'inputCurrency' : 'outputCurrency', newCurrencyId)
    },
    [onCurrencySelection, warningSwapHandler],
  )
  const handleInputSelect = useCallback(
    (newCurrency: Currency) => handleCurrencySelect(newCurrency, Field.INPUT, inputCurrencyId, outputCurrencyId),
    [handleCurrencySelect, inputCurrencyId, outputCurrencyId],
  )
  const handleOutputSelect = useCallback(
    (newCurrency: Currency) => handleCurrencySelect(newCurrency, Field.OUTPUT, inputCurrencyId, outputCurrencyId),
    [handleCurrencySelect, inputCurrencyId, outputCurrencyId],
  )

  const isTypingInput = independentField === Field.INPUT
  const inputValue = useMemo(
    () =>
      typedValue &&
      (isTypingInput ? typedValue : formatAmount(typeSwap === TYPE_SWAP.BUY ? outputAmount : inputAmount) || ''),
    [typedValue, isTypingInput, typeSwap, outputAmount, inputAmount],
  )
  const outputValue = useMemo(() => {
    return (
      typedValue &&
      (isTypingInput ? formatAmount(typeSwap === TYPE_SWAP.BUY ? inputAmount : outputAmount) || '' : typedValue)
    )
  }, [typedValue, isTypingInput, outputAmount, typeSwap, inputAmount])
  const inputLoading = typedValue ? !isTypingInput && tradeLoading : false
  const outputLoading = typedValue ? isTypingInput && tradeLoading : false
  const [tab, setTab] = useState(0)
  const handleItemClick = (index: number) => {
    setTab(index)
    dispatch(updateTypeSwap({ typeSwap: index }))
  }

  useEffect(() => {
    if (inputCurrency && outputCurrency) {
      if (isWrapping) {
        dispatch(updateTypeSwap({ typeSwap: TYPE_SWAP.SELL }))
      } else {
        dispatch(updateTypeSwap({ typeSwap: tab }))
      }
    }
  }, [inputCurrency, outputCurrency, isWrapping])

  return (
    <FormContainer>
      {!isWrapping && (
        <TabMenu activeIndex={tab} fullWidth isShowBorderBottom onItemClick={handleItemClick}>
          <Tab>Buy</Tab>
          <Tab>Sell</Tab>
        </TabMenu>
      )}

      <CurrencyInputPanel
        id="swap-currency-input"
        showUSDPrice
        showMaxButton={typeSwap === TYPE_SWAP.SELL}
        showCommonBases
        inputLoading={!isWrapping && inputLoading}
        currencyLoading={!loadedUrlParams}
        label={!isTypingInput && !isWrapping ? t('From (estimated)') : t('From')}
        value={isWrapping ? typedValue : inputValue}
        maxAmount={maxAmountInput}
        showQuickInputButton={typeSwap === TYPE_SWAP.SELL}
        currency={inputCurrency}
        onUserInput={handleTypeInput}
        onPercentInput={handlePercentInput}
        onMax={handleMaxInput}
        onCurrencySelect={handleInputSelect}
        otherCurrency={outputCurrency}
        commonBasesType={CommonBasesType.SWAP_LIMITORDER}
        title="Amount"
        hideIcon
      />
      <RiskCheck currency={inputCurrency} />
      {isWrapping && <FlipButton />}
      <CurrencyInputPanel
        id="swap-currency-output"
        showUSDPrice
        showCommonBases
        showMaxButton={typeSwap === TYPE_SWAP.BUY}
        maxAmount={maxAmountOutput}
        showQuickInputButton={typeSwap === TYPE_SWAP.BUY}
        inputLoading={!isWrapping && outputLoading}
        currencyLoading={!loadedUrlParams}
        label={isTypingInput && !isWrapping ? t('To (estimated)') : t('To')}
        value={isWrapping ? typedValue : outputValue}
        currency={outputCurrency}
        onUserInput={handleTypeOutput}
        onMax={handleMaxOutput}
        onPercentInput={handlePercentInput}
        onCurrencySelect={handleOutputSelect}
        otherCurrency={outputCurrency}
        commonBasesType={CommonBasesType.SWAP_LIMITORDER}
        title="Total"
        hideIcon
      />
      <RiskCheck currency={outputCurrency} />
      <Recipient />
      {pricingAndSlippage}
      {swapCommitButton}
    </FormContainer>
  )
}
