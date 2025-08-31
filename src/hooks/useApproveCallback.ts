import { MaxUint256 } from '@ethersproject/constants'
import { TransactionResponse } from '@ethersproject/providers'
import { Trade, TokenAmount, CurrencyAmount, CAVAX, ChainId, ElixirTrade, CHAINS } from '@pangolindex/sdk'
import { useCallback, useMemo, useState } from 'react'
import { ROUTER_ADDRESS, ZERO_ADDRESS } from '../constants'
import { useTokenAllowance } from '../data/Allowances'
import { Field } from '../state/swap/actions'
import { useTransactionAdder, useHasPendingApproval } from '../state/transactions/hooks'
import { computeSlippageAdjustedAmounts } from '../utils/prices'
import { calculateGasMargin } from '../utils'
import { useTokenContract } from './useContract'
import { useActiveWeb3React } from './index'
import { wait } from '@/utils/retry'
import { waitForTransaction } from '@/utils/common'
import { useIsApprovingInfinite } from '@/state/userv3'

export enum ApprovalState {
  UNKNOWN,
  NOT_APPROVED,
  PENDING,
  APPROVED
}

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
export function useApproveCallbackOld(
  amountToApprove?: CurrencyAmount,
  spender?: string
): [ApprovalState, () => Promise<void>] {
  const { account, chainId } = useActiveWeb3React()
  const token = amountToApprove instanceof TokenAmount ? amountToApprove.token : undefined
  const currentAllowance = useTokenAllowance(token, account ?? undefined, spender)
  const pendingApproval = useHasPendingApproval(token?.address, spender)

  // check the current approval status
  const approvalState: ApprovalState = useMemo(() => {
    if (!amountToApprove || !spender) return ApprovalState.UNKNOWN
    if (amountToApprove.currency === CAVAX[chainId ?? ChainId.AVALANCHE]) return ApprovalState.APPROVED
    // we might not have enough data to know whether or not we need to approve
    if (!currentAllowance) return ApprovalState.UNKNOWN

    // amountToApprove will be defined if currentAllowance is
    return currentAllowance.lessThan(amountToApprove)
      ? pendingApproval
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED
  }, [amountToApprove, chainId, currentAllowance, pendingApproval, spender])

  const tokenContract = useTokenContract(token?.address)
  const addTransaction = useTransactionAdder()

  const approve = useCallback(async (): Promise<void> => {
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      console.error('approve was called unnecessarily')
      return
    }
    if (!token) {
      console.error('no token')
      return
    }

    if (!tokenContract) {
      console.error('tokenContract is null')
      return
    }

    if (!amountToApprove) {
      console.error('missing amount to approve')
      return
    }

    if (!spender) {
      console.error('no spender')
      return
    }

    let useExact = true
    const estimatedGas = await tokenContract.estimateGas.approve(spender, amountToApprove.raw.toString()).catch(() => {
      // general fallback for tokens who restrict approval amounts
      useExact = false
      return tokenContract.estimateGas.approve(spender, MaxUint256)
    })


    return tokenContract
      .approve(spender, useExact ? amountToApprove.raw.toString() : MaxUint256, {
        gasLimit: calculateGasMargin(estimatedGas)
      })
      .then((response: TransactionResponse) => {
        addTransaction(response, {
          summary: 'Approve ' + amountToApprove.currency.symbol,
          approval: { tokenAddress: token.address, spender: spender }
        })
      })
      .catch((error: Error) => {
        console.debug('Failed to approve token', error)
        throw error
      })
  }, [approvalState, token, tokenContract, amountToApprove, spender, addTransaction])

  return [approvalState, approve]
}

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
export function useApproveCallback(
  chainId: ChainId,
  amountToApprove?: CurrencyAmount,
  spender?: string,
): [ApprovalState, () => Promise<void>] {
  const { account } = useActiveWeb3React()
  const [isPendingApprove, setIsPendingApprove] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  const token = amountToApprove instanceof TokenAmount ? amountToApprove.token : undefined;
  const currentAllowance = useTokenAllowance(token, account ?? undefined, spender);
  const pendingApproval = useHasPendingApproval(token?.address, spender);

  // check the current approval status
  const approvalState: ApprovalState = useMemo(() => {
    if (!amountToApprove || !spender) return ApprovalState.UNKNOWN;
    if (amountToApprove.currency === CAVAX[chainId]) return ApprovalState.APPROVED;
    // we might not have enough data to know whether or not we need to approve
    if (!currentAllowance) return ApprovalState.UNKNOWN;

    // amountToApprove will be defined if currentAllowance is
    if (!currentAllowance.lessThan(amountToApprove) || isApproved) {
      return ApprovalState.APPROVED;
    } else {
      if (pendingApproval || isPendingApprove) {
        return ApprovalState.PENDING;
      } else {
        return ApprovalState.NOT_APPROVED;
      }
    }
  }, [amountToApprove, currentAllowance, pendingApproval, isPendingApprove, isApproved, spender]);

  const tokenContract = useTokenContract(token?.address);
  const addTransaction = useTransactionAdder();

  const approvingInfinite = useIsApprovingInfinite();

  const approve = useCallback(async (): Promise<void> => {
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      console.error('approve was called unnecessarily');
      return;
    }
    if (!token) {
      console.error('no token');
      return;
    }

    if (!tokenContract) {
      console.error('tokenContract is null');
      return;
    }

    if (!amountToApprove) {
      console.error('missing amount to approve');
      return;
    }

    if (!spender) {
      console.error('no spender');
      return;
    }

    //let approveAmount = approvingInfinite ? MaxUint256.toString() : amountToApprove.raw.toString();
    let approveAmount = !approvingInfinite ? MaxUint256.toString() : amountToApprove.raw.toString();
    const estimatedGas = await tokenContract.estimateGas.approve(spender, approveAmount).catch(() => {
      // general fallback for tokens who restrict approval amounts
      approveAmount = amountToApprove.raw.toString();
      return tokenContract.estimateGas.approve(spender, amountToApprove.raw.toString());
    });

    try {
      setIsPendingApprove(true);
      const response: TransactionResponse = await tokenContract.approve(spender, approveAmount, {
        gasLimit: calculateGasMargin(estimatedGas),
      });
      await waitForTransaction(response, 1);
      addTransaction(response, {
        summary: 'Approved ' + amountToApprove.currency.symbol,
        approval: { tokenAddress: token.address, spender: spender },
      });
      setIsApproved(true);
    } catch (error) {
      console.debug('Failed to approve token', error);
      throw error;
    } finally {
      // we wait 1 second to be able to update the state with all the transactions,
      // because as we set isPendingApprove to false, the pendingApproval still hasn't
      // had time to be true and ends up returning ApprovalState.NOT_APPROVED
      await wait(1000);
      setIsPendingApprove(false);
    }
  }, [
    approvalState,
    token,
    tokenContract,
    amountToApprove,
    spender,
    addTransaction,
    setIsPendingApprove,
    approvingInfinite,
  ]);

  return [approvalState, approve];
}

