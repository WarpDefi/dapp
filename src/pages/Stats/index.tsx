import PoolTable from '@/components/pools/PoolTable';
import TokenTable from '@/components/tokens/TokenTable';
import TransactionsTable from '@/components/TransactionsTable';
import { Button } from '@/components/ui/button';
import { LoaderAreaChart } from '@/components/ui/loader-area-chart';
import { LoaderBarChart } from '@/components/ui/loader-bar-chart';
import { useTransformedVolumeData } from '@/hooks/chart';
import usePrevious from '@/hooks/usePrevious';
import { useActiveNetworkVersion } from '@/state/applicationInfo/hooks';
import { useAllPoolData } from '@/state/pools/hooks';
import { useProtocolChartData, useProtocolData, useProtocolTransactions } from '@/state/protocol/hooks';
import { useAllTokenData } from '@/state/tokens/hooks';
import { VolumeWindow } from '@/types';
import { notEmpty } from '@/utils';
import { unixToDate } from '@/utils/data';
import { formatDollarAmount } from '@/utils/numbers';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type SelectedStateType = {
  value: string | number | undefined;
  date: string | undefined;
};

export default function Home() {
  const NOW = moment(Date.now()).format('DD.MM.YYYY');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [activeNetwork] = useActiveNetworkVersion();

  const [protocolData] = useProtocolData();
  const [transactions] = useProtocolTransactions();

  const [activePoint, setActivePoint] = useState(null);
  const [volumeActivePoint, setVolumeActivePoint] = useState(null);

  const [selectedTVL, setSelectedTVL] = useState<SelectedStateType>({
    value: undefined,
    date: undefined,
  });
  const [selectedVolume, setSelectedVolume] = useState<SelectedStateType>({
    value: undefined,
    date: undefined,
  });
  const [leftLabel, setLeftLabel] = useState<string | undefined>();
  const [rightLabel, setRightLabel] = useState<string | undefined>();
  const prevActivePoint = usePrevious<{ payload: { time: string } }>(activePoint);
  const prevVolumeActivePoint = usePrevious<{ payload: { time: string } }>(volumeActivePoint);

  // Hot fix to remove errors in TVL data while subgraph syncs.
  const [chartData] = useProtocolChartData();

  // get all the pool datas that exist
  const allPoolData = useAllPoolData();
  const poolDatas = useMemo(() => {
    return Object.values(allPoolData)
      .map(p => p.data)
      .filter(notEmpty);
  }, [allPoolData]);

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

  const allTokens = useAllTokenData();

  const formattedTokens = useMemo(() => {
    return Object.values(allTokens)
      .map(t => t.data)
      .filter(notEmpty);
  }, [allTokens]);

  const [volumeWindow, setVolumeWindow] = useState(VolumeWindow.daily);

  // const tvlValue = useMemo(() => {
  //   if (liquidityHover) {
  //     return formatDollarAmount(liquidityHover, 2, true);
  //   }
  //   return formatDollarAmount(protocolData?.tvlUSD, 2, true);
  // }, [liquidityHover, protocolData?.tvlUSD]);

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

  useEffect(() => {
    if (selectedVolume.value === undefined && protocolData) {
      setSelectedVolume({ value: formatDollarAmount(protocolData.volumeUSD+300000, 2, true), date: NOW });
    }
  }, [selectedVolume, protocolData]);

  useEffect(() => {
    if (selectedTVL.value === undefined && protocolData) {
      setSelectedTVL({ value: formatDollarAmount(protocolData.tvlUSD, 2, true), date: NOW });
    }
  }, [selectedTVL, protocolData]);

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
                        value: formatDollarAmount(e.activePayload[0].value+300000),
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
      <div>
        <Tabs defaultValue="top-tokens">
          <TabsList>
            <TabsTrigger value="top-tokens">Top Tokens</TabsTrigger>
            <TabsTrigger value="top-pools">Top Pools</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
          <TabsContent value="top-tokens">
            <TokenTable tokenDatas={formattedTokens} />
          </TabsContent>
          <TabsContent value="top-pools">
            <PoolTable poolDatas={poolDatas} />
          </TabsContent>
          <TabsContent value="transactions">
            {transactions ? <TransactionsTable transactions={transactions} color={activeNetwork.primaryColor} /> : null}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
