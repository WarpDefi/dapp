import React, { useMemo, useState } from 'react';
import { AutoColumn } from '../../components/Column';
import styled from 'styled-components';

import { JSBI, ChainId, Fraction } from '@pangolindex/sdk';
import { RouteComponentProps } from 'react-router-dom';
import { useCurrency } from '../../hooks/Tokens';
import { TYPE } from '../../theme';

import { RowBetween } from '../../components/Row';
import { CardSection, DataCard, CardNoise, CardBGImage } from '../../components/earn/styled';
import { ButtonPrimary, ButtonEmpty } from '../../components/Button';
//import StakingModal from '../../components/earn/StakingModal'
import { useStakingInfo, StakingType } from '../../state/stake/hooks';
//import UnstakingModal from '../../components/earn/UnstakingModal'
import ClaimRewardModalNFT from '../../components/earn/ClaimRewardModalNFT';
//import CompoundRewardModal from '../../components/earn/CompoundRewardModal'
import { useTokenBalance } from '../../state/wallet/hooks';
import { useActiveWeb3React } from '../../hooks';
import { useColor } from '../../hooks/useColor';
import { CountUp } from 'use-count-up';

import { wrappedCurrency } from '../../utils/wrappedCurrency';
//import { usePair } from '../../data/Reserves'
import usePrevious from '../../hooks/usePrevious';
import { BIG_INT_ZERO, NFTSTAKE_ADDRESS, UNDEFINED } from '../../constants';

import { abi as IStakingRewardsNFT } from '../../../src/constants/abis/IStakingRewardsNFT.json';
import { Interface } from '@ethersproject/abi';
import { useMultipleContractSingleData } from '../../state/multicall/hooks';

const PageWrapper = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
`;

const PositionInfo = styled(AutoColumn)<{ dim: any }>`
  position: relative;
  max-width: 640px;
  width: 100%;
  opacity: ${({ dim }) => (dim ? 0.6 : 1)};
`;

const BottomSection = styled(AutoColumn)`
  border-radius: 12px;
  width: 100%;
  position: relative;
