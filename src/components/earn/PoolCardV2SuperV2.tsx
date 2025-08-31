import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePair } from '@/data/Reserves';
import useUSDCPrice from '@/utils/useUSDCPrice';
import { TransactionResponse } from '@ethersproject/providers';
import { ChainId, Fraction, JSBI, Pair, TokenAmount, WAVAX } from '@pangolindex/sdk';
import { splitSignature } from 'ethers/lib/utils';
import numeral from 'numeral';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useTransactionDeadline from 'src/hooks/useTransactionDeadline';
import CoinIcon from '../../assets/images/harvestcoin.svg';
import { PNG, UNDEFINED } from '../../constants';
import { useActiveWeb3React } from '../../hooks';
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback';
import { useMiniChefSPV2Contract, usePairContract } from '../../hooks/useContract';
import { Dots } from '../../pages/Pool/styleds';
import { useDerivedStakeInfo } from '../../state/stake/hooks';
import { useTransactionAdder } from '../../state/transactions/hooks';
import { useTokenBalance } from '../../state/wallet/hooks';
import { calculateGasMargin } from '../../utils';
import { maxAmountSpend } from '../../utils/maxAmountSpend';
import { unwrappedToken } from '../../utils/wrappedCurrency';
import { CurrencyInputPanelV2 } from '../CurrencyInputPanel';
import { DoubleCurrencyLogoV2 } from '../DoubleLogoNew';

