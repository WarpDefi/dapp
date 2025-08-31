import gql from 'graphql-tag'; // eslint-disable-line import/no-named-as-default
//import { useQuery } from 'react-query';
//import { useChainId } from 'src/provider';
import { validateAddressMapping } from 'src/utils/common';
import { SubgraphEnum, useSubgraphClient } from './client';
import { useQuery } from '@tanstack/react-query';
import { avalancheClient } from '@/apolloInfo/client';
;
import { useActiveWeb3React } from '@/hooks';
import { useChainId } from '@/provider';

export type ElixirTick = {
  id: string;
  tickIdx: string;
  liquidityGross: string;
  liquidityNet: string;
};

export type ElixirPoolType = {
  id: string;
  token0: {
    id: string;
    decimals: string;
    symbol: string;
    name: string;
  };
  token1: {
    id: string;
    decimals: string;
    symbol: string;
    name: string;
  };
  feeTier: string;
  initialFee: string;
  sqrtPrice: string;
  liquidity: string;
  tick: string;
  ticks: ElixirTick[];
  volumeUSD: string;
};

/*export const GET_ELIXIR_POOLS = gql`
  query pools($where: Pool_filter, $first: Int) {
    pools(first: $first, orderBy: liquidity, orderDirection: desc, where: $where) {
      id
      token0 {
        id
        decimals
        symbol
        name
      }
      token1 {
        id
        decimals
        symbol
        name
      }
      feeTier
      initialFee
      sqrtPrice
      liquidity
      volumeUSD
      tick
      ticks {
        id
        tickIdx
        liquidityGross
        liquidityNet
      }
    }
  }
`;*/

export const GET_ELIXIR_POOLS = gql`
  query pools {
    pools {
      id
      token0 {
        id
        decimals
        symbol
        name
      }
      token1 {
        id
        decimals
        symbol
        name
      }
      feeTier
      initialFee
      sqrtPrice
      liquidity
      volumeUSD
      tick
      ticks {
        id
        tickIdx
        liquidityGross
        liquidityNet
      }
    }
  }
`;

/**
 * this hook is useful to find information of given elixir pool addresses from subgraph
 * @param poolAddresses array of pool address
 * @returns list of elixir pools
 */

export const useElixirPools = (poolAddresses?: (string | undefined)[]) => {
  const poolsToFind: string[] | undefined = poolAddresses
    ? poolAddresses
        .map((item) => item?.toLowerCase())
        .filter((item): item is string => !!item)
    : undefined;

  const chainId = useChainId();
  const validateAddress = validateAddressMapping[chainId];

  return useQuery<ElixirPoolType[] | null>({
    queryKey: ['get-subgraph-elixir-pools', chainId, poolsToFind],
    queryFn: async () => {
      if (!avalancheClient || !poolsToFind || poolsToFind.length === 0) {
        return null;
      }

      const result = await avalancheClient.query({
        query: GET_ELIXIR_POOLS,
        variables: {
          where: {
            id_in: poolsToFind
          },
          first: 1000
        }
      });

      const data = result.data;
      const pools = (data?.pools as ElixirPoolType[])
        .map((item) => ({ ...item, id: validateAddress(item.id) as string }))
        .filter((item) => typeof item.id === 'string');

      return pools;
    },
  });
};
