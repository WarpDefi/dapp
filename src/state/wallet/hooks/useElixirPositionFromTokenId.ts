import { BigNumber } from 'ethers';
import { UseElixirPositionResults } from '../types';
import { useElixirPositionsFromTokenIdsHook } from './index';
;
import { useActiveWeb3React } from '@/hooks';
import { useChainId } from '@/provider';

export function useElixirPositionFromTokenId(tokenId: BigNumber | undefined): UseElixirPositionResults {
  const chainId = useChainId();

  const useElixirPositionsFromTokenIds = useElixirPositionsFromTokenIdsHook[chainId];

  const position = useElixirPositionsFromTokenIds(tokenId ? [tokenId] : undefined);

  return {
    loading: position.loading,
    position: position.positions?.[0],
  };
}
