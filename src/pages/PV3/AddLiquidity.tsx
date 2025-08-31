/* eslint-disable max-lines */
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useActiveWeb3React } from '@/hooks';
import { ApprovalState } from '@/hooks/useApproveCallback';
import { useApproveCallbackHook } from '@/hooks/useApproveCallback/index';
import { useChainId, useLibrary } from '@/provider/pangolin';
import { useWalletModalToggle } from '@/state/applicationv3';
import { useIsExpertMode, useUserSlippageTolerance } from '@/state/userv3';
import { useCurrencyBalance } from '@/state/wallet/hooks';
import { useElixirAddLiquidityHook } from '@/state/wallet/hooks/index';
import { SelectTokenDrawer } from '@/token-drawer';
import { cn } from '@/utils';
import { CHAINS, Currency, FeeAmount, wrappedCurrency } from '@pangolindex/sdk';
import { useCallback, useContext, useState } from 'react';
import { Info, Lock } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import LiquidityChartRangeInput from 'src/components/LiquidityChartRangeInput';
import { Bound, Field } from 'src/state/mint/atom';
import {
  useDerivedMintInfo,
  useMintActionHandlers,
  useMintState,
  useRangeHopCallbacks,
} from 'src/state/mint/hooksElixir';
import { useDerivedPositionInfo } from 'src/state/wallet/hooks/evm';
import { useElixirPositionFromTokenId } from 'src/state/wallet/hooks/useElixirPositionFromTokenId';
import { ThemeContext } from 'styled-components';
import { useCurrency } from '../../hooks/Tokens';
import ConfirmDrawer from './ConfirmDrawer';
import FeeSelector from './FeeSelector';
import OutofRangeWarning from './OutofRangeWarning';
import PriceRange from './PriceRange';
import SelectPair from './SelectPair';
import useTransactionDeadline from '@/hooks/useTransactionDeadline';
import { MixPanelEvents, useMixpanel } from '@/hooks/mixpanel';
;

