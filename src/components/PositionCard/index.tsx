import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { BIG_INT_ZERO } from '@/constants';
import { useTotalSupply } from '@/data/TotalSupply';
import { useActiveWeb3React } from '@/hooks';
import { useTokenBalance } from '@/state/wallet/hooks';
import { currencyId } from '@/utils/currencyId';
import { unwrappedToken } from '@/utils/wrappedCurrency';
import { JSBI, Pair, Percent } from '@pangolindex/sdk';
import { Link } from 'react-router-dom';
import { Text } from 'rebass';
import { GreyCard, LightCard } from '../Card';
import { AutoColumn } from '../Column';
import CurrencyLogo from '../CurrencyLogoV3';
import { DoubleCurrencyLogo } from '../DoubleCurrencyLogo';
import { RowFixed } from '../Row';
import { Dots } from '../swap/styleds';

interface PositionCardProps {
  pair: Pair;
  showUnwrapped?: boolean;
  border?: string;
}

export function MinimalPositionCard({ pair, showUnwrapped = false, border }: PositionCardProps) {
  const { account } = useActiveWeb3React();

  const currency0 = showUnwrapped ? pair.token0 : unwrappedToken(pair.token0);
  const currency1 = showUnwrapped ? pair.token1 : unwrappedToken(pair.token1);

  const userPoolBalance = useTokenBalance(account ?? undefined, pair.liquidityToken);
  const totalPoolTokens = useTotalSupply(pair.liquidityToken);

  const poolTokenPercentage =
    !!userPoolBalance && !!totalPoolTokens && JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
      : undefined;

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    JSBI.greaterThan(totalPoolTokens.raw, BIG_INT_ZERO) &&
    JSBI.greaterThan(userPoolBalance.raw, BIG_INT_ZERO) &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? pair.getLiquidityValues(totalPoolTokens, userPoolBalance, { feeOn: false })
      : [undefined, undefined];

  return (
    <>
      {userPoolBalance && JSBI.greaterThan(userPoolBalance.raw, JSBI.BigInt(0)) ? (
        <GreyCard border={border}>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="position" className="border-none">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <DoubleCurrencyLogo currency0={currency0} currency1={currency1} margin={true} size={24} />
                  <div className="flex flex-col items-start">
                    <Text fontWeight={500} fontSize={16}>
                      Your position
                    </Text>
                    <Text fontWeight={500} fontSize={20}>
                      {currency0.symbol}/{currency1.symbol}
                    </Text>
                  </div>
                </div>
                <Text fontWeight={500} fontSize={20}>
                  {userPoolBalance ? userPoolBalance.toSignificant(4) : '-'}
                </Text>
              </AccordionTrigger>
              <AccordionContent>
                <AutoColumn gap="4px">
                  <div className="h-6 flex items-center justify-between">
                    <Text fontSize={16} fontWeight={500}>
                      Your pool share:
                    </Text>
                    <Text fontSize={16} fontWeight={500}>
                      {poolTokenPercentage ? poolTokenPercentage.toFixed(6) + '%' : '-'}
                    </Text>
                  </div>
                  <div className="h-6 flex items-center justify-between">
                    <Text fontSize={16} fontWeight={500}>
                      {currency0.symbol}:
                    </Text>
                    {token0Deposited ? (
                      <RowFixed>
                        <Text fontSize={16} fontWeight={500} marginLeft={'6px'}>
                          {token0Deposited?.toSignificant(6)}
                        </Text>
                      </RowFixed>
                    ) : (
                      '-'
                    )}
                  </div>
                  <div className="h-6 flex items-center justify-between">
                    <Text fontSize={16} fontWeight={500}>
                      {currency1.symbol}:
                    </Text>
                    {token1Deposited ? (
                      <RowFixed>
                        <Text fontSize={16} fontWeight={500} marginLeft={'6px'}>
                          {token1Deposited?.toSignificant(6)}
                        </Text>
                      </RowFixed>
                    ) : (
                      '-'
                    )}
                  </div>
                </AutoColumn>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </GreyCard>
      ) : (
        <LightCard>
          <h5 className="text-center">
            <span role="img" aria-label="wizard-icon">
              ⭐️
            </span>{' '}
            By adding liquidity you&apos;ll earn 0.3% of all trades on this pair proportional to your share of the pool.
            Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.
          </h5>
        </LightCard>
      )}
    </>
  );
}

