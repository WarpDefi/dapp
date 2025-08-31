/* eslint-disable max-lines */
import { CurrencyInput } from '@/components/CurrencyInputV3';
import { Icons } from '@/components/icons';
import { Stat } from '@/components/Stat';
import TransactionCompleted from '@/components/TransactionCompleted';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ConnectWalletButtonRainbow } from '@/components/ui/connect-wallet-button-rainbow';
import { Loader } from '@/components/ui/loader';
import { Modal } from '@/components/ui/modal';
import { useActiveWeb3React } from '@/hooks';
import { MixPanelEvents, useMixpanel } from '@/hooks/mixpanel';
import { ApprovalState } from '@/hooks/useApproveCallback';
import { useApproveCallbackHook } from '@/hooks/useApproveCallback/index';
import useTransactionDeadline from '@/hooks/useTransactionDeadline';
import { useUSDCPriceHook } from '@/hooks/useUSDCPrice';
import { useChainId, useLibrary } from '@/provider';
import { Field } from '@/state/mint/atom';
import { useDerivedMintInfo, useMintActionHandlers, useMintState } from '@/state/mint/hooksElixir';
import { useUserSlippageTolerance } from '@/state/userv3';
import { useCurrencyBalanceV3 } from '@/state/wallet/hooks';
import { useDerivedPositionInfo } from '@/state/wallet/hooks/evm';
import { useElixirAddLiquidityHook } from '@/state/wallet/hooks/index';
import { unwrappedTokenV3, wrappedCurrency } from '@/utils/wrappedCurrency';
import { CHAINS } from '@pangolindex/sdk';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IncreasePositionProps } from './types';
;

