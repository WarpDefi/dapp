import { Button } from '@/components/ui/button';
import { useActiveWeb3React } from '@/hooks';
import { ChainId, CHAINS, computePoolAddress, Currency, CurrencyAmount, ElixirTrade, FeeAmount, JSBI, Token, Trade } from '@pangolindex/sdk';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ArrowDown } from 'react-feather';
import ReactGA from 'react-ga';
import { Text } from 'rebass';
import { ThemeContext } from 'styled-components';
import AddressInputPanel from '../../components/AddressInputPanel';
import Card from '../../components/Card';
import Column, { AutoColumn } from '../../components/Column';
import { CurrencyInputPanel } from '../../components/CurrencyInputPanel';
import Loader from '../../components/Loader';
import PairChart from '../../components/PairChart';
import ProgressSteps from '../../components/ProgressSteps';
import { AutoRow, RowBetween } from '../../components/Row';
import TokenWarningModal from '../../components/TokenWarningModal';
import AdvancedSwapDetailsDropdown from '../../components/swap/AdvancedSwapDetailsDropdown';
import BetterTradeLink, { DefaultVersionLink } from '../../components/swap/BetterTradeLink';
import ConfirmSwapModal from '../../components/swap/ConfirmSwapModal';
import TradePrice from '../../components/swap/TradePrice';
import confirmPriceImpactWithoutFee from '../../components/swap/confirmPriceImpactWithoutFee';
import { ArrowWrapper, BottomGrouping, SwapCallbackError } from '../../components/swap/styleds';
import { INITIAL_ALLOWED_SLIPPAGE, PNG } from '../../constants';
import { usePair } from '../../data/Reserves';
import { useCurrency } from '../../hooks/Tokens';
import { ApprovalState, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback';
import useENS from '../../hooks/useENS';
import { useSwapCallback } from '../../hooks/useSwapCallback';
import useToggledVersion, { DEFAULT_VERSION, Version } from '../../hooks/useToggledVersion';
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback';
import { useOpenDisclaimerModal, useToggleSettingsMenu } from '../../state/application/hooks';
import { Field } from '../../state/swap/actions';
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
} from '../../state/swap/hooks';
import { useExpertModeManager, useUserSlippageTolerance } from '../../state/user/hooks';
import { maxAmountSpend } from '../../utils/maxAmountSpend';
import { computeTradePriceBreakdown, warningSeverity } from '../../utils/prices';
import { ClickableText } from '../Pool/styleds';
import { Icons } from '@/components/icons';
import TopMarquee from '@/components/Marquee';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAllTokenData } from '@/state/tokens/hooks';
import { notEmpty } from '@/utils';
import TokenTable from '@/components/tokens/TokenTable';
import TopTokenMovers from '@/components/tokens/TopTokenMovers';
import { SelectTokenDrawer } from '@/token-drawer';
import { useInterval } from 'react-use';
import SettingsTab from '@/components/Settings';
import { useAccount } from 'wagmi';
import { usePool } from '@/hooks/common';
import { useV3PoolAddress } from '@/hooks/useV3PoolAddress';
import { useFeeTierDistribution } from '@/hooks/FeeTier/evm';

