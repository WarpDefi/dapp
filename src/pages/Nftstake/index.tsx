import { useMemo } from 'react';
import styled from 'styled-components';
import { AutoColumn } from '../../components/Column';
//import { STAKING_REWARDS_INFO, useStakingInfo, StakingType } from '../../state/stake/hooks'
//import { useTotalDeposited} from '../../state/autocompound/hooks'
import PoolCardStakeNFTV2 from '../../components/earn/PoolCardStakeNFTV2';
//import PoolCardAuto from '../../components/earn/PoolCardAuto'
//import { RowBetween } from '../../components/Row'
import { Loader } from '@/components/ui/loader';
import { useMultipleContractSingleData } from '../../state/multicall/hooks';
/*import Loader from '../../components/Loader'
import { useActiveWeb3React } from '../../hooks'
import { JSBI } from '@pangolindex/sdk'*/
import { Interface } from '@ethersproject/abi';
import { abi as IStakingRewardsNFT } from '../../../src/constants/abis/IStakingRewardsNFT.json';
import { NFTSTAKE_ADDRESS } from '../../constants';
import { useActiveWeb3React } from '../../hooks';

//import farmBanner from '../../assets/images/nftstake.webm'

const PageWrapper = styled(AutoColumn)`
  max-width: 960px;
  width: 100%;
`;

const TopSection = styled(AutoColumn)`
  max-width: 960px;
  width: 100%;
`;

const PoolSection = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 10px;
  row-gap: 15px;
  width: 100%;
  justify-self: center;
`;
const ConnectWallet = styled.div`
  text-align: center;
`;

const RewardText = styled.div`
  display: flex;
  gap: 5px;
`;
const MainText = styled.div`
  font-size: 18px;
`;
const SubText = styled.div`
  font-size: 16px;
  color: grey;
`;

const PoolSectionDiv = styled.div`
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 24px;
  box-sizing: border-box;
  padding: 16px 0;
`;

const GetYoursNowDiv = styled.div`
  margin-top: 20px;
  text-align: center;
`;
const BoogeyBirdsLink = styled.a`
  text-decoration: underline;
  color: #ff8100;
`;

export default function Nftstake() {
  const { chainId, account } = useActiveWeb3React();
  //const stakingInfos = useStakingInfo(StakingType.SINGLE)

  const pools = { stakingRewardAddress: chainId ? NFTSTAKE_ADDRESS[chainId] : undefined };

  const NFTSTR_INTERFACE = new Interface(IStakingRewardsNFT);
  const NFTADDR = useMemo(
    () => [chainId ? NFTSTAKE_ADDRESS[chainId] : undefined],
    [chainId ? NFTSTAKE_ADDRESS[chainId] : undefined],
  );
  const totalRewardRate = useMultipleContractSingleData(NFTADDR, NFTSTR_INTERFACE, 'rewardRate');
  const totalRewardRatex = totalRewardRate[0].result;
  const isLos = Boolean(Number(totalRewardRatex) > 0 ?? false);
  console.log(isLos);

  //const stakingRewardsExist = Boolean(typeof chainId === 'number' && (STAKING_REWARDS_INFO[chainId]?.length ?? 0) > 0)
  return (
    <PageWrapper gap="lg" justify="center">
      <TopSection gap="md">
        <video
          src={'https://app.canary.exchange/nftstake2.webm'}
          style={{ height: 'auto', maxWidth: '100%', borderRadius: '12px' }}
          autoPlay
          loop
          muted
          playsInline
        />
      </TopSection>

      <AutoColumn gap="lg" style={{ width: '100%', maxWidth: '960px' }}>
        <RewardText style={{ alignItems: 'baseline' }}>
          <MainText>NFT Stake Farming</MainText>
          <SubText>Stake NFT tokens to earn CNR!</SubText>
        </RewardText>
        <PoolSection>
          <PoolSectionDiv>
            {account ? (
              isLos && <PoolCardStakeNFTV2 key={pools.stakingRewardAddress} />
            ) : (
              <ConnectWallet>Connect your wallet</ConnectWallet>
            )}

            {!isLos && (
              <>
                <AutoColumn gap="lg" style={{ width: '100%', maxWidth: '960px' }}>
                  <Loader style={{ margin: 'auto' }} />
                </AutoColumn>
              </>
            )}
          </PoolSectionDiv>
          {isLos && (
            <GetYoursNowDiv>
              Get yours from{' '}
              <BoogeyBirdsLink id={`info-nav-link`} href={'https://boogeybirds.com'} target={'_blank'}>
                Boogeybirds.com!
              </BoogeyBirdsLink>
            </GetYoursNowDiv>
          )}
        </PoolSection>
      </AutoColumn>
    </PageWrapper>
  );
}