const IncreasePosition = ({ isOpen, position: positionDetails, onClose }: IncreasePositionProps) => {
  const { t } = useTranslation();
  const { account } = useActiveWeb3React();
  const chainId = useChainId();
  const currency0 = positionDetails?.token0 ? unwrappedTokenV3(positionDetails.token0, chainId) : undefined;
  const currency1 = positionDetails?.token1 ? unwrappedTokenV3(positionDetails.token1, chainId) : undefined;

  const currencies = {
    [Field.CURRENCY_A]: currency0,
    [Field.CURRENCY_B]: currency1,
  };

  const { provider, library } = useLibrary();
  const mixpanel = useMixpanel();
  const deadline = useTransactionDeadline();
  const [allowedSlippage] = useUserSlippageTolerance();

  const [hash, setHash] = useState<string | undefined>();
  const [attempting, setAttempting] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();
  const wrappedOnDismiss = () => {
    setHash(undefined);
    setAttempting(false);
    setError(undefined);
  };

  const { position: existingPosition } = useDerivedPositionInfo(positionDetails);
  const {
    dependentField,
    noLiquidity,
    parsedAmounts,
    depositADisabled,
    depositBDisabled,
    position: derivedPosition,
  } = useDerivedMintInfo(existingPosition);

  const selectedCurrencyBalanceA = useCurrencyBalanceV3(chainId, account ?? undefined, currency0 ?? undefined);
  const selectedCurrencyBalanceB = useCurrencyBalanceV3(chainId, account ?? undefined, currency1 ?? undefined);

  const useApproveCallback = useApproveCallbackHook[chainId];

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

  const areDepositsNotAvailable: boolean = useMemo(() => {
    // If depositA or depositB are not disabled, check if its parsedAmount is greater than 0
    if (
      (!depositADisabled && parsedAmounts[Field.CURRENCY_A]) ||
      (!depositBDisabled && parsedAmounts[Field.CURRENCY_B])
    ) {
      return false;
    }

    // If neither condition above is met, disable the addLiquidity button
    return true;
  }, [depositADisabled, depositBDisabled, parsedAmounts]);

  const isEnoughBalance = useMemo(() => {
    // Initialize flags based on whether deposits are disabled
    let isCurrencyAEnough = depositADisabled;
    let isCurrencyBEnough = depositBDisabled;

    // Check if balances for both currencies, parsedAmounts and deposits are available
    if (selectedCurrencyBalanceA && selectedCurrencyBalanceB && !areDepositsNotAvailable && parsedAmounts) {
      // Check if parsed amount for A doesn't exceed user's balance for A
      if (
        !isCurrencyAEnough &&
        parsedAmounts[Field.CURRENCY_A] &&
        !parsedAmounts[Field.CURRENCY_A]?.greaterThan(selectedCurrencyBalanceA)
      ) {
        isCurrencyAEnough = true;
      }

      // Check if parsed amount for B doesn't exceed user's balance for B
      if (
        !isCurrencyBEnough &&
        parsedAmounts[Field.CURRENCY_B] &&
        !parsedAmounts[Field.CURRENCY_B]?.greaterThan(selectedCurrencyBalanceB)
      ) {
        isCurrencyBEnough = true;
      }
    }

    // Return true only if there is enough balance for both currency A and currency B
    return isCurrencyAEnough && isCurrencyBEnough;
  }, [selectedCurrencyBalanceA, selectedCurrencyBalanceB, parsedAmounts, areDepositsNotAvailable]);

  const { independentField, typedValue } = useMintState();
  const { onFieldAInput, onFieldBInput, onCurrencySelection, onSetFeeAmount, onResetMintState } =
    useMintActionHandlers(noLiquidity);

  const useUSDCPrice = useUSDCPriceHook[chainId];

  const usdcValues = {
    [Field.CURRENCY_A]: useUSDCPrice(positionDetails?.token0 ?? undefined),
    [Field.CURRENCY_B]: useUSDCPrice(positionDetails?.token1 ?? undefined),
  };

  const usdcValueCurrencyA = usdcValues[Field.CURRENCY_A];
  const usdcValueCurrencyB = usdcValues[Field.CURRENCY_B];
  const currencyAFiat = useMemo(
    () => ({
      data: usdcValueCurrencyA ? parseFloat(usdcValueCurrencyA.toSignificant()) : undefined,
      isLoading: false,
    }),
    [usdcValueCurrencyA],
  );

  const currencyBFiat = useMemo(
    () => ({
      data: usdcValueCurrencyB ? parseFloat(usdcValueCurrencyB.toSignificant()) : undefined,
      isLoading: false,
    }),
    [usdcValueCurrencyB],
  );

  const fiatOfLiquidity = useMemo(() => {
    if (currencyAFiat.data && currencyBFiat.data) {
      return (
        parseFloat(parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) ?? '0') * currencyAFiat.data +
        parseFloat(parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) ?? '0') * currencyBFiat.data
      );
    }
    return 0;
  }, [currencyAFiat, currencyBFiat, parsedAmounts]);

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  };

  const addLiquidity = useElixirAddLiquidityHook[chainId]();

  const onIncrease = async () => {
    if (!chainId || !library || !account || !provider) return;

    if (!positionDetails?.token0 || !positionDetails?.token1) {
      return;
    }

    try {
      setAttempting(true);
      const addData = {
        parsedAmounts,
        deadline,
        noLiquidity,
        allowedSlippage,
        currencies,
        position: derivedPosition,
        tokenId: positionDetails?.tokenId,
        hasExistingPosition: !!positionDetails,
      };

      const response = await addLiquidity(addData);

      setHash(response?.hash as string);
      if (response?.hash) {
        mixpanel.track(MixPanelEvents.INCREASE_LIQUIDITY, {
          chainId: chainId,
          tokenA: positionDetails?.token0?.symbol,
          tokenB: positionDetails?.token1?.symbol,
          tokenA_Address: wrappedCurrency(positionDetails?.token0, chainId)?.address,
          tokenB_Address: wrappedCurrency(positionDetails?.token1, chainId)?.address,
        });
      }
      onResetMintState();
    } catch (err) {
      const _err = typeof err === 'string' ? new Error(err) : (err as any);
      setError(_err?.message);
      console.error(_err);
    } finally {
      setAttempting(false);
    }
  };

  const renderButton = () => {
    if (!account) {
      return <ConnectWalletButtonRainbow />;
    } else {
      return (
        <div className="flex gap-2">
          {(approvalA === ApprovalState.NOT_APPROVED ||
            approvalA === ApprovalState.PENDING ||
            approvalB === ApprovalState.NOT_APPROVED ||
            approvalB === ApprovalState.PENDING) &&
            isEnoughBalance && (
              <div className="flex gap-2">
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
            disabled={
              (approvalA !== ApprovalState.APPROVED && !depositADisabled) ||
              (approvalB !== ApprovalState.APPROVED && !depositBDisabled) ||
              areDepositsNotAvailable ||
              !isEnoughBalance
            }
            onClick={onIncrease}
          >
            {areDepositsNotAvailable
              ? 'Enter an amount'
              : isEnoughBalance
                ? t('common.addLiquidity')
                : t('common.insufficientBalance', { symbol: currencies[Field.CURRENCY_A]?.symbol })}
          </Button>
        </div>
      );
    }
  };

  useEffect(() => {
    if (positionDetails?.token0 && positionDetails?.token1) {
      positionDetails?.token0 && onCurrencySelection(Field.CURRENCY_A, positionDetails?.token0);
      positionDetails?.token1 && onCurrencySelection(Field.CURRENCY_B, positionDetails?.token1);
    }
    if (positionDetails?.fee) {
      onSetFeeAmount(positionDetails?.fee);
    }
  }, []);

  return (
    <Modal title="Increase Position" isOpen={isOpen} onClose={onClose}>
      {attempting && !hash && !error && <Loader label="Adding..." />}

      {hash && (
        <TransactionCompleted
          rootStyle={{ width: '100%' }}
          buttonText={t('common.close')}
          submitText={t('pool.liquidityAdded')}
          isShowButton={true}
          onButtonClick={wrappedOnDismiss}
        />
      )}

      {error && (
        <div className="flex flex-col items-center gap-4">
          <Icons.alert className="text-destructive size-32" />
          <small className="text-destructive text-center">{error}</small>
          <Button block variant="destructive" onClick={wrappedOnDismiss}>
            {t('transactionConfirmation.dismiss')}
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {depositADisabled ? (
          <Alert variant="destructive">
            <Icons.lock className="text-destructive" />
            <AlertTitle>Token 1</AlertTitle>
            <AlertDescription>{t('elixir.singleAssetDeposit')}</AlertDescription>
          </Alert>
        ) : (
          <CurrencyInput
            label="Token 1"
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
            disabled={!selectedCurrencyBalanceA}
            addonLabel={
              account && (
                <small>
                  {!!currency0 && selectedCurrencyBalanceA ? selectedCurrencyBalanceA?.toSignificant(4) : ' -'}
                </small>
              )
            }
          />
        )}

        <div className="w-full text-center flex justify-center items-center">
          <Icons.shuffle className="size-4" />
        </div>
        {depositBDisabled ? (
          <Alert variant="destructive">
            <Icons.lock className="text-destructive" />
            <AlertTitle>Token 2</AlertTitle>
            <AlertDescription>{t('elixir.singleAssetDeposit')}</AlertDescription>
          </Alert>
        ) : (
          <CurrencyInput
            label="Token 2"
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
            disabled={!selectedCurrencyBalanceB}
            addonLabel={
              account && (
                <small>
                  {!!currency1 && selectedCurrencyBalanceB ? selectedCurrencyBalanceB?.toSignificant(4) : ' -'}
                </small>
              )
            }
          />
        )}
        <div className="grid grid-cols-2 gap-2">
          <Stat
            title="Dollar Worth"
            stat={fiatOfLiquidity ? `$${fiatOfLiquidity.toFixed(2)}` : '-'}
            titlePosition="top"
            titleFontSize={12}
            statFontSize={14}
            titleColor="text8"
          />
          <Stat
            title="Pool Share"
            stat="-"
            titlePosition="top"
            titleFontSize={12}
            statFontSize={14}
            titleColor="text8"
          />
        </div>
        <div>{renderButton()}</div>
      </div>
    </Modal>
  );
};

export default IncreasePosition;
/* eslint-enable max-lines */
