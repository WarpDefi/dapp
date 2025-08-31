import { Icons } from '@/components/icons';
import { TextInput } from '@/components/TextInput';
import TransactionCompleted from '@/components/TransactionCompleted';
import { Button } from '@/components/ui/button';
import { ConnectWalletButtonRainbow } from '@/components/ui/connect-wallet-button-rainbow';
import { Loader } from '@/components/ui/loader';
import { Slider } from '@/components/ui/slider';
import { useActiveWeb3React } from '@/hooks';
import { MixPanelEvents, useMixpanel } from '@/hooks/mixpanel';
import useTransactionDeadline from '@/hooks/useTransactionDeadline';
import { useChainId, useLibrary } from '@/provider';
import { useElixirRemoveLiquidityHook } from '@/state/burn';
import { useDerivedBurnInfo } from '@/state/burn/common';
import { useUserSlippageTolerance } from '@/state/userv3';
import { Percent } from '@pangolindex/sdk';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RemoveProps } from './types';
;

const Remove = ({ position }: RemoveProps) => {
  const chainId = useChainId();
  const { account } = useActiveWeb3React();
  const { provider, library } = useLibrary();
  const { t } = useTranslation();
  const mixpanel = useMixpanel();

  const [hash, setHash] = useState<string | undefined>();
  const [attempting, setAttempting] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();
  const [sliderValue, setSliderValue] = useState<number>(0);

  function wrappedOnDismiss() {
    setHash(undefined);
    setAttempting(false);
    setError(undefined);
  }
  const {
    position: positionSDK,
    liquidityPercentage,
    liquidityValue0,
    liquidityValue1,
    feeValue0,
    feeValue1,
  } = useDerivedBurnInfo(position, sliderValue);

  const [userSlippage] = useUserSlippageTolerance();
  const deadline = useTransactionDeadline();
  const removeLiquidity = useElixirRemoveLiquidityHook[chainId]();

  const onBurn = async () => {
    if (!chainId || !library || !account || !provider) return;
    if (
      !liquidityValue0 ||
      !liquidityValue1 ||
      !position?.tokenId ||
      !deadline ||
      !account ||
      !chainId ||
      !positionSDK ||
      !liquidityPercentage
    ) {
      return;
    }

    try {
      setAttempting(true);

      const removeLiqResponse = await removeLiquidity({
        tokenId: position?.tokenId,
        positionSDK,
        liquidityPercentage,
        liquidities: {
          liquidityValue0,
          liquidityValue1,
        },
        feeValues: {
          feeValue0,
          feeValue1,
        },
        allowedSlippage: new Percent(userSlippage, 10_000),
        deadline,
      });

      setHash(removeLiqResponse?.hash as string);

      if (removeLiqResponse?.hash) {
        setSliderValue(0);
        mixpanel.track(MixPanelEvents.REMOVE_LIQUIDITY, {
          chainId: chainId,
          token0: liquidityValue0?.currency?.symbol,
          token1: liquidityValue1?.currency?.symbol,
          tokenId: position?.tokenId,
        });
      }
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
    }

    return (
      <Button loading={attempting && !hash} onClick={onBurn} disabled={sliderValue === 0}>
        {t('common.remove')}
      </Button>
    );
  };

  return (
    <div>
      {!attempting && !hash && !error && (
        <div className="flex flex-col gap-4">
          <div className="border border-muted rounded-lg">
            <TextInput
              addonAfter={
                <div className="flex items-center">
                  <h4>{liquidityValue0?.currency?.symbol}</h4>
                </div>
              }
              disabled
              value={liquidityValue0 ? parseFloat(liquidityValue0.toSignificant(6)) / 100 : '-'} // We divide by 100 to get the correct value, because of the percentage
              fontSize={24}
              isNumeric={true}
              placeholder="0.00"
            />
          </div>
          <div className="border border-muted rounded-lg">
            <TextInput
              addonAfter={
                <div className="flex items-center">
                  <h4>{liquidityValue1?.currency?.symbol}</h4>
                </div>
              }
              value={liquidityValue1 ? parseFloat(liquidityValue1.toSignificant(6)) / 100 : '-'} // We divide by 100 to get the correct value, because of the percentage
              disabled
              fontSize={24}
              isNumeric={true}
              placeholder="0.00"
            />
          </div>

          <div className="flex items-center justify-between gap-4 p-4 border border-muted rounded-lg">
            <Slider defaultValue={[sliderValue]} max={100} onValueChange={val => setSliderValue(val[0])} />
            <span className="lead">{sliderValue}</span>
          </div>
          <div>{renderButton()}</div>
        </div>
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

      {attempting && !hash && !error && <Loader label={`${t('common.removingLiquidity')}...`} />}

      {hash && (
        <TransactionCompleted
          rootStyle={{ width: '100%' }}
          buttonText={t('common.close')}
          submitText={t('common.removedLiquidity')}
          isShowButton={true}
          onButtonClick={wrappedOnDismiss}
        />
      )}
    </div>
  );
};

export default Remove;
