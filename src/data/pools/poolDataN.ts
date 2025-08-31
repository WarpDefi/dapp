import { useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import { useDeltaTimestamps } from '@/utils/queries'
import { useBlocksFromTimestamps } from '@/hooks/useBlocksFromTimestamps'
import { PoolData } from '@/state/pools/reducer'
import { get2DayChange } from '@/utils/data'
import { formatTokenName, formatTokenSymbol } from '@/utils/tokens'
import { useActiveNetworkVersion, useClients } from '@/state/applicationInfo/hooks'

export const POOLS_BULK = (
    block: number | undefined,
    token0: string,
    token1: string,
    initialFee: string
  ) => {
    const queryString = `
      query pools {
        pools(
          where: { token0: "${token0}", token1: "${token1}", initialFee: "${initialFee}" }${
      block ? `, block: { number: ${block} }` : ``
    }, orderBy: totalValueLockedUSD, orderDirection: desc, subgraphError: allow) {
          id
          feeTier
          liquidity
          sqrtPrice
          tick
          token0 {
            id
            symbol
            name
            decimals
            derivedETH
          }
          token1 {
            id
            symbol
            name
            decimals
            derivedETH
          }
          token0Price
          token1Price
          volumeUSD
          volumeToken0
          volumeToken1
          txCount
          totalValueLockedToken0
          totalValueLockedToken1
          totalValueLockedUSD
        }
        bundles(where: { id: "1" }) {
          ethPriceUSD
        }
      }
    `;
    return gql(queryString);
  };
  

interface PoolFields {
  id: string
  feeTier: string
  liquidity: string
  sqrtPrice: string
  tick: string
  token0: {
    id: string
    symbol: string
    name: string
    decimals: string
    derivedETH: string
  }
  token1: {
    id: string
    symbol: string
    name: string
    decimals: string
    derivedETH: string
  }
  token0Price: string
  token1Price: string
  volumeUSD: string
  volumeToken0: string
  volumeToken1: string
  txCount: string
  totalValueLockedToken0: string
  totalValueLockedToken1: string
  totalValueLockedUSD: string
}

interface PoolDataResponse {
  pools: PoolFields[]
  bundles: {
    ethPriceUSD: string
  }[]
}

/**
 * Fetch top addresses by volume
 */
export function usePoolDatasN(token0, token1, initialFee): {
  loading: boolean
  error: boolean
  data:
    | {
        [address: string]: PoolData
      }
    | undefined
} {
  // get client
  const { dataClient } = useClients()
  const [activeNetwork] = useActiveNetworkVersion()

  // get blocks from historic timestamps
  const [t24, t48, tWeek] = useDeltaTimestamps()
  const { blocks, error: blockError } = useBlocksFromTimestamps([t24, t48, tWeek])
  const [block24, block48, blockWeek] = blocks ?? []

  const { loading, error, data } = useQuery<PoolDataResponse>(POOLS_BULK(undefined, token0.address.toLowerCase(), token1.address.toLowerCase(), initialFee), {
    client: dataClient,
    fetchPolicy: 'cache-first'
  })

  const {
    loading: loading24,
    error: error24,
    data: data24,
  } = useQuery<PoolDataResponse>(POOLS_BULK(block24?.number, token0.address.toLowerCase(), token1.address.toLowerCase(), initialFee), { client: dataClient, fetchPolicy: 'cache-first' })
  const {
    loading: loading48,
    error: error48,
    data: data48,
  } = useQuery<PoolDataResponse>(POOLS_BULK(block48?.number, token0.address.toLowerCase(), token1.address.toLowerCase(), initialFee), { client: dataClient, fetchPolicy: 'cache-first' })
  const {
    loading: loadingWeek,
    error: errorWeek,
    data: dataWeek,
  } = useQuery<PoolDataResponse>(POOLS_BULK(blockWeek?.number, token0.address.toLowerCase(), token1.address.toLowerCase(), initialFee), { client: dataClient, fetchPolicy: 'cache-first' })

  const anyError = Boolean(error || error24 || error48 || blockError || errorWeek)
  const anyLoading = Boolean(loading || loading24 || loading48 || loadingWeek)

  //console.log(block24?.number)
  //console.log(Boolean(error) , Boolean(error24) , Boolean(error48) , Boolean(blockError) , Boolean(errorWeek))

  // return early if not all data yet
  if (anyError || anyLoading) {
    return {
      loading: anyLoading,
      error: anyError,
      data: undefined,
    }
  }


  const ethPriceUSD = data?.bundles?.[0]?.ethPriceUSD ? parseFloat(data?.bundles?.[0]?.ethPriceUSD) : 0

  const parsed = data?.pools
    ? data.pools.reduce((accum: { [address: string]: PoolFields }, poolData) => {
        accum[poolData.id] = poolData
        return accum
      }, {})
    : {}
  const parsed24 = data24?.pools
    ? data24.pools.reduce((accum: { [address: string]: PoolFields }, poolData) => {
        accum[poolData.id] = poolData
        return accum
      }, {})
    : {}
  const parsed48 = data48?.pools
    ? data48.pools.reduce((accum: { [address: string]: PoolFields }, poolData) => {
        accum[poolData.id] = poolData
        return accum
      }, {})
    : {}
  const parsedWeek = dataWeek?.pools
    ? dataWeek.pools.reduce((accum: { [address: string]: PoolFields }, poolData) => {
        accum[poolData.id] = poolData
        return accum
      }, {})
    : {}

  // format data and calculate daily changes
  const formatted = Object.keys(parsed).reduce((accum: { [address: string]: PoolData }, address: string) => {
    const current: PoolFields | undefined = parsed[address]
    const oneDay: PoolFields | undefined = parsed24[address]
    const twoDay: PoolFields | undefined = parsed48[address]
    const week: PoolFields | undefined = parsedWeek[address]

    const [volumeUSD, volumeUSDChange] =
      current && oneDay && twoDay
        ? get2DayChange(current.volumeUSD, oneDay.volumeUSD, twoDay.volumeUSD)
        : current
        ? [parseFloat(current.volumeUSD), 0]
        : [0, 0]

    const volumeUSDWeek =
      current && week
        ? parseFloat(current.volumeUSD) - parseFloat(week.volumeUSD)
        : current
        ? parseFloat(current.volumeUSD)
        : 0

    // Hotifx: Subtract fees from TVL to correct data while subgraph is fixed.
    /**
     * Note: see issue desribed here https://github.com/Uniswap/v3-subgraph/issues/74
     * During subgraph deploy switch this month we lost logic to fix this accounting.
     * Grafted sync pending fix now.
     */
    const feePercent = current ? parseFloat(current.feeTier) / 10000 / 100 : 0
    const tvlAdjust0 = current?.volumeToken0 ? (parseFloat(current.volumeToken0) * feePercent) / 2 : 0
    const tvlAdjust1 = current?.volumeToken1 ? (parseFloat(current.volumeToken1) * feePercent) / 2 : 0
    const tvlToken0 = current ? parseFloat(current.totalValueLockedToken0) - tvlAdjust0 : 0
    const tvlToken1 = current ? parseFloat(current.totalValueLockedToken1) - tvlAdjust1 : 0
    let tvlUSD = current ? parseFloat(current.totalValueLockedUSD) : 0

    const tvlUSDChange =
      current && oneDay
        ? ((parseFloat(current.totalValueLockedUSD) - parseFloat(oneDay.totalValueLockedUSD)) /
            parseFloat(oneDay.totalValueLockedUSD === '0' ? '1' : oneDay.totalValueLockedUSD)) *
          100
        : 0

    // Part of TVL fix
    const tvlUpdated = current
      ? tvlToken0 * parseFloat(current.token0.derivedETH) * ethPriceUSD +
        tvlToken1 * parseFloat(current.token1.derivedETH) * ethPriceUSD
      : undefined
    if (tvlUpdated) {
      tvlUSD = tvlUpdated
    }

    const feeTier = current ? parseInt(current.feeTier) : 0

    if (current && oneDay && twoDay) {
      accum[address] = {
        address,
        feeTier,
        liquidity: parseFloat(current.liquidity),
        sqrtPrice: parseFloat(current.sqrtPrice),
        tick: parseFloat(current.tick),
        token0: {
          address: current.token0.id,
          name: formatTokenName(current.token0.id, current.token0.name, activeNetwork),
          symbol: formatTokenSymbol(current.token0.id, current.token0.symbol, activeNetwork),
          decimals: parseInt(current.token0.decimals),
          derivedETH: parseFloat(current.token0.derivedETH),
        },
        token1: {
          address: current.token1.id,
          name: formatTokenName(current.token1.id, current.token1.name, activeNetwork),
          symbol: formatTokenSymbol(current.token1.id, current.token1.symbol, activeNetwork),
          decimals: parseInt(current.token1.decimals),
          derivedETH: parseFloat(current.token1.derivedETH),
        },
        token0Price: parseFloat(current.token0Price),
        token1Price: parseFloat(current.token1Price),
        volumeUSD,
        volumeUSDChange,
        volumeUSDWeek,
        tvlUSD,
        tvlUSDChange,
        tvlToken0,
        tvlToken1,
      }
    }

    return accum
  }, {})

  return {
    loading: anyLoading,
    error: anyError,
    data: formatted,
  }
}
