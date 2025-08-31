import { BigNumber } from '@ethersproject/bignumber';
import { splitSignature } from '@ethersproject/bytes';
import { Contract } from '@ethersproject/contracts';
import { TransactionResponse } from '@ethersproject/providers';
import { CAVAX, ChainId, Currency, Percent, WAVAX, currencyEquals } from '@pangolindex/sdk';
import { useCallback, useContext, useMemo, useState } from 'react';
import { ArrowDown, Plus } from 'react-feather';
import ReactGA from 'react-ga';
import { Text } from 'rebass';
import styled, { ThemeContext } from 'styled-components';
import { ButtonConfirmed, ButtonError, ButtonLight, ButtonPrimary } from '../../components/Button';
import { LightCard } from '../../components/Card';
import { AutoColumn, ColumnCenter } from '../../components/Column';
import { CurrencyInputPanel } from '../../components/CurrencyInputPanel';
import CurrencyLogo from '../../components/CurrencyLogo';
import DoubleCurrencyLogo from '../../components/DoubleLogo';
import { AddRemoveTabs } from '../../components/NavigationTabs';
import { MinimalPositionCard } from '../../components/PositionCard';
import Row, { RowBetween, RowFixed } from '../../components/Row';
import Slider from '../../components/Slider';
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../components/TransactionConfirmationModal';
import { Dots } from '../../components/swap/styleds';
import { ROUTER_ADDRESS } from '../../constants';
import { useActiveWeb3React } from '../../hooks';
import { useCurrency } from '../../hooks/Tokens';
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback';
import { usePairContract } from '../../hooks/useContract';
import useTransactionDeadline from '../../hooks/useTransactionDeadline';
import { useOpenDisclaimerModal, useWalletModalToggle } from '../../state/application/hooks';
import { Field } from '../../state/burn/actions';
import { useBurnActionHandlers, useBurnState, useDerivedBurnInfo } from '../../state/burn/hooks';
import { useTransactionAdder } from '../../state/transactions/hooks';
import { useUserSlippageTolerance } from '../../state/user/hooks';
import { calculateGasMargin, calculateSlippageAmount, getRouterContract } from '../../utils';
import { currencyId } from '../../utils/currencyId';
import useDebouncedChangeHandler from '../../utils/useDebouncedChangeHandler';
import { wrappedCurrency } from '../../utils/wrappedCurrency';
import AppBody from '../AppBody';
import { ClickableText, MaxButton, Wrapper } from '../Pool/styleds';
import { Link, redirect, useNavigate, useParams } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';

const PageWrapper = styled(AutoColumn)`
  width: 100%;

  @media (min-width: 768px) {
    max-width: 40vw;
  }
`;