`;

const StyledDataCard = styled(DataCard)<{ bgColor?: any; showBackground?: any }>`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #1e1a31 0%, #3d51a5 100%);
  z-index: 2;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  background: radial-gradient(91.85% 100% at 1.84% 0%, #46e6d7 0%, #a5e2e8 100%);
`;

const StyledBottomCard = styled(DataCard)<{ dim: any }>`
  opacity: ${({ dim }) => (dim ? 0.4 : 1)};
  margin-top: -40px;
  padding: 0 1.25rem 1rem 1.25rem;
  padding-top: 32px;
  z-index: 1;
`;

const PoolData = styled(DataCard)`
  background: none;
  padding: 1rem;
  z-index: 1;
`;

const DataRow = styled(RowBetween)`
  justify-content: center;
  gap: 12px;
`;

export function NftstakeManage({
  match: {
    params: { currencyId, rewardCurrencyId },
  },
}: RouteComponentProps<{ currencyId: string; rewardCurrencyId: string }>) {
  const { account, chainId } = useActiveWeb3React();
  const currency = useCurrency(currencyId);
  const rewardCurrency = useCurrency(rewardCurrencyId);
  const stakingToken =
    wrappedCurrency(currency ?? undefined, chainId) ?? UNDEFINED[chainId ? chainId : ChainId.AVALANCHE];
  const rewardToken =
    wrappedCurrency(rewardCurrency ?? undefined, chainId) ?? UNDEFINED[chainId ? chainId : ChainId.AVALANCHE];
  //const [, stakingTokenPair] = usePair(stakingToken, UNDEFINED[chainId ? chainId : ChainId.AVALANCHE])
  const stakingInfos = useStakingInfo(StakingType.SINGLE);
  const stakingInfo = stakingInfos?.filter(info => info.rewardToken.equals(rewardToken))[0];

  // get the color of the token
  let backgroundColor = useColor(stakingToken);
  if (rewardToken.symbol == 'LYD') backgroundColor = '#5d1361';
  if (rewardToken.symbol == 'OLIVE') backgroundColor = '#4e980b';

  const userLiquidityUnstaked = useTokenBalance(account ?? undefined, stakingInfo?.stakedAmount?.token);
  const [showClaimRewardModalNFT, setShowClaimRewardModalNFT] = useState(false);
  const disableTop = !stakingInfo?.stakedAmount || stakingInfo.stakedAmount.equalTo(JSBI.BigInt(0));

  const accountArg = useMemo(() => [account ?? undefined], [account]);

  const NFTSTR_INTERFACE = new Interface(IStakingRewardsNFT);
  const oneTokenf = JSBI.BigInt(1000000000000000000);

  const NFTADDR = useMemo(
    () => [chainId ? NFTSTAKE_ADDRESS[chainId] : undefined],
    [chainId ? NFTSTAKE_ADDRESS[chainId] : undefined],
  );
  const ttlSpply = useMultipleContractSingleData(NFTADDR, NFTSTR_INTERFACE, 'totalSupply');
  //console.log(ttlSpply)
  const ttlSpplyx = JSBI.BigInt(ttlSpply[0].result ?? 1);
  //const ttlSpplyx = JSBI.BigInt(1)
  const totalRewardRate = useMultipleContractSingleData(NFTADDR, NFTSTR_INTERFACE, 'rewardRate');
  //console.log(totalRewardRate)
  const totalRewardRatex = JSBI.BigInt(totalRewardRate[0].result ?? 1);
  //const totalRewardRatex = JSBI.BigInt(1)

  const balances = useMultipleContractSingleData(NFTADDR, NFTSTR_INTERFACE, 'balanceOf', accountArg);
  //console.log(balances)
  const balancesx = JSBI.BigInt(balances[0].result ?? 1);
  //const balancesx = JSBI.BigInt(1)
  const isStakingIn = Boolean(BigInt(balancesx.toString()) > 0 ?? false);

  const earned = useMultipleContractSingleData(NFTADDR, NFTSTR_INTERFACE, 'earned', accountArg);
  const earnedx = JSBI.BigInt(earned[0].result ?? 1);

  const rewardRate = JSBI.divide(
    JSBI.multiply(JSBI.divide(JSBI.multiply(totalRewardRatex, balancesx), ttlSpplyx), JSBI.BigInt(60 * 60 * 24 * 7)),
    oneTokenf,
  );

  let totalSupplyf: Fraction;
  let weeklyRewardAmnt: Fraction;
  let balancesf: Fraction;
  let earnedf: Fraction;
  let rewardRatef: Fraction;
  rewardRatef = new Fraction(JSBI.BigInt(rewardRate));
  balancesf = new Fraction(JSBI.BigInt(balancesx));
  earnedf = new Fraction(JSBI.divide(JSBI.BigInt(earnedx), oneTokenf));
  totalSupplyf = new Fraction(JSBI.BigInt(ttlSpplyx));
  weeklyRewardAmnt = new Fraction(
    JSBI.divide(JSBI.BigInt(JSBI.multiply(totalRewardRatex, JSBI.BigInt(60 * 60 * 24 * 7))), oneTokenf),
  );

  const countUpAmountf = earnedf?.toFixed(6) ?? '0';
  const countUpAmountPreviousf = usePrevious(countUpAmountf) ?? '0';

  return (
    <PageWrapper gap="lg" justify="center">
      <RowBetween style={{ gap: '24px' }}>
        <TYPE.mediumHeader style={{ margin: 0 }}>Boogey Birds Staking</TYPE.mediumHeader>
      </RowBetween>
      <DataRow style={{ gap: '24px' }}>
        <PoolData>
          <AutoColumn gap="sm">
            <TYPE.body style={{ margin: 0 }}>Total Staked</TYPE.body>
            <TYPE.body fontSize={24} fontWeight={500}>
              {`${totalSupplyf?.toSignificant(4, { groupSeparator: ',' }) ?? '-'} BB`}
            </TYPE.body>
          </AutoColumn>
        </PoolData>
        <PoolData>
          <AutoColumn gap="sm">
            <TYPE.body style={{ margin: 0 }}>Pool Rate</TYPE.body>
            <TYPE.body fontSize={24} fontWeight={500}>
              {weeklyRewardAmnt.toSignificant(4, { groupSeparator: ',' }) ?? '-'}
              {' CNR / week'}
            </TYPE.body>
          </AutoColumn>
        </PoolData>
      </DataRow>

      {ttlSpply[0].result && (
        <>
          <ClaimRewardModalNFT isOpen={showClaimRewardModalNFT} onDismiss={() => setShowClaimRewardModalNFT(false)} />
        </>
      )}

      <PositionInfo gap="lg" justify="center" dim={false}>
        <BottomSection gap="lg" justify="center">
          <StyledDataCard disabled={disableTop} bgColor={backgroundColor} showBackground={true}>
            <CardSection>
              <CardNoise />
              <AutoColumn gap="md">
                <RowBetween>
                  <TYPE.white fontWeight={600}>Your BB deposits</TYPE.white>
                </RowBetween>
                <RowBetween style={{ alignItems: 'baseline' }}>
                  <TYPE.white fontSize={36} fontWeight={600}>
                    {balancesf?.toSignificant(6) ?? '-'}
                  </TYPE.white>
                  <TYPE.white>{currency?.symbol}</TYPE.white>
                </RowBetween>
              </AutoColumn>
            </CardSection>
          </StyledDataCard>
          <StyledBottomCard dim={stakingInfo?.stakedAmount?.equalTo(JSBI.BigInt(0))}>
            <CardBGImage desaturate />
            <CardNoise />
            <AutoColumn gap="sm">
              <RowBetween>
                <div>
                  <TYPE.black>Your unclaimed CNR</TYPE.black>
                </div>
                {JSBI.notEqual(BIG_INT_ZERO, earnedx) && (
                  <ButtonEmpty
                    padding="8px"
                    borderRadius="8px"
                    width="fit-content"
                    onClick={() => setShowClaimRewardModalNFT(true)}
                  >
                    Claim
                  </ButtonEmpty>
                )}
              </RowBetween>
              <RowBetween style={{ alignItems: 'baseline' }}>
                <TYPE.largeHeader fontSize={36} fontWeight={600}>
                  <CountUp
                    key={countUpAmountf}
                    isCounting
                    decimalPlaces={4}
                    start={parseFloat(countUpAmountPreviousf)}
                    end={parseFloat(countUpAmountf)}
                    thousandsSeparator={','}
                    duration={1}
                  />
                </TYPE.largeHeader>
                <TYPE.black fontSize={16} fontWeight={500}>
                  <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px ' }}>
                    ⚡
                  </span>
                  {isStakingIn ? rewardRatef.toSignificant(4, { groupSeparator: ',' }) : '0'}
                  {' CNR / week'}
                </TYPE.black>
              </RowBetween>
            </AutoColumn>
          </StyledBottomCard>
        </BottomSection>

        <p className="text-center">
          <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px' }}>
            ⭐️
          </span>
          When you withdraw, the contract will automagically claim CNR on your behalf!
        </p>
        <DataRow style={{ marginBottom: '1rem' }}>
          <ButtonPrimary
            padding="8px"
            borderRadius="8px"
            width="160px"
            onClick={e => {
              e.preventDefault();
              window.location.href = '/nftstake/deposit';
            }}
          >
            {'Stake NFTs'}
          </ButtonPrimary>
          <ButtonPrimary
            padding="8px"
            borderRadius="8px"
            width="160px"
            onClick={e => {
              e.preventDefault();
              window.location.href = '/nftstake/withdraw';
            }}
          >
            {'Withdraw'}
          </ButtonPrimary>
        </DataRow>
        {!userLiquidityUnstaked ? null : userLiquidityUnstaked.equalTo('0') ? null : (
          <p>
            {userLiquidityUnstaked.toSignificant(6)} {stakingToken.symbol} tokens available
          </p>
        )}
      </PositionInfo>
    </PageWrapper>
  );
}