// wraps useApproveCallback in the context of a swap
export function useApproveCallbackFromTradeOld(trade?: Trade, allowedSlippage = 0) {
  const { chainId } = useActiveWeb3React()
  const amountToApprove = useMemo(
    () => (trade ? computeSlippageAdjustedAmounts(trade, allowedSlippage)[Field.INPUT] : undefined),
    [trade, allowedSlippage]
  )
  return useApproveCallbackOld(amountToApprove, chainId ? ROUTER_ADDRESS[chainId] : ROUTER_ADDRESS[ChainId.AVALANCHE])
}

// wraps useApproveCallback in the context of a swap
export function useApproveCallbackFromTrade(chainId: ChainId, trade?: Trade | ElixirTrade, allowedSlippage = 0) {
  const [amountToApprove, routerAddress] = useMemo(() => {
    if (!chainId || !trade) return [undefined, undefined];
    const elixirSwapRouter = CHAINS[chainId].contracts!.elixir?.swapRouter;
    return [
      computeSlippageAdjustedAmounts(trade, allowedSlippage)[Field.INPUT],
      trade instanceof ElixirTrade
        ? elixirSwapRouter
        : ROUTER_ADDRESS[chainId]
    ];
  }, [trade, allowedSlippage]);
  return useApproveCallback(chainId, amountToApprove, routerAddress);
}
