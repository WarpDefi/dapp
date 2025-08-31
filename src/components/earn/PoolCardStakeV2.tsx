import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TransactionResponse } from '@ethersproject/providers';
import { ChainId, Fraction, JSBI, Pair, TokenAmount, WAVAX } from '@pangolindex/sdk';
import { splitSignature } from 'ethers/lib/utils';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useTransactionDeadline from 'src/hooks/useTransactionDeadline';
import CoinIcon from '../../assets/images/harvestcoin.svg';
import { PNG, UNDEFINED } from '../../constants';
import { usePair } from '../../data/Reserves';
import { useActiveWeb3React } from '../../hooks';
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback';
import { usePngContract, useStakingContractOld } from '../../hooks/useContract';
import { Dots } from '../../pages/Pool/styleds';
import { StakingInfo, useDerivedStakeInfo } from '../../state/stake/hooks';
import { useTransactionAdder } from '../../state/transactions/hooks';
import { useTokenBalance } from '../../state/wallet/hooks';
import { calculateGasMargin } from '../../utils';
import { maxAmountSpend } from '../../utils/maxAmountSpend';
import useUSDCPrice from '../../utils/useUSDCPrice';
import { unwrappedToken } from '../../utils/wrappedCurrency';
import { CurrencyInputPanelV2 } from '../CurrencyInputPanel';
import CurrencyLogo from '../CurrencyLogo';

let cnrprice = 0;