export default function FullPositionCard({ pair, border }: PositionCardProps) {
  const { account } = useActiveWeb3React();

  const currency0 = unwrappedToken(pair.token0);
  const currency1 = unwrappedToken(pair.token1);

  const userPoolBalance = useTokenBalance(account ?? undefined, pair.liquidityToken);
  const totalPoolTokens = useTotalSupply(pair.liquidityToken);

  const poolTokenPercentage =
    !!userPoolBalance && !!totalPoolTokens && JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
      : undefined;

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    JSBI.greaterThan(totalPoolTokens.raw, BIG_INT_ZERO) &&
    JSBI.greaterThan(userPoolBalance.raw, BIG_INT_ZERO) &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? pair.getLiquidityValues(totalPoolTokens, userPoolBalance, { feeOn: false })
      : [undefined, undefined];

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="position" className="border-none bg-muted rounded-lg">
        <AccordionTrigger className="hover:no-underline px-6 py-6">
          <div className="flex items-center gap-3">
            <DoubleCurrencyLogo currency0={currency0} currency1={currency1} margin={true} size={24} />
            <Text fontWeight={500} fontSize={20}>
              {!currency0 || !currency1 ? <Dots>Loading</Dots> : `${currency0.symbol}/${currency1.symbol}`}
            </Text>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className='flex flex-col gap-4 p-6'>
            <div className="h-6 flex items-center justify-between">
              <Text fontSize={16} fontWeight={500}>
                Your pool tokens:
              </Text>
              <Text fontSize={16} fontWeight={500}>
                {userPoolBalance ? userPoolBalance.toSignificant(4) : '-'}
              </Text>
            </div>
            <div className="h-6 flex items-center justify-between">
              <RowFixed>
                <Text fontSize={16} fontWeight={500}>
                  Pooled {currency0.symbol}:
                </Text>
              </RowFixed>
              {token0Deposited ? (
                <RowFixed>
                  <Text fontSize={16} fontWeight={500} marginLeft={'6px'}>
                    {token0Deposited?.toSignificant(6)}
                  </Text>
                  <CurrencyLogo size={24} imageSize={48} style={{ marginLeft: '8px' }} currency={currency0} />
                </RowFixed>
              ) : (
                '-'
              )}
            </div>

            <div className="h-6 flex items-center justify-between">
              <RowFixed>
                <Text fontSize={16} fontWeight={500}>
                  Pooled {currency1.symbol}:
                </Text>
              </RowFixed>
              {token1Deposited ? (
                <RowFixed>
                  <Text fontSize={16} fontWeight={500} marginLeft={'6px'}>
                    {token1Deposited?.toSignificant(6)}
                  </Text>
                  <CurrencyLogo size={24} imageSize={48} style={{ marginLeft: '8px' }} currency={currency1} />
                </RowFixed>
              ) : (
                '-'
              )}
            </div>

            <div className="h-6 flex items-center justify-between">
              <Text fontSize={16} fontWeight={500}>
                Your pool share:
              </Text>
              <Text fontSize={16} fontWeight={500}>
                {poolTokenPercentage ? poolTokenPercentage.toFixed(2) + '%' : '-'}
              </Text>
            </div>

            <div className="flex items-center gap-4 w-full mt-2">
              <Link to={`/add/${currencyId(currency0)}/${currencyId(currency1)}`} className="flex-1">
                <Button className="w-full">Add</Button>
              </Link>
              <Link to={`/remove/${currencyId(currency0)}/${currencyId(currency1)}`} className="flex-1">
                <Button className="w-full">Remove</Button>
              </Link>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