export default function RemoveLiquidity() {
  const params = useParams<{ currencyIdA: string; currencyIdB: string }>();
  const navigate = useNavigate();
  const [currencyA, currencyB] = [
    useCurrency(params.currencyIdA) ?? undefined,
    useCurrency(params.currencyIdB) ?? undefined,
  ];
  const { account, chainId, library } = useActiveWeb3React();
  const [tokenA, tokenB] = useMemo(
    () => [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)],
    [currencyA, currencyB, chainId],
  );

  const theme = useContext(ThemeContext);

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle();

  // burn state
  const { independentField, typedValue } = useBurnState();
  const { pair, parsedAmounts, error } = useDerivedBurnInfo(currencyA ?? undefined, currencyB ?? undefined);
  const { onUserInput: _onUserInput } = useBurnActionHandlers();
  const isValid = !error;

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [showDetailed, setShowDetailed] = useState<boolean>(false);
  const [attemptingTxn, setAttemptingTxn] = useState(false); // clicked confirm

  // txn values
  const [txHash, setTxHash] = useState<string>('');
  const deadline = useTransactionDeadline();
  const [allowedSlippage] = useUserSlippageTolerance();
  const onOpenDisclaimerModal = useOpenDisclaimerModal();

  const formattedAmounts = {
    [Field.LIQUIDITY_PERCENT]: parsedAmounts[Field.LIQUIDITY_PERCENT].equalTo('0')
      ? '0'
      : parsedAmounts[Field.LIQUIDITY_PERCENT].lessThan(new Percent('1', '100'))
        ? '<1'
        : parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0),
    [Field.LIQUIDITY]:
      independentField === Field.LIQUIDITY ? typedValue : (parsedAmounts[Field.LIQUIDITY]?.toSignificant(6) ?? ''),
    [Field.CURRENCY_A]:
      independentField === Field.CURRENCY_A ? typedValue : (parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) ?? ''),
    [Field.CURRENCY_B]:
      independentField === Field.CURRENCY_B ? typedValue : (parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) ?? ''),
  };

  const atMaxAmount = parsedAmounts[Field.LIQUIDITY_PERCENT]?.equalTo(new Percent('1'));

  // pair contract
  const pairContract: Contract | null = usePairContract(pair?.liquidityToken?.address);

  // allowance handling
  const [signatureData, setSignatureData] = useState<{ v: number; r: string; s: string; deadline: number } | null>(
    null,
  );
  const [approval, approveCallback] = useApproveCallback(
    chainId ?? ChainId.AVALANCHE,
    parsedAmounts[Field.LIQUIDITY],
    chainId ? ROUTER_ADDRESS[chainId] : ROUTER_ADDRESS[ChainId.AVALANCHE],
  );

  const isArgentWallet = false;

  async function onAttemptToApprove() {
    if (!pairContract || !pair || !library || !deadline) throw new Error('missing dependencies');
    const liquidityAmount = parsedAmounts[Field.LIQUIDITY];
    if (!liquidityAmount) throw new Error('missing liquidity amount');

    if (isArgentWallet) {
      return approveCallback();
    }

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
      verifyingContract: pair.liquidityToken.address,
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
      spender: chainId ? ROUTER_ADDRESS[chainId] : ROUTER_ADDRESS[ChainId.AVALANCHE],
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

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      setSignatureData(null);
      return _onUserInput(field, typedValue);
    },
    [_onUserInput],
  );

  const onLiquidityInput = useCallback(
    (typedValue: string): void => onUserInput(Field.LIQUIDITY, typedValue),
    [onUserInput],
  );
  const onCurrencyAInput = useCallback(
    (typedValue: string): void => onUserInput(Field.CURRENCY_A, typedValue),
    [onUserInput],
  );
  const onCurrencyBInput = useCallback(
    (typedValue: string): void => onUserInput(Field.CURRENCY_B, typedValue),
    [onUserInput],
  );

  // tx sending
  const addTransaction = useTransactionAdder();
  async function onRemove() {
    if (!chainId || !library || !account || !deadline) throw new Error('missing dependencies');
    const { [Field.CURRENCY_A]: currencyAmountA, [Field.CURRENCY_B]: currencyAmountB } = parsedAmounts;
    if (!currencyAmountA || !currencyAmountB) {
      throw new Error('missing currency amounts');
    }
    const router = getRouterContract(chainId, library, account);

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(currencyAmountA, allowedSlippage)[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(currencyAmountB, allowedSlippage)[0],
    };

    if (!currencyA || !currencyB) throw new Error('missing tokens');
    const liquidityAmount = parsedAmounts[Field.LIQUIDITY];
    if (!liquidityAmount) throw new Error('missing liquidity amount');

    const currencyBIsETH = currencyB === CAVAX[chainId];
    const oneCurrencyIsETH = currencyA === CAVAX[chainId] || currencyBIsETH;

    if (!tokenA || !tokenB) throw new Error('could not wrap');

    let methodNames: string[], args: Array<string | string[] | number | boolean>;
    // we have approval, use normal remove liquidity
    if (approval === ApprovalState.APPROVED) {
      // removeLiquidityAVAX
      if (oneCurrencyIsETH) {
        methodNames = ['removeLiquidityAVAX', 'removeLiquidityAVAXSupportingFeeOnTransferTokens'];
        args = [
          currencyBIsETH ? tokenA.address : tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
          account,
          deadline.toHexString(),
        ];
      }
      // removeLiquidity
      else {
        methodNames = ['removeLiquidity'];
        args = [
          tokenA.address,
          tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[Field.CURRENCY_A].toString(),
          amountsMin[Field.CURRENCY_B].toString(),
          account,
          deadline.toHexString(),
        ];
      }
    }
    // we have a signataure, use permit versions of remove liquidity
    else if (signatureData !== null) {
      // removeLiquidityAVAXWithPermit
      if (oneCurrencyIsETH) {
        methodNames = ['removeLiquidityAVAXWithPermit', 'removeLiquidityAVAXWithPermitSupportingFeeOnTransferTokens'];
        args = [
          currencyBIsETH ? tokenA.address : tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
          account,
          signatureData.deadline,
          false,
          signatureData.v,
          signatureData.r,
          signatureData.s,
        ];
      }
      // removeLiquidityAVAXWithPermit
      else {
        methodNames = ['removeLiquidityWithPermit'];
        args = [
          tokenA.address,
          tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[Field.CURRENCY_A].toString(),
          amountsMin[Field.CURRENCY_B].toString(),
          account,
          signatureData.deadline,
          false,
          signatureData.v,
          signatureData.r,
          signatureData.s,
        ];
      }
    } else {
      throw new Error('Attempting to confirm without approval or a signature. Please contact support.');
    }

    const safeGasEstimates: (BigNumber | undefined)[] = await Promise.all(
      methodNames.map(methodName =>
        router.estimateGas[methodName](...args)
          .then(calculateGasMargin)
          .catch(error => {
            console.error(`estimateGas failed`, methodName, args, error);
            return undefined;
          }),
      ),
    );

    const indexOfSuccessfulEstimation = safeGasEstimates.findIndex(safeGasEstimate =>
      BigNumber.isBigNumber(safeGasEstimate),
    );

    // all estimations failed...
    if (indexOfSuccessfulEstimation === -1) {
      console.error('This transaction would fail. Please contact support.');
    } else {
      const methodName = methodNames[indexOfSuccessfulEstimation];
      const safeGasEstimate = safeGasEstimates[indexOfSuccessfulEstimation];

      setAttemptingTxn(true);
      await router[methodName](...args, {
        gasLimit: safeGasEstimate,
      })
        .then((response: TransactionResponse) => {
          setAttemptingTxn(false);

          addTransaction(response, {
            summary:
              'Remove ' +
              parsedAmounts[Field.CURRENCY_A]?.toSignificant(3) +
              ' ' +
              currencyA?.symbol +
              ' and ' +
              parsedAmounts[Field.CURRENCY_B]?.toSignificant(3) +
              ' ' +
              currencyB?.symbol,
          });

          setTxHash(response.hash);

          ReactGA.event({
            category: 'Liquidity',
            action: 'Remove',
            label: [currencyA?.symbol, currencyB?.symbol].join('/'),
          });
        })
        .catch((error: Error) => {
          setAttemptingTxn(false);
          // we only care if the error is something _other_ than the user rejected the tx
          console.error(error);
        });
    }
  }

  function modalHeader() {
    return (
      <AutoColumn gap={'md'} style={{ marginTop: '20px' }}>
        <RowBetween align="flex-end">
          <Text fontSize={24} fontWeight={500}>
            {parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}
          </Text>
          <RowFixed gap="4px">
            <CurrencyLogo currency={currencyA} size={'24px'} />
            <Text fontSize={24} fontWeight={500} style={{ marginLeft: '10px' }}>
              {currencyA?.symbol}
            </Text>
          </RowFixed>
        </RowBetween>
        <RowFixed>
          <Plus size="16" />
        </RowFixed>
        <RowBetween align="flex-end">
          <Text fontSize={24} fontWeight={500}>
            {parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}
          </Text>
          <RowFixed gap="4px">
            <CurrencyLogo currency={currencyB} size={'24px'} />
            <Text fontSize={24} fontWeight={500} style={{ marginLeft: '10px' }}>
              {currencyB?.symbol}
            </Text>
          </RowFixed>
        </RowBetween>

        <span className="italic">
          {`Output is estimated. If the price changes by more than ${
            allowedSlippage / 100
          }% your transaction will revert.`}
        </span>
      </AutoColumn>
    );
  }

  function modalBottom() {
    return (
      <>
        <RowBetween>
          <Text fontWeight={500} fontSize={16}>
            {'CNR ' + currencyA?.symbol + '/' + currencyB?.symbol} Burned
          </Text>
          <RowFixed>
            <DoubleCurrencyLogo currency0={currencyA} currency1={currencyB} margin={true} />
            <Text fontWeight={500} fontSize={16}>
              {parsedAmounts[Field.LIQUIDITY]?.toSignificant(6)}
            </Text>
          </RowFixed>
        </RowBetween>
        {pair && (
          <>
            <RowBetween>
              <Text fontWeight={500} fontSize={16}>
                Price
              </Text>
              <Text fontWeight={500} fontSize={16}>
                1 {currencyA?.symbol} = {tokenA && tokenB ? pair.priceOf(tokenA, tokenB).toSignificant(6) : '-'}{' '}
                {currencyB?.symbol}
              </Text>
            </RowBetween>
            <RowBetween>
              <div />
              <Text fontWeight={500} fontSize={16}>
                1 {currencyB?.symbol} = {tokenB && tokenA ? pair.priceOf(tokenB, tokenA).toSignificant(6) : '-'}{' '}
                {currencyA?.symbol}
              </Text>
            </RowBetween>
          </>
        )}
        <ButtonPrimary disabled={!(approval === ApprovalState.APPROVED || signatureData !== null)} onClick={onRemove}>
          <Text fontWeight={500} fontSize={20}>
            Confirm
          </Text>
        </ButtonPrimary>
      </>
    );
  }

  const pendingText = `Removing ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} ${
    currencyA?.symbol
  } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} ${currencyB?.symbol}`;

  const liquidityPercentChangeCallback = useCallback(
    (value: number) => {
      onUserInput(Field.LIQUIDITY_PERCENT, value.toString());
    },
    [onUserInput],
  );

  const oneCurrencyIsAVAX =
    currencyA === CAVAX[chainId ?? ChainId.AVALANCHE] || currencyB === CAVAX[chainId ?? ChainId.AVALANCHE];
  const oneCurrencyIsWAVAX = Boolean(
    chainId &&
      ((currencyA && currencyEquals(WAVAX[chainId], currencyA)) ||
        (currencyB && currencyEquals(WAVAX[chainId], currencyB))),
  );

  const handleSelectCurrencyA = useCallback((currency: Currency) => {
    if (params.currencyIdB && currencyId(currency) === params.currencyIdB) {
      navigate(`/remove/${currencyId(currency)}/${params.currencyIdA}`);
    } else {
      navigate(`/remove/${currencyId(currency)}/${params.currencyIdB}`);
    }
  }, []);

  const handleSelectCurrencyB = useCallback((currency: Currency) => {
    if (params.currencyIdA && currencyId(currency) === params.currencyIdA) {
      navigate(`/remove/${params.currencyIdB}/${currencyId(currency)}`);
    } else {
      navigate(`/remove/${params.currencyIdA}/${currencyId(currency)}`);
    }
  }, []);

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false);
    setSignatureData(null); // important that we clear signature data to avoid bad sigs
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.LIQUIDITY_PERCENT, '0');
    }
    setTxHash('');
  }, [onUserInput, txHash]);

  const [innerLiquidityPercentage, setInnerLiquidityPercentage] = useDebouncedChangeHandler(
    Number.parseInt(parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0)),
    liquidityPercentChangeCallback,
  );

  return (
    <>
      <div className="bg-background p-8 rounded-lg lg:w-full lg:max-w-[500px] m-auto">
        <AddRemoveTabs creating={false} adding={false} />
        <Wrapper>
          <TransactionConfirmationModal
            isOpen={showConfirm}
            onDismiss={handleDismissConfirmation}
            attemptingTxn={attemptingTxn}
            hash={txHash ? txHash : ''}
            content={() => (
              <ConfirmationModalContent
                title={'You will receive'}
                onDismiss={handleDismissConfirmation}
                topContent={modalHeader}
                bottomContent={modalBottom}
              />
            )}
            pendingText={pendingText}
          />
          <AutoColumn gap="md">
            <LightCard>
              <AutoColumn gap="20px">
                <RowBetween>
                  <Text fontWeight={500}>Amount</Text>
                  <ClickableText
                    fontWeight={500}
                    onClick={() => {
                      setShowDetailed(!showDetailed);
                    }}
                  >
                    {showDetailed ? 'Simple' : 'Detailed'}
                  </ClickableText>
                </RowBetween>
                <Row style={{ alignItems: 'flex-end' }}>
                  <Text fontSize={72} fontWeight={500}>
                    {formattedAmounts[Field.LIQUIDITY_PERCENT]}%
                  </Text>
                </Row>
                {!showDetailed && (
                  <>
                    <Slider value={innerLiquidityPercentage} onChange={setInnerLiquidityPercentage} />
                    <RowBetween>
                      <MaxButton onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '25')} width="20%">
                        25%
                      </MaxButton>
                      <MaxButton onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '50')} width="20%">
                        50%
                      </MaxButton>
                      <MaxButton onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '75')} width="20%">
                        75%
                      </MaxButton>
                      <MaxButton onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '100')} width="20%">
                        Max
                      </MaxButton>
                    </RowBetween>
                  </>
                )}
              </AutoColumn>
            </LightCard>
            {!showDetailed && (
              <>
                <ColumnCenter>
                  <ArrowDown size="16" />
                </ColumnCenter>
                <LightCard>
                  <AutoColumn gap="10px">
                    <RowBetween>
                      <Text fontSize={24} fontWeight={500}>
                        {formattedAmounts[Field.CURRENCY_A] || '-'}
                      </Text>
                      <RowFixed>
                        <CurrencyLogo currency={currencyA} style={{ marginRight: '12px' }} />
                        <Text fontSize={24} fontWeight={500} id="remove-liquidity-tokena-symbol">
                          {currencyA?.symbol}
                        </Text>
                      </RowFixed>
                    </RowBetween>
                    <RowBetween>
                      <Text fontSize={24} fontWeight={500}>
                        {formattedAmounts[Field.CURRENCY_B] || '-'}
                      </Text>
                      <RowFixed>
                        <CurrencyLogo currency={currencyB} style={{ marginRight: '12px' }} />
                        <Text fontSize={24} fontWeight={500} id="remove-liquidity-tokenb-symbol">
                          {currencyB?.symbol}
                        </Text>
                      </RowFixed>
                    </RowBetween>
                    {chainId && (oneCurrencyIsWAVAX || oneCurrencyIsAVAX) ? (
                      <RowBetween style={{ justifyContent: 'flex-end' }}>
                        {oneCurrencyIsAVAX ? (
                          <Link
                            to={`/remove/${currencyA === CAVAX[chainId] ? WAVAX[chainId].address : params.currencyIdA}/${
                              currencyB === CAVAX[chainId] ? WAVAX[chainId].address : params.currencyIdB
                            }`}
                          >
                            Receive WAVAX
                          </Link>
                        ) : oneCurrencyIsWAVAX ? (
                          <Link
                            to={`/remove/${
                              currencyA && currencyEquals(currencyA, WAVAX[chainId])
                                ? /*chainId == ChainId.SCROLL ? 'ETH' : */ 'AVAX'
                                : params.currencyIdA
                            }/${
                              currencyB && currencyEquals(currencyB, WAVAX[chainId])
                                ? /*chainId == ChainId.SCROLL ? 'ETH' : */ 'AVAX'
                                : params.currencyIdB
                            }`}
                          >
                            Receive AVAX
                          </Link>
                        ) : null}
                      </RowBetween>
                    ) : null}
                  </AutoColumn>
                </LightCard>
              </>
            )}

            {showDetailed && (
              <>
                <CurrencyInputPanel
                  value={formattedAmounts[Field.LIQUIDITY]}
                  onUserInput={onLiquidityInput}
                  onMax={() => {
                    onUserInput(Field.LIQUIDITY_PERCENT, '100');
                  }}
                  showMaxButton={!atMaxAmount}
                  disableCurrencySelect
                  currency={pair?.liquidityToken}
                  pair={pair}
                  id="liquidity-amount"
                />
                <ColumnCenter>
                  <ArrowDown size="16" />
                </ColumnCenter>
                <CurrencyInputPanel
                  hideBalance={true}
                  value={formattedAmounts[Field.CURRENCY_A]}
                  onUserInput={onCurrencyAInput}
                  onMax={() => onUserInput(Field.LIQUIDITY_PERCENT, '100')}
                  showMaxButton={!atMaxAmount}
                  currency={currencyA}
                  label={'Output'}
                  onCurrencySelect={handleSelectCurrencyA}
                  id="remove-liquidity-tokena"
                />
                <ColumnCenter>
                  <Plus size="16" />
                </ColumnCenter>
                <CurrencyInputPanel
                  hideBalance={true}
                  value={formattedAmounts[Field.CURRENCY_B]}
                  onUserInput={onCurrencyBInput}
                  onMax={() => onUserInput(Field.LIQUIDITY_PERCENT, '100')}
                  showMaxButton={!atMaxAmount}
                  currency={currencyB}
                  label={'Output'}
                  onCurrencySelect={handleSelectCurrencyB}
                  id="remove-liquidity-tokenb"
                />
              </>
            )}
            {pair && (
              <div style={{ padding: '10px 20px' }}>
                <RowBetween>
                  Price:
                  <div>
                    1 {currencyA?.symbol} = {tokenA && tokenB ? pair.priceOf(tokenA, tokenB).toSignificant(6) : '-'}{' '}
                    {currencyB?.symbol}
                  </div>
                </RowBetween>
                <RowBetween>
                  <div />
                  <div>
                    1 {currencyB?.symbol} = {tokenB && tokenA ? pair.priceOf(tokenB, tokenA).toSignificant(6) : '-'}{' '}
                    {currencyA?.symbol}
                  </div>
                </RowBetween>
              </div>
            )}
            <div style={{ position: 'relative' }}>
              {!account ? (
                <Button block onClick={onOpenDisclaimerModal}>
                  Connect Wallet
                </Button>
              ) : (
                <div className="flex items-center gap-4">
                  <Button
                    block
                    onClick={onAttemptToApprove}
                    disabled={approval !== ApprovalState.NOT_APPROVED || signatureData !== null}
                  >
                    {approval === ApprovalState.PENDING ? (
                      <Dots>Approving</Dots>
                    ) : approval === ApprovalState.APPROVED || signatureData !== null ? (
                      'Approved'
                    ) : (
                      'Approve'
                    )}
                  </Button>
                  <Button
                    block
                    onClick={() => {
                      setShowConfirm(true);
                    }}
                    variant={
                      !isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]
                        ? 'destructive'
                        : 'default'
                    }
                    disabled={!isValid || (signatureData === null && approval !== ApprovalState.APPROVED)}
                  >
                    <Text fontSize={16} fontWeight={500}>
                      {error || 'Remove'}
                    </Text>
                  </Button>
                </div>
              )}
            </div>
          </AutoColumn>
        </Wrapper>
      </div>
      {pair ? (
        <div className="lg:max-w-[500px] m-auto">
          <MinimalPositionCard showUnwrapped={oneCurrencyIsWAVAX} pair={pair} />
        </div>
      ) : null}
    </>
  );
}
