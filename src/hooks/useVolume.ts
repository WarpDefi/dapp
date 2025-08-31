// hooks/useVolume.ts
import { usePoolDatasN } from '@/data/pools/poolDataN';
import numeral from 'numeral';

export function useVolume(token0, token1, initialFee): number {
  const { loading, error, data } = usePoolDatasN(token0, token1, initialFee);

  if (loading || error) return 0;

  const pools = data ? Object.values(data) : [];
  if (pools.length === 0) return 0;

  // raw volume sayısı
  const rawVolume = Number(pools[0].volumeUSD.toFixed(0));
  return rawVolume;
}