/* eslint-disable max-lines */
import { Icons } from '@/components/icons';
import LiquidityChartRangeInput from '@/components/LiquidityChartRangeInput';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ConnectWalletButtonRainbow } from '@/components/ui/connect-wallet-button-rainbow';
import { Modal } from '@/components/ui/modal';
import { useActiveWeb3React } from '@/hooks';
import { MixPanelEvents, useMixpanel } from '@/hooks/mixpanel';
import { ApprovalState } from '@/hooks/useApproveCallback';
import { useApproveCallbackHook } from '@/hooks/useApproveCallback/index';
import useTransactionDeadline from '@/hooks/useTransactionDeadline';
import { useChainId, useLibrary } from '@/provider/pangolin';
import { Bound, Field } from '@/state/mint/atom';
import {
  useDerivedMintInfo,
  useMintActionHandlers,
  useMintState,
  useRangeHopCallbacks,
} from '@/state/mint/hooksElixir';
import { useIsExpertMode, useUserSlippageTolerance } from '@/state/userv3';
import { useCurrencyBalance } from '@/state/wallet/hooks';
import { useDerivedPositionInfo } from '@/state/wallet/hooks/evm';
import { useElixirAddLiquidityHook } from '@/state/wallet/hooks/index';
import { useElixirPositionFromTokenId } from '@/state/wallet/hooks/useElixirPositionFromTokenId';
import { SelectTokenDrawer } from '@/token-drawer';
import { cn } from '@/utils';
import { CHAINS, Currency, FeeAmount, wrappedCurrency } from '@pangolindex/sdk';
import { useCallback, useState } from 'react';
import { Box } from '../Box';
import { TextInput } from '../TextInput';
import { Text } from '../TextV3';
import ConfirmDrawer from './ConfirmDrawer';
import FeeSelector from './FeeSelector';
import PriceRange from './PriceRange';
import SelectPair from './SelectPair';
import {
  ButtonWrapper,
  Buttons,
  CurrencyInputTextBox,
  DynamicSection,
  InputValue,
  InputWrapper
} from './styles';

