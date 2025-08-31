import {
  CAVAX,
  CHAINS,
  ElixirPool,
  JSBI,
  NonfungiblePositionManager,
  Percent,
  Position,
  TokenAmount,
} from '@pangolindex/sdk';
import { BigNumber } from 'ethers';
import { useMemo } from 'react';
import { usePool } from 'src/hooks/common';
import { Field } from 'src/state/mint/atom';
import { useConcLiqNFTPositionManagerContract as useElixirNFTPositionManagerContract } from 'src/utils/contracts';
import {
  ElixirAddLiquidityProps,
  ElixirLiquidityCollectFeesProps,
  PositionDetails,
  UseElixirPositionsResults,
} from '../types';
import { useSingleCallResult, useSingleContractMultipleData } from '@/state/multicallv3/hooks';
import { useActiveWeb3React } from '@/hooks';
import { useTokensContract } from '@/state/stake/hooks';
import { useCurrency } from '@/hooks/Tokens';
import { useTransactionAdder } from '@/state/transactionsv3';

import { ChainId, CurrencyAmount, Token } from '@pangolindex/sdk';
import { useMultipleContractSingleData } from 'src/state/multicall/hooks';
import { wrappedCurrency } from '@/utils/wrappedCurrency';
import { BIPS_BASE } from '@/constants';
import { calculateGasMargin, isAddress, waitForTransaction } from '@/utils/common';
import { useChainId, useLibrary } from '@/provider';
import { useMulticallContract } from '@/hooks/useContract';
import ERC20_INTERFACE from '@/constants/abis/erc20';
import { useAccount } from 'wagmi';
;

// It returns the positions based on the tokenIds.
export function useElixirPositionsFromTokenIds(tokenIds: BigNumber[] | undefined): UseElixirPositionsResults {
  const positionManager = useElixirNFTPositionManagerContract();
  const inputs = useMemo(() => (tokenIds ? tokenIds.map((tokenId) => [BigNumber.from(tokenId)]) : []), [tokenIds]);
  const results = useSingleContractMultipleData(positionManager, 'positions', inputs);

  const loading = useMemo(() => results.some(({ loading }) => loading), [results]);
  const error = useMemo(() => results.some(({ error }) => error), [results]);

  const positions = useMemo(() => {
    if (!loading && !error && tokenIds) {
      return results.map((call, i) => {
        const tokenId = tokenIds[i];
        const result = call.result as any; // any => CallStateResult
        return {
          tokenId,
          fee: result.fee,
          feeGrowthInside0LastX128: result.feeGrowthInside0LastX128,
          feeGrowthInside1LastX128: result.feeGrowthInside1LastX128,
          liquidity: result.liquidity,
          nonce: result.nonce,
          operator: result.operator,
          tickLower: result.tickLower,
          tickUpper: result.tickUpper,
          token0: result.token0,
          token1: result.token1,
          tokensOwed0: result.tokensOwed0,
          tokensOwed1: result.tokensOwed1,
        };
      });
    }
    return undefined;
  }, [loading, error, results, tokenIds]);

  return {
    loading,
    positions: positions?.map((position, i) => ({ ...position, tokenId: inputs[i][0] })),
  };
}

// It return the positions of the user.
export function useGetUserPositions() {
  const { account } = useActiveWeb3React();
  const { address: wagmiAccount } = useAccount();
  const finalAccount = account || wagmiAccount;
  const positionManager = useElixirNFTPositionManagerContract();

  const chainId = useChainId();
  //const useTokens = useTokensHook[chainId];

  const { loading: balanceLoading, result: balanceResult } = useSingleCallResult(positionManager, 'balanceOf', [
    finalAccount ?? undefined,
  ]);

  const accountBalance: number | undefined = balanceResult?.[0]?.toNumber();

  const tokenIdsArgs = useMemo(() => {
    if (accountBalance && finalAccount) {
      const tokenRequests = [] as any;
      for (let i = 0; i < accountBalance; i++) {
        tokenRequests.push([finalAccount, i]);
      }
      return tokenRequests;
    }
    return [];
  }, [finalAccount, accountBalance]);

  const tokenIdResults = useSingleContractMultipleData(positionManager, 'tokenOfOwnerByIndex', tokenIdsArgs);
  const someTokenIdsLoading = useMemo(() => tokenIdResults.some(({ loading }) => loading), [tokenIdResults]);

  // If you're trying to access data related to user's liquidity positions,
  // you need the tokenIds for those positions
  const tokenIds = useMemo(() => {
    if (finalAccount) {
      return tokenIdResults
        .map(({ result }) => result)
        .filter((result): result is any => !!result)
        .map((result) => BigNumber.from(result[0]));
    }
    return [];
  }, [finalAccount, tokenIdResults]);

  const { positions, loading: positionsLoading } = useElixirPositionsFromTokenIds(tokenIds);

  const uniqueTokens = useMemo(() => {
    if (positions) {
      const tokens = positions.map((position) => {
        return [position.token0, position.token1];
      });

      const uniqueTokens = [...new Set(tokens.flat())];
      return uniqueTokens;
    }
    return [];
  }, [positions]);

  const uniqueTokensWithData = useTokensContract(uniqueTokens);

  const positionsWithTokens = useMemo(() => {
    if (positions) {
      const positionsWithTokenDetails = positions.map((position) => {
        const token0 = uniqueTokensWithData?.find((token) => token?.address === position.token0);
        const token1 = uniqueTokensWithData?.find((token) => token?.address === position.token1);
        return {
          ...position,
          token0,
          token1,
        };
      });
      return positionsWithTokenDetails;
    }
  }, [positions, uniqueTokensWithData]);


  return {
    loading: someTokenIdsLoading || balanceLoading || positionsLoading,
    positions: positionsWithTokens,
  };
}

