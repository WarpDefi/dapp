import { Button } from '@/components/ui/button';
import { useActiveWeb3React, useConcLiqPositionFeesHook } from '@/hooks';
import useIsTickAtLimit, { getPriceOrderingFromPositionForUI, usePool } from '@/hooks/common';
import { MixPanelEvents, useMixpanel } from '@/hooks/mixpanel';
import { useUSDCPriceHook } from '@/hooks/useUSDCPrice';
import { useChainId, useLibrary } from '@/provider';
import { Bound } from '@/state/mint/atom';
import { useElixirCollectEarnedFeesHook } from '@/state/wallet/hooks/index';
import { useInverter } from '@/utils/common';
import { formatTickPrice } from '@/utils/formatTickPrice';
import { unwrappedTokenV3 } from '@/utils/wrappedCurrency';
import { CurrencyAmount, FeeAmount, Fraction, NumberType, Position, Token, WAVAX, formatPrice } from '@pangolindex/sdk';
import numeral from 'numeral';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PriceCard from './PriceCard';
import { DetailStats } from './detail-stats';
import { DetailTabProps } from './types';
import { getTokenLogoURL } from '@/components/CurrencyLogoV3/getTokenLogoURL';
import { getBonusRewardEndTime, getBonusRewardTokens, getPendingRewards } from '@/hooks/evm';
import { useConcLiqNFTPositionManagerContract } from '@/utils/contracts';
import { useSingleCallResult } from '@/state/multicallv3/hooks';
import { useNPM, useTokenContract } from '@/hooks/useContract';
import BonusTokenItem from '@/components/BonusTokenItem';
import { calculateGasMargin } from '@/utils';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import Loader from '@/components/Loader';
;
import { useComponentButton } from '@/contexts/ButtonContext';

