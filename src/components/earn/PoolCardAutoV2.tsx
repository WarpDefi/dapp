import { Fragment, useCallback, useState } from 'react';
import styled from 'styled-components';
import {
  GetBalance,
  GetDepositTokensForShares,
  NextReinvestCalc /*, GetSharesForDepositTokens*/,
  useTotalDeposited,
} from '../../state/autocompound/hooks';
import { ButtonConfirmed, ButtonError, ButtonGetLPV2, ButtonHarvestV2 } from '../Button';
import { AutoColumn } from '../Column';
import CurrencyLogo from '../CurrencyLogo';
import { RowBetweenV2, RowBetweenV2M } from '../Row';
//import { useCurrency } from '../../hooks/Tokens'
import { ChainId, JSBI, Pair, TokenAmount } from '@pangolindex/sdk';
//import { Fraction } from '@pangolindex/sdk'
/*import { CAVAX } from '@pangolindex/sdk'
import { Token } from '@pangolindex/sdk'*/
//import Tooltip from '@material-ui/core/tooltip';
import { useAutocompoundContract, useStakingContract } from '../../hooks/useContract';
//import ReactTooltip from 'react-tooltip';
//import { AUTOCOMPOUND_ADDRESS } from '../../constants'
import { AUTOCOMPOUND_ADDRESS, CNR, CNR_STAKE_ADDRESS, UNDEFINED } from '../../constants';
import { useActiveWeb3React } from '../../hooks';
import { useSingleCallResult } from '../../state/multicall/hooks';
//import { useWalletModalToggle } from '../../state/application/hooks'
import { TransactionResponse } from '@ethersproject/providers';
import { buttonUnstyledClasses } from '@mui/base/ButtonUnstyled';
import TabPanelUnstyled from '@mui/base/TabPanelUnstyled';
import TabsListUnstyled from '@mui/base/TabsListUnstyled';
import TabsUnstyled from '@mui/base/TabsUnstyled';
import TabUnstyled, { tabUnstyledClasses } from '@mui/base/TabUnstyled';
import { Tabs } from '@mui/material';
import Expand from 'react-expand-animated';
import ReactTooltip from 'react-tooltip';
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback';
import { Dots } from '../../pages/Pool/styleds';
import { useDerivedStakeInfo } from '../../state/stake/hooks';
import { useTransactionAdder } from '../../state/transactions/hooks';
import { useTokenBalance } from '../../state/wallet/hooks';
import { calculateGasMargin } from '../../utils';
import { maxAmountSpend } from '../../utils/maxAmountSpend';
import { CurrencyInputPanelV2 } from '../CurrencyInputPanel';

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
    background-color: ${({ dvExpand }) => (dvExpand ? '#ffffff' : '#ebebeb')};
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

const ExpandBoxes = styled.div`
  padding: 16px;
`;

const TabTopSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  z-index: 1;
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

const Tab = styled(TabUnstyled)`
  color: #34b3c3;
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
    background-color: #34b3c3;
  }

  &.${tabUnstyledClasses.selected} {
    background-color: #34b3c3;
    color: white;
  }

  &.${buttonUnstyledClasses.disabled} {
    opacity: 0.5;
    cursor: not-allowed;
  }
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

const StyledExternalLink = styled.a`
  :hover,
  :focus {
    text-decoration: none;
  }
`;

const TabPanel = styled(TabPanelUnstyled)`
  width: 100%;
  font-size: 0.875rem;
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

const StyledTab = styled(Tab)`
  &.Mui-selected {
    color: #ffb456 !important;
  }
`;

const StyledTabs = styled(Tabs)`
  .MuiTabs-indicator {
    background-color: #ffb456;
  }
`;

