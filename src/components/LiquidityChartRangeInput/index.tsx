import { Icons } from '@/components/icons';
import { useTailwindTheme } from '@/hooks/useTailwindTheme';
//import { useChainId } from '@/provider';
import { wrappedCurrency } from '@/state/stake/hooks';
import { format } from 'd3';
import { saturate } from 'polished';
import { FC, ReactNode, useCallback, useMemo } from 'react';
import { Loader } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { batch } from 'react-redux';
import { useDensityChartData } from 'src/hooks/chart/evm';
import { AutoColumn, ColumnCenter } from '../Column';
import { Text } from '../TextV3';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Chart } from './Chart';
import { Bound, FeeAmount, LiquidityChartRangeInputProps, ZOOM_LEVELS } from './types';
;
import { useActiveWeb3React } from '@/hooks';
import { useChainId } from '@/provider';

function InfoBox({ message, icon }: { message?: ReactNode; icon: ReactNode }) {
  return (
    <ColumnCenter style={{ height: '100%', justifyContent: 'center' }}>
      {icon}
      {message && (
        <Text padding={10} marginTop="20px" textAlign="center">
          {message}
        </Text>
      )}
    </ColumnCenter>
  );
}

const LiquidityChartRangeInput: FC<LiquidityChartRangeInputProps> = props => {
  const {
    currency0,
    currency1,
    feeAmount,
    ticksAtLimit,
    price,
    priceLower,
    priceUpper,
    onLeftRangeInput,
    onRightRangeInput,
    interactive,
  } = props;
  const { t } = useTranslation();
  const { colors } = useTailwindTheme();

  const chainId = useChainId();
  const tokenA = wrappedCurrency(currency0, chainId);
  const tokenB = wrappedCurrency(currency1, chainId);

  const isSorted = tokenA && tokenB && !tokenA.equals(tokenB) && tokenA?.sortsBefore(tokenB);

  const { isLoading, error, formattedData } = useDensityChartData({
    currencyA: currency0,
    currencyB: currency1,
    feeAmount,
  });

  const onBrushDomainChangeEnded = useCallback(
    (domain: [number, number], mode: string | undefined) => {
      let leftRangeValue = Number(domain[0]);
      const rightRangeValue = Number(domain[1]);

      if (leftRangeValue <= 0) {
        leftRangeValue = 1 / 10 ** 6;
      }

      batch(() => {
        // simulate user input for auto-formatting and other validations
        if (
          (!ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER] || mode === 'handle' || mode === 'reset') &&
          leftRangeValue > 0
        ) {
          leftRangeValue < 0.01
            ? onLeftRangeInput(leftRangeValue.toFixed(15))
            : onLeftRangeInput(leftRangeValue.toFixed(5));
        }

        if ((!ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER] || mode === 'reset') && rightRangeValue > 0) {
          // todo: remove this check. Upper bound for large numbers
          // sometimes fails to parse to tick.
          if (rightRangeValue < 1e35) {
            rightRangeValue < 0.01
              ? onRightRangeInput(rightRangeValue.toFixed(15))
              : onRightRangeInput(rightRangeValue.toFixed(5));
          }
        }
      });
    },
    [isSorted, onLeftRangeInput, onRightRangeInput, ticksAtLimit],
  );

  const interactiveStatus = interactive && Boolean(formattedData?.length);

  // const brushDomain: [number, number] | undefined = useMemo(() => {

  //   return leftPrice && rightPrice ? [leftPrice, rightPrice] : undefined;
  // }, [isSorted, priceLower, priceUpper]);

  const brushDomain: [number, number] | undefined = useMemo(() => {
    const leftPrice = isSorted ? priceLower : priceUpper?.invert();
    const rightPrice = isSorted ? priceUpper : priceLower?.invert();

    return leftPrice && rightPrice
      ? [parseFloat(leftPrice?.toSignificant(6)), parseFloat(rightPrice?.toSignificant(6))]
      : undefined;
  }, [isSorted, priceLower, priceUpper]);

  const brushLabelValue = useCallback(
    (d: 'w' | 'e', x: number) => {
      if (!price) return '';

      if (d === 'w' && ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER]) return '0';
      if (d === 'e' && ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER]) return '∞';

      const percent = (x < price ? -1 : 1) * ((Math.max(x, price) - Math.min(x, price)) / price) * 100;

      return price ? `${format(Math.abs(percent) > 1 ? '.2~s' : '.2~f')(percent)}%` : '';
    },
    [isSorted, price, ticksAtLimit],
  );

  const isUninitialized = !currency0 || !currency1 || (formattedData === undefined && !isLoading);
  return (
    <AutoColumn gap="md" style={{ minHeight: '200px' }}>
      {isUninitialized ? (
        <Alert variant="destructive">
          <Icons.inbox />
          <AlertTitle>Uninitialized</AlertTitle>
          <AlertDescription>Your position will appear here.</AlertDescription>
        </Alert>
      ) : isLoading ? (
        <InfoBox icon={<Loader size={40} />} />
      ) : error ? (
        <Alert variant="destructive">
          <Icons.inbox />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Liquidity data not available.</AlertDescription>
        </Alert>
      ) : !formattedData || formattedData.length === 0 || !price ? (
        <Alert variant="destructive">
          <Icons.cloudOff />
          <AlertTitle>No data</AlertTitle>
          <AlertDescription>There is no liquidity data.</AlertDescription>
        </Alert>
      ) : (
        <div className="border border-muted rounded-lg p-3 gap-2 bg-slate-50 dark:bg-muted">
          <Chart
            data={{ series: formattedData, current: price }}
            dimensions={{ width: 400, height: 200 }}
            margins={{ top: 0, right: 0, bottom: 24, left: 0 }}
            styles={{
              area: {
                selection: '#57cb7a',
              },
              brush: {
                handle: {
                  west: saturate(0.1, '#57cb7a'),
                  east: saturate(0.1, '#57cb7a'),
                },
              },
            }}
            interactive={interactiveStatus}
            brushLabels={brushLabelValue}
            brushDomain={brushDomain}
            onBrushDomainChange={onBrushDomainChangeEnded}
            zoomLevels={ZOOM_LEVELS[feeAmount ?? FeeAmount.MEDIUM]}
            ticksAtLimit={ticksAtLimit}
          />
        </div>
      )}
    </AutoColumn>
  );
};

export default LiquidityChartRangeInput;
