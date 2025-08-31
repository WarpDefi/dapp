import { FC, useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import useDebounce from '@/hooks/useDebounce';
import { POOL_HIDE } from '@/constants';
import { PoolRowV2 } from '@/components/PoolRowV2';
import AddLiquidity from '@/components/AddLiquidity';
import { PoolListProps } from './types';
import { Input } from '../ui/input';
import { Loader } from '../ui/loader';
import { notEmpty } from '@/utils';
import { PoolDataV2 } from '@/state/pools/reducer';
import { useActiveNetworkVersion } from '@/state/applicationInfo/hooks';
import { useAllPairData } from '@/contexts/PairData';

const PoolList: FC<PoolListProps> = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, 250);
  const [addLiquidityIsOpen, setAddLiquidityIsOpen] = useState<boolean>(false);

  const allPairs = useAllPairData();

  const [currentNetwork] = useActiveNetworkVersion();

  const SORT_FIELD = {
    feeTier: 'feeTier',
    oneDayVolumeUSD: 'oneDayVolumeUSD',
    reserveUSD: 'reserveUSD',
  };

  // for sorting
  const [sortField, setSortField] = useState(SORT_FIELD.oneDayVolumeUSD);
  const [sortDirection, setSortDirection] = useState<boolean>(true);

  const poolDatas = useMemo(() => {
    return Object.values(allPairs).filter(notEmpty) as PoolDataV2[];
  }, [allPairs]);

  const sortedPools = useMemo(() => {
    let filtered = poolDatas.filter(x => !!x && !POOL_HIDE[currentNetwork.id].includes(x.address));

    if (debouncedSearchQuery) {
      const q = debouncedSearchQuery.trim().toUpperCase();
      filtered = filtered.filter((pool: PoolDataV2) => {
        const s0 = pool.token0.symbol.toUpperCase();
        const s1 = pool.token1.symbol.toUpperCase();
        return s0.includes(q) || s1.includes(q);
      });
    }

    return filtered.sort((a, b) => {
      const aValue = a[sortField as keyof PoolDataV2];
      const bValue = b[sortField as keyof PoolDataV2];
      if (aValue === bValue) return 0;
      return aValue > bValue ? (sortDirection ? -1 : 1) : sortDirection ? 1 : -1;
    });
  }, [currentNetwork.id, poolDatas, sortField, sortDirection, debouncedSearchQuery]);

  const handleSort = useCallback(
    (newField: string) => {
      setSortField(newField);
      setSortDirection(sortField !== newField ? true : !sortDirection);
    },
    [sortDirection, sortField],
  );

  const arrow = useCallback(
    (field: string) => {
      return sortField === field ? (!sortDirection ? '↑' : '↓') : '';
    },
    [sortDirection, sortField],
  );

  const onCloseAddLiquidityModal = useCallback(() => {
    setAddLiquidityIsOpen(!addLiquidityIsOpen);
  }, [addLiquidityIsOpen]);

  if (poolDatas.length === 0) {
    return <Loader />;
  }

  return (
    <>
      <div className="sticky top-[4.5rem] z-10 bg-background mb-4 border p-4 rounded-md flex mostrado gap-4 lg:flex-row lg:justify-between lg:items-center">
        <div className="flex items-center gap-2 lg:w-1/4 text-slate-400 text-sm lg:text-md">
          <Input
            type="text"
            placeholder="Search by token name or symbol"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
            }}
            className="w-full"
          />
        </div>
        <div className="hidden lg:grid grid-cols-3 gap-3 lg:grid-cols-5 lg:w-3/4 items-center">
          <div className="text-center text-slate-400 text-sm lg:text-md">Fee</div>
          <div className="text-center text-slate-400 text-sm lg:text-md">APR</div>
          <Button
            variant="ghost"
            size="sm"
            className="text-center text-sm lg:text-md text-slate-400"
            onClick={() => handleSort(SORT_FIELD.reserveUSD)}
          >
            TVL {arrow(SORT_FIELD.reserveUSD)}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-center text-sm lg:text-md text-slate-400"
            onClick={() => handleSort(SORT_FIELD.oneDayVolumeUSD)}
          >
            Volume 24H {arrow(SORT_FIELD.oneDayVolumeUSD)}
          </Button>
          <div className="text-center text-slate-400 text-sm lg:text-md">Pool Type</div>
        </div>
        <div className="lg:w-[160px] text-slate-400 text-sm lg:text-md"></div>
      </div>

      {sortedPools.map((poolData, i) => {
        const poolKey = `${poolData.token0.address}-${poolData.token1.address}-${poolData.address}`;

        return <PoolRowV2 key={poolKey} pool={poolData} />;
      })}
    </>
  );
};

export default PoolList;