export default function Swap() {
  const loadedUrlParams = useDefaultsFromURLSearch();

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId),
  ];
  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false);
  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c instanceof Token) ?? [],
    [loadedInputCurrency, loadedOutputCurrency],
  );
  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true);
  }, []);

  const { account, chainId } = useActiveWeb3React();
  const { address: wagmiAccount } = useAccount();
  const finalAccount = account || wagmiAccount;
  const theme = useContext(ThemeContext);

  // toggle wallet when disconnected
  const onOpenDisclaimerModal = useOpenDisclaimerModal();

  // for expert mode
  const toggleSettings = useToggleSettingsMenu();
  const [isExpertMode] = useExpertModeManager();

  //const [topTextLink, setTopTextLink] = useState<boolean>(false)

  // get custom setting values for user
  const [allowedSlippage] = useUserSlippageTolerance();

  // swap state
  const { independentField, typedValue, recipient } = useSwapState();
  const [refreshInterval, setRefreshInterval] = useState(0);
  const {
    v1Trade,
    v2Trade,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
    isLoading: isLoadingSwap,
  } = useDerivedSwapInfo(refreshInterval);

  useEffect(() => {
    const interval = setInterval(() => {
      //onUserInput(Field.INPUT, "10000");
      setRefreshInterval(prev => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
  } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue);

  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE;
  const { address: recipientAddress } = useENS(recipient);
  const toggledVersion = useToggledVersion();
  const tradesByVersion = {
    [Version.v1]: v1Trade,
    [Version.v2]: v2Trade,
  };

  //const [, pair] = usePair(currencies[Field.INPUT], currencies[Field.OUTPUT]);
  //const pairAddress = pair?.liquidityToken.address;
  const { isLoading, isError, largestUsageFeeTier, distributions } = useFeeTierDistribution(currencies[Field.INPUT], currencies[Field.OUTPUT]);
  const poolAddress = useV3PoolAddress(currencies[Field.INPUT], currencies[Field.OUTPUT], largestUsageFeeTier);
  const trade = showWrap ? undefined : tradesByVersion[toggledVersion];
  const defaultTrade = showWrap ? undefined : tradesByVersion[DEFAULT_VERSION];

  const betterTradeLinkVersion: Version | undefined = undefined;

  const parsedAmounts = showWrap
    ? {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount,
      }
    : {
        [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
        [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
      };

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers();
  const isValid = !swapInputError;
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT;

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value);
    },
    [onUserInput],
  );
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value);
    },
    [onUserInput],
  );

  // modal and loading
  const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    showConfirm: boolean;
    tradeToConfirm: Trade | ElixirTrade | undefined;
    attemptingTxn: boolean;
    swapErrorMessage: string | undefined;
    txHash: string | undefined;
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined,
  });

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? (parsedAmounts[independentField]?.toExact() ?? '')
      : (parsedAmounts[dependentField]?.toSignificant(6) ?? ''),
  };

  const route = trade?.route;
  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0)),
  );
  const noRoute = !route;

  // check whether the user has approved the router on the input token
  const [approval, approveCallback] = useApproveCallbackFromTrade(
    chainId ?? ChainId.AVALANCHE,
    trade as Trade,
    allowedSlippage,
  );

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false);

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true);
    }
  }, [approval, approvalSubmitted]);

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(
    currencyBalances[Field.INPUT],
    chainId ?? ChainId.AVALANCHE,
  );
  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput));

  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(
    trade as Trade,
    allowedSlippage,
    recipient,
  );

  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade as Trade);

  const handleSwap = useCallback(() => {
    if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee)) {
      return;
    }
    if (!swapCallback) {
      return;
    }
    setSwapState({ attemptingTxn: true, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: undefined });
    swapCallback()
      .then(hash => {
        setSwapState({ attemptingTxn: false, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: hash });

        ReactGA.event({
          category: 'Swap',
          action:
            recipient === null
              ? 'Swap w/o Send'
              : (recipientAddress ?? recipient) === finalAccount
                ? 'Swap w/o Send + recipient'
                : 'Swap w/ Send',
          label: [trade?.inputAmount?.currency?.symbol, trade?.outputAmount?.currency?.symbol, Version.v2].join('/'),
        });
      })
      .catch(error => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: error.message,
          txHash: undefined,
        });
      });
  }, [tradeToConfirm, finalAccount, priceImpactWithoutFee, recipient, recipientAddress, showConfirm, swapCallback, trade]);

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false);

  // warnings on slippage
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee);

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !swapInputError &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3 && !isExpertMode);

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ showConfirm: false, tradeToConfirm, attemptingTxn, swapErrorMessage, txHash });
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '');
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash]);

  const handleAcceptChanges = useCallback(() => {
    setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn, showConfirm });
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash]);

  const handleInputSelect = useCallback(
    (inputCurrency: Currency) => {
      setApprovalSubmitted(false); // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency);
    },
    [onCurrencySelection],
  );

  const handleMaxInput = useCallback(() => {
    maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact());
  }, [maxAmountInput, onUserInput]);

  const handleHalfInput = useCallback(() => {
    maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.divide(JSBI.BigInt(2)).toSignificant(10));
  }, [maxAmountInput, onUserInput]);

  const handleOutputSelect = useCallback(
    (outputCurrency: Currency) => {
      onCurrencySelection(Field.OUTPUT, outputCurrency);
    },
    [onCurrencySelection],
  );

  const allTokens = useAllTokenData();

  const formattedTokens = useMemo(() => {
    return Object.values(allTokens)
      .map(t => t.data)
      .filter(notEmpty);
  }, [allTokens]);

  const [selectedTokenAddress, setSelectedTokenAddress] = useState<string | null>(null);
  const currency = useCurrency(selectedTokenAddress || undefined);

  useEffect(() => {
    if (currency) {
      handleOutputSelect(currency);
    }
  }, [currency]);

  return (
    <>
      <TopTokenMovers
        handleOutputSelect={tokenAddress => {
          setSelectedTokenAddress(tokenAddress); // ✅ Sadece state değiştiriyoruz
        }}
      />
      <TokenWarningModal
        isOpen={
          urlLoadedTokens.length > 0 &&
          !dismissTokenWarning &&
          urlLoadedTokens[0] &&
          urlLoadedTokens[0].address !== PNG[ChainId.AVALANCHE].address
        }
        tokens={urlLoadedTokens}
        onConfirm={handleConfirmTokenWarning}
      />
      <div className="grid grid-rows-2 lg:grid-cols-3 lg:grid-rows-1 gap-4">
        <div className="bg-background p-8 rounded-xl lg:col-span-2">
          <PairChart
            currency0={currencies[Field.INPUT]}
            currency1={currencies[Field.OUTPUT]}
            address={poolAddress?.toLocaleLowerCase()}
            color="#36d58f"
          />
        </div>
        <div className="bg-background p-8 rounded-xl">
          {/* <SwapPoolTabs active={'swap'} /> */}
          <ConfirmSwapModal
            isOpen={showConfirm}
            trade={trade}
            originalTrade={tradeToConfirm}
            onAcceptChanges={handleAcceptChanges}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
            recipient={recipient}
            allowedSlippage={allowedSlippage}
            onConfirm={handleSwap}
            swapErrorMessage={swapErrorMessage}
            onDismiss={handleConfirmDismiss}
          />

          <AutoColumn gap={'md'}>
            <SettingsTab />
            <CurrencyInputPanel
              label={independentField === Field.OUTPUT && !showWrap && trade ? 'From (estimated)' : 'From'}
              value={formattedAmounts[Field.INPUT]}
              showMaxButton={!atMaxAmountInput}
              currency={currencies[Field.INPUT]}
              onUserInput={handleTypeInput}
              onMax={handleMaxInput}
              onHalf={handleHalfInput}
              onCurrencySelect={handleInputSelect}
              otherCurrency={currencies[Field.OUTPUT]}
              id="swap-currency-input"
            />
            <AutoColumn justify="space-between">
              <AutoRow justify={isExpertMode ? 'space-between' : 'center'} style={{ padding: '0 1rem' }}>
                <ArrowWrapper clickable>
                  <Icons.arrowUpDown
                    className="size-4 text-primary"
                    onClick={() => {
                      setApprovalSubmitted(false); // reset 2 step UI for approvals
                      onSwitchTokens();
                    }}
                  />
                </ArrowWrapper>
                {recipient === null && !showWrap && isExpertMode ? (
                  <a id="add-recipient-button" onClick={() => onChangeRecipient('')}>
                    + Add a send (optional)
                  </a>
                ) : null}
              </AutoRow>
            </AutoColumn>
            <CurrencyInputPanel
              value={formattedAmounts[Field.OUTPUT]}
              onUserInput={handleTypeOutput}
              label={independentField === Field.INPUT && !showWrap && trade ? 'To (estimated)' : 'To'}
              showMaxButton={false}
              currency={currencies[Field.OUTPUT]}
              onCurrencySelect={handleOutputSelect}
              otherCurrency={currencies[Field.INPUT]}
              id="swap-currency-output"
            />
            {recipient !== null && !showWrap ? (
              <>
                <AutoRow justify="space-between" style={{ padding: '0 1rem' }}>
                  <ArrowWrapper clickable={false}>
                    <ArrowDown size="16" />
                  </ArrowWrapper>
                  <a id="remove-recipient-button" onClick={() => onChangeRecipient(null)}>
                    - Remove send
                  </a>
                </AutoRow>
                <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
              </>
            ) : null}
            {showWrap ? null : (
              <Card padding={'.25rem .75rem 0 .75rem'} borderRadius={'20px'}>
                <AutoColumn gap="4px">
                  {Boolean(trade) && (
                    <RowBetween align="center">
                      <Text fontWeight={500} fontSize={14}>
                        Price
                      </Text>
                      <TradePrice
                        price={trade?.executionPrice}
                        showInverted={showInverted}
                        setShowInverted={setShowInverted}
                      />
                    </RowBetween>
                  )}
                  {allowedSlippage !== INITIAL_ALLOWED_SLIPPAGE && (
                    <RowBetween align="center">
                      <ClickableText fontWeight={500} fontSize={14} onClick={toggleSettings}>
                        Slippage Tolerance
                      </ClickableText>
                      <ClickableText fontWeight={500} fontSize={14} onClick={toggleSettings}>
                        {allowedSlippage / 100}%
                      </ClickableText>
                    </RowBetween>
                  )}
                </AutoColumn>
              </Card>
            )}
          </AutoColumn>
          <BottomGrouping>
            {!finalAccount ? (
              <Button block onClick={onOpenDisclaimerModal}>
                Connect Wallet
              </Button>
            ) : showWrap ? (
              <Button disabled={Boolean(wrapInputError)} onClick={onWrap}>
                {wrapInputError ??
                  (wrapType === WrapType.WRAP ? 'Wrap' : wrapType === WrapType.UNWRAP ? 'Unwrap' : null)}
              </Button>
            ) : (isLoadingSwap && !swapInputError) ||
              (userHasSpecifiedInputOutput && trade && approval === ApprovalState.UNKNOWN) ? (
              <Button block disabled={true}>
                <AutoRow gap="6px" justify="center">
                  Looking for the best price <Loader stroke="white" />
                </AutoRow>
              </Button>
            ) : noRoute && userHasSpecifiedInputOutput ? (
              <div className="border p-3 rounded-md border-information text-information">
                Insufficient liquidity for this trade.
              </div>
            ) : showApproveFlow ? (
              <div className="flex gap-2">
                <Button
                  block
                  onClick={approveCallback}
                  loading={approval === ApprovalState.PENDING}
                  disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                  // altDisabledStyle={approval === ApprovalState.PENDING} // show solid button while waiting
                  // confirmed={approval === ApprovalState.APPROVED}
                >
                  {approval === ApprovalState.PENDING ? (
                    <AutoRow gap="6px" justify="center">
                      Approving <Loader stroke="white" />
                    </AutoRow>
                  ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
                    'Approved'
                  ) : (
                    'Approve ' + currencies[Field.INPUT]?.symbol
                  )}
                </Button>
                <Button
                  block
                  variant={isValid && priceImpactSeverity > 2 ? 'destructive' : 'default'}
                  onClick={() => {
                    if (isExpertMode) {
                      handleSwap();
                    } else {
                      setSwapState({
                        tradeToConfirm: trade,
                        attemptingTxn: false,
                        swapErrorMessage: undefined,
                        showConfirm: true,
                        txHash: undefined,
                      });
                    }
                  }}
                  id="swap-button"
                  disabled={
                    !isValid || approval !== ApprovalState.APPROVED || (priceImpactSeverity > 3 && !isExpertMode)
                  }
                  // error={isValid && priceImpactSeverity > 2}
                >
                  {priceImpactSeverity > 3 && !isExpertMode
                    ? `Price Impact High`
                    : `Swap ${priceImpactSeverity > 2 ? 'Anyway' : ''}`}
                </Button>
              </div>
            ) : (
              <Button
                block
                onClick={() => {
                  if (isExpertMode) {
                    handleSwap();
                  } else {
                    setSwapState({
                      tradeToConfirm: trade,
                      attemptingTxn: false,
                      swapErrorMessage: undefined,
                      showConfirm: true,
                      txHash: undefined,
                    });
                  }
                }}
                id="swap-button"
                disabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError}
                variant={isValid && priceImpactSeverity > 2 && !swapCallbackError ? 'destructive' : 'default'}
              >
                <span>
                  {swapInputError
                    ? swapInputError
                    : priceImpactSeverity > 3 && !isExpertMode
                      ? `Price Impact Too High`
                      : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`}
                </span>
              </Button>
            )}
            {showApproveFlow && (
              <Column style={{ marginTop: '1rem' }}>
                <ProgressSteps steps={[approval === ApprovalState.APPROVED]} />
              </Column>
            )}
            {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
            {betterTradeLinkVersion ? (
              <BetterTradeLink version={betterTradeLinkVersion} />
            ) : toggledVersion !== DEFAULT_VERSION && defaultTrade ? (
              <DefaultVersionLink />
            ) : null}
          </BottomGrouping>
          {trade && <AdvancedSwapDetailsDropdown trade={trade} />}
        </div>
      </div>
      <TokenTable tokenDatas={formattedTokens} />
    </>
  );
}
