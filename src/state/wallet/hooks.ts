import { Currency, CurrencyAmount, CAVAX, JSBI, Token, TokenAmount, ChainId } from '@pangolindex/sdk'
import { useMemo } from 'react'
import ERC20_INTERFACE from '../../constants/abis/erc20'
import { useAllTokens } from '../../hooks/Tokens'
import { useActiveWeb3React } from '../../hooks'
import { useMulticallContract } from '../../hooks/useContract'
import { isAddress } from '../../utils'
import { useSingleContractMultipleData, useMultipleContractSingleData } from '../multicall/hooks'
import { useTokenBalancesHook } from './hooks/index'
import { useAccountBalanceHook } from './hooks/index'
import { useAccount } from 'wagmi';

/**
 * Returns a map of the given addresses to their eventually consistent ETH balances.
 */
export function useETHBalances(
  uncheckedAddresses?: (string | undefined)[]
): { [address: string]: CurrencyAmount | undefined } {
  const { chainId } = useActiveWeb3React()
  const multicallContract = useMulticallContract()

  const addresses: string[] = useMemo(
    () =>
      uncheckedAddresses
        ? uncheckedAddresses
            .map(isAddress)
            .filter((a): a is string => a !== false)
            .sort()
        : [],
    [uncheckedAddresses]
  )

  const results = useSingleContractMultipleData(
    multicallContract,
    'getEthBalance',
    addresses.map(address => [address])
  )

  return useMemo(
    () =>
      addresses.reduce<{ [address: string]: CurrencyAmount }>((memo, address, i) => {
        const value = results?.[i]?.result?.[0]
        if (value) memo[address] = CurrencyAmount.ether(JSBI.BigInt(value.toString()), chainId ?? ChainId.AVALANCHE)
        return memo
      }, {}),
    [addresses, chainId, results]
  )
}

