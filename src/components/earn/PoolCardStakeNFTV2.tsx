import React, { Fragment, useMemo } from 'react';
import { AutoColumn } from '../Column';
import { RowBetweenV2, RowBetweenV2M } from '../Row';
import styled from 'styled-components';
import { TYPE } from '../../theme';
/*import DoubleCurrencyLogo from '../DoubleLogoNew'
import CurrencyLogo from '../CurrencyLogo'*/
import { JSBI } from '@pangolindex/sdk';
import { useActiveWeb3React } from '../../hooks';
//import { useCurrency } from '../../hooks/Tokens'
import { Fraction } from '@pangolindex/sdk';
import { useMultipleContractSingleData } from '../../state/multicall/hooks';
/*import { CAVAX } from '@pangolindex/sdk'
import { Token } from '@pangolindex/sdk'*/

import { abi as IStakingRewardsNFT } from '../../../src/constants/abis/IStakingRewardsNFT.json';
import { Interface } from '@ethersproject/abi';

import nftstakeicon from '../../assets/images/nftstakeicon.png';
import { NFTSTAKE_ADDRESS } from '../../constants';

const Wrapper = styled(AutoColumn)<{ dvExpand: boolean; showBackground: boolean; bgColor: any; isDead: boolean }>`
  width: 100%;
  overflow: hidden;
  position: relative;
  opacity: ${({ showBackground }) => (showBackground ? '1' : '1')};
  background: ${({ theme, bgColor, showBackground }) => `${bgColor}`};
  ${({ isDead }) =>
    isDead &&
    `opacity: 0.75;
  background: radial-gradient(91.85% 100% at 1.84% 0%, #000000 0%, #000000 100%);
  `}
  box-shadow: ${({ dvExpand }) => (dvExpand ? '0 8px 24px -6px rgb(0 0 0 / 16%), 0 0 1px rgb(0 0 0 / 40%)' : '0')};
  &:hover {
    background-color: ${({ dvExpand }) => (dvExpand ? '#ffd02629' : '#a7881b29')};
  }
  cursor: pointer;
`;

const TopSection = styled.div`
  display: grid;
  grid-template-columns: 64px 1fr 1fr 1fr 1fr 1fr 1fr 0.3fr;
  grid-gap: 0px;
  align-items: center;
  padding: 2rem;
  z-index: 1;
`;

const RewardsStyled = styled.img`
  width: 24px;
  heigth: 24px;
  border-radius: 24px;
`;

export default function PoolCardStakeNFTV2() {
  const { chainId, account } = useActiveWeb3React();
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
  const balancesx = JSBI.BigInt(balances[0].result ?? 1);
  //const balancesx = JSBI.BigInt(1)
  const isStakingIn = Boolean(BigInt(balancesx.toString()) > 0 ?? false);

  //const rewardRate = JSBI.divide(JSBI.multiply(JSBI.divide(JSBI.multiply(totalRewardRatex, balancesx), ttlSpplyx), JSBI.BigInt(60 * 60 * 24 * 7)), oneTokenf)

  //let rewardRatef: Fraction
  let totalSupplyf: Fraction;
  //let weeklyRewardAmnt: Fraction
  let apy: Fraction;
  totalSupplyf = new Fraction(JSBI.BigInt(ttlSpplyx));
  //rewardRatef = new Fraction(JSBI.BigInt(rewardRate))
  //weeklyRewardAmnt = new Fraction(JSBI.divide(JSBI.BigInt(JSBI.multiply(totalRewardRatex, JSBI.BigInt(60 * 60 * 24 * 7))), oneTokenf))
  apy = new Fraction(
    JSBI.divide(
      JSBI.divide(JSBI.BigInt(JSBI.multiply(totalRewardRatex, JSBI.BigInt(60 * 60 * 24 * 7))), JSBI.BigInt(ttlSpplyx)),
      oneTokenf,
    ),
  );

  const deadFound = false;

  const rewardsBaseUrl = 'https://raw.githubusercontent.com/pangolindex/tokens/main/assets/43114/';

  /*console.log(totalSupplyf.toSignificant(4, { groupSeparator: ',' }))
        console.log(weeklyRewardAmnt.toSignificant(4, { groupSeparator: ',' }))
        console.log(balancesx.toString())
        console.log(isStakingIn)
        console.log(rewardRatef.toSignificant(4, { groupSeparator: ',' }))*/

  return (
    <Fragment>
      <Wrapper
        dvExpand={false}
        onClick={event => (window.location.href = '/nftstake/manage')}
        showBackground={isStakingIn}
        bgColor={'#ffffff'}
        isDead={deadFound}
      >
        <TopSection>
          <>
            <img src={nftstakeicon} alt="BBIcon" width="40px" />
            <TYPE.blackM style={{ marginLeft: '8px' }}>Boogey Birds</TYPE.blackM>

            <RowBetweenV2>
              <TYPE.darkGrayM>Your Stake</TYPE.darkGrayM>
              <TYPE.blackM>{isStakingIn ? balancesx : '0'}</TYPE.blackM>
            </RowBetweenV2>

            <RowBetweenV2>
              <TYPE.darkGrayM>Rate</TYPE.darkGrayM>
              <TYPE.blackM>
                {!deadFound ? `${apy.toSignificant(4, { groupSeparator: ',' }) ?? '-'} CNR / wk` : '0 CNR / wk'}
              </TYPE.blackM>
            </RowBetweenV2>

            <RowBetweenV2M>
              <TYPE.darkGrayM>Multiplier</TYPE.darkGrayM>
              <TYPE.blackM>8x</TYPE.blackM>
            </RowBetweenV2M>

            <RowBetweenV2M>
              <TYPE.darkGrayM>Total Staked</TYPE.darkGrayM>
              <TYPE.blackM>{`${totalSupplyf.toSignificant(4, { groupSeparator: ',' }) ?? '-'} BB`}</TYPE.blackM>
            </RowBetweenV2M>

            <RowBetweenV2>
              <TYPE.darkGrayM>Rewards</TYPE.darkGrayM>
              <TYPE.blackM>
                <RewardsStyled
                  key={'cnrRewardLogo0'}
                  src={`${rewardsBaseUrl}/0x8D88e48465F30Acfb8daC0b3E35c9D6D7d36abaf/logo_48.png`}
                />
              </TYPE.blackM>
            </RowBetweenV2>

            <RowBetweenV2M>
              <svg viewBox="0 0 24 24" color="primary" width="20px" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.11997 9.29006L12 13.1701L15.88 9.29006C16.27 8.90006 16.9 8.90006 17.29 9.29006C17.68 9.68006 17.68 10.3101 17.29 10.7001L12.7 15.2901C12.31 15.6801 11.68 15.6801 11.29 15.2901L6.69997 10.7001C6.30997 10.3101 6.30997 9.68006 6.69997 9.29006C7.08997 8.91006 7.72997 8.90006 8.11997 9.29006Z"></path>
              </svg>
            </RowBetweenV2M>
          </>
        </TopSection>
      </Wrapper>
    </Fragment>
  );
}
