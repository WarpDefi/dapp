import { LightCard } from '@/components/Card';
import { AutoColumn, ColumnCenter } from '@/components/Column';
import CurrencyLogo from '@/components/CurrencyLogo';
import { Icons } from '@/components/icons';
import { FindPoolTabs } from '@/components/NavigationTabs';
import { MinimalPositionCard } from '@/components/PositionCard';
import CurrencySearchModal from '@/components/SearchModal/CurrencySearchModal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ConnectWalletButtonRainbow } from '@/components/ui/connect-wallet-button-rainbow';
import { CAVAX, ChainId, Currency, JSBI, TokenAmount } from '@pangolindex/sdk';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Text } from 'rebass';
import { PairState, usePair } from '../../data/ReservesPangolin';
import { useActiveWeb3React } from '../../hooks';
import { usePairAdder } from '../../state/user/hooks';
import { useTokenBalance } from '../../state/wallet/hooks';
import { currencyId } from '../../utils/currencyId';

enum Fields {
  TOKEN0 = 0,
  TOKEN1 = 1,
}

export default function PoolFinder() {
  const { account, chainId } = useActiveWeb3React();

  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [activeField, setActiveField] = useState<number>(Fields.TOKEN1);

  const [currency0, setCurrency0] = useState<Currency | null>(CAVAX[chainId ?? ChainId.AVALANCHE]);
  const [currency1, setCurrency1] = useState<Currency | null>(null);

  const [pairState, pair] = usePair(currency0 ?? undefined, currency1 ?? undefined);
  const addPair = usePairAdder();

  useEffect(() => {
    if (pair) {
      addPair(pair);
    }
  }, [pair, addPair]);

  const validPairNoLiquidity: boolean =
    pairState === PairState.NOT_EXISTS ||
    Boolean(
      pairState === PairState.EXISTS &&
        pair &&
        JSBI.equal(pair.reserve0.raw, JSBI.BigInt(0)) &&
        JSBI.equal(pair.reserve1.raw, JSBI.BigInt(0)),
    );

  const position: TokenAmount | undefined = useTokenBalance(account ?? undefined, pair?.liquidityToken);
  const hasPosition = Boolean(position && JSBI.greaterThan(position.raw, JSBI.BigInt(0)));

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      if (activeField === Fields.TOKEN0) {
        setCurrency0(currency);
      } else {
        setCurrency1(currency);
      }
    },
    [activeField],
  );

  const handleSearchDismiss = useCallback(() => {
    setShowSearch(false);
  }, [setShowSearch]);

  const prerequisiteMessage = !account ? (
    <ConnectWalletButtonRainbow />
  ) : (
    <Alert variant="information">
      <Icons.info />
      <AlertTitle>Select a token</AlertTitle>
      <AlertDescription>Select a token to find your liquidity.</AlertDescription>
    </Alert>
  );

  return (
    <div className="bg-background p-8 rounded-lg lg:w-full lg:max-w-[500px] m-auto flex flex-col gap-4">
      <FindPoolTabs />
      <div className="flex flex-col gap-4">
        <Button
          block
          variant="outline"
          className="h-12"
          onClick={() => {
            setShowSearch(true);
            setActiveField(Fields.TOKEN0);
          }}
        >
          {currency0 ? (
            <div className="flex items-center gap-4">
              <CurrencyLogo currency={currency0} />
              {currency0.symbol}
            </div>
          ) : (
            <small>Select a Token</small>
          )}
        </Button>

        <ColumnCenter>
          <Icons.plus className="size-4 text-primary" />
        </ColumnCenter>

        <Button
          block
          variant="outline"
          className="h-12"
          onClick={() => {
            setShowSearch(true);
            setActiveField(Fields.TOKEN1);
          }}
        >
          {currency1 ? (
            <div className="flex items-center gap-4">
              <CurrencyLogo currency={currency1} />
              {currency1.symbol}
            </div>
          ) : (
            <small>Select a Token</small>
          )}
        </Button>

        {hasPosition && (
          <ColumnCenter
            style={{ justifyItems: 'center', backgroundColor: '', padding: '12px 0px', borderRadius: '12px' }}
          >
            <Text textAlign="center" fontWeight={500}>
              Pool Found!
            </Text>
            <Link to={`/pool`}>
              <Text textAlign="center">Manage this pool.</Text>
            </Link>
          </ColumnCenter>
        )}

        {currency0 && currency1 ? (
          pairState === PairState.EXISTS ? (
            hasPosition && pair ? (
              <MinimalPositionCard pair={pair} border="1px solid #CED0D9" />
            ) : (
              <Alert>
                <Icons.inbox />
                <AlertTitle>No pool</AlertTitle>
                <AlertDescription>
                  You don’t have liquidity in this pool yet.
                  <Button asChild>
                    <Link to={`/add/${currencyId(currency0)}/${currencyId(currency1)}`}>Add liquidity</Link>
                  </Button>
                </AlertDescription>
              </Alert>
            )
          ) : validPairNoLiquidity ? (
            <Alert>
              <Icons.inbox />
              <AlertTitle>No pool</AlertTitle>
              <AlertDescription>
                No pool found.
                <Button asChild>
                  <Link to={`/add/${currencyId(currency0)}/${currencyId(currency1)}`}>Create a pool</Link>
                </Button>
              </AlertDescription>
            </Alert>
          ) : pairState === PairState.INVALID ? (
            <Alert variant="destructive">
              <Icons.x />
              <AlertTitle>Invalid pair</AlertTitle>
            </Alert>
          ) : pairState === PairState.LOADING ? (
            <Alert variant="information">
              <Icons.loader className="animate-spin" />
              <AlertTitle>Loading...</AlertTitle>
            </Alert>
          ) : null
        ) : (
          prerequisiteMessage
        )}
      </div>

      <CurrencySearchModal
        isOpen={showSearch}
        onCurrencySelect={handleCurrencySelect}
        onDismiss={handleSearchDismiss}
        showCommonBases
        selectedCurrency={(activeField === Fields.TOKEN0 ? currency1 : currency0) ?? undefined}
      />
    </div>
  );
}
