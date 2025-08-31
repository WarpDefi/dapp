import { TransactionResponse } from '@ethersproject/providers';
import { buttonUnstyledClasses } from '@mui/base/ButtonUnstyled';
import TabPanelUnstyled from '@mui/base/TabPanelUnstyled';
import TabUnstyled, { tabUnstyledClasses } from '@mui/base/TabUnstyled';
import TabsListUnstyled from '@mui/base/TabsListUnstyled';
import TabsUnstyled from '@mui/base/TabsUnstyled';
import { ChainId, Fraction, JSBI, Pair, TokenAmount, WAVAX } from '@pangolindex/sdk';
import { Fragment, useCallback, useState } from 'react';
import Expand from 'react-expand-animated';
import styled from 'styled-components';
import CoinIcon from '../../assets/images/harvestcoin.svg';
import { PNG, UNDEFINED } from '../../constants';
import { usePair } from '../../data/Reserves';
import { useActiveWeb3React } from '../../hooks';
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback';
import { useStakingContractOld } from '../../hooks/useContract';
import { Dots } from '../../pages/Pool/styleds';
import { SingleSideStakingInfo, useDerivedStakeInfo } from '../../state/stake/hooksSingle';
import { useTransactionAdder } from '../../state/transactions/hooks';
import { useTokenBalance } from '../../state/wallet/hooks';
import { calculateGasMargin } from '../../utils';
import { maxAmountSpend } from '../../utils/maxAmountSpend';
import useUSDCPrice from '../../utils/useUSDCPrice';
import { unwrappedToken } from '../../utils/wrappedCurrency';
import { ButtonConfirmed, ButtonError, ButtonGetLPV2, ButtonHarvestV2 } from '../Button';
import { AutoColumn } from '../Column';
import { CurrencyInputPanelV2 } from '../CurrencyInputPanel';
import CurrencyLogo from '../CurrencyLogo';
import { RowBetweenV2, RowBetweenV2M } from '../Row';