function separator(numb: number) {
  const str = numb.toString().split('.');
  str[0] = str[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return str.join('.');
}
export default function PoolCardAutoV2() {
  const { account, chainId } = useActiveWeb3React();

  const bigo = JSBI.BigInt(1000000000000000000);

  const addTransaction = useTransactionAdder();
  const totalDeposits = (Number(useTotalDeposited()) / JSBI.toNumber(bigo)).toFixed(0);
  const getBalance = GetBalance() ?? 0;
  const ShareBal = (Number(GetDepositTokensForShares() ?? 0) / JSBI.toNumber(bigo)).toFixed(0).toLocaleString();
  const ShareBalo = Number(GetDepositTokensForShares() ?? 0);
  const NextReinvest = (Number(NextReinvestCalc()) / JSBI.toNumber(bigo)).toFixed(4);
  const NextReinvestZ = (Number(NextReinvest) * 0.05).toFixed(2);
  //const NextReinvestZ = (Number(NextReinvest)*0.05).toFixed(2)

  const [typedValue, setTypedValue] = useState('');
  const [typedValueW, setTypedValueW] = useState('');
  const userLiquidityUnstaked = useTokenBalance(account ?? undefined, CNR[chainId ? chainId : '43114']);
  const { parsedAmount, error } = useDerivedStakeInfo(
    typedValue,
    CNR[chainId ? chainId : '43114'],
    userLiquidityUnstaked,
  );
  const [approval, approveCallback] = useApproveCallback(
    new TokenAmount(CNR[chainId ? chainId : '43114'], parsedAmount?.raw.toString() ?? '79228162514264337593543950335'),
    chainId ? AUTOCOMPOUND_ADDRESS[chainId] : undefined,
  );
  const [signatureData, setSignatureData] = useState<{ v: number; r: string; s: string; deadline: number } | null>(
    null,
  );

  const AutocompoundContract = useAutocompoundContract();
  const AutoStakingRewards = useStakingContract(chainId ? CNR_STAKE_ADDRESS[chainId] : undefined);
  const AutoTotalStake = useSingleCallResult(AutoStakingRewards, 'totalSupply', []).result;
  const AutoTotalRewards = useSingleCallResult(AutoStakingRewards, 'getRewardForDuration', []).result;
  const apr = (Number(AutoTotalRewards) / Number(AutoTotalStake) / 5) * 365;
  //const autoapy = (((((apy / 365) / 100) + 1) ** 365) * 100).toFixed(0)
  const autoapy = (((1 + apr / 365) ** 365 - 1) * 100).toFixed(0);
  const fixapy = Number(autoapy) > 10000 ? separator(10000) : separator(Number(autoapy));

  const tds = separator(Number(totalDeposits));
  const sbl = separator(Number(ShareBal));

  const currency0 = chainId ? CNR[chainId] : undefined;

  async function onReinvest() {
    if (AutocompoundContract) {
      AutocompoundContract.reinvest()
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Reinvest completed`,
          });
          //setHash(response.hash)
        })
        .catch((error: any) => {
          //setAttempting(false)
          console.log(error);
        });
    }
  }

  async function onStake() {
    if (AutocompoundContract && parsedAmount) {
      if (approval === ApprovalState.APPROVED) {
        await AutocompoundContract.estimateGas['deposit'](`0x${parsedAmount.raw.toString(16)}`).then(
          estimatedGasLimit => {
            AutocompoundContract.deposit(`0x${parsedAmount.raw.toString(16)}`, {
              gasLimit: calculateGasMargin(estimatedGasLimit),
            })
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
          },
        );
      } else {
        //setAttempting(false)
        throw new Error('Attempting to stake without approval or a signature. Please contact support.');
      }
    }
  }

  async function onWithdraw() {
    if (AutocompoundContract && derivedW.parsedAmount) {
      //if (approval === ApprovalState.APPROVED) {
      await AutocompoundContract.getSharesForDepositTokens(`0x${derivedW?.parsedAmount?.raw?.toString(16)}`).then(
        async (fBalance: any) => {
          await AutocompoundContract.estimateGas['withdraw'](fBalance.toHexString()).then(estimatedGasLimit => {
            AutocompoundContract.withdraw(fBalance.toHexString(), { gasLimit: calculateGasMargin(estimatedGasLimit) })
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
          });
        },
      );
      /*} else {
          //setAttempting(false)
          throw new Error('Attempting to stake without approval or a signature. Please contact support.')
        }*/
    }
  }

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

  //console.log(ShareBal)
  const dummyPair = new Pair(
    new TokenAmount(CNR[chainId ? chainId : '43114'], '0'),
    new TokenAmount(UNDEFINED[chainId ? chainId : '43114'], '0'),
    chainId ? chainId : ChainId.AVALANCHE,
  );
  const derivedW = useDerivedStakeInfo(
    typedValueW,
    CNR[chainId ? chainId : '43114'],
    new TokenAmount(CNR[chainId ? chainId : '43114'], JSBI.BigInt(ShareBalo)),
  );
  const backgroundColor = 'white';

  const rewardsBaseUrl = 'https://raw.githubusercontent.com/pangolindex/tokens/main/assets/43114/';

  const maxAmountInput = maxAmountSpend(userLiquidityUnstaked);
  const atMaxAmount = Boolean(maxAmountInput && parsedAmount?.equalTo(maxAmountInput));
  const handleMax = useCallback(() => {
    maxAmountInput && onUserInput(maxAmountInput.toExact());
  }, [maxAmountInput, onUserInput]);

  const maxAmountInputW = maxAmountSpend(new TokenAmount(CNR[chainId ? chainId : '43114'], JSBI.BigInt(ShareBalo)));
  const atMaxAmountW = Boolean(maxAmountInputW && parsedAmount?.equalTo(maxAmountInputW));
  const handleMaxW = useCallback(() => {
    maxAmountInputW && onUserInputW(maxAmountInputW.toExact());
  }, [maxAmountInputW, onUserInputW]);

  const styles = {
    open: { background: 'rgb(228 250 255)' },
  };

  return (
    <Fragment>
      <Wrapper
        onClick={toggleExpand}
        dvExpand={divExpand}
        showBackground={true}
        bgColor={backgroundColor}
        isDead={false}
      >
        <TopSection>
          <>
            <CurrencyLogo currency={currency0} size={'32px'} />
            <span style={{ marginLeft: '8px' }}>{currency0?.symbol} Auto</span>

            <RowBetweenV2>
              <span>Your Stake</span>
              {getBalance ? <span>{`${sbl}`} CNR</span> : <span>0.00 CNR</span>}
            </RowBetweenV2>

            <RowBetweenV2>
              <span>APY</span>
              <span>{`${fixapy ?? '-'}%`}</span>
            </RowBetweenV2>

            <RowBetweenV2M>
              <span>Reinvest</span>
              <span>{Number(NextReinvest).toFixed(0)} CNR</span>
            </RowBetweenV2M>

            <RowBetweenV2M>
              <span>Total Staked</span>
              <span>{`${tds} CNR`}</span>
            </RowBetweenV2M>

            <RowBetweenV2>
              <span>Rewards</span>
              <span>
                <RewardsStyled
                  key={'cnrRewardLogo0'}
                  src={`${rewardsBaseUrl}/0x8D88e48465F30Acfb8daC0b3E35c9D6D7d36abaf/logo_48.png`}
                />
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
                  <RewardDetails>
                    <img
                      key={'cnrtokenlogo0'}
                      src={`${rewardsBaseUrl}0x8D88e48465F30Acfb8daC0b3E35c9D6D7d36abaf/logo_48.png`}
                      style={{ height: '30px', width: '30px', borderRadius: '50%' }}
                    ></img>
                    <div style={{ fontSize: '11px' }}>{`${sbl}`}</div>
                  </RewardDetails>
                </RewardsCardDiv>
                <RewardsCardDiv>
                  <RewardDetails style={{ marginTop: '2px' }}>
                    <ButtonHarvestV2 data-tip data-for="happyFace" onClick={onReinvest}>
                      Reinvest
                    </ButtonHarvestV2>
                    <ReactTooltip id="happyFace" type="light" effect="solid">
                      <span>
                        <strong>Click to Earn {`${NextReinvestZ} CNR (%5 Reinvest Reward)`}</strong>
                      </span>
                    </ReactTooltip>
                  </RewardDetails>
                </RewardsCardDiv>
                <RewardsCardDiv>
                  <RewardDetails style={{ marginTop: '2px' }}>
                    <StyledExternalLink
                      id={`buy-nav-link`}
                      href={'/swap?outputCurrency=0x8D88e48465F30Acfb8daC0b3E35c9D6D7d36abaf'}
                    >
                      <ButtonGetLPV2>Buy ${currency0?.symbol}</ButtonGetLPV2>
                    </StyledExternalLink>
                  </RewardDetails>
                </RewardsCardDiv>
              </RewardsDiv>
            </TabTopSection>
            <TabPanel value={0}>
              <div style={{ marginBottom: '15px' }}>
                <WalletBalanceDiv>
                  Wallet Balance: 
                  {!userLiquidityUnstaked ? (
                    0
                  ) : userLiquidityUnstaked.equalTo('0') ? (
                    0
                  ) : (
                    <p>{userLiquidityUnstaked.toSignificant(6)}</p>
                  )}
                  <span style={{ color: '#34b3c3', marginLeft: '5px' }}> {currency0?.symbol}</span>
                </WalletBalanceDiv>
                <WalletBalanceDiv>
                  Your Stake: <p>{sbl ?? '-'}</p>
                  <span style={{ color: '#34b3c3', marginLeft: '5px' }}> {currency0?.symbol}</span>
                </WalletBalanceDiv>
              </div>
              <InputLpDiv>
                <CurrencyInputPanelV2
                  value={typedValue}
                  onUserInput={onUserInput}
                  onMax={handleMax}
                  showMaxButton={!atMaxAmount}
                  currency={CNR[chainId ? chainId : '43114']}
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
              <div style={{ marginBottom: '15px' }}>
                <WalletBalanceDiv>
                  Wallet Balance: 
                  {!userLiquidityUnstaked ? (
                    0
                  ) : userLiquidityUnstaked.equalTo('0') ? (
                    0
                  ) : (
                    <p>{userLiquidityUnstaked.toSignificant(6)}</p>
                  )}
                  <span style={{ color: '#34b3c3', marginLeft: '5px' }}> {currency0?.symbol}</span>
                </WalletBalanceDiv>
                <WalletBalanceDiv>
                  Your Stake: <p>{sbl ?? '-'}</p>
                  <span style={{ color: '#34b3c3', marginLeft: '5px' }}> {currency0?.symbol}</span>
                </WalletBalanceDiv>
              </div>
              <InputLpDiv>
                <CurrencyInputPanelV2
                  value={typedValueW}
                  onUserInput={onUserInputW}
                  onMax={handleMaxW}
                  showMaxButton={!atMaxAmountW}
                  currency={CNR[chainId ? chainId : '43114']}
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
                  {derivedW.error ?? 'Withdraw'}
                </ButtonError>
              </FarmButtonDiv>
            </TabPanel>
          </TabsUnstyled>
        </ExpandBoxes>
      </Expand>
    </Fragment>
  );
}