export function useETHBalancesV3(
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

/**
 * Returns a map of token addresses to their eventually consistent token balances for a single account.
 */
export function useTokenBalancesWithLoadingIndicator(
  address?: string,
  tokens?: (Token | undefined)[]
): [{ [tokenAddress: string]: TokenAmount | undefined }, boolean] {
  const validatedTokens: Token[] = useMemo(
    () => tokens?.filter((t?: Token): t is Token => isAddress(t?.address) !== false) ?? [],
    [tokens]
  )

  const validatedTokenAddresses = useMemo(() => validatedTokens.map(vt => vt.address), [validatedTokens])

  const balances = useMultipleContractSingleData(validatedTokenAddresses, ERC20_INTERFACE, 'balanceOf', [address])

  const anyLoading: boolean = useMemo(() => balances.some(callState => callState.loading), [balances])

  return [
    useMemo(
      () =>
        address && validatedTokens.length > 0
          ? validatedTokens.reduce<{ [tokenAddress: string]: TokenAmount | undefined }>((memo, token, i) => {
              const value = balances?.[i]?.result?.[0]
              const amount = value ? JSBI.BigInt(value.toString()) : undefined
              if (amount) {
                memo[token.address] = new TokenAmount(token, amount)
              }
              return memo
            }, {})
          : {},
      [address, validatedTokens, balances]
    ),
    anyLoading
  ]
}

export function useTokenBalances(
  address?: string,
  tokens?: (Token | undefined)[]
): { [tokenAddress: string]: TokenAmount | undefined } {
  return useTokenBalancesWithLoadingIndicator(address, tokens)[0]
}

export function useTokenBalancesV3(
  address?: string,
  tokens?: (Token | undefined)[],
): [{ [tokenAddress: string]: TokenAmount | undefined }, boolean] {
  const validatedTokens: Token[] = useMemo(
    () => tokens?.filter((t?: Token): t is Token => isAddress(t?.address) !== false) ?? [],
    [tokens],
  );

  const validatedTokenAddresses = useMemo(() => validatedTokens.map((vt) => vt.address), [validatedTokens]);

  const balances = useMultipleContractSingleData(validatedTokenAddresses, ERC20_INTERFACE, 'balanceOf', [address]);

  const anyLoading: boolean = useMemo(() => balances.some((callState) => callState.loading), [balances]);

  const tokenBalances = useMemo(
    () =>
      address && validatedTokens.length > 0
        ? validatedTokens.reduce<{ [tokenAddress: string]: TokenAmount | undefined }>((memo, token, i) => {
            const value = balances?.[i]?.result?.[0];
            const amount = value ? JSBI.BigInt(value.toString()) : undefined;
            if (amount) {
              memo[token.address] = new TokenAmount(token, amount);
            }
            return memo;
          }, {})
        : {},
    [address, validatedTokens, balances],
  );
  return [tokenBalances, anyLoading];
}

// get the balance for a single token/account combo
export function useTokenBalance(account?: string, token?: Token): TokenAmount | undefined {
  const tokenBalances = useTokenBalances(account, [token])
  if (!token) return undefined
  return tokenBalances[token.address]
}

export function useCurrencyBalances(
  account?: string,
  currencies?: (Currency | undefined)[]
): (CurrencyAmount | undefined)[] {
  const { chainId } = useActiveWeb3React()
  const { address: wagmiAccount } = useAccount();
  const finalAccount = account || wagmiAccount;
  const tokens = useMemo(() => currencies?.filter((currency): currency is Token => currency instanceof Token) ?? [], [
    currencies
  ])

  const tokenBalances = useTokenBalances(finalAccount, tokens)
  const containsETH: boolean = useMemo(
    () => currencies?.some(currency => currency === CAVAX[chainId ?? ChainId.AVALANCHE]) ?? false,
    [chainId, currencies]
  )
  const ethBalance = useETHBalances(containsETH ? [finalAccount] : [])

  return useMemo(
    () =>
      currencies?.map(currency => {
        if (!finalAccount || !currency) return undefined
        if (currency instanceof Token) return tokenBalances[currency.address]
        if (currency === CAVAX[chainId ?? ChainId.AVALANCHE]) return ethBalance[finalAccount]
        return undefined
      }) ?? [],
    [finalAccount, chainId, currencies, ethBalance, tokenBalances]
  )
}

export function useCurrencyBalancesV3(
  chainId: ChainId,
  account?: string,
  currencies?: (Currency | undefined)[],
): (CurrencyAmount | undefined)[] {
  const { address: wagmiAccount } = useAccount();
  const finalAccount = account || wagmiAccount;
  const tokens = useMemo(
    () => currencies?.filter((currency): currency is Token => currency instanceof Token) ?? [],
    [currencies],
  );

  const useTokenBalances_ = useTokenBalancesHook[chainId];
  const useETHBalances_ = useAccountBalanceHook[chainId];

  const [tokenBalances] = useTokenBalances_(finalAccount, tokens);
  const containsETH: boolean = useMemo(
    () => currencies?.some((currency) => chainId && currency === CAVAX[chainId]) ?? false,
    [chainId, currencies],
  );

  const accountArr = useMemo(() => [finalAccount], [finalAccount]);
  const memoArr = useMemo(() => [], []);
  const ethBalance = useETHBalances_(chainId, containsETH ? accountArr : memoArr);

  return useMemo(
    () =>
      currencies?.map((currency) => {
        if (!finalAccount || !currency) return undefined;
        if (currency instanceof Token) return tokenBalances[currency.address];
        if (currency === CAVAX[chainId]) return ethBalance?.[finalAccount];
        return undefined;
      }) ?? [],
    [chainId, finalAccount, currencies, ethBalance, tokenBalances],
  );
}

export function useCurrencyBalance(account?: string, currency?: Currency): CurrencyAmount | undefined {
  return useCurrencyBalances(account, [currency])[0]
}

export function useCurrencyBalanceV3(
  chainId: ChainId,
  account?: string,
  currency?: Currency,
): CurrencyAmount | undefined {
  const currencyArr = useMemo(() => [currency], [currency]);
  return useCurrencyBalancesV3(chainId, account, currencyArr)[0];
}

// mimics useAllBalances
export function useAllTokenBalances(): { [tokenAddress: string]: TokenAmount | undefined } {
  const { account } = useActiveWeb3React()
  const allTokens = useAllTokens()
  const allTokensArray = useMemo(() => Object.values(allTokens ?? {}), [allTokens])
  const balances = useTokenBalances(account ?? undefined, allTokensArray)
  return balances ?? {}
}
