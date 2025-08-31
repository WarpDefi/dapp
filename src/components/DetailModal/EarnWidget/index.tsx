import { Stat } from '@/components/Stat';
import TransactionCompleted from '@/components/TransactionCompleted';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useActiveWeb3React, useConcLiqPositionFeesHook } from '@/hooks';
import { usePool } from '@/hooks/common';
import { MixPanelEvents, useMixpanel } from '@/hooks/mixpanel';
import { useLibrary } from '@/provider';
import { useElixirCollectEarnedFeesHook } from '@/state/wallet/hooks/index';
import { unwrappedTokenV3 } from '@/utils/wrappedCurrency';
import { Token } from '@pangolindex/sdk';
import { useState } from 'react';
import { AlertTriangle } from 'react-feather';
import { useTranslation } from 'react-i18next';
import RemoveDrawer from './RemoveDrawer';
import { RewardWrapper, Root } from './styles';
import { EarnWidgetProps } from './types';
;

const EarnWidget = ({ position }: EarnWidgetProps) => {
  const { t } = useTranslation();
  const chainId = useChainId();
  const { account } = useActiveWeb3React();
  const { provider, library } = useLibrary();
  const useConcLiqPositionFees = useConcLiqPositionFeesHook[chainId];
  const [hash, setHash] = useState<string | undefined>();
  const [attempting, setAttempting] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();
  function wrappedOnDismiss() {
    setHash(undefined);
    setAttempting(false);
    setError(undefined);
  }

  const mixpanel = useMixpanel();

  const [isRemoveDrawerVisible, setShowRemoveDrawer] = useState(false);

  const [, pool] = usePool(position?.token0 ?? undefined, position?.token1 ?? undefined, position?.fee);
  // inverted is default false. We need to change it when we decide to show an inverted price
  // (inverted mean is; show everything(min, max, current price etc.) in base Token0/Token1 not Token1/Token0)
  const inverted = false;
  // fees
  const [feeValue0, feeValue1] = useConcLiqPositionFees(pool ?? undefined, position?.tokenId);
  const feeValueUpper = inverted ? feeValue0 : feeValue1;
  const feeValueLower = inverted ? feeValue1 : feeValue0;

  // these currencies will match the feeValue{0,1} currencies for the purposes of fee collection
  const currency0ForFeeCollectionPurposes = pool ? (unwrappedTokenV3(pool.token0, chainId) as Token) : undefined;
  const currency1ForFeeCollectionPurposes = pool ? (unwrappedTokenV3(pool.token1, chainId) as Token) : undefined;
  const canClaim = (feeValue0?.greaterThan?.('0') ?? false) || (feeValue1?.greaterThan?.('0') ?? false);

  const collectFees = useElixirCollectEarnedFeesHook[chainId]();
  const onClaim = async () => {
    if (!chainId || !library || !account || !provider) return;
    if (!currency0ForFeeCollectionPurposes || !currency1ForFeeCollectionPurposes) return;
    try {
      setAttempting(true);
      const collectFeesResponse = await collectFees({
        tokenId: position?.tokenId,
        tokens: {
          token0: currency0ForFeeCollectionPurposes,
          token1: currency1ForFeeCollectionPurposes,
        },
        feeValues: {
          feeValue0: feeValue0,
          feeValue1: feeValue1,
        },
      });

      setHash(collectFeesResponse?.hash as string);
      if (collectFeesResponse?.hash) {
        mixpanel.track(MixPanelEvents.CLAIM_REWARDS, {
          chainId: chainId,
          token0: currency0ForFeeCollectionPurposes.symbol,
          token1: currency1ForFeeCollectionPurposes.symbol,
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h4>Earned</h4>

        <Button variant="destructive" onClick={() => setShowRemoveDrawer(true)}>
          Remove
        </Button>
      </div>

      {error && (
        <div className="flex flex-col items-center gap-4">
          <AlertTriangle className="text-destructive size-32" />
          <small className="text-destructive text-center">{error}</small>
          <Button block variant="destructive" onClick={wrappedOnDismiss}>
            {t('transactionConfirmation.dismiss')}
          </Button>
        </div>
      )}

      {!attempting && !hash && !error && (
        <Root>
          <div className="flex flex-col gap-4">
            <div className="flex flex-1 flex-col justify-center">
              <RewardWrapper>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="grid grid-cols-2 gap-2">
                      <Stat
                        title={t('earn.unclaimedReward', { symbol: `${currency0ForFeeCollectionPurposes?.symbol}` })}
                        stat={feeValueUpper ? feeValueUpper?.toFixed(2) : '-'}
                        titlePosition="top"
                        titleFontSize={12}
                        statFontSize={[24, 18]}
                        titleColor="text1"
                        statAlign="center"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {feeValueUpper && currency0ForFeeCollectionPurposes && feeValueUpper?.toSignificant(8)}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="grid grid-cols-2 gap-2" data-tip data-for="unclaimedReward-2">
                      <Stat
                        title={t('earn.unclaimedReward', { symbol: `${currency1ForFeeCollectionPurposes?.symbol}` })}
                        stat={feeValueLower ? feeValueLower?.toFixed(2) : '-'}
                        titlePosition="top"
                        titleFontSize={12}
                        statFontSize={[24, 18]}
                        titleColor="text1"
                        statAlign="center"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {feeValueLower && currency1ForFeeCollectionPurposes && feeValueLower?.toSignificant(8)}
                  </TooltipContent>
                </Tooltip>
              </RewardWrapper>

              <div>
                <small className="text-center">{t('earn.liquidityRemainsPool')}</small>
              </div>
            </div>

            <div>
              <Button disabled={!canClaim} onClick={onClaim}>
                {t('earn.claimReward', { symbol: '' })}
              </Button>
            </div>
          </div>
        </Root>
      )}

      <RemoveDrawer
        isOpen={isRemoveDrawerVisible}
        position={position}
        onClose={() => {
          setShowRemoveDrawer(false);
        }}
      />

      {attempting && !hash && <Loader label={`${t('sarClaim.claiming')}...`} />}

      {hash && (
        <TransactionCompleted
          buttonText={t('common.close')}
          submitText={t('earn.rewardClaimed')}
          isShowButton={true}
          onButtonClick={wrappedOnDismiss}
        />
      )}
    </div>
  );
};

export default EarnWidget;
