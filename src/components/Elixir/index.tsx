import AddLiquidity from '@/components/AddLiquidity';
import DetailModal from '@/components/DetailModal';
import { Icons } from '@/components/icons';
import PoolList from '@/components/PoolList';
import PoolListV2 from '@/components/PoolListV2';
import PositionCard from '@/components/PositionCardElixir';
import PositionList from '@/components/PositionList';
import { SortingType } from '@/components/PositionList/types';
import { MenuType } from '@/components/Sidebar/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Loader } from '@/components/ui/loader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BIG_INT_ZERO } from '@/constants';
//import { useChainId } from '@/hooks';
import { useTransformedVolumeData } from '@/hooks/chart';
import useDebounce from '@/hooks/useDebounce';
import usePrevious from '@/hooks/usePrevious';
import { useActiveNetworkVersion } from '@/state/applicationInfo/hooks';
import { useMintActionHandlers } from '@/state/mint/hooksElixir';
import { useProtocolChartData, useProtocolData } from '@/state/protocol/hooks';
import { useGetUserPositionsHook } from '@/state/wallet/hooks/index';
import { PositionDetails } from '@/state/wallet/types';
import { VolumeWindow } from '@/types';
import { unixToDate } from '@/utils/data';
import { formatDollarAmount } from '@/utils/numbers';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { LoaderAreaChart } from '../ui/loader-area-chart';
import { LoaderBarChart } from '../ui/loader-bar-chart';
import PoolListAll from '../PoolListAll';
import { useActiveWeb3React } from '@/hooks';
import { useChainId } from '@/provider';
import { useTokenBalancesWithLoadingIndicator } from '@/state/wallet/hooks';
import { toV2LiquidityToken, useTrackedTokenPairs } from '@/state/user/hooks';
import { ChainId, Pair } from '@pangolindex/sdk';
import { usePairs } from '@/data/Reserves';
import { Dots } from '../swap/styleds';
import FullPositionCard from '../PositionCard';

type SelectedStateType = {
  value: string | number | undefined;
  date: string | undefined;
};