export const PV3AddLiquidity = () => {
  const { t } = useTranslation();
  const { library, provider } = useLibrary();
  const { account } = useActiveWeb3React();
  const chainId = useChainId();
  const expertMode = useIsExpertMode();

  const theme = useContext(ThemeContext);
  const [isCurrencyDrawerOpen, setIsCurrencyDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<Field>(Field.CURRENCY_A);

  // mint state
  const { independentField, typedValue, feeAmount, startPriceTypedValue } = useMintState();

  // TODO check tokenId
  // const tokenId = '';
  // check for existing position if tokenId in url
  const { position: existingPositionDetails, loading: positionLoading } = useElixirPositionFromTokenId(undefined);
  const hasExistingPosition = !!existingPositionDetails && !positionLoading;
  const { position: existingPosition } = useDerivedPositionInfo(existingPositionDetails);

  const {
    dependentField,
    noLiquidity,
    currencies,
    price,
    invertPrice,
    ticks,
    pricesAtTicks,
    pool,
    ticksAtLimit,
    invalidPool,
    invalidRange,
    outOfRange,
    depositADisabled,
    depositBDisabled,
    parsedAmounts,
    errorMessage, // Real-time field base error message
    pricesAtLimit,
    position,
  } = useDerivedMintInfo(existingPosition);

  const {
    onFieldAInput,
    onFieldBInput,
    onLeftRangeInput,
    onRightRangeInput,
    onCurrencySelection,
    onSetFeeAmount,
    onSetinitialFee,
    onStartPriceInput,
    onResetMintState,
    onSwitchCurrencies,
    onResettMintStateOnToggle,
  } = useMintActionHandlers(noLiquidity);

  const isValid = !errorMessage && !invalidRange;

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined); // txn error
  const { currencyIdA, currencyIdB } = useParams<{ currencyIdA: string; currencyIdB: string }>();
  const currency0 = useCurrency(currencyIdA);
  const currency1 = useCurrency(currencyIdB);

  // txn values
  const deadline = useTransactionDeadline(); // custom from users settings
  const [allowedSlippage] = useUserSlippageTolerance(); // custom from users
  const [txHash, setTxHash] = useState<string>('');
  const mixpanel = useMixpanel();
  const addLiquidity = useElixirAddLiquidityHook[chainId]();
  const useApproveCallback = useApproveCallbackHook[chainId];

  // check whether the user has approved the router on the tokens
  const [approvalA, approveACallback] = useApproveCallback(
    chainId,
    parsedAmounts[Field.CURRENCY_A],
    CHAINS[chainId]?.contracts?.elixir?.nftManager,
  );
  const [approvalB, approveBCallback] = useApproveCallback(
    chainId,
    parsedAmounts[Field.CURRENCY_B],
    CHAINS[chainId]?.contracts?.elixir?.nftManager,
  );

  // const currency0 = currencies[Field.CURRENCY_A];
  // const currency1 = currencies[Field.CURRENCY_B];

  // get formatted amounts
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  };

  const onChangeTokenDrawerStatus = useCallback(() => {
    setIsCurrencyDrawerOpen(!isCurrencyDrawerOpen);
  }, [isCurrencyDrawerOpen]);

  const onTokenClick = useCallback(
    (field: Field) => {
      setDrawerType(field);
      onChangeTokenDrawerStatus();
    },
    [setDrawerType, onChangeTokenDrawerStatus],
  );

  const handleFeePoolSelect = useCallback(
    (newFeeAmount: FeeAmount) => {
      onSetFeeAmount(newFeeAmount);
      onSetinitialFee(newFeeAmount);
      onLeftRangeInput('');
      onRightRangeInput('');
    },
    [onSetFeeAmount, onLeftRangeInput, onRightRangeInput],
  );

  const handleToggle = useCallback(() => {
    onSwitchCurrencies();
    onResettMintStateOnToggle();
  }, [onSetFeeAmount, onLeftRangeInput, onRightRangeInput, onSwitchCurrencies]);

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      if (drawerType === Field.CURRENCY_A) {
        if (currency1 === currency) {
          onSwitchCurrencies();
        } else {
          onCurrencySelection(Field.CURRENCY_A, currency);
        }
      } else {
        if (currency0 === currency) {
          onSwitchCurrencies();
        } else {
          onCurrencySelection(Field.CURRENCY_B, currency);
        }
      }
    },
    [drawerType, onSwitchCurrencies, currency0, currency1],
  );

  // get value and prices at ticks
  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks;
  const { [Bound.LOWER]: priceLower, [Bound.UPPER]: priceUpper } = pricesAtTicks;

  const { getDecrementLower, getIncrementLower, getDecrementUpper, getIncrementUpper, getSetFullRange } =
    useRangeHopCallbacks(currency0 ?? undefined, currency1 ?? undefined, feeAmount, tickLower, tickUpper, pool);

  async function onAdd() {
    if (!chainId || !library || !account || !provider) return;

    if (!currency0 || !currency1) {
      return;
    }

    try {
      setAttemptingTxn(true);
      const addData = {
        parsedAmounts,
        deadline,
        noLiquidity,
        allowedSlippage,
        currencies,
        position,
      };

      const response = await addLiquidity(addData);
      setTxHash(response?.hash as string);
      if (response?.hash) {
        mixpanel.track(MixPanelEvents.ADD_LIQUIDITY, {
          chainId: chainId,
          tokenA: currency0?.symbol,
          tokenB: currency1?.symbol,
          tokenA_Address: wrappedCurrency(currency0, chainId)?.address,
          tokenB_Address: wrappedCurrency(currency1, chainId)?.address,
        });
        onResetMintState();
      }
    } catch (err) {
      const _err = err as any;
      setError(_err?.message);
      console.error(_err);
    } finally {
      setAttemptingTxn(false);
    }
  }

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false);
    // if there was a tx hash, we want to clear the input
    // if (txHash) {
    //   onFieldAInput('', pairAddress);
    // }
    setError(undefined);
    setTxHash('');
    setAttemptingTxn(false);
  }, [txHash]);

  const handleCloseDrawer = useCallback(() => {
    onResetMintState();
    handleDismissConfirmation();
  }, []);

  const handleSetFullRange = useCallback(() => {
    getSetFullRange();
    const minPrice = pricesAtLimit[Bound.LOWER];
    const maxPrice = pricesAtLimit[Bound.UPPER];
    if (minPrice) {
      onLeftRangeInput(minPrice.toSignificant(5));
    }

    if (maxPrice) {
      onRightRangeInput(maxPrice.toSignificant(5));
    }
  }, [getSetFullRange, pricesAtLimit, onLeftRangeInput, onRightRangeInput]);

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle();

  const selectedCurrencyBalanceA = useCurrencyBalance(account ?? undefined, currency0 ?? undefined);
  const selectedCurrencyBalanceB = useCurrencyBalance(account ?? undefined, currency1 ?? undefined);

  const renderButton = () => {
    if (!account) {
      return <Button onClick={toggleWalletModal}>{t('swapPage.connectWallet')}</Button>;
    } else {
      return (
        <div>
          {(approvalA === ApprovalState.NOT_APPROVED ||
            approvalA === ApprovalState.PENDING ||
            approvalB === ApprovalState.NOT_APPROVED ||
            approvalB === ApprovalState.PENDING) &&
            isValid && (
              <div>
                {approvalA !== ApprovalState.APPROVED && (
                  <Button
                    onClick={approveACallback}
                    disabled={approvalA === ApprovalState.PENDING}
                    loading={approvalA === ApprovalState.PENDING}
                    // loadingText={`${t('swapPage.approving')} ${currencies[Field.CURRENCY_A]?.symbol}`}
                  >
                    {`${t('addLiquidity.approve')} ` + currencies[Field.CURRENCY_A]?.symbol}
                  </Button>
                )}
                {approvalB !== ApprovalState.APPROVED && (
                  <Button
                    onClick={approveBCallback}
                    disabled={approvalB === ApprovalState.PENDING}
                    loading={approvalB === ApprovalState.PENDING}
                    // loadingText={`${t('swapPage.approving')} ${currencies[Field.CURRENCY_B]?.symbol}`}
                  >
                    {`${t('addLiquidity.approve')} ` + currencies[Field.CURRENCY_B]?.symbol}
                  </Button>
                )}
              </div>
            )}
          <Button
            onClick={() => {
              expertMode ? onAdd() : setShowConfirm(true);
            }}
            disabled={
              !isValid ||
              (approvalA !== ApprovalState.APPROVED && !depositADisabled) ||
              (approvalB !== ApprovalState.APPROVED && !depositBDisabled)
            }
            //isDisabled={!isValid || approvalA !== ApprovalState.APPROVED || approvalB !== ApprovalState.APPROVED}
            //error={!isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]}
          >
            {errorMessage ?? t('addLiquidity.supply')}
          </Button>
        </div>
      );
    }
  };

  if (!currency0 || !currency1) {
    return <div>{t('elixir.addLiquidity.selectPair')}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center">Add Liquidity</div>
      {!hasExistingPosition && (
        <>
          <SelectPair
            onTokenClick={onTokenClick}
            handleToggle={handleToggle}
            currency0={currency0}
            currency1={currency1}
          />

          <div className="flex items-center justify-between">
            {t('elixir.addLiquidity.selectFeeTier')}
            <Tooltip>
              <TooltipTrigger>
                <Info size={16} data-tip data-for="selectFeeTier" />
              </TooltipTrigger>
              <TooltipContent>{t('elixir.addLiquidity.feeTierTooltipContext')}</TooltipContent>
            </Tooltip>
          </div>

          <FeeSelector
            handleFeePoolSelect={handleFeePoolSelect}
            disabled={!currency0 || !currency1}
            feeAmount={feeAmount}
            currency0={currency0}
            currency1={currency1}
          />
        </>
      )}
      <div
        className={cn(!feeAmount || invalidPool ? 'opacity-5 pointer-events-none' : 'opacity-100 pointer-events-auto')}
      >
        {!noLiquidity ? (
          <div className="my-10 mx-auto">
            <LiquidityChartRangeInput
              currency0={currency0}
              currency1={currency1}
              feeAmount={feeAmount}
              ticksAtLimit={ticksAtLimit}
              price={price ? parseFloat((invertPrice ? price.invert() : price).toSignificant(8)) : undefined}
              priceLower={priceLower}
              priceUpper={priceUpper}
              onLeftRangeInput={onLeftRangeInput}
              onRightRangeInput={onRightRangeInput}
              interactive={!hasExistingPosition}
            />
          </div>
        ) : (
          <div>
            {t('elixir.priceRange.startingPriceRange')}

            {noLiquidity && (
              <div className="flex flex-col justify-center items-center p-10 rounded-md mx-auto mb-10">
                {t('elixir.initializedLiquidity')}
              </div>
            )}

            <div className="grid grid-flow-row grid-cols-[minmax(0,_1fr)] mt-3 gap-2">
              <Input
                value={startPriceTypedValue}
                onChange={(value: any) => {
                  onStartPriceInput(value);
                }}
                placeholder="0.00"
              />

              <div>
                <span>Current 1 {currency0?.symbol} Price:</span>
                {price ? (
                  <div className="flex items-center justify-center">
                    {invertPrice
                      ? price?.invert()?.toSignificant(12).substring(0, 12)
                      : price?.toSignificant(12).substring(0, 12)}

                    <span style={{ fontSize: '14px', marginLeft: '4px' }}>{currency1?.symbol}</span>
                  </div>
                ) : (
                  '-'
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <div
        className={cn(
          !feeAmount ||
            invalidPool ||
            (noLiquidity && (!startPriceTypedValue || parseFloat(startPriceTypedValue) === 0))
            ? 'opacity-5 pointer-events-none'
            : 'opacity-100 pointer-events-auto',
        )}
      >
        <PriceRange
          priceLower={priceLower}
          priceUpper={priceUpper}
          getDecrementLower={getDecrementLower}
          getIncrementLower={getIncrementLower}
          getDecrementUpper={getDecrementUpper}
          getIncrementUpper={getIncrementUpper}
          onLeftRangeInput={onLeftRangeInput}
          onRightRangeInput={onRightRangeInput}
          currencyA={currency0}
          currencyB={currency1}
          feeAmount={feeAmount}
          ticksAtLimit={ticksAtLimit}
          onClickFullRange={handleSetFullRange}
        />

        {outOfRange ? (
          <div className="flex flex-col justify-center items-center p-10 rounded-md mx-auto mb-10">
            {t('elixir.notEarnFee')}
          </div>
        ) : null}
        {invalidRange ? (
          <div className="flex flex-col justify-center items-center p-10 rounded-md mx-auto mb-10">
            {t('elixir.invalidPriceRange')}
          </div>
        ) : null}
      </div>
      <div
        className={cn(
          tickLower === undefined || tickUpper === undefined || invalidPool || invalidRange
            ? 'opacity-20 pointer-events-none'
            : 'opacity-100 pointer-events-auto',
        )}
      >
        <div>
          {depositADisabled ? (
            <OutofRangeWarning
              label={`${t('common.from')}`}
              message={t('elixir.singleAssetDeposit')}
              addonLabel={<Lock size={18} color={theme?.textInput?.labelText} />}
            />
          ) : (
            <>
              <Label>{t('common.from')}</Label>
              <Input
                value={formattedAmounts[Field.CURRENCY_A]}
                onChange={(value: any) => {
                  onFieldAInput(value);
                }}
                placeholder="0.00"
                id="add-liquidity-currency-input"
              />
              {account && (
                <div>{!!currency0 && selectedCurrencyBalanceA ? selectedCurrencyBalanceA?.toSignificant(4) : ' -'}</div>
              )}
            </>
          )}

          {depositBDisabled ? (
            <OutofRangeWarning
              label={`${t('common.to')}`}
              message={t('elixir.singleAssetDeposit')}
              addonLabel={<Lock size={18} color={theme?.textInput?.labelText} />}
            />
          ) : (
            <>
              <Label>{`${t('common.to')}`}</Label>
              <Input
                value={formattedAmounts[Field.CURRENCY_B]}
                onChange={(value: any) => {
                  onFieldBInput(value);
                }}
                placeholder="0.00"
                id="swap-currency-input"
              />
              {account && (
                <div>{!!currency1 && selectedCurrencyBalanceB ? selectedCurrencyBalanceB?.toSignificant(4) : ' -'}</div>
              )}
            </>
          )}
        </div>
      </div>
      {renderButton()}
      {isCurrencyDrawerOpen && (
        <SelectTokenDrawer
          isOpen={isCurrencyDrawerOpen}
          onClose={onChangeTokenDrawerStatus}
          onCurrencySelect={handleCurrencySelect}
          selectedCurrency={currency0}
          otherSelectedCurrency={currency1}
        />
      )}
      {/* Confirm Swap Drawer */}
      {showConfirm && (
        <ConfirmDrawer
          isOpen={showConfirm}
          poolErrorMessage={errorMessage || error}
          currencies={currencies}
          noLiquidity={noLiquidity}
          onAdd={onAdd}
          attemptingTxn={attemptingTxn}
          txHash={txHash}
          onClose={handleDismissConfirmation}
          onComplete={handleCloseDrawer}
          position={position}
          ticksAtLimit={ticksAtLimit}
        />
      )}
    </div>
  );
};
