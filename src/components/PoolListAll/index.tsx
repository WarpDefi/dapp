import AddLiquidity from '@/components/AddLiquidity';
import { PoolRow } from '@/components/PoolRow';
import { PoolRowV2 } from '@/components/PoolRowV2';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader } from '@/components/ui/loader';
import { POOL_HIDE } from '@/constants';
import { useAllPairData } from '@/contexts/PairData';
import useDebounce from '@/hooks/useDebounce';
import { useActiveNetworkVersion } from '@/state/applicationInfo/hooks';
import { Field } from '@/state/mint/atom';
import { useMintActionHandlers } from '@/state/mint/hooksElixir';
import { useAllPoolData } from '@/state/pools/hooks';
import { PoolData, PoolDataV2 } from '@/state/pools/reducer';
import { notEmpty } from '@/utils';
import { Currency, FeeAmount } from '@pangolindex/sdk';
import { FC, useCallback, useMemo, useState } from 'react';

/**
 * Combined “All Pools” page that merges V3 and V2 pool lists.
 *
 * ─ Features ────────────────────────────────────────────────────────────
 * • Unified search, sort, and pagination (if needed later).
 * • Maintains the original row components so styling/behaviour is kept.
 * • Uses a normalised data layer so V2 & V3 fields line‑up for sorting.
 * • Supports Add‑Liquidity modal for V3 pools (unchanged behaviour).
 */

// Normalised structure used only by the UI (never touches on‑chain).
type CombinedPoolData = {
  version: 'V3' | 'V2';
  fee: number;
  tvl: number; // USD
  volume: number; // 24h USD
  apr?: number;
  pool: PoolData | PoolDataV2;
};

const PoolList: FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 250);
  const [addLiquidityIsOpen, setAddLiquidityIsOpen] = useState(false);

  // Sorting helpers
  const SORT_FIELD = {
    fee: 'fee',
    tvl: 'tvl',
    volume: 'volume',
  } as const;
  type SortField = (typeof SORT_FIELD)[keyof typeof SORT_FIELD];

  const [sortField, setSortField] = useState<SortField>(SORT_FIELD.volume);
  const [sortDirection, setSortDirection] = useState<boolean>(true); // true ▸ DESC

  /* ────────────────────────── Data ───────────────────────────────── */
  const [currentNetwork] = useActiveNetworkVersion();
  const allPoolData = useAllPoolData(); // V3
  const allPairData = useAllPairData(); // V2

  // Normalise V3 pools
  const v3Pools: CombinedPoolData[] = useMemo(() => {
    return Object.values(allPoolData)
      .map(p => p.data)
      .filter(notEmpty)
      .filter(p => !POOL_HIDE[currentNetwork.id].includes(p.address))
      .map(p => ({
        version: 'V3' as const,
        pool: p,
        fee: p.initialFee,
        tvl: p.tvlUSD ?? 0,
        volume: p.volumeUSD ?? 0,
        apr: 0, //p.apr,
      }));
  }, [allPoolData, currentNetwork.id]);

  // Normalise V2 pools
  const v2Pools: CombinedPoolData[] = useMemo(() => {
    return Object.values(allPairData as Record<string, PoolDataV2>)
      .filter(notEmpty)
      .filter(p => !POOL_HIDE[currentNetwork.id].includes(p.address))
      .map(p => ({
        version: 'V2' as const,
        pool: p,
        fee: p.feeTier,
        tvl: p.reserveUSD ?? 0,
        volume: p.oneDayVolumeUSD ?? 0,
        apr: 0, //p.apr,
      }));
  }, [allPairData, currentNetwork.id]);

  // Merge V3 & V2
  const combinedPools = useMemo<CombinedPoolData[]>(() => {
    let pools = [...v3Pools, ...v2Pools];

    // Search filter
    if (debouncedSearchQuery) {
      const q = debouncedSearchQuery.trim().toUpperCase();
      pools = pools.filter(({ pool }) => {
        const s0 = pool.token0.symbol.toUpperCase();
        const s1 = pool.token1.symbol.toUpperCase();
        return s0.includes(q) || s1.includes(q);
      });
    }

    // Sort
    pools.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal === bVal) return 0;
      return aVal > bVal ? (sortDirection ? -1 : 1) : sortDirection ? 1 : -1;
    });

    return pools;
  }, [v3Pools, v2Pools, debouncedSearchQuery, sortField, sortDirection]);

  /* ───────────────────── Add‑Liquidity Modal ─────────────────────── */
  const { onCurrencySelection, onSetFeeAmount } = useMintActionHandlers(true);

  const onOpenAddLiquidityModal = useCallback((currency0: Currency, currency1: Currency, fee: FeeAmount) => {
    onCurrencySelection(Field.CURRENCY_A, currency0);
    onCurrencySelection(Field.CURRENCY_B, currency1);
    onSetFeeAmount(fee);
    setAddLiquidityIsOpen(true);
  }, []);

  const onCloseAddLiquidityModal = useCallback(() => {
    setAddLiquidityIsOpen(false);
  }, []);

  /* ─────────────────────────── UI ────────────────────────────────── */
  if (v3Pools.length + v2Pools.length === 0) {
    return <Loader />;
  }

  const handleSort = (field: SortField) => {
    setSortField(field);
    setSortDirection(sortField !== field ? true : !sortDirection);
  };

  const arrow = (field: SortField) => (sortField === field ? (!sortDirection ? '↑' : '↓') : '');

  return (
    <>
      {/* Header */}
      <div className="sticky top-[4.5rem] z-10 bg-background mb-4 border p-4 rounded-md flex flex-col lg:flex-row gap-4 lg:justify-between lg:items-center">
        {/* Search */}
        <div className="flex items-center gap-2 lg:w-1/4 text-slate-400 text-sm lg:text-md">
          <Input
            type="text"
            placeholder="Search by token name or symbol"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Column titles & sort buttons */}
        <div className="hidden lg:grid grid-cols-3 gap-3 lg:grid-cols-5 lg:w-3/4 items-center">
          <div className="text-center text-slate-400 text-sm lg:text-md">Fee</div>
          <div className="text-center text-slate-400 text-sm lg:text-md">APR</div>
          <Button
            variant="ghost"
            size="sm"
            className="text-center text-slate-400 text-sm lg:text-md"
            onClick={() => handleSort(SORT_FIELD.tvl)}
          >
            TVL {arrow(SORT_FIELD.tvl)}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-center text-slate-400 text-sm lg:text-md"
            onClick={() => handleSort(SORT_FIELD.volume)}
          >
            Volume 24H {arrow(SORT_FIELD.volume)}
          </Button>
          <div className="text-center text-slate-400 text-sm lg:text-md">Pool Type</div>
        </div>
        {/* spacer for right‑aligned area */}
        <div className="lg:w-[160px] text-slate-400 text-sm lg:text-md" />
      </div>

      {/* Rows */}
      {combinedPools.map(({ version, pool }) => {
        const key = `${version}-${pool.token0.address}-${pool.token1.address}-${pool.address ?? (pool as any).initialFee}`;

        return version === 'V3' ? (
          <PoolRow key={key} pool={pool as PoolData} onOpenAddLiquidityModal={onOpenAddLiquidityModal} />
        ) : (
          <PoolRowV2 key={key} pool={pool as PoolDataV2} />
        );
      })}

      {addLiquidityIsOpen && <AddLiquidity isOpen={addLiquidityIsOpen} onClose={onCloseAddLiquidityModal} />}
    </>
  );
};

export default PoolList;