export function useDerivedPositionInfo(positionDetails: PositionDetails | undefined): {
  position: Position | undefined;
  pool: ElixirPool | undefined;
} {
  const currency0 = useCurrency(positionDetails?.token0?.address);
  const currency1 = useCurrency(positionDetails?.token1?.address);

  // construct pool data
  const [, pool] = usePool(currency0 ?? undefined, currency1 ?? undefined, positionDetails?.fee);


  let position: any = undefined;
  if (pool && positionDetails) {
    position = new Position({
      pool,
      liquidity: positionDetails?.liquidity.toString(),
      tickLower: positionDetails?.tickLower || 0, // TODO
      tickUpper: positionDetails?.tickUpper || 0, // TODO
    });
  }

  return {
    position,
    pool: pool ?? undefined,
  };
}

export function useElixirAddLiquidity() {
  const { account, chainId, library } = useActiveWeb3React()
  const addTransaction = useTransactionAdder();

  return async (data: ElixirAddLiquidityProps) => {
    if (!chainId || !library || !account) return;

    const {
      parsedAmounts,
      deadline,
      noLiquidity,
      allowedSlippage,
      currencies,
      position,
      hasExistingPosition,
      tokenId,
    } = data;


    const { CURRENCY_A: currencyA, CURRENCY_B: currencyB } = currencies;

    try {
      if (position && account && deadline) {
        const useNative =
          currencyA === CAVAX[chainId] ? currencyA : currencyB === CAVAX[chainId] ? currencyB : undefined;

          console.log(position)

        const { calldata, value } =
          hasExistingPosition && tokenId
            ? NonfungiblePositionManager.addCallParameters(position, {
                tokenId: tokenId?.toString(),
                slippageTolerance: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
                deadline: deadline.toString(),
                useNative: wrappedCurrency(useNative, chainId),
              })
            : NonfungiblePositionManager.addCallParameters(position, {
                slippageTolerance: new Percent(JSBI.BigInt(allowedSlippage), BIPS_BASE),
                recipient: account,
                deadline: deadline.toString(),
                useNative: wrappedCurrency(useNative, chainId),
                createPool: noLiquidity,
              });

        const txn: { to: string; data: string; value: string } = {
          to: CHAINS[chainId]?.contracts?.elixir?.nftManager ?? '',
          data: calldata,
          value,
        };

        const estimatedGasLimit = await library.getSigner().estimateGas(txn);

        //const estimatedGasLimit = BigNumber.from(1000000);

        const newTxn = {
          ...txn,
          gasLimit: calculateGasMargin(estimatedGasLimit),
        };

        const response = await library.getSigner().sendTransaction(newTxn);

        await waitForTransaction(response, 5);

        addTransaction(response, {
          summary:
            'Added ' +
            parsedAmounts[Field.CURRENCY_A]?.toSignificant(3) +
            ' ' +
            currencies[Field.CURRENCY_A]?.symbol +
            ' and ' +
            parsedAmounts[Field.CURRENCY_B]?.toSignificant(3) +
            ' ' +
            currencies[Field.CURRENCY_B]?.symbol,
        });

        return response;
      }
    } catch (err) {
      const _err = err as any;
      if (_err?.code !== 4001) {
        console.error(_err);
        throw new Error('User Rejected Transaction');
      }
      throw _err;
    } finally {
      // This is intentional
    }
  };
}

