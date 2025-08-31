import { Token, ChainId } from '@pangolindex/sdk';
import { useMemo } from 'react';
//import { useSelectedTokenList } from '../state/lists/hooks';
import { useUserAddedTokens } from '../state/userv3/hooks';
import { useActiveWeb3React } from '.';
import { useSelectedTokenList } from '@/state/listsV3';
import { useChainId } from '@/provider';
;

/**
 * get all tokens
 * @returns
 */
/*export function useChainId() {
    const { chainId } = useActiveWeb3React()
    return (chainId || ChainId.AVALANCHE) as ChainId
  }*/

export function useAllTokens(): { [address: string]: Token } {
  const chainId = useChainId();

  const userAddedTokens = useUserAddedTokens();
  const allTokens = useSelectedTokenList();
  return useMemo(() => {
    if (!chainId) return {};
    return (
      userAddedTokens
        // reduce into all ALL_TOKENS filtered by the current chain
        .reduce<{ [address: string]: Token }>(
          (tokenMap, token) => {
            tokenMap[token.address] = token;
            return tokenMap;
          },
          // must make a copy because reduce modifies the map, and we do not
          // want to make a copy in every iteration
          { ...allTokens[chainId] },
        )
    );
  }, [chainId, userAddedTokens, allTokens]);
}