const DetailTab = ({ position }: DetailTabProps) => {
  const { t } = useTranslation();
  const chainId = useChainId();
  const { account } = useActiveWeb3React();
  const { provider, library } = useLibrary();
  const mixpanel = useMixpanel();
  const [, pool] = usePool(position?.token0 ?? undefined, position?.token1 ?? undefined, position?.fee);

  const [attempting, setAttempting] = useState<boolean>(false);
  const [hash, setHash] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  const [attemptingBonus, setAttemptingBonus] = useState<boolean>(false);
  const [hashBonus, setHashBonus] = useState<string | undefined>();
  const [errorBonus, setErrorBonus] = useState<string | undefined>();
  const { setEnabled } = useComponentButton(position?.tokenId);

  const currency0 = position?.token0 ? unwrappedTokenV3(position?.token0, chainId) : undefined;
  const currency1 = position?.token1 ? unwrappedTokenV3(position?.token1, chainId) : undefined;

  const tokenId = isNaN(Number(position?.tokenId)) ? 0 : Number(position?.tokenId);

  const positionManager = useConcLiqNFTPositionManagerContract();

  //const { setEnabled } = useButton();

  const shouldFetchReward = Boolean(
    positionManager && !isNaN(tokenId) && tokenId > 0 && position?.liquidity?.gt?.('0'),
  );

  const rewardAmountCall = useSingleCallResult(
    shouldFetchReward ? positionManager : undefined,
    'positionReward',
    shouldFetchReward ? [tokenId] : undefined,
  );

  const rewardAmount = useMemo(() => {
    if (rewardAmountCall.loading || rewardAmountCall.error || !rewardAmountCall.result) {
      return { totalReward: 0 };
    }
    return rewardAmountCall.result;
  }, [rewardAmountCall]);

  const bonusTokens = getBonusRewardTokens(position?.token0, position?.token1, position?.fee);
  const pendingRewards = getPendingRewards(
    position?.token0,
    position?.token1,
    Number(position?.tokenId),
    rewardAmount?.totalReward.toString(),
    position?.fee,
  );

  const listItems = bonusTokens?.[0]?.map((address: string, index: number) => (
    <BonusTokenItem key={address} address={address} rewardValue={pendingRewards?.amounts?.[index]} chainId={chainId} />
  ));

  const useConcLiqPositionFees = useConcLiqPositionFeesHook[chainId];
  const useUSDCPrice = useUSDCPriceHook[chainId];
  const collectFees = useElixirCollectEarnedFeesHook[chainId]();

  const nativePosition = useMemo(() => {
    if (
      pool &&
      position?.liquidity &&
      typeof position?.tickLower === 'number' &&
      typeof position?.tickUpper === 'number'
    ) {
      return new Position({
        pool,
        liquidity: position?.liquidity.toString(),
        tickLower: position?.tickLower,
        tickUpper: position?.tickUpper,
      });
    }
    return undefined;
  }, [position?.liquidity, pool, position?.tickLower, position?.tickUpper]);

  // Claiming fees
  const [feeValue0, feeValue1] = useConcLiqPositionFees(pool ?? undefined, position?.tokenId);
  const canClaim = (feeValue0?.greaterThan?.('0') ?? false) || (feeValue1?.greaterThan?.('0') ?? false);

  // these currencies will match the feeValue{0,1} currencies for the purposes of fee collection
  const currency0ForFeeCollectionPurposes = pool ? (unwrappedTokenV3(pool.token0, chainId) as Token) : undefined;
  const currency1ForFeeCollectionPurposes = pool ? (unwrappedTokenV3(pool.token1, chainId) as Token) : undefined;

  const tickAtLimit = useIsTickAtLimit(position?.fee, position?.tickLower, position?.tickUpper);
  const pricesFromPosition = getPriceOrderingFromPositionForUI(nativePosition);
  const { priceLower, priceUpper, base } = useInverter({
    priceLower: pricesFromPosition.priceLower,
    priceUpper: pricesFromPosition.priceUpper,
    quote: pricesFromPosition.quote,
    base: pricesFromPosition.base,
    invert: false, // we don't want to invert the price, just the tokens
  });

  //const inverted = position?.token0 ? base?.equals(position?.token0) : undefined;
  const inverted = true;
  const currentPrice = pool && formatPrice(inverted ? pool?.token1Price : pool?.token0Price, NumberType.TokenTx);

  const minPrice = formatTickPrice({
    price: priceLower,
    atLimit: tickAtLimit,
    direction: Bound.LOWER,
  });

  const maxPrice = formatTickPrice({
    price: priceUpper,
    atLimit: tickAtLimit,
    direction: Bound.UPPER,
  });

  const price0 = useUSDCPrice(position?.token0 ?? undefined);
  const price1 = useUSDCPrice(position?.token1 ?? undefined);

  const fiatValueOfLiquidity: CurrencyAmount | null = useMemo(() => {
    if (!price0 || !price1 || !nativePosition) return null;
    const amount0 = price0.quote(nativePosition?.amount0, chainId);
    const amount1 = price1.quote(nativePosition?.amount1, chainId);
    return amount0.add(amount1);
  }, [price0, price1, nativePosition]);

  const currencyPair = position ? `${currency0?.symbol} per ${currency1?.symbol}` : '';

  const feeValueUpper = inverted ? feeValue0 : feeValue1;
  const feeValueLower = inverted ? feeValue1 : feeValue0;

  const userLiquidity = {
    stat: fiatValueOfLiquidity?.greaterThan(new Fraction('1', '10000'))
      ? numeral(fiatValueOfLiquidity?.toFixed(2)).format('$0.00a')
      : '-',
  };

  const liquidityData = [
    {
      stat: nativePosition?.amount0 ? numeral(nativePosition?.amount0?.toFixed(6)).format('0.00a') : '-',
      currency: currency0,
    },
    {
      stat: nativePosition?.amount1 ? numeral(nativePosition?.amount1?.toFixed(6)).format('0.00a') : '-',
      currency: currency1,
    },
  ];

  const claimData = [
    {
      stat: feeValueUpper?.toSignificant(8) || <Loader/>,
      currency: currency0,
    },
    {
      stat: feeValueLower?.toSignificant(8) || <Loader/>,
      currency: currency1,
    },
  ];

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

  async function onHarvest() {
    if (positionManager) {
      try {
        setAttemptingBonus(true);
        const gss = await positionManager.estimateGas['claimReward'](position?.tokenId, account).then(
          estimatedGasLimit => {
            positionManager
              .claimReward(position?.tokenId, account, { gasLimit: calculateGasMargin(estimatedGasLimit) })
              .then((response: TransactionResponse) => {
                console.log(response);
                setHashBonus(response.hash);
                setEnabled(true);
              })
              .catch((error: any) => {
                setAttemptingBonus(false);
                console.log(error);
              });
          },
        );
      } catch (err) {
        const _err = typeof err === 'string' ? new Error(err) : (err as any);
        setErrorBonus(_err?.message);
        console.error(_err);
      }
    }
  }

  return (
    <div>
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h4>Liquidity</h4>
          </div>
          <div>
            <h2>{userLiquidity.stat}</h2>
          </div>
          <div className="border border-muted rounded-lg p-3 bg-slate-50 dark:bg-primary/5 flex flex-col gap-2">
            {liquidityData.map((item, index) => (
              <DetailStats key={index} item={item} />
            ))}
          </div>
        </div>
        <div
          className={`flex flex-row lg:grid ${pendingRewards?.amounts?.[0] > 0 ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-6`}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h4>Fees</h4>
            </div>
            {!attempting && !hash && !error ? (
              <>
                <div className="flex items-center justify-end gap-2">
                  <Button disabled={!canClaim} onClick={onClaim}>
                    {t('earn.claimReward', { symbol: '' })}
                  </Button>
                </div>
                <div className="border border-muted rounded-lg p-3 flex flex-col gap-2 bg-slate-50 dark:bg-primary/5">
                  {claimData.map((item, index) => (
                    <DetailStats key={index} item={item} />
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-end gap-2">
                  <Button disabled={!canClaim} onClick={onClaim}>
                    {t('earn.claimReward', { symbol: '' })}
                  </Button>
                </div>
                <div className="border py-7 items-center border-muted rounded-lg p-3 flex flex-col gap-2 bg-slate-50 dark:bg-primary/5">
                  <Loader size="24px"></Loader>
                </div>
              </>
            )}
          </div>
          {pendingRewards?.amounts?.[0] > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h4>Bonus</h4>
              </div>
              {!attemptingBonus && !hashBonus && !errorBonus ? (
                <>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      onClick={() => {
                        onHarvest();
                      }}
                    >
                      {t('earn.claimRewardBonus', { symbol: '' })}
                    </Button>
                  </div>
                  <div className="border border-muted rounded-lg p-3 flex flex-col gap-2 bg-slate-50 dark:bg-primary/5">{listItems}</div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      onClick={() => {
                        onHarvest();
                      }}
                    >
                      {t('earn.claimRewardBonus', { symbol: '' })}
                    </Button>
                  </div>
                  <div className="border py-7 items-center border-muted rounded-lg p-3 flex flex-col gap-2 bg-slate-50 dark:bg-primary/5">
                    <Loader size="24px"></Loader>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <div className="col-span-2 flex flex-col gap-2">
          <h4>Price Range</h4>
          <div className="grid grid-cols-2 gap-6">
            <PriceCard
              title="Min Price"
              price={minPrice}
              currencyPair={currencyPair}
              description={`Your position will be 100% ${currency1?.symbol} at this price.`}
            />
            <PriceCard
              title="Max Price"
              price={maxPrice}
              currencyPair={currencyPair}
              description={`Your position will be 100% ${currency0?.symbol} at this price.`}
            />
            <div className="col-span-2">
              <PriceCard title="Current Price" price={currentPrice || '-'} currencyPair={currencyPair} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailTab;