export function useElixirCollectEarnedFees() {
  const { account } = useActiveWeb3React()
  const chainId = useChainId();
  const { library } = useLibrary();
  const addTransaction = useTransactionAdder();

  return async (data: ElixirLiquidityCollectFeesProps) => {
    const { tokenId, tokens, feeValues } = data;
    const { token0, token1 } = tokens;
    const { feeValue0, feeValue1 } = feeValues;
    if (!token0 || !token1 || !chainId || !account || !tokenId) return;

    try {
      const param = {
        tokenId: tokenId.toString(),
        expectedCurrencyOwed0: feeValue0 ?? TokenAmount.fromRawAmount(token0, 0),
        expectedCurrencyOwed1: feeValue1 ?? TokenAmount.fromRawAmount(token1, 0),
        recipient: account,
        chainId: chainId,
      };
      // we fall back to expecting 0 fees in case the fetch fails, which is safe in the
      // vast majority of cases
      const { calldata, value } = NonfungiblePositionManager.collectCallParameters(param);

      const txn: { to: string; data: string; value: string } = {
        to: CHAINS[chainId]?.contracts?.elixir?.nftManager ?? '',
        data: calldata,
        value,
      };

      const estimatedGasLimit = await library.getSigner().estimateGas(txn);

      const newTxn = {
        ...txn,
        gasLimit: calculateGasMargin(estimatedGasLimit),
      };

      const response = await library.getSigner().sendTransaction(newTxn);

      await waitForTransaction(response, 5);

      addTransaction(response, {
        summary:
          'Collect' +
          ' ' +
          token0?.symbol +
          ' ' +
          'AND' +
          ' ' +
          token1?.symbol +
          ' ' +
          'Fees' +
          ' ' +
          param?.expectedCurrencyOwed0?.toExact() +
          ' ' +
          'AND' +
          ' ' +
          param?.expectedCurrencyOwed1?.toExact(),
      });

      return response;
    } catch (err) {
      const _err = err as any;
      if (_err?.code !== 4001) {
        console.error(_err);
        throw new Error('User Rejected Transaction');
      }
      throw _err;
    }
  };
}

export function useETHBalances(
  chainId: ChainId,
  uncheckedAddresses?: (string | undefined)[],
): { [address: string]: CurrencyAmount | undefined } {
  const multicallContract = useMulticallContract();

  const addresses: string[] = useMemo(
    () =>
      uncheckedAddresses
        ? uncheckedAddresses
            .map(isAddress)
            .filter((a): a is string => a !== false)
            .sort()
        : [],
    [uncheckedAddresses],
  );

  const results = useSingleContractMultipleData(
    multicallContract,
    'getEthBalance',
    addresses.map((address) => [address]),
  );

  return useMemo(
    () =>
      addresses.reduce<{ [address: string]: CurrencyAmount }>((memo, address, i) => {
        const value = results?.[i]?.result?.[0];
        if (value) memo[address] = CurrencyAmount.ether(JSBI.BigInt(value.toString()), chainId);
        return memo;
      }, {}),
    [chainId, addresses, results],
  );
}

export function useTokenBalances(
  address?: string,
  tokens?: (Token | undefined)[],
): [{ [tokenAddress: string]: TokenAmount | undefined }, boolean] {
  const { address: wagmiAccount } = useAccount();
  const finalAddress = address || wagmiAccount;
  const validatedTokens: Token[] = useMemo(
    () => tokens?.filter((t?: Token): t is Token => isAddress(t?.address) !== false) ?? [],
    [tokens],
  );

  const validatedTokenAddresses = useMemo(() => validatedTokens.map((vt) => vt.address), [validatedTokens]);

  const balances = useMultipleContractSingleData(validatedTokenAddresses, ERC20_INTERFACE, 'balanceOf', [finalAddress]);

  const anyLoading: boolean = useMemo(() => balances.some((callState) => callState.loading), [balances]);

  const tokenBalances = useMemo(
    () =>
      finalAddress && validatedTokens.length > 0
        ? validatedTokens.reduce<{ [tokenAddress: string]: TokenAmount | undefined }>((memo, token, i) => {
            const value = balances?.[i]?.result?.[0];
            const amount = value ? JSBI.BigInt(value.toString()) : undefined;
            if (amount) {
              memo[token.address] = new TokenAmount(token, amount);
            }
            return memo;
          }, {})
        : {},
    [finalAddress, validatedTokens, balances],
  );
  return [tokenBalances, anyLoading];
}

// get the balance for a single token/account combo
export function useTokenBalance(account?: string, token?: Token): TokenAmount | undefined {
  const [tokenBalances] = useTokenBalances(account, [token]);
  if (!token) return undefined;
  return tokenBalances[token.address];
}

/* eslint-enable max-lines */