const AddLiquidity = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { library, provider } = useLibrary();
  const { account } = useActiveWeb3React();
  const chainId = useChainId();
  const expertMode = useIsExpertMode();

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

  const currency0 = currencies[Field.CURRENCY_A];
  const currency1 = currencies[Field.CURRENCY_B];

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

  const handleCloseModal = useCallback(() => {
    onClose();
    onResetMintState();
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

  const selectedCurrencyBalanceA = useCurrencyBalance(account ?? undefined, currency0 ?? undefined);
  const selectedCurrencyBalanceB = useCurrencyBalance(account ?? undefined, currency1 ?? undefined);

  const renderButton = () => {
    if (!account) {
      return <ConnectWalletButtonRainbow />;
    } else {
      return (
        <Buttons>
          {(approvalA === ApprovalState.NOT_APPROVED ||
            approvalA === ApprovalState.PENDING ||
            approvalB === ApprovalState.NOT_APPROVED ||
            approvalB === ApprovalState.PENDING) &&
            isValid && (
              <ButtonWrapper>
                {approvalA !== ApprovalState.APPROVED && (
                  <Button
                    onClick={approveACallback}
                    disabled={approvalA === ApprovalState.PENDING}
                    loading={approvalA === ApprovalState.PENDING}
                    // loadingText={`${t('swapPage.approving')} ${currencies[Field.CURRENCY_A]?.symbol}`}
                  >
                    {`Approve ` + currencies[Field.CURRENCY_A]?.symbol}
                  </Button>
                )}
                {approvalB !== ApprovalState.APPROVED && (
                  <Button
                    onClick={approveBCallback}
                    disabled={approvalB === ApprovalState.PENDING}
                    loading={approvalB === ApprovalState.PENDING}
                    // loadingText={`${t('swapPage.approving')} ${currencies[Field.CURRENCY_B]?.symbol}`}
                  >
                    {`Approve ` + currencies[Field.CURRENCY_B]?.symbol}
                  </Button>
                )}
              </ButtonWrapper>
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
            {errorMessage ?? 'Supply'}
          </Button>
        </Buttons>
      );
    }
  };

  return (
    <Modal title="Add Liquidity" isOpen={isOpen} onClose={handleCloseModal} size="lg">
      <div className="md:grid md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-4">
          {!hasExistingPosition && (
            <>
              <SelectPair
                onTokenClick={onTokenClick}
                handleToggle={handleToggle}
                currency0={currency0}
                currency1={currency1}
              />

              <Alert variant="warning" className='py-1 px-2'>
                <AlertDescription className='text-xs py-0'>
                  Position fees can be adjusted based on market conditions to help investors remain profitable.
                </AlertDescription>
              </Alert>

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
            className={cn(
              !feeAmount || invalidPool ? 'pointer-events-none opacity-20' : 'pointer-events-auto opacity-100',
            )}
          >
            <div className="grid grid-cols-2 gap-4">
              {pool?.fee && (
                <div className="flex flex-col gap-2 border border-muted rounded-lg p-3 bg-slate-50 dark:bg-muted">
                  <small>Current Fee</small>
                  <h4>{pool && pool?.fee / 10000}%</h4>
                </div>
              )}
              {price && (
                <div className="flex flex-col gap-2 border border-muted rounded-lg p-3 bg-slate-50 dark:bg-muted">
                  <small>Current Price</small>
                  <h4>
                    {price ? parseFloat((invertPrice ? price.invert() : price).toSignificant(8)) : undefined}{' '}
                    {currency1?.symbol}
                  </h4>
                </div>
              )}
            </div>
          </div>
          <div
            className={cn(
              'flex flex-col gap-2 border border-primary rounded-lg p-3 bg-slate-50 dark:bg-muted',
              tickLower === undefined || tickUpper === undefined || invalidPool || invalidRange
                ? 'pointer-events-none opacity-20'
                : 'pointer-events-auto opacity-100',
            )}
          >
            <div className="flex flex-col gap-4">
              {depositADisabled ? (
                <Alert>
                  <Icons.lock />
                  <AlertTitle>From</AlertTitle>
                  <AlertDescription>
                    The market price is outside your specified price range. Single-asset deposit only.
                  </AlertDescription>
                </Alert>
              ) : (
                <CurrencyInputTextBox
                  label="From"
                  value={formattedAmounts[Field.CURRENCY_A]}
                  onChange={(value: any) => {
                    onFieldAInput(value);
                  }}
                  buttonStyle={{
                    cursor: 'default',
                  }}
                  showArrowIcon={false}
                  className="h-12"
                  onTokenClick={() => {}}
                  currency={currency0}
                  fontSize={24}
                  isNumeric={true}
                  placeholder="0.00"
                  id="add-liquidity-currency-input"
                  addonLabel={
                    account && (
                      <div className="flex items-center gap-2">
                        <small>
                          {!!currency0 && selectedCurrencyBalanceA ? selectedCurrencyBalanceA?.toSignificant(4) : ' -'}
                        </small>
                        <Button
                          size="sm"
                          className="py-1 px-2"
                          variant="outline"
                          onClick={() => {
                            if (selectedCurrencyBalanceA) {
                              onFieldAInput(selectedCurrencyBalanceA?.toSignificant(4));
                            }
                          }}
                        >
                          Max
                        </Button>
                      </div>
                    )
                  }
                />
              )}

              {depositBDisabled ? (
                <Alert>
                  <Icons.lock />
                  <AlertTitle>To</AlertTitle>
                  <AlertDescription>
                    The market price is outside your specified price range. Single-asset deposit only.
                  </AlertDescription>
                </Alert>
              ) : (
                <CurrencyInputTextBox
                  label="To"
                  value={formattedAmounts[Field.CURRENCY_B]}
                  onChange={(value: any) => {
                    onFieldBInput(value);
                  }}
                  buttonStyle={{
                    cursor: 'default',
                  }}
                  showArrowIcon={false}
                  className="h-12"
                  onTokenClick={() => {}}
                  currency={currency1}
                  fontSize={24}
                  isNumeric={true}
                  placeholder="0.00"
                  id="swap-currency-input"
                  addonLabel={
                    account && (
                      <div className="flex items-center gap-2">
                        <small>
                          {!!currency0 && selectedCurrencyBalanceB ? selectedCurrencyBalanceB?.toSignificant(4) : ' -'}
                        </small>
                        <Button
                          size="sm"
                          className="py-1 px-2"
                          variant="outline"
                          onClick={() => {
                            if (selectedCurrencyBalanceB) {
                              onFieldBInput(selectedCurrencyBalanceB?.toSignificant(4));
                            }
                          }}
                        >
                          Max
                        </Button>
                      </div>
                    )
                  }
                />
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div
            className={cn(
              'flex flex-col gap-4',
              !feeAmount ||
                invalidPool ||
                (noLiquidity && (!startPriceTypedValue || parseFloat(startPriceTypedValue) === 0))
                ? 'pointer-events-none opacity-20'
                : 'pointer-events-auto opacity-100',
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
              <Alert variant="destructive">
                <AlertTitle>Not earn fee</AlertTitle>
                <AlertDescription>
                  Your position will not earn fees or be used in trades until the market price moves into your range.
                </AlertDescription>
              </Alert>
            ) : null}
            {invalidRange ? (
              <Alert variant="destructive">
                <AlertTitle>Invalid range</AlertTitle>
                <AlertDescription>
                  Invalid range selected. The min price must be lower than the max price.
                </AlertDescription>
              </Alert>
            ) : null}
          </div>
          <DynamicSection disabled={!feeAmount || invalidPool}>
            {!noLiquidity ? (
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
            ) : (
              <div className="flex flex-col gap-2 border border-muted rounded-lg p-3 bg-slate-50 dark:bg-muted">
                <h4>Starting price range</h4>

                {noLiquidity && <small>Initialized liquidity</small>}

                <InputWrapper>
                  <TextInput
                    value={startPriceTypedValue}
                    onChange={(value: any) => {
                      onStartPriceInput(value);
                    }}
                    fontSize={24}
                    isNumeric={true}
                    placeholder="0.00"
                  />

                  <InputValue>
                    <Text fontSize={14} style={{ fontWeight: 500 }} textAlign="left" color="text1">
                      Current 1 {currency0?.symbol} Price:
                    </Text>

                    {price ? (
                      <Box display="flex" justifyContent="center" alignItems="center">
                        <Text fontSize={14} style={{ fontWeight: 500 }} textAlign="left" color="text1">
                          {invertPrice
                            ? price?.invert()?.toSignificant(12).substring(0, 12)
                            : price?.toSignificant(12).substring(0, 12)}
                        </Text>{' '}
                        <span style={{ fontSize: '14px', marginLeft: '4px' }}>{currency1?.symbol}</span>
                      </Box>
                    ) : (
                      '-'
                    )}
                  </InputValue>
                </InputWrapper>
              </div>
            )}
          </DynamicSection>
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
    </Modal>
  );
};

export default AddLiquidity;
/* eslint-enable max-lines */
