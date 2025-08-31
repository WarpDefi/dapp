import { Version } from '../../hooks/useToggledVersion';
import { parseUnits } from '@ethersproject/units';
import { Currency, CurrencyAmount, JSBI, Token, TokenAmount, Trade, ChainId, ElixirTrade } from '@pangolindex/sdk';
import { ParsedQs } from 'qs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useActiveWeb3React } from '../../hooks';
import { useCurrency } from '../../hooks/Tokens';
import { useElixirTradeExactIn, useElixirTradeExactOut, useTradeExactIn, useTradeExactOut } from '../../hooks/Trades';
import useParsedQueryString from '../../hooks/useParsedQueryString';
import { isAddress } from '../../utils';
import { AppDispatch, AppState } from '../index';
import { useCurrencyBalances } from '../wallet/hooks';
import { Field, replaceSwapState, selectCurrency, setRecipient, switchCurrencies, typeInput } from './actions';
import { SwapState } from './reducer';
import useToggledVersion from '../../hooks/useToggledVersion';
import { useUserSlippageTolerance } from '../user/hooks';
import { computeSlippageAdjustedAmounts } from '../../utils/prices';
import { ROUTER_ADDRESS, FACTORY_ADDRESS, PNG } from '../../constants';
;
import { useAccount } from 'wagmi';
import { useChainId } from '@/provider';

export function useSwapState(): AppState['swap'] {
  return useSelector<AppState, AppState['swap']>(state => state.swap);
}

export function useSwapActionHandlers(): {
  onCurrencySelection: (field: Field, currency: Currency) => void;
  onSwitchTokens: () => void;
  onUserInput: (field: Field, typedValue: string) => void;
  onChangeRecipient: (recipient: string | null) => void;
} {
  const chainId = useChainId();
  const dispatch = useDispatch<AppDispatch>();
  const onCurrencySelection = useCallback(
    (field: Field, currency: Currency) => {
      dispatch(
        selectCurrency({
          field,
          currencyId: currency instanceof Token ? currency.address : chainId === ChainId.AVALANCHE ? 'AVAX' : 'ETH',
          //currencyId: currency instanceof Token ? currency.address : currency === CAVAX[chainId ?? ChainId.AVALANCHE] ? 'ETH' : '' old backup
        }),
      );
    },
    [dispatch, chainId],
  );

  const onSwitchTokens = useCallback(() => {
    dispatch(switchCurrencies());
  }, [dispatch]);

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }));
    },
    [dispatch],
  );

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      dispatch(setRecipient({ recipient }));
    },
    [dispatch],
  );

  return {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
    onChangeRecipient,
  };
}

// try to parse a user entered amount for a given token
export function tryParseAmount(value?: string, currency?: Currency, chainId?: ChainId): CurrencyAmount | undefined {
  if (!value || !currency) {
    return undefined;
  }
  try {
    const typedValueParsed = parseUnits(value, currency.decimals).toString();
    if (typedValueParsed !== '0') {
      return currency instanceof Token
        ? new TokenAmount(currency, JSBI.BigInt(typedValueParsed))
        : CurrencyAmount.ether(JSBI.BigInt(typedValueParsed), chainId ?? ChainId.AVALANCHE);
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error);
  }
  // necessary for all paths to return a value
  return undefined;
}

const BAD_RECIPIENT_ADDRESSES: string[] = [
  FACTORY_ADDRESS[ChainId.AVALANCHE], // v2 factory
  ROUTER_ADDRESS[ChainId.AVALANCHE], // v2 router 02
];

/**
 * Returns true if any of the pairs or tokens in a trade have the given checksummed address
 * @param trade to check for the given address
 * @param checksummedAddress address to check in the pairs and tokens
 */
function involvesAddress(trade: Trade, checksummedAddress: string): boolean {
  return (
    trade.route.path.some(token => token.address === checksummedAddress) ||
    trade.route.pools.some(pool => pool.liquidityToken.address === checksummedAddress)
  );
}

// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfo(refreshInterval?: number) {
  const { account, chainId } = useActiveWeb3React();
  const { address: wagmiAccount } = useAccount();
  const finalAccount = account || wagmiAccount;

  const toggledVersion = useToggledVersion();

  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    recipient,
  } = useSwapState();

  const inputCurrency = useCurrency(inputCurrencyId);
  const outputCurrency = useCurrency(outputCurrencyId);
  const recipientAddress = isAddress(recipient);
  const to: string | null = (recipientAddress ? recipientAddress : finalAccount) ?? null;

  const relevantTokenBalances = useCurrencyBalances(finalAccount ?? undefined, [
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
  ]);

  const isExactIn: boolean = independentField === Field.INPUT;

  // 🚩 interval ile tetiklenen parsedAmount hesaplaması
  const parsedAmount = useMemo(() => {
    return tryParseAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined, chainId);
  }, [typedValue, chainId, inputCurrency, outputCurrency, isExactIn]);

  const { trade: v2BestTradeExactIn, isLoading: isLoadingIn } = useTradeExactIn(
    isExactIn ? parsedAmount : undefined,
    outputCurrency ?? undefined,
    refreshInterval
  );

  const { trade: v2BestTradeExactOut, isLoading: isLoadingOut } = useTradeExactOut(
    inputCurrency ?? undefined,
    !isExactIn ? parsedAmount : undefined,
    refreshInterval
  );

  const { trade: bestElixirTradeExactIn, isLoading: isElixirLoadingIn } = useElixirTradeExactIn(
    isExactIn ? parsedAmount : undefined,
    outputCurrency ?? undefined,
    refreshInterval
  );

  const { trade: bestElixirTradeExactOut, isLoading: isElixirLoadingOut } = useElixirTradeExactOut(
    inputCurrency ?? undefined,
    !isExactIn ? parsedAmount : undefined,
    refreshInterval
  );

  const bestTradeIn = v2BestTradeExactIn
    ? bestElixirTradeExactIn?.outputAmount.greaterThan(v2BestTradeExactIn?.outputAmount)
      ? bestElixirTradeExactIn
      : v2BestTradeExactIn
    : bestElixirTradeExactIn;

  const bestTradeOut = v2BestTradeExactOut
    ? bestElixirTradeExactOut?.inputAmount.lessThan(v2BestTradeExactOut?.inputAmount)
      ? bestElixirTradeExactOut
      : v2BestTradeExactOut
    : bestElixirTradeExactOut;

  const v2Trade = isExactIn ? bestTradeIn : bestTradeOut;

  const currencyBalances = {
    [Field.INPUT]: relevantTokenBalances[0],
    [Field.OUTPUT]: relevantTokenBalances[1],
  };

  const currencies: { [field in Field]?: Currency } = {
    [Field.INPUT]: inputCurrency ?? undefined,
    [Field.OUTPUT]: outputCurrency ?? undefined,
  };

  let inputError: string | undefined;
  if (!finalAccount) {
    inputError = 'Connect Wallet';
  }

  if (!parsedAmount) {
    inputError = inputError ?? 'Enter an amount';
  }

  if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
    inputError = inputError ?? 'Select a token';
  }

  const formattedTo = isAddress(to);
  if (!to || !formattedTo) {
    inputError = inputError ?? 'Enter a recipient';
  } else if (
    BAD_RECIPIENT_ADDRESSES.indexOf(formattedTo) !== -1 ||
    (v2BestTradeExactIn && involvesAddress(v2BestTradeExactIn, formattedTo)) ||
    (v2BestTradeExactOut && involvesAddress(v2BestTradeExactOut, formattedTo))
  ) {
    inputError = inputError ?? 'Invalid recipient';
  }

  const [allowedSlippage] = useUserSlippageTolerance();

  const slippageAdjustedAmounts =
    v2Trade && allowedSlippage && computeSlippageAdjustedAmounts(v2Trade, allowedSlippage);

  const [balanceIn, amountIn] = [
    currencyBalances[Field.INPUT],
    toggledVersion === Version.v1
      ? null
      : slippageAdjustedAmounts
      ? slippageAdjustedAmounts[Field.INPUT]
      : null,
  ];

  if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
    inputError = 'Insufficient ' + amountIn.currency.symbol + ' balance';
  }

  const isLoading = isExactIn
    ? v2Trade instanceof ElixirTrade
      ? isElixirLoadingIn
      : isLoadingIn
    : v2Trade instanceof ElixirTrade
    ? isElixirLoadingOut
    : isLoadingOut;

  return {
    currencies,
    currencyBalances,
    parsedAmount,
    v2Trade: v2Trade ?? undefined,
    inputError,
    v1Trade: undefined,
    isLoading,
  };
}