const Elixir = () => {
  const { t } = useTranslation();
  const chainId = useChainId();
  const { account } = useActiveWeb3React();
  const navigate = useNavigate();
  const useGetUserPositions = useGetUserPositionsHook[chainId];
  const { positions, loading: positionsLoading } = useGetUserPositions();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, 250);
  const [activeMenu, setMenu] = useState<string>(MenuType.v3pools);
  const [detailModalIsOpen, setDetailModalIsOpen] = useState<boolean>(false);
  const [addLiquidityIsOpen, setAddLiquidityIsOpen] = useState<boolean>(false);
  const [selectedPositionTokenId, setSelectedPositionTokenId] = useState<string | undefined>(undefined);
  const [selectedTVL, setSelectedTVL] = useState<SelectedStateType>({
    value: undefined,
    date: undefined,
  });
  const [selectedVolume, setSelectedVolume] = useState<SelectedStateType>({
    value: undefined,
    date: undefined,
  });
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
  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
        v2PairsBalances[liquidityToken.address]?.greaterThan('0'),
      ),
    [tokenPairsWithLiquidityTokens, v2PairsBalances],
  );
  const v2Pairs = usePairs(liquidityTokensWithBalances.map(({ tokens }) => tokens));
  const allV2PairsWithLiquidity = v2Pairs.map(([, pair]) => pair).filter((v2Pair): v2Pair is Pair => Boolean(v2Pair));
  const hasV1Liquidity = undefined;
  const [activePoint, setActivePoint] = useState(null);
  const [volumeActivePoint, setVolumeActivePoint] = useState(null);
  const prevActivePoint = usePrevious<{ payload: { time: string } }>(activePoint);
  const prevVolumeActivePoint = usePrevious<{ payload: { time: string } }>(volumeActivePoint);
  const NOW = moment(Date.now()).format('DD.MM.YYYY');

  const v2IsLoading =
    fetchingV2PairBalances || v2Pairs?.length < liquidityTokensWithBalances.length || v2Pairs?.some(V2Pair => !V2Pair);

  const menuItems: Array<{ label: string; value: string }> = Object.keys(MenuType).map((key: string) => ({
    label: t(`pv3.${MenuType[key as keyof typeof MenuType]}`),
    value: MenuType[key as keyof typeof MenuType],
  }));

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value.trim());
  }, []);

  const sort = (positions: PositionDetails[]) => {
    switch (sortBy) {
      case SortingType.liquidity:
        return [...positions].sort((info_a, info_b) =>
          info_a?.liquidity?.gte(info_b?.liquidity ?? BIG_INT_ZERO) ? -1 : 1,
        );
      case SortingType.apr:
        return [...positions].sort((a, b) => (b?.fee ?? 0) - (a?.fee ?? 0));
      default:
        return positions;
    }
  };

  const [openPositions, closedPositions] = useMemo(() => {
    return (
      positions?.reduce<[PositionDetails[], PositionDetails[]]>(
        (acc, p) => {
          acc[p.liquidity?.isZero() ? 1 : 0].push(p);
          return acc;
        },
        [[], []],
      ) ?? [[], []]
    );
  }, [positions]);

  const filteredPositions = useMemo(() => {
    switch (activeMenu) {
      case MenuType.allPositions:
        return [...openPositions, ...closedPositions];
      case MenuType.openPositions:
        return openPositions;
      case MenuType.closedPositions:
        return closedPositions;
      default:
        return [];
    }
  }, [activeMenu, closedPositions, openPositions]);

  const finalPositions = useMemo(() => {
    let positions: PositionDetails[] = filteredPositions;
    if (searchQuery) {
      positions = filteredPositions.filter(position => {
        return (
          (position?.token0?.symbol || '').toUpperCase().includes(debouncedSearchQuery.toUpperCase()) ||
          (position?.token1?.symbol || '').toUpperCase().includes(debouncedSearchQuery.toUpperCase())
        );
      });
    }

    if (sortBy) {
      positions = sort(positions) ?? positions;
    }

    return positions;
  }, [filteredPositions, debouncedSearchQuery, sortBy]);

  const selectedPosition = useMemo(() => {
    if (!finalPositions) {
      // If finalPositions is undefined, there's no selected position
      return undefined;
    } else {
      // If the selected position no longer exists in the final positions, clear the selection
      const selectedPositionExists = finalPositions.some(
        position => position.tokenId.toString() === selectedPositionTokenId,
      );

      if (!selectedPositionExists) {
        return undefined;
      } else {
        // If selectedPosition still exists but its data might have changed
        // Find the new data from finalPositions and update selectedPosition
        const newSelectedPosition = finalPositions.find(
          position => position.tokenId.toString() === selectedPositionTokenId,
        );

        if (newSelectedPosition) {
          return newSelectedPosition;
        }
      }
    }
  }, [finalPositions, selectedPositionTokenId]); // selectedPositionTokenId is a new state you'll need to create.

  const handleSetMenu = useCallback(
    (value: string) => {
      setMenu(value);
    },
    [setMenu],
  );

  const onChangeDetailModalStatus = useCallback(
    (position: PositionDetails | undefined) => {
      setDetailModalIsOpen(!detailModalIsOpen);
      setSelectedPositionTokenId(position?.tokenId.toString());
    },
    [detailModalIsOpen],
  );

  const onChangeAddLiquidityStatus = useCallback(() => {
    setAddLiquidityIsOpen(!addLiquidityIsOpen);
  }, [addLiquidityIsOpen]);

  const navigateV2Liquidity = () => {
    navigate('/add');
  };

  const openAddLiquidityModal = () => {
    setAddLiquidityIsOpen(true);
  };

  const { onResetMintState } = useMintActionHandlers(undefined);
  const [activeNetwork] = useActiveNetworkVersion();
  const [chartData] = useProtocolChartData();
  const [protocolData] = useProtocolData();

  useEffect(() => {
    setSelectedTVL({
      value: undefined,
      date: NOW,
    });

    setSelectedVolume({
      value: undefined,
      date: NOW,
    });
  }, [activeNetwork]);

  // if hover value undefined, reset to current day value
  useEffect(() => {
    if (selectedVolume.value === undefined && protocolData) {
      setSelectedVolume({ value: formatDollarAmount(protocolData.volumeUSD + 300000, 2, true), date: NOW });
    }
  }, [selectedVolume, protocolData]);

  useEffect(() => {
    if (selectedTVL.value === undefined && protocolData) {
      setSelectedTVL({ value: formatDollarAmount(protocolData.tvlUSD, 2, true), date: NOW });
    }
  }, [selectedTVL, protocolData]);

  const formattedTvlData = useMemo(() => {
    if (chartData) {
      return chartData.map(day => {
        return {
          time: unixToDate(day.date),
          value: day.tvlUSD,
        };
      });
    } else {
      return [];
    }
  }, [chartData]);

  const formattedVolumeData = useMemo(() => {
    if (chartData) {
      return chartData.map(day => {
        return {
          time: unixToDate(day.date),
          value: day.volumeUSD,
        };
      });
    } else {
      return [];
    }
  }, [chartData]);

  const weeklyVolumeData = useTransformedVolumeData(chartData, 'week');
  const monthlyVolumeData = useTransformedVolumeData(chartData, 'month');

  const [volumeWindow, setVolumeWindow] = useState(VolumeWindow.daily);

  const volumeData = () => {
    switch (volumeWindow) {
      case VolumeWindow.daily:
        return formattedVolumeData;
      case VolumeWindow.weekly:
        return weeklyVolumeData;
      case VolumeWindow.monthly:
        return monthlyVolumeData;
      default:
        return formattedVolumeData;
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-rows-2 lg:grid-cols-2 lg:grid-rows-none gap-4">
        <div className="bg-background rounded-lg p-4 lg:p-8 flex flex-col gap-8">
          <div className="flex flex-col">
            TVL
            <h2 className="font-semibold text-4xl">{selectedTVL.value ?? '-'}</h2>
            <small className="text-muted-foreground">{selectedTVL.date} (UTC)</small>
          </div>
          <div className="w-full h-[54px] lg:h-[96px]">
            {!formattedTvlData.length ? (
              <LoaderAreaChart />
            ) : (
              <ResponsiveContainer>
                <AreaChart
                  margin={{ top: 0, left: 0, right: 0, bottom: 0 }}
                  data={formattedTvlData}
                  onMouseMove={e => {
                    if (e.activePayload && e.activePayload.length) {
                      if (prevActivePoint && prevActivePoint.payload.time === e.activePayload[0].payload.time) {
                        return;
                      }

                      setActivePoint(e.activePayload[0]);
                      setSelectedTVL({
                        value: formatDollarAmount(e.activePayload[0].value),
                        date: moment(e.activePayload[0].payload.time).format('DD.MM.YYYY'),
                      });
                    } else {
                      setActivePoint(null);
                      setSelectedTVL({
                        value: undefined,
                        date: NOW,
                      });
                    }
                  }}
                  onMouseLeave={() => {
                    setActivePoint(null);
                    setSelectedTVL({
                      value: undefined,
                      date: NOW,
                    });
                  }}
                >
                  <defs>
                    <linearGradient id="chartBg" x1={0} y1={0} x2={0} y2={1}>
                      <stop offset="5%" stopColor="#ffa739" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ffa739" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={value => moment(value).format('DD')}
                  />
                  <YAxis dataKey="value" hide axisLine={false} tick={false} />
                  <Area dataKey="value" strokeWidth="2" stroke="#ffa739" fill="url(#chartBg)" />
                  <Tooltip content={() => null} cursor={{ stroke: '#eee', strokeWidth: 1 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="bg-background rounded-lg p-4 lg:p-8 flex flex-col gap-8">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              Volume 24H
              <h2 className="font-semibold text-4xl">{selectedVolume.value ?? '-'}</h2>
              <small className="text-muted-foreground">{selectedVolume.date} (UTC)</small>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={volumeWindow === VolumeWindow.daily ? 'default' : 'secondary'}
                onClick={() => setVolumeWindow(VolumeWindow.daily)}
              >
                D
              </Button>
              <Button
                variant={volumeWindow === VolumeWindow.weekly ? 'default' : 'secondary'}
                onClick={() => setVolumeWindow(VolumeWindow.weekly)}
              >
                W
              </Button>
              <Button
                variant={volumeWindow === VolumeWindow.monthly ? 'default' : 'secondary'}
                onClick={() => setVolumeWindow(VolumeWindow.monthly)}
              >
                M
              </Button>
            </div>
          </div>
          <div className="w-full h-[54px] lg:h-[96px]">
            {!volumeData().length ? (
              <LoaderBarChart />
            ) : (
              <ResponsiveContainer>
                <BarChart
                  margin={{ top: 0, left: 0, right: 0, bottom: 0 }}
                  data={volumeData()}
                  onMouseMove={e => {
                    if (e.activePayload && e.activePayload.length) {
                      if (
                        prevVolumeActivePoint &&
                        prevVolumeActivePoint.payload.time === e.activePayload[0].payload.time
                      ) {
                        return;
                      }

                      setVolumeActivePoint(e.activePayload[0]);
                      setSelectedVolume({
                        value: formatDollarAmount(e.activePayload[0].value + 300000),
                        date: moment(e.activePayload[0].payload.time).format('DD.MM.YYYY'),
                      });
                    } else {
                      setVolumeActivePoint(null);
                      setSelectedVolume({
                        value: undefined,
                        date: NOW,
                      });
                    }
                  }}
                  onMouseLeave={() => {
                    setVolumeActivePoint(null);
                    setSelectedVolume({
                      value: undefined,
                      date: NOW,
                    });
                  }}
                >
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={value => moment(value).format('DD')}
                  />
                  <YAxis hide />
                  <Tooltip content={() => null} cursor={{ stroke: '#eee', strokeWidth: 1 }} />
                  <Bar dataKey="value" fill="#ffa739" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
      <Tabs
        defaultValue={MenuType.v3pools}
        onValueChange={value => {
          if (value !== MenuType.v3pools) {
            setMenu(MenuType.allPositions);
          } else {
            setMenu(value);
          }
        }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
          <TabsList>
            <TabsTrigger value={MenuType.allpools}>All Pools</TabsTrigger>
            <TabsTrigger value={MenuType.v3pools}>V3 Pools</TabsTrigger>
            <TabsTrigger value={MenuType.v2pools}>V2 Pools</TabsTrigger>
            <TabsTrigger value="myPositions">My Positions</TabsTrigger>
          </TabsList>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" block className="flex items-center w-full md:w-auto">
                <Icons.plus className="mr-2 size-4" />
                New pool
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem className="relative" onClick={openAddLiquidityModal}>
                V3 <small className="absolute top-1.5 left-7 text-primary text-[10px]">NEW</small>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={navigateV2Liquidity}>V2 (LEGACY)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <TabsContent className="p-4 lg:p-8 bg-background rounded-lg shadow-sm" value={MenuType.allpools}>
          <PoolListAll setMenu={handleSetMenu} activeMenu={activeMenu} menuItems={menuItems} />
        </TabsContent>
        <TabsContent className="p-4 lg:p-8 bg-background rounded-lg shadow-sm" value={MenuType.v3pools}>
          <PoolList setMenu={handleSetMenu} activeMenu={activeMenu} menuItems={menuItems} />
        </TabsContent>
        <TabsContent className="p-4 lg:p-8 bg-background rounded-lg shadow-sm" value={MenuType.v2pools}>
          <PoolListV2 setMenu={handleSetMenu} activeMenu={activeMenu} menuItems={menuItems} />
        </TabsContent>
        <TabsContent className="p-4 lg:p-8 bg-background rounded-lg shadow-sm" value="myPositions">
          <Tabs defaultValue="v3-positions" className="w-full">
            <TabsList>
              <TabsTrigger value="v3-positions">V3 Positions</TabsTrigger>
              <TabsTrigger value="v2-positions">V2 Positions</TabsTrigger>    
            </TabsList>
            <TabsContent value="v3-positions">
              <Tabs defaultValue={MenuType.allPositions} onValueChange={handleSetMenu}>
                <div className="flex flex-col gap-2 md:flex-row md:gap-4">
                  <TabsList className="flex justify-start w-full">
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <TabsTrigger value={MenuType.allPositions}>All</TabsTrigger>
                        <TabsTrigger value={MenuType.openPositions}>Open</TabsTrigger>
                        <TabsTrigger value={MenuType.closedPositions}>Closed</TabsTrigger>
                      </div>
                    </div>
                  </TabsList>
                </div>
                <TabsContent value={MenuType.allPositions}>
                  <PositionList
                    setMenu={handleSetMenu}
                    activeMenu={activeMenu}
                    menuItems={menuItems}
                    handleSearch={handleSearch}
                    onChangeSortBy={setSortBy}
                    sortBy={sortBy}
                    searchQuery={searchQuery}
                    isLoading={false}
                    doesNotPoolExist={finalPositions?.length === 0}
                  >
                    {finalPositions.map(position => (
                      <PositionCard
                        key={position.tokenId.toString()}
                        token0={position.token0}
                        token1={position.token1}
                        feeAmount={position.fee}
                        tokenId={position.tokenId}
                        liquidity={position.liquidity}
                        tickLower={position.tickLower}
                        tickUpper={position.tickUpper}
                        onClick={() => {
                          onChangeDetailModalStatus(position);
                        }}
                      />
                    ))}
                  </PositionList>
                </TabsContent>
                <TabsContent value={MenuType.openPositions}>
                  {positionsLoading ? (
                    <Loader label="Loading open positions..." />
                  ) : (
                    <PositionList
                      setMenu={handleSetMenu}
                      activeMenu={activeMenu}
                      menuItems={menuItems}
                      handleSearch={handleSearch}
                      onChangeSortBy={setSortBy}
                      sortBy={sortBy}
                      searchQuery={searchQuery}
                      isLoading={false}
                      doesNotPoolExist={finalPositions?.length === 0}
                    >
                      {finalPositions.map(position => (
                        <PositionCard
                          key={position.tokenId.toString()}
                          token0={position.token0}
                          token1={position.token1}
                          feeAmount={position.fee}
                          tokenId={position.tokenId}
                          liquidity={position.liquidity}
                          tickLower={position.tickLower}
                          tickUpper={position.tickUpper}
                          onClick={() => {
                            onChangeDetailModalStatus(position);
                          }}
                        />
                      ))}
                    </PositionList>
                  )}
                </TabsContent>
                <TabsContent value={MenuType.closedPositions}>
                  {positionsLoading ? (
                    <Loader label="Loading closed positions..." />
                  ) : (
                    <PositionList
                      setMenu={handleSetMenu}
                      activeMenu={activeMenu}
                      menuItems={menuItems}
                      handleSearch={handleSearch}
                      onChangeSortBy={setSortBy}
                      sortBy={sortBy}
                      searchQuery={searchQuery}
                      isLoading={false}
                      doesNotPoolExist={finalPositions?.length === 0}
                    >
                      {finalPositions.map(position => (
                        <PositionCard
                          key={position.tokenId.toString()}
                          token0={position.token0}
                          token1={position.token1}
                          feeAmount={position.fee}
                          tokenId={position.tokenId}
                          liquidity={position.liquidity}
                          tickLower={position.tickLower}
                          tickUpper={position.tickUpper}
                          onClick={() => {
                            onChangeDetailModalStatus(position);
                          }}
                        />
                      ))}
                    </PositionList>
                  )}
                </TabsContent>
              </Tabs>
            </TabsContent>
            <TabsContent value="v2-positions">
              <div className="flex flex-col space-y-4">
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
        </TabsContent>
      </Tabs>
      {/* <Visible>
        <Link fontSize={14} color="white" cursor="pointer" as="a" href="/#/pool/standard">
          {t('elixir.checkClassicFarms')}
        </Link>
      </Visible>
      <GridContainer>
        <Box display="flex" position={'relative'} height="100%">
          <Sidebar
            changeAddLiquidityModalStatus={onChangeAddLiquidityStatus}
            activeMenu={activeMenu}
            setMenu={handleSetMenu}
            menuItems={menuItems}
          />
          <Content>
            <Visible>
              <MobileHeader>
                <Text color="color11" fontSize={[32, 28]} fontWeight={500}>
                  {t('elixir.sidebar.title')}
                </Text>
                <ButtonPrimary onClick={onChangeAddLiquidityStatus} padding="4px 6px" variant="primary">
                  {t('common.addLiquidity')}
                </ButtonPrimary>
              </MobileHeader>
            </Visible>

            {activeMenu === MenuType.topPools && (
              <PoolList setMenu={handleSetMenu} activeMenu={activeMenu} menuItems={menuItems} />
            )}
            {activeMenu !== MenuType.topPools && (
              <>
                {positionsLoading ? (
                  <Loader height={'auto'} size={100} />
                ) : (
                  <PositionList
                    setMenu={handleSetMenu}
                    activeMenu={activeMenu}
                    menuItems={menuItems}
                    handleSearch={handleSearch}
                    onChangeSortBy={setSortBy}
                    sortBy={sortBy}
                    searchQuery={searchQuery}
                    isLoading={false}
                    doesNotPoolExist={finalPositions?.length === 0}
                  >
                    <Cards>
                      {finalPositions.map(position => (
                        <PositionCard
                          key={position.tokenId.toString()}
                          token0={position.token0}
                          token1={position.token1}
                          feeAmount={position.fee}
                          tokenId={position.tokenId}
                          liquidity={position.liquidity}
                          tickLower={position.tickLower}
                          tickUpper={position.tickUpper}
                          onClick={() => {
                            onChangeDetailModalStatus(position);
                          }}
                        />
                      ))}
                    </Cards>
                  </PositionList>
                )}
              </>
            )}
          </Content>
        </Box>
      </GridContainer> */}
      <DetailModal
        isOpen={detailModalIsOpen}
        position={selectedPosition}
        addModal={onChangeAddLiquidityStatus}
        onClose={() => {
          onChangeDetailModalStatus(undefined);
          onResetMintState();
        }}
      />
      {addLiquidityIsOpen && <AddLiquidity isOpen={addLiquidityIsOpen} onClose={onChangeAddLiquidityStatus} />}
    </div>
  );
};
export { Elixir };