export default function PoolCardStakeV2({ stakingInfo }: { stakingInfo: StakingInfo }) {
  const { account, chainId, library } = useActiveWeb3React();
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
  const [approval, approveCallback] = useApproveCallback(
    chainId ?? ChainId.AVALANCHE,
    new TokenAmount(
      stakingInfo.stakedAmount.token,
      parsedAmount?.raw.toString() ?? '115792089237316195423570985008687907853269984665640564039457584007913129639935',
    ),
    stakingInfo.stakingRewardAddress,
  );

  const dummyPair = new Pair(
    new TokenAmount(stakingInfo.tokens[0], '0'),
    new TokenAmount(stakingInfo.tokens[1], '0'),
    chainId ? chainId : ChainId.AVALANCHE,
  );

  const token0 = stakingInfo.tokens[0];
  const token1 = stakingInfo.tokens[1];
  const isPair = token1 !== UNDEFINED[token1.chainId];

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

  const stakingTokenContract = usePngContract();

  const deadline = useTransactionDeadline();

  const { t } = useTranslation();

  async function onStake() {
    //setAttempting(true)
    if (stakingContract && parsedAmount && deadline) {
      if (approval === ApprovalState.APPROVED) {
        stakingContract
          .stake(`0x${parsedAmount.raw.toString(16)}`)
          .then((response: TransactionResponse) => {
            addTransaction(response, {
              summary: t('earnPage.stakeStakingTokens', { symbol: 'PNG' }),
            });
            //setHash(response.hash)
          })
          .catch((error: any) => {
            //setAttempting(false)
            // we only care if the error is something _other_ than the user rejected the tx
            if (error?.code !== 4001) {
              console.error(error);
            }
          });
      } else if (signatureData) {
        stakingContract
          .stakeWithPermit(
            `0x${parsedAmount.raw.toString(16)}`,
            signatureData.deadline,
            signatureData.v,
            signatureData.r,
            signatureData.s,
          )
          .then((response: TransactionResponse) => {
            addTransaction(response, {
              summary: t('earnPage.stakeStakingTokens', { symbol: 'PNG' }),
            });
            //setHash(response.hash)
          })
          .catch((error: any) => {
            //setAttempting(false)
            // we only care if the error is something _other_ than the user rejected the tx
            if (error?.code !== 4001) {
              console.error(error);
            }
          });
      } else {
        //setAttempting(false)
        throw new Error(t('earn.attemptingToStakeError'));
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

  const avaxPriceUSD = useUSDCPrice(WAVAX[chainId ? chainId : ChainId.AVALANCHE]);
  const avaxprice = Number(avaxPriceUSD?.toFixed(2));
  const rewardsBaseUrl = 'https://raw.githubusercontent.com/pangolindex/tokens/main/assets/43114/';

  let currency0 = unwrappedToken(token0);

  if (isPair === false) {
    currency0 = token0;
  }

  const isStaking = Boolean(stakingInfo.stakedAmount.greaterThan('0'));

  let weeklyRewardAmount: Fraction;
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
  if (cnrprice === 0) {
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

  async function onAttemptToApprove() {
    if (!stakingTokenContract || !library || !deadline) throw new Error(t('earn.missingDependencies'));
    const liquidityAmount = parsedAmount;
    if (!liquidityAmount) throw new Error(t('earn.missingLiquidityAmount'));

    // try to gather a signature for permission
    const nonce = await stakingTokenContract.nonces(account);

    const EIP712Domain = [
      { name: 'name', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ];
    const domain = {
      name: 'Pangolin',
      chainId: chainId,
      verifyingContract: stakingTokenContract.address,
    };
    const Permit = [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ];
    const message = {
      owner: account,
      spender: stakingInfo.stakingRewardAddress,
      value: liquidityAmount.raw.toString(),
      nonce: nonce.toHexString(),
      deadline: deadline.toNumber(),
    };
    const data = JSON.stringify({
      types: {
        EIP712Domain,
        Permit,
      },
      domain,
      primaryType: 'Permit',
      message,
    });

    library
      .send('eth_signTypedData_v4', [account, data])
      .then(splitSignature)
      .then(signature => {
        setSignatureData({
          v: signature.v,
          r: signature.r,
          s: signature.s,
          deadline: deadline.toNumber(),
        });
      })
      .catch(_error => {
        // for all errors other than 4001 (EIP-1193 user rejected request), fall back to manual approve
        if (_error?.code !== 4001) {
          approveCallback();
        }
      });
  }

  return (
    <div>
      <div className="bg-background rounded-md p-6 space-x-4 flex flex-col md:flex-row gap-6">
        <div className="lg:min-w-60 flex gap-4 items-center">
          <CurrencyLogo currency={currency0} className="size-12" />
          <div className="shrink-0 md:px-6">
            {currency0?.symbol}{' '}
            {stakingInfo.stakingRewardAddress === '0xA1fB7219f2De81da27183D82587873A5b1be5979' && '(Pangolin LP)'}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 w-full">
          <div className="flex flex-col items-center">
            <span className="text-slate-400 text-sm lg:text-md">Your Stake</span>
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
          </div>
          <div className="flex flex-col items-center">
            <span className="text-slate-400 text-sm lg:text-md">APR</span>
            <span>{`${apy.toFixed(0) ?? '-'}%`}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-slate-400 text-sm lg:text-md">Total Staked</span>
            <span>
              {`$${
                stakingInfo.totalStakedInUsd
                  .divide(JSBI.BigInt(1000000000000))
                  .toSignificant(4, { groupSeparator: ',' }) ?? '-'
              }`}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-slate-400 text-sm lg:text-md">Rewards</span>
            <span>
              {stakingInfo.rewardTokensArray.map((token: string) => (
                <img className="size-6 rounded-full" key={token} src={`${rewardsBaseUrl}${token}/logo_48.png`} />
              ))}
            </span>
          </div>
        </div>
      </div>
      <div className="bg-background rounded-md mt-1 p-6">
        <Tabs defaultValue="deposit">
          <TabsList>
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          </TabsList>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 h-full my-4">
            <div className="flex flex-col w-full text-sm bg-backgroundSoft p-4 rounded-md gap-6 h-full min-h-36">
              <h4 className="text-muted-foreground font-medium">Wallet Balance</h4>
              <div className="flex flex-col flex-1 justify-center">
                <h2 className="!p-0">
                  {!userLiquidityUnstaked ? (
                    0
                  ) : userLiquidityUnstaked.equalTo('0') ? (
                    0
                  ) : (
                    <span>{userLiquidityUnstaked.toSignificant(6)}</span>
                  )}
                </h2>
                <span>{currency0?.symbol}</span>
              </div>
            </div>
            <div className="flex flex-col w-full text-sm bg-backgroundSoft p-4 rounded-md gap-6 h-full min-h-36">
              <h4 className="text-muted-foreground font-medium">Your Stake</h4>
              <div className="flex flex-col flex-1 justify-center">
                <h2 className="!p-0">{stakingInfo?.stakedAmount?.toSignificant(6) ?? '-'}</h2>
                <span>{currency0?.symbol}</span>
              </div>
            </div>
            <div className="flex flex-col w-full text-sm bg-backgroundSoft p-4 rounded-md gap-6 h-full min-h-36">
              <h4 className="text-muted-foreground font-medium">Your Rate</h4>
              <div className="flex flex-col flex-1 justify-center">
                <h2 className="!p-0">
                  {isStaking ? (
                    stakingInfo.rewardRate?.multiply(`${60 * 60 * 24 * 7}`)?.toSignificant(4, { groupSeparator: ',' })
                  ) : (
                    <span>0</span>
                  )}
                </h2>
                <span>PNG / week</span>
              </div>
            </div>
            <div className="flex flex-col w-full text-sm bg-backgroundSoft p-4 rounded-md gap-6 h-full min-h-36">
              <div className="flex flex-col flex-1 justify-center">
                {stakingInfo.rewardTokensArray.map((token: string) => (
                  <div className="flex flex-col items-center space-y-2 shrink-0" key={token}>
                    <img className="size-12 shrink-0" src={`${rewardsBaseUrl}${token}/logo_48.png`} alt="" />
                    <h4 className="font-medium">{stakingInfo.earnedAmount.toSignificant(2)}</h4>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col h-full">
              <Button onClick={onHarvest} className="flex items-center flex-col space-y-2 h-full">
                <img src={CoinIcon} className="size-12" alt="" />
                <h4 className="font-medium">Harvest</h4>
              </Button>
            </div>
            <div className="flex flex-col h-full">
              <Button variant="outline" asChild className="h-full text-xl font-medium">
                <a
                  id={`buy-nav-link`}
                  href={
                    stakingInfo.stakedAmount.token.symbol === 'PNG'
                      ? '/swap?outputCurrency=0x60781C2586D68229fde47564546784ab3fACA982'
                      : '/swap?outputCurrency=0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7'
                  }
                >
                  Buy ${currency0?.symbol}
                </a>
              </Button>
            </div>
          </div>
          <TabsContent value="deposit">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="w-full">
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
              </div>
              <div className="flex items-center gap-4">
                <Button
                  onClick={onAttemptToApprove}
                  // confirmed={approval === ApprovalState.APPROVED || signatureData !== null}
                  disabled={approval !== ApprovalState.NOT_APPROVED || !parsedAmount || signatureData !== null}
                >
                  {approval === ApprovalState.PENDING ? (
                    <Dots>Approving</Dots>
                  ) : approval === ApprovalState.APPROVED ? (
                    'Approved'
                  ) : (
                    'Approve'
                  )}
                </Button>
                <Button
                  disabled={!!error || (signatureData === null && approval !== ApprovalState.APPROVED)}
                  variant={!!error && !!parsedAmount ? 'destructive' : 'default'}
                  onClick={onStake}
                >
                  {error ?? 'Deposit'}
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="withdraw">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="w-full">
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
              </div>
              <div>
                <Button
                  disabled={!!derivedW.error}
                  variant={!!derivedW.error && !!derivedW.parsedAmount ? 'destructive' : 'default'}
                  onClick={onWithdraw}
                >
                  {derivedW.error ?? 'Withdraw PNG'}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