function parseCurrencyFromURLParameter(urlParam: any, chainId: ChainId): string {
  if (typeof urlParam === 'string') {
    const valid = isAddress(urlParam);
    if (valid) return valid;
    if (urlParam.toUpperCase() === 'AVAX') return 'AVAX';
    if (urlParam.toUpperCase() === 'ETH') return 'ETH';
    if (valid === false) return chainId === ChainId.AVALANCHE ? 'AVAX' : 'ETH';
  }
  return chainId === ChainId.AVALANCHE ? 'AVAX' : 'ETH';
}

function parseTokenAmountURLParameter(urlParam: any): string {
  return typeof urlParam === 'string' && !isNaN(parseFloat(urlParam)) ? urlParam : '';
}

function parseIndependentFieldURLParameter(urlParam: any): Field {
  return typeof urlParam === 'string' && urlParam.toLowerCase() === 'output' ? Field.OUTPUT : Field.INPUT;
}

const ENS_NAME_REGEX = /^[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)?$/;
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;
function validatedRecipient(recipient: any): string | null {
  if (typeof recipient !== 'string') return null;
  const address = isAddress(recipient);
  if (address) return address;
  if (ENS_NAME_REGEX.test(recipient)) return recipient;
  if (ADDRESS_REGEX.test(recipient)) return recipient;
  return null;
}

export function queryParametersToSwapState(parsedQs: ParsedQs, chainId: ChainId): SwapState {
  let inputCurrency = parseCurrencyFromURLParameter(parsedQs.inputCurrency, chainId ?? ChainId.AVALANCHE);
  let outputCurrency = parseCurrencyFromURLParameter(parsedQs.outputCurrency, chainId ?? ChainId.AVALANCHE);

  if (inputCurrency === outputCurrency) {
    if (typeof parsedQs.outputCurrency === 'string') {
      inputCurrency = '';
    } else {
      outputCurrency = PNG[chainId ?? ChainId.AVALANCHE].address; // outputCurrency= ''
    }
  }

  const recipient = validatedRecipient(parsedQs.recipient);

  return {
    [Field.INPUT]: {
      currencyId: inputCurrency,
    },
    [Field.OUTPUT]: {
      currencyId: outputCurrency,
    },
    typedValue: parseTokenAmountURLParameter(parsedQs.exactAmount),
    independentField: parseIndependentFieldURLParameter(parsedQs.exactField),
    recipient,
  };
}

// updates the swap state to use the defaults for a given network
export function useDefaultsFromURLSearch():
  | { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined }
  | undefined {
  const chainId = useChainId();
  const dispatch = useDispatch<AppDispatch>();
  const parsedQs = useParsedQueryString();
  const [result, setResult] = useState<
    { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined } | undefined
  >();

  useEffect(() => {
    if (!chainId) return;
    const parsed = queryParametersToSwapState(parsedQs, chainId);

    dispatch(
      replaceSwapState({
        typedValue: parsed.typedValue,
        field: parsed.independentField,
        inputCurrencyId: parsed[Field.INPUT].currencyId,
        outputCurrencyId: parsed[Field.OUTPUT].currencyId,
        recipient: parsed.recipient,
      }),
    );

    setResult({ inputCurrencyId: parsed[Field.INPUT].currencyId, outputCurrencyId: parsed[Field.OUTPUT].currencyId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, chainId]);

  return result;
}