const Wrapper = styled(AutoColumn)<{ dvExpand: boolean; showBackground: boolean; bgColor: any; isDead: boolean }>`
  width: 100%;
  overflow: hidden;
  position: relative;
  opacity: ${({ showBackground }) => (showBackground ? '1' : '1')};
  background: ${({ bgColor }) => `${bgColor}`};
  ${({ isDead }) =>
    isDead &&
    `opacity: 0.75;
     background: radial-gradient(91.85% 100% at 1.84% 0%, #000000 0%, #000000 100%);
     `}
  box-shadow: ${({ dvExpand }) => (dvExpand ? '0 8px 24px -6px rgb(0 0 0 / 16%), 0 0 1px rgb(0 0 0 / 40%)' : '0')};
  &:hover {
    background-color: ${({ dvExpand }) => (dvExpand ? '#ffffff' : '#d3bb6a1f')};
  }
  cursor: pointer;
`;

const TopSection = styled.div`
  display: grid;
  grid-template-columns: 64px 1fr 1fr 1fr 1fr 1fr 0.3fr;
  grid-gap: 0px;
  align-items: center;
  padding: 2rem;
  z-index: 1;
`;

const ExpandBoxes = styled.div`
  padding: 16px;
`;

const Tab = styled(TabUnstyled)`
  color: #d3bb6a;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: bold;
  background-color: transparent;
  width: 100%;
  padding: 7px 0px;
  margin: 6px 6px;
  border: none;
  border-radius: 5px;
  display: flex;
  justify-content: center;

  &.${buttonUnstyledClasses.focusVisible} {
    color: #fff;
    outline: none;
    background-color: #d3bb6a;
  }

  &.${tabUnstyledClasses.selected} {
    background-color: #d3bb6a;
    color: white;
  }

  &.${buttonUnstyledClasses.disabled} {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TabPanel = styled(TabPanelUnstyled)`
  width: 100%;
  font-size: 0.875rem;
`;

const TabsList = styled(TabsListUnstyled)`
  min-width: 320px;
  background-color: white;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  align-content: space-between;
  width: fit-content;
`;

const WalletBalanceDiv = styled.div`
  display: flex;
  width: 100%;
  font-size: 0.875rem;
`;

const InputLpDiv = styled.div``;

const FarmButtonDiv = styled.div`
  display: flex;
  gap: 5px;
  width: 100%;
  margin-top: 16px;
  font-size: 0.875rem;
`;

const TabTopSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  z-index: 1;
`;

const RewardsDiv = styled.div`
  display: flex;
  gap: 12px;
  padding: 24px 24px 0;
`;

const RewardDetails = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 4px;
  margin-left: 4px;
  -webkit-box-align: center;
  align-items: center;
`;

const RewardsCardDiv = styled.div`
  display: flex;
  border-radius: 8px;
  padding: 4px;
`;

const StyledExternalLink = styled(ExternalLink)`
  :hover,
  :focus {
    text-decoration: none;
  }
`;
const RewardsStyled = styled.img`
  width: 24px;
  heigth: 24px;
  border-radius: 24px;
`;

const StyledTab = styled(Tab)`
  &.Mui-selected {
    color: #ffb456 !important;
  }
`;

const StyledTabs = styled(Tab)`
  .MuiTabs-indicator {
    background-color: #ffb456;
  }
`;

let cnrprice = 0;

export default function PoolCardStakeV2({ stakingInfo }: { stakingInfo: SingleSideStakingInfo }) {
  const { account, chainId } = useActiveWeb3React();

  const [typedValue, setTypedValue] = useState('');
  const [typedValueW, setTypedValueW] = useState('');
  const [signatureData, setSignatureData] = useState<{ v: number; r: string; s: string; deadline: number } | null>(
    null,
  );
  const userLiquidityUnstaked = useTokenBalance(account ?? undefined, stakingInfo?.stakedAmount?.token);
  const { parsedAmount, error } = useDerivedStakeInfo(
    typedValue,
    stakingInfo.stakedAmount.token,
    userLiquidityUnstaked,
  );
  const derivedW = useDerivedStakeInfo(typedValueW, stakingInfo.stakedAmount.token, stakingInfo.stakedAmount);
  //userLiquidityUnstaked ? userLiquidityUnstaked.raw.toString() : '115792089237316195423570985008687907853269984665640564039457584007913129639935'
  const [approval, approveCallback] = useApproveCallback(
    new TokenAmount(
      stakingInfo.stakedAmount.token,
      parsedAmount?.raw.toString() ?? '115792089237316195423570985008687907853269984665640564039457584007913129639935',
    ),
    stakingInfo.stakingRewardAddress,
  );

  const dummyPair = new Pair(
    new TokenAmount(stakingInfo.rewardToken, '0'),
    new TokenAmount(UNDEFINED[stakingInfo.rewardToken.chainId], '0'),
    chainId ? chainId : ChainId.AVALANCHE,
  );

  const token0 = stakingInfo.rewardToken;
  const token1 = stakingInfo.rewardToken;
  const isPair = token1 !== UNDEFINED[token1.chainId];

  const [divExpand, setDivExpand] = useState(false);

  function toggleExpand() {
    setDivExpand(prevState => !prevState);
  }

  const onUserInput = useCallback((typedValue: string) => {
    setSignatureData(null);
    setTypedValue(typedValue);
  }, []);

  const onUserInputW = useCallback((typedValue: string) => {
    setSignatureData(null);
    setTypedValueW(typedValue);
  }, []);

  const addTransaction = useTransactionAdder();
  const stakingContract = useStakingContractOld(stakingInfo.stakingRewardAddress);
  async function onStake() {
    if (stakingContract && parsedAmount) {
      if (approval === ApprovalState.APPROVED) {
        await stakingContract.estimateGas['stake'](`0x${parsedAmount.raw.toString(16)}`).then(estimatedGasLimit => {
          stakingContract
            .stake(`0x${parsedAmount.raw.toString(16)}`, { gasLimit: calculateGasMargin(estimatedGasLimit) })
            .then((response: TransactionResponse) => {
              //console.log(response)
              addTransaction(response, {
                summary: `Deposit LP`,
              });
              //setHash(response.hash)
            })
            .catch((error: any) => {
              //setAttempting(false)
              console.log(error);
            });
        });
      } else {
        //setAttempting(false)
        throw new Error('Attempting to stake without approval or a signature. Please contact support.');
      }
    }
  }

  async function onWithdraw() {
    if (stakingContract && derivedW.parsedAmount) {
      //if (approval === ApprovalState.APPROVED) {
      await stakingContract.estimateGas['withdraw'](`0x${derivedW.parsedAmount.raw.toString(16)}`).then(
        estimatedGasLimit => {
          stakingContract
            .withdraw(`0x${derivedW?.parsedAmount?.raw.toString(16)}`, {
              gasLimit: calculateGasMargin(estimatedGasLimit),
            })
            .then((response: TransactionResponse) => {
              //console.log(response)
              addTransaction(response, {
                summary: `Withdraw LP`,
              });
              //setHash(response.hash)
            })
            .catch((error: any) => {
              //setAttempting(false)
              console.log(error);
            });
        },
      );
      /*} else {
        //setAttempting(false)
        throw new Error('Attempting to stake without approval or a signature. Please contact support.')
      }*/
    }
  }

  async function onHarvest() {
    if (stakingContract) {
      await stakingContract.estimateGas['getReward']().then(estimatedGasLimit => {
        stakingContract
          .getReward({ gasLimit: calculateGasMargin(estimatedGasLimit) })
          .then((response: TransactionResponse) => {
            //console.log(response)
            addTransaction(response, {
              summary: `Harvest Rewards`,
            });
            //setHash(response.hash)
          })
          .catch((error: any) => {
            //setAttempting(false)
            console.log(error);
          });
      });
    }
  }

  const maxAmountInput = maxAmountSpend(userLiquidityUnstaked);
  const atMaxAmount = Boolean(maxAmountInput && parsedAmount?.equalTo(maxAmountInput));
  const handleMax = useCallback(() => {
    maxAmountInput && onUserInput(maxAmountInput.toExact());
  }, [maxAmountInput, onUserInput]);

  const maxAmountInputW = maxAmountSpend(stakingInfo.stakedAmount);
  const atMaxAmountW = Boolean(maxAmountInputW && parsedAmount?.equalTo(maxAmountInputW));
  const handleMaxW = useCallback(() => {
    maxAmountInputW && onUserInputW(maxAmountInputW.toExact());
  }, [maxAmountInputW, onUserInputW]);

  const styles = {
    open: { background: 'rgb(253 250 243)' },
  };

  const avaxPriceUSD = useUSDCPrice(WAVAX[chainId ? chainId : ChainId.AVALANCHE]);
  const avaxprice = Number(avaxPriceUSD?.toFixed(2));
  const deadFound = false;
  const rewardsBaseUrl = 'https://raw.githubusercontent.com/pangolindex/tokens/main/assets/43114/';

  let currency0 = unwrappedToken(token0);

  if (isPair === false) {
    currency0 = token0;
  }

  //const wavax = WAVAX[chainId ? chainId : 43114]

  const isStaking = Boolean(stakingInfo.stakedAmount.greaterThan('0'));
  const backgroundColor = '#FFFFFF';

  let weeklyRewardAmount: Fraction;
  //let weeklyRewardPerAvax: Fraction
  if (stakingInfo.totalStakedInWavax.equalTo(JSBI.BigInt(0))) {
    weeklyRewardAmount = new Fraction(JSBI.BigInt(0));
    //weeklyRewardPerAvax = new Fraction(JSBI.BigInt(0))
  } else {
    weeklyRewardAmount = stakingInfo.totalRewardRate.multiply(JSBI.BigInt(60 * 60 * 24 * 7));
    //weeklyRewardPerAvax = weeklyRewardAmount.divide(stakingInfo.totalStakedInWavax)
  }

  const bag = chainId ? PNG[chainId] : undefined;
  const wavax = WAVAX[chainId ? chainId : 43114];
  const [, avaxBagTokenPair] = usePair(wavax, bag);
  const oneToken = JSBI.BigInt(1000000000000000000);

  let pngPrice: number | undefined;
  if (cnrprice == 0) {
    if (avaxBagTokenPair && bag) {
      const avaxPngRatio = JSBI.divide(
        JSBI.multiply(oneToken, avaxBagTokenPair.reserveOfToken(wavax).raw),
        avaxBagTokenPair.reserveOfToken(bag).raw,
      );
      pngPrice = JSBI.toNumber(avaxPngRatio) / 1000000000000000000;
      cnrprice = Number(pngPrice);
    }
  }

  const avaxdollar = Number(stakingInfo.totalStakedInWavax.toSignificant(4)) * Number(avaxprice);
  const cnrdollar = Number(cnrprice) * Number(avaxprice) * Number(weeklyRewardAmount.toFixed(0));
  const apy = (((cnrdollar / 7) * 365) / avaxdollar) * 100;
  console.log(apy);

  return (
    <Fragment>
      <Wrapper
        onClick={toggleExpand}
        dvExpand={divExpand}
        showBackground={isStaking}
        bgColor={
          stakingInfo.stakingRewardAddress == '0xA1fB7219f2De81da27183D82587873A5b1be5979' ? '#ef8110' : backgroundColor
        }
        isDead={deadFound}
      >
        <TopSection>
          <>
            <CurrencyLogo currency={currency0} size={'32px'} />
            <span style={{ marginLeft: '8px' }}>
              {currency0?.symbol}{' '}
              {stakingInfo.stakingRewardAddress == '0xA1fB7219f2De81da27183D82587873A5b1be5979' && '(Pangolin LP)'}
            </span>

            <RowBetweenV2>
              <span>Your Stake</span>
              {isStaking ? (
                <span>
                  {`${stakingInfo.stakedAmount.toSignificant(4, { groupSeparator: ',' })}`}{' '}
                  {stakingInfo.stakingRewardAddress === '0x967fEA7074BA54E8DaD60A9512b1ECDc89D98453' ? 'WAVAX' : 'PNG'}
                </span>
              ) : (
                <span>
                  0.00{' '}
                  {stakingInfo.stakingRewardAddress === '0x967fEA7074BA54E8DaD60A9512b1ECDc89D98453' ? 'WAVAX' : 'PNG'}
                </span>
              )}
            </RowBetweenV2>

            <RowBetweenV2>
              <span>APR</span>
              <span>{`${stakingInfo.apr ?? '-'}%`}</span>
            </RowBetweenV2>

            <RowBetweenV2M>
              <span>Total Staked</span>
              <span>{`${stakingInfo.totalStakedInPng.toSignificant(4, { groupSeparator: ',' }) ?? '0'} PNG`}</span>
            </RowBetweenV2M>

            <RowBetweenV2>
              <span>Rewards</span>
              <span>
                {stakingInfo.rewardTokensArray.map((token: string) => (
                  <RewardsStyled key={token} src={`${rewardsBaseUrl}${token}/logo_48.png`} />
                ))}
              </span>
            </RowBetweenV2>

            <RowBetweenV2M>
              {!divExpand ? (
                <svg
                  viewBox="0 0 24 24"
                  color="primary"
                  width="20px"
                  style={{ transition: 'all .7s' }}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M8.11997 9.29006L12 13.1701L15.88 9.29006C16.27 8.90006 16.9 8.90006 17.29 9.29006C17.68 9.68006 17.68 10.3101 17.29 10.7001L12.7 15.2901C12.31 15.6801 11.68 15.6801 11.29 15.2901L6.69997 10.7001C6.30997 10.3101 6.30997 9.68006 6.69997 9.29006C7.08997 8.91006 7.72997 8.90006 8.11997 9.29006Z"></path>
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  color="primary"
                  style={{ transform: 'rotate(-180deg)', transition: 'all .7s' }}
                  width="20px"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M8.11997 9.29006L12 13.1701L15.88 9.29006C16.27 8.90006 16.9 8.90006 17.29 9.29006C17.68 9.68006 17.68 10.3101 17.29 10.7001L12.7 15.2901C12.31 15.6801 11.68 15.6801 11.29 15.2901L6.69997 10.7001C6.30997 10.3101 6.30997 9.68006 6.69997 9.29006C7.08997 8.91006 7.72997 8.90006 8.11997 9.29006Z"></path>
                </svg>
              )}
            </RowBetweenV2M>
          </>
        </TopSection>
      </Wrapper>
      <Expand open={divExpand} duration={300} styles={styles} transitions={['height', /* "opacity", */ 'background']}>
        <ExpandBoxes>
          <TabsUnstyled defaultValue={0}>
            <TabTopSection>
              <StyledTabs>
                <StyledTab>Deposit</StyledTab>
                <StyledTab>Withdraw</StyledTab>
              </StyledTabs>
              <RewardsDiv>
                <RewardsCardDiv>
                  {stakingInfo.rewardTokensArray.map((token: string) => (
                    <RewardDetails key={token}>
                      <img
                        src={`${rewardsBaseUrl}${token}/logo_48.png`}
                        style={{ height: '30px', width: '30px', borderRadius: '50%' }}
                      ></img>
                      <div style={{ fontSize: '11px' }}>{stakingInfo.earnedAmount.toSignificant(2)}</div>
                    </RewardDetails>
                  ))}
                </RewardsCardDiv>
                <RewardsCardDiv>
                  <RewardDetails style={{ marginTop: '2px' }}>
                    <ButtonHarvestV2 onClick={onHarvest}>
                      Harvest <img src={CoinIcon} style={{ width: '16px' }}></img>
                    </ButtonHarvestV2>
                  </RewardDetails>
                </RewardsCardDiv>
                <RewardsCardDiv>
                  <RewardDetails style={{ marginTop: '2px' }}>
                    <StyledExternalLink
                      id={`buy-nav-link`}
                      href={
                        stakingInfo.stakedAmount.token.symbol === 'PNG'
                          ? '/swap?outputCurrency=0x60781C2586D68229fde47564546784ab3fACA982'
                          : '/swap?outputCurrency=0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7'
                      }
                    >
                      <ButtonGetLPV2>Buy ${currency0?.symbol}</ButtonGetLPV2>
                    </StyledExternalLink>
                  </RewardDetails>
                </RewardsCardDiv>
              </RewardsDiv>
            </TabTopSection>
            <TabPanel value={0}>
              <div style={{ marginBottom: '15px', paddingLeft: '10px' }}>
                <WalletBalanceDiv>
                  Wallet Balance: 
                  {!userLiquidityUnstaked ? (
                    0
                  ) : userLiquidityUnstaked.equalTo('0') ? (
                    0
                  ) : (
                    <p>{userLiquidityUnstaked.toSignificant(6)}</p>
                  )}
                  <span style={{ color: '#b3983c', marginLeft: '5px' }}> {currency0?.symbol}</span>
                </WalletBalanceDiv>
                <WalletBalanceDiv>
                  Your Stake: <p>{stakingInfo?.stakedAmount?.toSignificant(6) ?? '-'}</p>
                  <span style={{ color: '#b3983c', marginLeft: '5px' }}> {currency0?.symbol}</span>
                </WalletBalanceDiv>
                <WalletBalanceDiv>
                  Your Rate: 
                  {isStaking ? (
                    <p>
                      {`${stakingInfo.rewardRate
                        ?.multiply(`${60 * 60 * 24 * 7}`)
                        ?.toSignificant(4, { groupSeparator: ',' })} PNG / week`}
                    </p>
                  ) : (
                    <p>0</p>
                  )}
                </WalletBalanceDiv>
              </div>
              <InputLpDiv>
                <CurrencyInputPanelV2
                  value={typedValue}
                  onUserInput={onUserInput}
                  onMax={handleMax}
                  showMaxButton={!atMaxAmount}
                  currency={stakingInfo.stakedAmount.token}
                  pair={dummyPair}
                  label={''}
                  disableCurrencySelect={true}
                  id="FarmV2-liquidity-token"
                />
              </InputLpDiv>
              <FarmButtonDiv>
                <ButtonConfirmed
                  mr="0.5rem"
                  onClick={approveCallback}
                  confirmed={approval === ApprovalState.APPROVED || signatureData !== null}
                  disabled={approval !== ApprovalState.NOT_APPROVED || !parsedAmount || signatureData !== null}
                >
                  {approval === ApprovalState.PENDING ? (
                    <Dots>Approving</Dots>
                  ) : approval === ApprovalState.APPROVED ? (
                    'Approved'
                  ) : (
                    'Approve'
                  )}
                </ButtonConfirmed>
                <ButtonError
                  disabled={!!error || (signatureData === null && approval !== ApprovalState.APPROVED)}
                  error={!!error && !!parsedAmount}
                  onClick={onStake}
                >
                  {error ?? 'Deposit'}
                </ButtonError>
              </FarmButtonDiv>
            </TabPanel>
            <TabPanel value={1}>
              <div style={{ marginBottom: '15px', paddingLeft: '10px' }}>
                <WalletBalanceDiv>
                  Wallet Balance: 
                  {!userLiquidityUnstaked ? (
                    0
                  ) : userLiquidityUnstaked.equalTo('0') ? (
                    0
                  ) : (
                    <p>{userLiquidityUnstaked.toSignificant(6)}</p>
                  )}
                  <span style={{ color: '#b3983c', marginLeft: '5px' }}> {currency0?.symbol}</span>
                </WalletBalanceDiv>
                <WalletBalanceDiv>
                  Your Stake: <p>{stakingInfo?.stakedAmount?.toSignificant(6) ?? '-'}</p>
                  <span style={{ color: '#b3983c', marginLeft: '5px' }}> {currency0?.symbol}</span>
                </WalletBalanceDiv>
                <WalletBalanceDiv>
                  Your Rate: 
                  {isStaking ? (
                    <p>
                      {`${stakingInfo.rewardRate
                        ?.multiply(`${60 * 60 * 24 * 7}`)
                        ?.toSignificant(4, { groupSeparator: ',' })} PNG / week`}
                    </p>
                  ) : (
                    <p>0</p>
                  )}
                </WalletBalanceDiv>
              </div>
              <InputLpDiv>
                <CurrencyInputPanelV2
                  value={typedValueW}
                  onUserInput={onUserInputW}
                  onMax={handleMaxW}
                  showMaxButton={!atMaxAmountW}
                  currency={stakingInfo.stakedAmount.token}
                  pair={dummyPair}
                  label={''}
                  disableCurrencySelect={true}
                  id="FarmV2W-liquidity-token"
                />
              </InputLpDiv>
              <FarmButtonDiv>
                <ButtonError
                  disabled={!!derivedW.error}
                  error={!!derivedW.error && !!derivedW.parsedAmount}
                  onClick={onWithdraw}
                >
                  {derivedW.error ?? 'Withdraw PNG'}
                </ButtonError>
              </FarmButtonDiv>
            </TabPanel>
          </TabsUnstyled>
        </ExpandBoxes>
      </Expand>
    </Fragment>
  );
}