export default function PoolCardV2SuperV2({ MinichefStakingInfo }: { MinichefStakingInfo: MinichefStakingInfo }) {
  const { account, chainId, library } = useActiveWeb3React();
  const [typedValue, setTypedValue] = useState('');
  const [typedValueW, setTypedValueW] = useState('');
  const [signatureData, setSignatureData] = useState<{ v: number; r: string; s: string; deadline: number } | null>(
    null,
  );
  const userLiquidityUnstaked = useTokenBalance(account ?? undefined, MinichefStakingInfo?.stakedAmount?.token);
  const { parsedAmount, error } = useDerivedStakeInfo(
    typedValue,
    MinichefStakingInfo.stakedAmount.token,
    userLiquidityUnstaked,
  );
  const derivedW = useDerivedStakeInfo(
    typedValueW,
    MinichefStakingInfo.stakedAmount.token,
    MinichefStakingInfo.stakedAmount,
  );
  const [approval, approveCallback] = useApproveCallback(
    new TokenAmount(
      MinichefStakingInfo.stakedAmount.token,
      parsedAmount?.raw.toString() ?? '115792089237316195423570985008687907853269984665640564039457584007913129639935',
    ),
    MinichefStakingInfo.stakingRewardAddress,
  );

  const dummyPair = new Pair(
    new TokenAmount(MinichefStakingInfo.tokens[0], '0'),
    new TokenAmount(MinichefStakingInfo.tokens[1], '0'),
    chainId ? chainId : ChainId.AVALANCHE,
  );

  const token0 = MinichefStakingInfo.tokens[0];
  const token1 = MinichefStakingInfo.tokens[1];
  const isPair = token1 !== UNDEFINED[token1.chainId];

  let bonusTokenMultipliers = '{"0":1.01, "1":2.6, "2":2, "3":2, "4":1.85, "5":1}';

  const deadList = [
    '0x7A7199327C18e946a34eBE76ea96ED7FB96bF470',
    '0xb4438EC951B5d12fd3fA3d83FF979F12bd8a6Bd3',
    '0x628D0eDB4d871Fe80CACab7fA84e1c31FA4C9d58',
    '0x8e38d57666cD6BeFdFe478E675362390b9de3d14',
  ];
  const deadFound = deadList.includes(MinichefStakingInfo.stakingRewardAddress);

  const avaxPriceUSD = useUSDCPrice(WAVAX[chainId ? chainId : ChainId.AVALANCHE]);
  const avaxprice = Number(avaxPriceUSD?.toFixed(2));

  const bag = chainId ? PNG[chainId] : undefined;
  const wavax = WAVAX[chainId ? chainId : 43114];
  const [, avaxBagTokenPair] = usePair(wavax, bag);
  const oneToken = JSBI.BigInt(1000000000000000000);

  let pngPrice: number | undefined;
  if (avaxBagTokenPair && bag) {
    const avaxPngRatio = JSBI.divide(
      JSBI.multiply(oneToken, avaxBagTokenPair.reserveOfToken(wavax).raw),
      avaxBagTokenPair.reserveOfToken(bag).raw,
    );
    pngPrice = JSBI.toNumber(avaxPngRatio) / 1000000000000000000;
  }

  let nPngPrice = (Number(pngPrice) * Number(avaxprice)) / 1000000000000;

  const pngRewardYearlyUSD =
    ((Number(MinichefStakingInfo.totalRewardRatePerSecond.raw.toString()) * 60 * 60 * 24 * 365) / 1000000000000000000) *
    nPngPrice;

  let pngApr = (pngRewardYearlyUSD / MinichefStakingInfo.totalStakedInUsd.toSignificant(4)) * 100;

  let pid = MinichefStakingInfo.pid.toString();

  const obj = JSON.parse(bonusTokenMultipliers);

  let sumApr = pngApr + pngApr * obj[pid];

  const rewardsBaseUrl = 'https://raw.githubusercontent.com/pangolindex/tokens/main/assets/43114/';

  const rows = [];
  for (let i = 0; i < MinichefStakingInfo.extraPendingRewards.length; i++) {
    // note: we are adding a key prop here to allow react to uniquely identify each
    // element in this array. see: https://reactjs.org/docs/lists-and-keys.html
    rows.push(
      <div className="flex flex-col items-center space-y-1 shrink-0" key={MinichefStakingInfo.rewardTokensAddress[i]}>
        <img
          className="size-7 shrink-0 rounded-full"
          src={`${rewardsBaseUrl}${MinichefStakingInfo.rewardTokensAddress[i]}/logo_48.png`}
          alt=""
        />
        <span className="text-sm">
          {Number(Number(MinichefStakingInfo.extraPendingRewards[i]) / 1000000000000000000).toFixed(2)}
        </span>
      </div>,
    );
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
  const stakingContract = useMiniChefSPV2Contract();

  const pairContract = usePairContract(dummyPair.liquidityToken.address);

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
          .depositWithPermit(
            MinichefStakingInfo.pid,
            `0x${parsedAmount.raw.toString(16)}`,
            account,
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
      await stakingContract.estimateGas['withdrawAndHarvest'](
        MinichefStakingInfo.pid,
        `0x${derivedW?.parsedAmount?.raw.toString(16)}`,
        account,
      ).then(estimatedGasLimit => {
        stakingContract
          .withdrawAndHarvest(MinichefStakingInfo.pid, `0x${derivedW?.parsedAmount?.raw.toString(16)}`, account, {
            gasLimit: calculateGasMargin(estimatedGasLimit),
          })
          .then((response: TransactionResponse) => {
            //console.log(response)
            addTransaction(response, {
              summary: `Withdraw LP`,
            });
            setTypedValueW('');
            //setHash(response.hash)
          })
          .catch((error: any) => {
            //setAttempting(false)
            console.log(error);
          });
      });
      /*} else {
        //setAttempting(false)
        throw new Error('Attempting to stake without approval or a signature. Please contact support.')
      }*/
    }
  }

  async function onHarvest() {
    if (stakingContract) {
      await stakingContract.estimateGas['harvest'](MinichefStakingInfo.pid, account).then(estimatedGasLimit => {
        stakingContract
          .harvest(MinichefStakingInfo.pid, account, { gasLimit: calculateGasMargin(estimatedGasLimit) })
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

  const maxAmountInputW = maxAmountSpend(MinichefStakingInfo.stakedAmount);
  const atMaxAmountW = Boolean(maxAmountInputW && parsedAmount?.equalTo(maxAmountInputW));
  const handleMaxW = useCallback(() => {
    maxAmountInputW && onUserInputW(maxAmountInputW.toExact());
  }, [maxAmountInputW, onUserInputW]);

  let currency0 = unwrappedToken(token0);
  let currency1 = unwrappedToken(token1);

  if (isPair === false) {
    currency0 = token0;
    currency1 = token1;
  }

  async function onAttemptToApprove() {
    if (!pairContract || !library || !deadline) throw new Error(t('earn.missingDependencies'));

    const liquidityAmount = parsedAmount;
    if (!liquidityAmount) throw new Error(t('earn.missingLiquidityAmount'));

    // try to gather a signature for permission
    const nonce = await pairContract.nonces(account);

    const EIP712Domain = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ];
    const domain = {
      name: 'Pangolin Liquidity',
      version: '1',
      chainId: chainId,
      verifyingContract: pairContract.address,
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
      spender: MinichefStakingInfo.stakingRewardAddress,
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
      .catch(error => {
        // for all errors other than 4001 (EIP-1193 user rejected request), fall back to manual approve
        if (error?.code !== 4001) {
          approveCallback();
        }
      });
  }

  const yourTVL = MinichefStakingInfo.totalStakedInUsd
    .multiply(MinichefStakingInfo.stakedAmount)
    .divide(MinichefStakingInfo.totalStakedAmount);

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger className="bg-background rounded-md p-6 space-x-4 flex flex-col md:flex-row gap-6">
          <div className="lg:min-w-60 flex gap-4 items-center">
            <DoubleCurrencyLogoV2 isDead={deadFound} currency0={currency0} currency1={currency1} size={32} />
            <div className="shrink-0 md:px-4">
              {currency0?.symbol}-{currency1?.symbol}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 w-full">
            <div className="flex flex-col items-center">
              <span className="text-slate-400 text-sm lg:text-md">Your Stake</span>
              <span>{numeral((yourTVL as Fraction)?.toFixed(2)).format('$0.00a')}</span>
            </div>

            {MinichefStakingInfo.isPeriodFinished ? (
              <div>
                <Badge variant="destructive">FINISHED</Badge>
              </div>
            ) : (
              <div
                className="flex flex-col items-center"
                data-tip
                data-for={`happyFace${MinichefStakingInfo.stakingRewardAddress}`}
              >
                <span className="text-slate-400 text-sm lg:text-md">APR</span>
                <span>{sumApr.toFixed(0)}%</span>
              </div>
            )}

            <div className="flex flex-col items-center">
              <span className="text-slate-400 text-sm lg:text-md">Liquidity</span>
              <span>${MinichefStakingInfo.totalStakedInUsd.toSignificant(4, { groupSeparator: ',' }) ?? '-'}</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-slate-400 text-sm lg:text-md">Rewards</span>
              <div className="flex items-center space-x-2">
                <img
                  className="size-6 rounded-full"
                  key={'0x60781C2586D68229fde47564546784ab3fACA982'}
                  src={`${rewardsBaseUrl}${'0x60781C2586D68229fde47564546784ab3fACA982'}/logo_48.png`}
                />
                {MinichefStakingInfo.rewardTokensAddress.map(
                  (token: string) =>
                    token !== '' && (
                      <img className="size-6 rounded-full" key={token} src={`${rewardsBaseUrl}${token}/logo_48.png`} />
                    ),
                )}
              </div>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="bg-background rounded-md mt-1 p-6">
          <Tabs defaultValue="deposit">
            <TabsList>
              <TabsTrigger value="deposit">Deposit</TabsTrigger>
              <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            </TabsList>
            <div className="grid md:grid-cols-2 gap-4 my-4">
              <div>
                <div className="flex w-full text-sm">
                  Wallet Balance: 
                  {!userLiquidityUnstaked ? (
                    0
                  ) : userLiquidityUnstaked.equalTo('0') ? (
                    0
                  ) : (
                    <p>{userLiquidityUnstaked.toSignificant(6)}</p>
                  )}
                  <span style={{ color: '#B3983C', marginLeft: '5px' }}> PGL</span>
                </div>
                <div className="flex w-full text-sm">
                  Your Stake: <p>{MinichefStakingInfo?.stakedAmount?.toSignificant(6) ?? '-'}</p>
                  <span style={{ color: '#B3983C', marginLeft: '5px' }}> PGL</span>
                </div>
              </div>
              <div className="flex flex-col space-y-2 lg:flex-row lg:space-x-4 lg:space-y-0 place-content-end">
                <div className="flex space-x-4 col-span-2 lg:col-span-1">
                  <div
                    className="flex flex-col items-center space-y-1 shrink-0"
                    key={'0x60781C2586D68229fde47564546784ab3fACA982'}
                  >
                    <img
                      className="size-7 shrink-0 rounded-full"
                      src={`${rewardsBaseUrl}${'0x60781C2586D68229fde47564546784ab3fACA982'}/logo_48.png`}
                      alt=""
                    />
                    <span className="text-sm">{MinichefStakingInfo.earnedAmount.toSignificant(4)}</span>
                  </div>
                  {rows}
                </div>
                <div className="flex space-x-2">
                  <Button onClick={onHarvest} className="flex items-center space-x-2">
                    <span>Harvest</span>
                    <img src={CoinIcon} className="size-4" alt="" />
                  </Button>
                  <Button variant="outline" asChild>
                    <a
                      id={`buy-nav-link`}
                      href={`/add/${token0.symbol === 'WAVAX' ? 'AVAX' : token0.address}/${
                        token1.symbol === 'WAVAX' ? 'AVAX' : token1.address
                      }`}
                    >
                      Get {currency0?.symbol}-{currency1?.symbol} LP
                    </a>
                  </Button>
                </div>
              </div>
            </div>
            <TabsContent value="deposit">
              <div className="flex flex-col space-y-2">
                <CurrencyInputPanelV2
                  value={typedValue}
                  onUserInput={onUserInput}
                  onMax={handleMax}
                  showMaxButton={!atMaxAmount}
                  currency={MinichefStakingInfo.stakedAmount.token}
                  pair={dummyPair}
                  label={''}
                  disableCurrencySelect={true}
                  id="FarmV2-liquidity-token"
                />
                <div className="flex items-center space-x-2">
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
              <div className="flex flex-col space-y-2">
                <CurrencyInputPanelV2
                  value={typedValueW}
                  onUserInput={onUserInputW}
                  onMax={handleMaxW}
                  showMaxButton={!atMaxAmountW}
                  currency={MinichefStakingInfo.stakedAmount.token}
                  pair={dummyPair}
                  label={''}
                  disableCurrencySelect={true}
                  id="FarmV2W-liquidity-token"
                />
                <div>
                  <Button
                    disabled={!!derivedW.error}
                    variant={!!derivedW.error && !!derivedW.parsedAmount ? 'destructive' : 'default'}
                    onClick={onWithdraw}
                  >
                    {derivedW.error ?? 'Withdraw LP'}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
