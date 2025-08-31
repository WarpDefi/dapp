import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChainId, Pair } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import poolImage from '../../assets/images/pool2.webp';
import FullPositionCard from '../../components/PositionCard';
import { Dots } from '../../components/swap/styleds';
import { usePairs } from '../../data/Reserves';
import { toV2LiquidityToken, useTrackedTokenPairs } from '../../state/user/hooks';
import { useTokenBalancesWithLoadingIndicator } from '../../state/wallet/hooks';
import { useActiveWeb3React } from '@/hooks';

export default function Pool() {
  const { account, chainId } = useActiveWeb3React();

  // fetch the user's balances of all tracked V2 LP tokens
  const trackedTokenPairs = useTrackedTokenPairs();
  const tokenPairsWithLiquidityTokens = useMemo(
    () =>
      trackedTokenPairs.map(tokens => ({
        liquidityToken: toV2LiquidityToken(tokens, chainId ? chainId : ChainId.AVALANCHE),
        tokens,
      })),
    [trackedTokenPairs, chainId],
  );
  const liquidityTokens = useMemo(
    () => tokenPairsWithLiquidityTokens.map(tpwlt => tpwlt.liquidityToken),
    [tokenPairsWithLiquidityTokens],
  );
  const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
    account ?? undefined,
    liquidityTokens,
  );

  // fetch the reserves for all V2 pools in which the user has a balance
  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
        v2PairsBalances[liquidityToken.address]?.greaterThan('0'),
      ),
    [tokenPairsWithLiquidityTokens, v2PairsBalances],
  );

  const v2Pairs = usePairs(liquidityTokensWithBalances.map(({ tokens }) => tokens));
  const v2IsLoading =
    fetchingV2PairBalances || v2Pairs?.length < liquidityTokensWithBalances.length || v2Pairs?.some(V2Pair => !V2Pair);

  const allV2PairsWithLiquidity = v2Pairs.map(([, pair]) => pair).filter((v2Pair): v2Pair is Pair => Boolean(v2Pair));

  const hasV1Liquidity = undefined;

  return (
    <>
      <PageHeader
        variant="pool"
        title="Liquidity Provider Rewards"
        description="Fees accumulate in real-time and are automatically added to your liquidity"
        image={poolImage}
      />
      <Tabs defaultValue="my-pools">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="pools" disabled>
              Pools
            </TabsTrigger>
            <TabsTrigger value="my-pools">My pools</TabsTrigger>
          </TabsList>
          <Button asChild>
            <Link to={/*chainId == ChainId.SCROLL ? "/create/ETH" : */ '/create/AVAX'}>Add / Create Liquidity</Link>
          </Button>
        </div>
        <TabsContent value="pools">Pools</TabsContent>
        <TabsContent value="my-pools" className="bg-background rounded-lg">
          <div className="flex flex-col space-y-4 p-8">
            {!account ? (
              <div className="text-center">Connect Wallet to view your liquidity.</div>
            ) : v2IsLoading ? (
              <div className="p-4 flex flex-col text-center space-y-2 border rounded-md text-muted-foreground">
                <Dots>Loading</Dots>
              </div>
            ) : allV2PairsWithLiquidity?.length > 0 ? (
              <>
                {allV2PairsWithLiquidity.map(v2Pair => (
                  <FullPositionCard key={v2Pair.liquidityToken.address} pair={v2Pair} />
                ))}
              </>
            ) : (
              <div className="p-4 flex flex-col text-center space-y-2 border rounded-md text-muted-foreground">
                <span>No liquidity found.</span>
                <span className="text-sm">
                  Important note: The liquidity added to farms is not visible on the pool page.
                </span>
              </div>
            )}
            <div className="text-center text-muted-foreground text-sm">
              {hasV1Liquidity ? 'Uniswap V1 liquidity found!' : "Don't see a pool you joined?"}{' '}
              <Link className="text-primary" to={hasV1Liquidity ? '/migrate/v1' : '/find'}>
                {hasV1Liquidity ? 'Migrate now.' : 'Import it.'}
              </Link>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
