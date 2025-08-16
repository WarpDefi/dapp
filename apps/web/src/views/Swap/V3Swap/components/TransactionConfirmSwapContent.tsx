import { Currency, CurrencyAmount, TradeType } from '@pancakeswap/sdk'
import { SmartRouterTrade } from '@pancakeswap/smart-router/evm'
import { ConfirmationModalContent } from '@pancakeswap/widgets-internal'
import { memo, useCallback, useMemo } from 'react'
import { Field } from 'state/swap/actions'
import { TYPE_SWAP } from 'state/swap/reducer'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { MMSlippageTolerance } from 'views/Swap/MMLinkPools/components/MMSlippageTolerance'
import {
  computeSlippageAdjustedAmounts as mmComputeSlippageAdjustedAmountsWithSmartRouter,
  computeTradePriceBreakdown as mmComputeTradePriceBreakdownWithSmartRouter,
} from 'views/Swap/MMLinkPools/utils/exchange'
import SwapModalHeader from '../../components/SwapModalHeader'
import {
  computeSlippageAdjustedAmounts as computeSlippageAdjustedAmountsWithSmartRouter,
  computeTradePriceBreakdown as computeTradePriceBreakdownWithSmartRouter,
} from '../utils/exchange'
import { SwapModalFooter } from './SwapModalFooter'

/**
 * Returns true if the trade requires a confirmation of details before we can submit it
 * @param tradeA trade A
 * @param tradeB trade B
 */
function tradeMeaningfullyDiffers(tradeA: SmartRouterTrade<TradeType>, tradeB: SmartRouterTrade<TradeType>): boolean {
  return (
    tradeA.tradeType !== tradeB.tradeType ||
    !tradeA.inputAmount.currency.equals(tradeB.inputAmount.currency) ||
    !tradeA.inputAmount.equalTo(tradeB.inputAmount) ||
    !tradeA.outputAmount.currency.equals(tradeB.outputAmount.currency) ||
    !tradeA.outputAmount.equalTo(tradeB.outputAmount)
  )
}

interface TransactionConfirmSwapContentProps {
  isMM?: boolean
  isRFQReady?: boolean
  trade: SmartRouterTrade<TradeType> | undefined
  originalTrade: SmartRouterTrade<TradeType> | undefined
  onAcceptChanges: () => void
  allowedSlippage: number
  onConfirm: () => void
  recipient?: string | null
  currencyBalances: {
    INPUT?: CurrencyAmount<Currency>
    OUTPUT?: CurrencyAmount<Currency>
  }
  typeSwap?: number
}

export const TransactionConfirmSwapContent = memo<TransactionConfirmSwapContentProps>(
  function TransactionConfirmSwapContentComp({
    isMM,
    trade,
    recipient,
    isRFQReady,
    originalTrade,
    allowedSlippage,
    currencyBalances,
    onConfirm,
    onAcceptChanges,
    typeSwap,
  }) {
    const showAcceptChanges = useMemo(
      () => Boolean(trade && originalTrade && tradeMeaningfullyDiffers(trade, originalTrade)),
      [originalTrade, trade],
    )

    const slippageAdjustedAmounts = useMemo(
      () =>
        isMM
          ? mmComputeSlippageAdjustedAmountsWithSmartRouter(trade)
          : computeSlippageAdjustedAmountsWithSmartRouter(trade, allowedSlippage),
      [isMM, trade, allowedSlippage],
    )
    const { priceImpactWithoutFee, lpFeeAmount } = useMemo(
      () =>
        isMM ? mmComputeTradePriceBreakdownWithSmartRouter(trade) : computeTradePriceBreakdownWithSmartRouter(trade),
      [isMM, trade],
    )

    const isEnoughInputBalance = useMemo(() => {
      if (typeSwap !== TYPE_SWAP.SELL) return null

      const isInputBalanceExist = !!(currencyBalances && currencyBalances[Field.INPUT])
      const isInputBalanceBNB = isInputBalanceExist && currencyBalances[Field.INPUT]?.currency.isNative
      const inputCurrencyAmount = isInputBalanceExist
        ? isInputBalanceBNB
          ? maxAmountSpend(currencyBalances[Field.INPUT])
          : currencyBalances[Field.INPUT]
        : null
      return inputCurrencyAmount && slippageAdjustedAmounts && slippageAdjustedAmounts[Field.INPUT]
        ? inputCurrencyAmount.greaterThan(slippageAdjustedAmounts[Field.INPUT]) ||
            inputCurrencyAmount.equalTo(slippageAdjustedAmounts[Field.INPUT])
        : false
    }, [typeSwap, currencyBalances, slippageAdjustedAmounts])

    const modalHeader = useCallback(() => {
      return trade ? (
        <SwapModalHeader
          inputAmount={trade.inputAmount}
          outputAmount={trade.outputAmount}
          currencyBalances={currencyBalances}
          tradeType={trade.tradeType}
          priceImpactWithoutFee={priceImpactWithoutFee ?? undefined}
          allowedSlippage={isMM ? <MMSlippageTolerance /> : allowedSlippage}
          slippageAdjustedAmounts={slippageAdjustedAmounts ?? undefined}
          isEnoughInputBalance={isEnoughInputBalance ?? undefined}
          recipient={recipient ?? undefined}
          showAcceptChanges={showAcceptChanges}
          onAcceptChanges={onAcceptChanges}
          typeSwap={typeSwap}
        />
      ) : null
    }, [
      isMM,
      priceImpactWithoutFee,
      currencyBalances,
      allowedSlippage,
      onAcceptChanges,
      recipient,
      showAcceptChanges,
      trade,
      slippageAdjustedAmounts,
      isEnoughInputBalance,
      typeSwap,
    ])

    const modalBottom = useCallback(() => {
      return trade ? (
        <SwapModalFooter
          trade={trade}
          isMM={isMM}
          isRFQReady={isRFQReady}
          tradeType={trade.tradeType}
          inputAmount={trade.inputAmount}
          outputAmount={trade.outputAmount}
          currencyBalances={currencyBalances}
          lpFee={lpFeeAmount ?? undefined}
          priceImpact={priceImpactWithoutFee ?? undefined}
          disabledConfirm={showAcceptChanges}
          slippageAdjustedAmounts={slippageAdjustedAmounts ?? undefined}
          isEnoughInputBalance={isEnoughInputBalance ?? undefined}
          typeSwap={typeSwap}
          onConfirm={onConfirm}
        />
      ) : null
    }, [
      isMM,
      trade,
      isRFQReady,
      currencyBalances,
      lpFeeAmount,
      showAcceptChanges,
      isEnoughInputBalance,
      slippageAdjustedAmounts,
      priceImpactWithoutFee,
      typeSwap,
      onConfirm,
    ])

    return <ConfirmationModalContent topContent={modalHeader} bottomContent={modalBottom} />
  },
)
