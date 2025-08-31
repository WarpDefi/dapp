import { DoubleCurrencyLogoV2 } from '@/components/DoubleLogoNew';
import { Stat } from '@/components/Stat';
import TransactionCompleted from '@/components/TransactionCompleted';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { Modal } from '@/components/ui/modal';
import { useActiveWeb3React } from '@/hooks';
import { useChainId } from '@/provider';
//import { useChainId } from '@/provider';
import { Bound, Field } from '@/state/mint/atom';
import { formatTickPrice } from '@/utils/formatTickPrice';
import { unwrappedTokenV3 } from '@/utils/wrappedCurrency';
import { Currency, Position } from '@pangolindex/sdk';
import { AlertTriangle } from 'react-feather';
import { useTranslation } from 'react-i18next';
;

interface ConfirmDrawerProps {
  isOpen: boolean;
  attemptingTxn: boolean;
  txHash: string | undefined;
  poolErrorMessage: string | undefined;
  onClose: () => void;
  onComplete: () => void;
  noLiquidity?: boolean;
  currencies: { [field in Field]?: Currency };
  onAdd: () => void;
  position: Position | undefined;
  ticksAtLimit: { [bound: string]: boolean | undefined };
}

const ConfirmDrawer = ({
  isOpen,
  onClose,
  onComplete,
  attemptingTxn,
  poolErrorMessage,
  txHash,
  noLiquidity,
  currencies,
  onAdd,
  position,
  ticksAtLimit,
}: ConfirmDrawerProps) => {
  const { t } = useTranslation();
  const chainId = useChainId();

  const currency0 = position?.pool?.token0 ? unwrappedTokenV3(position?.pool?.token0, chainId) : undefined;
  const currency1 = position?.pool?.token1 ? unwrappedTokenV3(position?.pool?.token1, chainId) : undefined;

  const baseCurrencyDefault = currencies[Field.CURRENCY_A];

  const baseCurrency = baseCurrencyDefault
    ? baseCurrencyDefault === currency0
      ? currency0
      : baseCurrencyDefault === currency1
        ? currency1
        : currency0
    : currency0;

  const sorted = baseCurrency === currency0;
  const quoteCurrency = sorted ? currency1 : currency0;

  const price = sorted ? position?.pool.priceOf(position?.pool?.token0) : position?.pool.priceOf(position?.pool.token1);

  const priceLower = sorted ? position?.token0PriceLower : position?.token0PriceUpper.invert();
  const priceUpper = sorted ? position?.token0PriceUpper : position?.token0PriceLower.invert();

  const pendingText = `${t('pool.supplying')}`;

  function renderDetailConfirmContentButton() {
    return <Button onClick={onAdd}>{noLiquidity ? 'Create pool & supply' : 'Confirm supply'}</Button>;
  }

  const DetailConfirmContent = (
    <div className="flex flex-col gap-4">
      <div>
        <div className="flex gap-3">
          <DoubleCurrencyLogoV2 currency0={currency0} currency1={currency1} size={32} />

          <h3>{currency0?.symbol + '/' + currency1?.symbol}</h3>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Stat
            title={`${currency0?.symbol ? currency0?.symbol : ''} deposited`}
            stat={`${position?.amount0 ? position?.amount0?.toSignificant(4) : '-'}`}
            titlePosition="top"
            titleFontSize={12}
            statFontSize={[26, 20]}
            titleColor="text2"
            currency={currency0}
            statfontWeight={'600'}
          />

          <Stat
            title={`${currency1?.symbol ? currency1?.symbol : ''} deposited`}
            stat={`${position?.amount1 ? position?.amount1?.toSignificant(4) : '-'}`}
            titlePosition="top"
            titleFontSize={12}
            statFontSize={[26, 20]}
            titleColor="text2"
            currency={currency1}
            statfontWeight={'600'}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Stat
            title={`Min price (${quoteCurrency?.symbol} / ${baseCurrency?.symbol})`}
            stat={formatTickPrice({
              price: priceLower,
              atLimit: ticksAtLimit,
              direction: Bound.LOWER,
            })}
            titlePosition="top"
            titleFontSize={12}
            statFontSize={[26, 20]}
            titleColor="text2"
            statfontWeight={'600'}
          />

          <Stat
            title={`Max price (${quoteCurrency?.symbol} / ${baseCurrency?.symbol})`}
            stat={formatTickPrice({
              price: priceUpper,
              atLimit: ticksAtLimit,
              direction: Bound.UPPER,
            })}
            titlePosition="top"
            titleFontSize={12}
            statFontSize={[24, 20]}
            titleColor="text2"
            statfontWeight={'600'}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Stat
            title={`Current price (${quoteCurrency?.symbol} / ${baseCurrency?.symbol})`}
            stat={`${price ? price.toSignificant(5) : 0}`}
            titlePosition="top"
            titleFontSize={12}
            statFontSize={[24, 20]}
            titleColor="text2"
            statfontWeight={'600'}
          />

          <Stat
            title="Fee tier"
            stat={`${(position?.pool?.fee ?? 0) / 10000}%`}
            titlePosition="top"
            titleFontSize={12}
            statFontSize={[24, 20]}
            titleColor="text2"
            statfontWeight={'600'}
          />
        </div>
      </div>
      {renderDetailConfirmContentButton()}
    </div>
  );

  const PendingContent = <Loader label={pendingText} />;

  const ErrorContent = (
    <Alert variant="destructive">
      <AlertTriangle />
      <AlertDescription>{poolErrorMessage}</AlertDescription>
      <div>
        <Button variant="destructive" onClick={onClose}>
          Dismiss
        </Button>
      </div>
    </Alert>
  );

  const SubmittedContent = (
    <TransactionCompleted
      submitText={t('pool.liquidityAdded')}
      isShowButton={true}
      onButtonClick={() => {
        onComplete();
      }}
      buttonText={t('transactionConfirmation.close')}
    />
  );

  const renderBody = () => {
    if (txHash) {
      return SubmittedContent;
    }

    if (attemptingTxn) {
      return PendingContent;
    }

    if (poolErrorMessage) {
      return ErrorContent;
    }

    return DetailConfirmContent;
  };

  function getTitle() {
    if (txHash) {
      return 'Success';
    }

    if (poolErrorMessage) {
      return 'Error';
    }

    return 'Summary';
  }

  return (
    <Modal
      title={getTitle()}
      isOpen={isOpen}
      onClose={() => {
        onClose();
      }}
    >
      {renderBody()}
    </Modal>
  );
};

export default ConfirmDrawer;
