import { Icons } from '@/components/icons';
import { ConnectWalletButtonRainbow } from '@/components/ui/connect-wallet-button-rainbow';
import { BigNumber } from '@ethersproject/bignumber';
import { TransactionResponse } from '@ethersproject/providers';
import { CAVAX, ChainId, Currency, TokenAmount } from '@pangolindex/sdk';
import { useCallback, useState } from 'react';
import ReactGA from 'react-ga';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Text } from 'rebass';
import { ButtonError, ButtonPrimary } from '../../components/Button';
import { BlueCard, LightCard } from '../../components/Card';
import { AutoColumn, ColumnCenter } from '../../components/Column';
import { CurrencyInputPanel } from '../../components/CurrencyInputPanel';
import DoubleCurrencyLogo from '../../components/DoubleLogo';
import { AddRemoveTabs } from '../../components/NavigationTabs';
import Row, { RowBetween, RowFlat } from '../../components/Row';
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../components/TransactionConfirmationModal';
import { ROUTER_ADDRESS } from '../../constants';
import { PairState } from '../../data/ReservesPangolin';
import { useActiveWeb3React } from '../../hooks';
import { useCurrency } from '../../hooks/Tokens';
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback';
import useTransactionDeadline from '../../hooks/useTransactionDeadline';
import { Field } from '../../state/mint/actions';
import { useDerivedMintInfo, useMintActionHandlers, useMintState } from '../../state/mint/hooks';
import { useTransactionAdder } from '../../state/transactions/hooks';
import { useIsExpertMode, useUserSlippageTolerance } from '../../state/user/hooks';
import { calculateGasMargin, calculateSlippageAmount, getRouterContract } from '../../utils';
import { currencyId } from '../../utils/currencyId';
import { maxAmountSpend } from '../../utils/maxAmountSpend';
import { wrappedCurrency } from '../../utils/wrappedCurrency';
import { Dots, Wrapper } from '../Pool/styleds';
import { ConfirmAddModalBottom } from './ConfirmAddModalBottom';
import { PoolPriceBar } from './PoolPriceBar';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function AddLiquidity() {
  const { pathname } = useLocation();
  const { currencyIdA, currencyIdB } = useParams<{ currencyIdA?: string; currencyIdB?: string }>();
  const navigate = useNavigate();
  const { account, chainId, library } = useActiveWeb3React();

  const currencyA = useCurrency(currencyIdA);
  const currencyB = useCurrency(currencyIdB);

  /*const oneCurrencyIsWAVAX = Boolean(
    chainId &&
      ((currencyA && currencyEquals(currencyA, WAVAX[chainId])) ||
        (currencyB && currencyEquals(currencyB, WAVAX[chainId])))
  )*/

  const expertMode = useIsExpertMode();

  // mint state
  const { independentField, typedValue, otherTypedValue } = useMintState();
  const {
    dependentField,
    currencies,
    pair,
    pairState,
    currencyBalances,
    parsedAmounts,
    price,
    noLiquidity,
    liquidityMinted,
    poolTokenPercentage,
    error,
  } = useDerivedMintInfo(currencyA ?? undefined, currencyB ?? undefined);
  const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noLiquidity);

  const isValid = !error;

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false); // clicked confirm

  // txn values
  const deadline = useTransactionDeadline(); // custom from users settings
  const [allowedSlippage] = useUserSlippageTolerance(); // custom from users
  const [txHash, setTxHash] = useState<string>('');

  // get formatted amounts
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: noLiquidity ? otherTypedValue : (parsedAmounts[dependentField]?.toSignificant(6) ?? ''),
  };

  // get the max amounts user can add
  const maxAmounts: { [field in Field]?: TokenAmount } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmountSpend(currencyBalances[field], chainId ?? ChainId.AVALANCHE),
      };
    },
    {},
  );

  const atMaxAmounts: { [field in Field]?: TokenAmount } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmounts[field]?.equalTo(parsedAmounts[field] ?? '0'),
      };
    },
    {},
  );

  // check whether the user has approved the router on the tokens
  const [approvalA, approveACallback] = useApproveCallback(
    chainId ?? ChainId.AVALANCHE,
    parsedAmounts[Field.CURRENCY_A],
    chainId ? ROUTER_ADDRESS[chainId] : ROUTER_ADDRESS[ChainId.AVALANCHE],
  );
  const [approvalB, approveBCallback] = useApproveCallback(
    chainId ?? ChainId.AVALANCHE,
    parsedAmounts[Field.CURRENCY_B],
    chainId ? ROUTER_ADDRESS[chainId] : ROUTER_ADDRESS[ChainId.AVALANCHE],
  );

  const addTransaction = useTransactionAdder();

  async function onAdd() {
    console.log(library);
    if (!chainId || !library || !account) return;
    const router = getRouterContract(chainId, library, account);

    const { [Field.CURRENCY_A]: parsedAmountA, [Field.CURRENCY_B]: parsedAmountB } = parsedAmounts;
    if (!parsedAmountA || !parsedAmountB || !currencyA || !currencyB || !deadline) {
      return;
    }

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(parsedAmountA, noLiquidity ? 0 : allowedSlippage)[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(parsedAmountB, noLiquidity ? 0 : allowedSlippage)[0],
    };

    let estimate,
      method: (...args: any) => Promise<TransactionResponse>,
      args: Array<string | string[] | number>,
      value: BigNumber | null;
    if (currencyA === CAVAX[chainId] || currencyB === CAVAX[chainId]) {
      const tokenBIsETH = currencyB === CAVAX[chainId];
      estimate = router.estimateGas.addLiquidityAVAX;
      method = router.addLiquidityAVAX;
      args = [
        wrappedCurrency(tokenBIsETH ? currencyA : currencyB, chainId)?.address ?? '', // token
        (tokenBIsETH ? parsedAmountA : parsedAmountB).raw.toString(), // token desired
        amountsMin[tokenBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(), // token min
        amountsMin[tokenBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(), // eth min
        account,
        deadline.toHexString(),
      ];
      value = BigNumber.from((tokenBIsETH ? parsedAmountB : parsedAmountA).raw.toString());
    } else {
      estimate = router.estimateGas.addLiquidity;
      method = router.addLiquidity;
      args = [
        wrappedCurrency(currencyA, chainId)?.address ?? '',
        wrappedCurrency(currencyB, chainId)?.address ?? '',
        parsedAmountA.raw.toString(),
        parsedAmountB.raw.toString(),
        amountsMin[Field.CURRENCY_A].toString(),
        amountsMin[Field.CURRENCY_B].toString(),
        account,
        deadline.toHexString(),
      ];
      value = null;
    }

    setAttemptingTxn(true);
    await estimate(...args, value ? { value } : {})
      .then(estimatedGasLimit =>
        method(...args, {
          ...(value ? { value } : {}),
          gasLimit: calculateGasMargin(estimatedGasLimit),
        }).then(response => {
          setAttemptingTxn(false);

          addTransaction(response, {
            summary:
              'Add ' +
              parsedAmounts[Field.CURRENCY_A]?.toSignificant(3) +
              ' ' +
              currencies[Field.CURRENCY_A]?.symbol +
              ' and ' +
              parsedAmounts[Field.CURRENCY_B]?.toSignificant(3) +
              ' ' +
              currencies[Field.CURRENCY_B]?.symbol,
          });

          setTxHash(response.hash);

          ReactGA.event({
            category: 'Liquidity',
            action: 'Add',
            label: [currencies[Field.CURRENCY_A]?.symbol, currencies[Field.CURRENCY_B]?.symbol].join('/'),
          });
        }),
      )
      .catch(error => {
        setAttemptingTxn(false);
        // we only care if the error is something _other_ than the user rejected the tx
        if (error?.code !== 4001) {
          console.error(error);
        }
      });
  }

  const modalHeader = () => {
    return noLiquidity ? (
      <AutoColumn gap="20px">
        <LightCard mt="20px" borderRadius="20px">
          <RowFlat>
            <Text fontSize="48px" fontWeight={500} lineHeight="42px" marginRight={10}>
              {currencies[Field.CURRENCY_A]?.symbol + '/' + currencies[Field.CURRENCY_B]?.symbol}
            </Text>
            <DoubleCurrencyLogo
              currency0={currencies[Field.CURRENCY_A]}
              currency1={currencies[Field.CURRENCY_B]}
              size={30}
            />
          </RowFlat>
        </LightCard>
      </AutoColumn>
    ) : (
      <AutoColumn gap="20px">
        <RowFlat style={{ marginTop: '20px' }}>
          <Text fontSize="48px" fontWeight={500} lineHeight="42px" marginRight={10}>
            {liquidityMinted?.toSignificant(6)}
          </Text>
          <DoubleCurrencyLogo
            currency0={currencies[Field.CURRENCY_A]}
            currency1={currencies[Field.CURRENCY_B]}
            size={30}
          />
        </RowFlat>
        <Row>
          <Text fontSize="24px">
            {currencies[Field.CURRENCY_A]?.symbol + '/' + currencies[Field.CURRENCY_B]?.symbol + ' Pool Tokens'}
          </Text>
        </Row>
        <span className="italic">
          {`Output is estimated. If the price changes by more than ${
            allowedSlippage / 100
          }% your transaction will revert.`}
        </span>
      </AutoColumn>
    );
  };

  const modalBottom = () => {
    return (
      <ConfirmAddModalBottom
        price={price}
        currencies={currencies}
        parsedAmounts={parsedAmounts}
        noLiquidity={noLiquidity}
        onAdd={onAdd}
        poolTokenPercentage={poolTokenPercentage}
      />
    );
  };

  const pendingText = `Supplying ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} ${
    currencies[Field.CURRENCY_A]?.symbol
  } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} ${currencies[Field.CURRENCY_B]?.symbol}`;

  const handleCurrencyASelect = useCallback(
    (currencyA: Currency) => {
      const newCurrencyIdA = currencyId(currencyA);
      if (newCurrencyIdA === currencyIdB) {
        navigate(`/add/${currencyIdB}/${currencyIdA}`);
      } else {
        navigate(`/add/${newCurrencyIdA}/${currencyIdB}`);
      }
    },
    [currencyIdA, currencyIdB],
  );

  const handleCurrencyBSelect = useCallback(
    (currencyB: Currency) => {
      const newCurrencyIdB = currencyId(currencyB);
      if (currencyIdA === newCurrencyIdB) {
        if (currencyIdB) {
          navigate(`/add/${currencyIdB}/${newCurrencyIdB}`);
        } else {
          navigate(`/add/${newCurrencyIdB}`);
        }
      } else {
        navigate(
          `/add/${currencyIdA ? currencyIdA : /*chainId == ChainId.SCROLL ? 'ETH' : */ 'AVAX'}/${newCurrencyIdB}`,
        );
      }
    },
    [currencyIdA, currencyIdB],
  );

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false);
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onFieldAInput('');
    }
    setTxHash('');
  }, [onFieldAInput, txHash]);

  const isCreate = pathname.includes('/create');

  return (
    <>
      <div className="bg-background p-8 rounded-lg lg:w-full lg:max-w-[500px] m-auto flex flex-col gap-4">
        <AddRemoveTabs creating={isCreate} adding={true} />
        <Wrapper className="tt">
          <TransactionConfirmationModal
            isOpen={showConfirm}
            onDismiss={handleDismissConfirmation}
            attemptingTxn={attemptingTxn}
            hash={txHash}
            content={() => (
              <ConfirmationModalContent
                title={noLiquidity ? 'You are creating a pool' : 'You will receive'}
                onDismiss={handleDismissConfirmation}
                topContent={modalHeader}
                bottomContent={modalBottom}
              />
            )}
            pendingText={pendingText}
          />
          <div className="flex flex-col gap-4">
            {noLiquidity ||
              (isCreate && (
                <Alert variant="information">
                  <Info />
                  <AlertTitle>You are the first liquidity provider.</AlertTitle>
                  <AlertDescription>The ratio of tokens you add will set the price of this pool.</AlertDescription>
                  <AlertDescription>Once you are happy with the rate click supply to review.</AlertDescription>
                </Alert>
              ))}
            <CurrencyInputPanel
              value={formattedAmounts[Field.CURRENCY_A]}
              onUserInput={onFieldAInput}
              onMax={() => {
                onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '');
              }}
              onCurrencySelect={handleCurrencyASelect}
              showMaxButton={!atMaxAmounts[Field.CURRENCY_A]}
              currency={currencies[Field.CURRENCY_A]}
              id="add-liquidity-input-tokena"
              showCommonBases
            />
            <ColumnCenter>
              <Icons.plus className="size-4" />
            </ColumnCenter>
            <CurrencyInputPanel
              value={formattedAmounts[Field.CURRENCY_B]}
              onUserInput={onFieldBInput}
              onCurrencySelect={handleCurrencyBSelect}
              onMax={() => {
                onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '');
              }}
              showMaxButton={!atMaxAmounts[Field.CURRENCY_B]}
              currency={currencies[Field.CURRENCY_B]}
              id="add-liquidity-input-tokenb"
              showCommonBases
            />
            {currencies[Field.CURRENCY_A] && currencies[Field.CURRENCY_B] && pairState !== PairState.INVALID && (
              <div className="p-4 border rounded-lg flex flex-col gap-2">
                <div>
                  <h4 className="large font-normal">{noLiquidity ? 'Initial prices' : 'Prices'} and pool share</h4>
                </div>
                <div className="border-t py-4">
                  <PoolPriceBar
                    currencies={currencies}
                    poolTokenPercentage={poolTokenPercentage}
                    noLiquidity={noLiquidity}
                    price={price}
                  />
                </div>
              </div>
            )}

            {!account ? (
              <ConnectWalletButtonRainbow />
            ) : (
              <div className="flex gap-4">
                {(approvalA === ApprovalState.NOT_APPROVED ||
                  approvalA === ApprovalState.PENDING ||
                  approvalB === ApprovalState.NOT_APPROVED ||
                  approvalB === ApprovalState.PENDING) &&
                  isValid && (
                    <div className="flex gap-2">
                      {approvalA !== ApprovalState.APPROVED && (
                        <Button onClick={approveACallback} disabled={approvalA === ApprovalState.PENDING}>
                          {approvalA === ApprovalState.PENDING ? (
                            <Dots>Approving {currencies[Field.CURRENCY_A]?.symbol}</Dots>
                          ) : (
                            'Approve ' + currencies[Field.CURRENCY_A]?.symbol
                          )}
                        </Button>
                      )}
                      {approvalB !== ApprovalState.APPROVED && (
                        <Button onClick={approveBCallback} disabled={approvalB === ApprovalState.PENDING}>
                          {approvalB === ApprovalState.PENDING ? (
                            <Dots>Approving {currencies[Field.CURRENCY_B]?.symbol}</Dots>
                          ) : (
                            'Approve ' + currencies[Field.CURRENCY_B]?.symbol
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                <Button
                  block
                  variant={
                    !isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]
                      ? 'destructive'
                      : 'default'
                  }
                  onClick={() => {
                    expertMode ? onAdd() : setShowConfirm(true);
                  }}
                  disabled={!isValid || approvalA !== ApprovalState.APPROVED || approvalB !== ApprovalState.APPROVED}
                >
                  {error ?? 'Supply'}
                </Button>
              </div>
            )}
          </div>
        </Wrapper>
      </div>

      {pair && !noLiquidity && pairState !== PairState.INVALID ? (
        <AutoColumn style={{ minWidth: '20rem', width: '100%', maxWidth: '400px', marginTop: '1rem' }}></AutoColumn>
      ) : null}
    </>
  );
}
