import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import gql from 'graphql-tag'
import { PoolChartEntry } from '@/state/pools/reducer'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { avalancheClient } from '@/apolloInfo/client'
import { useDeltaTimestamps } from '@/utils/queries'
import { useBlocksFromTimestamps } from '@/hooks/useBlocksFromTimestamps'
import { useQuery } from '@tanstack/react-query'

// format dayjs with the libraries that we need
dayjs.extend(utc)
dayjs.extend(weekOfYear)
const ONE_DAY_UNIX = 24 * 60 * 60

const POOL_CHART = gql`
  query poolDayDatas($startTime: Int!, $skip: Int!, $address: Bytes!) {
    poolDayDatas(
      first: 1000
      skip: $skip
      where: { pool: $address, date_gt: $startTime }
      orderBy: date
      orderDirection: asc
      subgraphError: allow
    ) {
      date
      volumeUSD
      tvlUSD
      feesUSD
      pool {
        feeTier
      }
    }
  }
`

const POOL_CHART_E = gql`
  query pools($token0: String!, $token1: String!, $initialFee: String!, $blockNumber: Number!) {
    pools(
      first: 1000,
      orderBy: liquidity,
      orderDirection: desc,
      where: {
        token0: $token0,
        token1: $token1,
        initialFee: $initialFee,
        block: {number: $blockNumber}
      }
    ) {
      id
      poolDayData {
        date
        volumeUSD
        tvlUSD
        feesUSD
        pool {
          feeTier
        }
      }
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


/*const POOL_CHART = gql`
  query {
  poolDayDatas(startTime: 1619170975, skip: 0, address: $address) {
    date
      volumeUSD
      tvlUSD
      feesUSD
      pool {
        feeTier
      }
  }
}
`*/

interface ChartResults {
  poolDayDatas: {
    date: number
    volumeUSD: string
    tvlUSD: string
    feesUSD: string
    pool: {
      feeTier: string
    }
  }[]
}

interface ChartResults_e {
  pools: {
    id: number;
    poolDayData: {
      date: number;
      volumeUSD: string;
      tvlUSD: string;
      feesUSD: string;
      pool: {
        feeTier: string;
      }
    }[];
  }[];
}

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

export async function fetchPoolChartData_e(token0, token1, initialFee, avalancheClients) {
  let data: {
    date: number
    volumeUSD: string
    tvlUSD: string
    feesUSD: string
    pool: {
      feeTier: string
    }
  }[] = []
  const startTimestamp = 1619170975
  const endTimestamp = dayjs.utc().unix()

  // get blocks from historic timestamps
  const [t24, t48, tWeek] = useDeltaTimestamps()
  const { blocks, error: blockError } = useBlocksFromTimestamps([t24, t48, tWeek])
  const [block24, block48, blockWeek] = blocks ?? []

  let error = false
  let skip = 0
  let allFound = false

  try {
    while (!allFound) {
      const {
        data: chartResData,
        error,
        loading,
      } = await avalancheClient.query<ChartResults_e>({
        query: POOL_CHART_E,
        variables: {
          token0:token0.address.toLowerCase(),
          token1:token1.address.toLowerCase(),
          initialFee:initialFee.toString(),
          block24: block24.number,
        },
        fetchPolicy: 'cache-first',
      })

      if (!loading) {
        skip += 1000
        if (chartResData.pools[0].poolDayData.length < 1000 || error) {
          allFound = true
        }
        if (chartResData) {
          data = data.concat(chartResData.pools[0].poolDayData)
        }
      }
    }
  } catch {
    error = true
  }
  
  if (data) {
    const formattedExisting = data.reduce((accum: { [date: number]: PoolChartEntry }, dayData) => {
      const roundedDate = parseInt((dayData.date / ONE_DAY_UNIX).toFixed(0))
      const feePercent = parseFloat(dayData.pool.feeTier) / 10000
      const tvlAdjust = dayData?.volumeUSD ? parseFloat(dayData.volumeUSD) * feePercent : 0

      accum[roundedDate] = {
        date: dayData.date,
        volumeUSD: parseFloat(dayData.volumeUSD),
        totalValueLockedUSD: parseFloat(dayData.tvlUSD) - tvlAdjust,
        feesUSD: parseFloat(dayData.feesUSD),
      }
      return accum
    }, {})

    const firstEntry = formattedExisting[parseInt(Object.keys(formattedExisting)[0])]

    // fill in empty days ( there will be no day datas if no trades made that day )
    let timestamp = firstEntry?.date ?? startTimestamp
    let latestTvl = firstEntry?.totalValueLockedUSD ?? 0
    while (timestamp < endTimestamp - ONE_DAY_UNIX) {
      const nextDay = timestamp + ONE_DAY_UNIX
      const currentDayIndex = parseInt((nextDay / ONE_DAY_UNIX).toFixed(0))
      if (!Object.keys(formattedExisting).includes(currentDayIndex.toString())) {
        formattedExisting[currentDayIndex] = {
          date: nextDay,
          volumeUSD: 0,
          totalValueLockedUSD: latestTvl,
          feesUSD: 0,
        }
      } else {
        latestTvl = formattedExisting[currentDayIndex].totalValueLockedUSD
      }
      timestamp = nextDay
    }

    const dateMap = Object.keys(formattedExisting).map((key) => {
      return formattedExisting[parseInt(key)]
    })

    console.log(dateMap)

    return {
      data: dateMap,
      error: false,
    }
  } else {
    return {
      data: undefined,
      error,
    }
  }
}

export async function fetchPoolChartData(address: string, client: ApolloClient<NormalizedCacheObject>) {
  let data: {
    date: number
    volumeUSD: string
    tvlUSD: string
    feesUSD: string
    pool: {
      feeTier: string
    }
  }[] = []
  const startTimestamp = 1619170975
  const endTimestamp = dayjs.utc().unix()

  let error = false
  let skip = 0
  let allFound = false

  try {
    while (!allFound) {
      const {
        data: chartResData,
        error,
        loading,
      } = await avalancheClient.query<ChartResults>({
        query: POOL_CHART,
        variables: {
          address: address,
          startTime: startTimestamp,
          skip,
        },
        fetchPolicy: 'cache-first',
      })
      if (!loading) {
        skip += 1000
        if (chartResData.poolDayDatas.length < 1000 || error) {
          allFound = true
        }
        if (chartResData) {
          data = data.concat(chartResData.poolDayDatas)
        }
      }
    }
  } catch {
    error = true
  }

  if (data) {
    const formattedExisting = data.reduce((accum: { [date: number]: PoolChartEntry }, dayData) => {
      const roundedDate = parseInt((dayData.date / ONE_DAY_UNIX).toFixed(0))
      const feePercent = parseFloat(dayData.pool.feeTier) / 10000
      const tvlAdjust = dayData?.volumeUSD ? parseFloat(dayData.volumeUSD) * feePercent : 0

      accum[roundedDate] = {
        date: dayData.date,
        volumeUSD: parseFloat(dayData.volumeUSD),
        totalValueLockedUSD: parseFloat(dayData.tvlUSD) - tvlAdjust,
        feesUSD: parseFloat(dayData.feesUSD),
      }
      return accum
    }, {})

    const firstEntry = formattedExisting[parseInt(Object.keys(formattedExisting)[0])]

    // fill in empty days ( there will be no day datas if no trades made that day )
    let timestamp = firstEntry?.date ?? startTimestamp
    let latestTvl = firstEntry?.totalValueLockedUSD ?? 0
    while (timestamp < endTimestamp - ONE_DAY_UNIX) {
      const nextDay = timestamp + ONE_DAY_UNIX
      const currentDayIndex = parseInt((nextDay / ONE_DAY_UNIX).toFixed(0))
      if (!Object.keys(formattedExisting).includes(currentDayIndex.toString())) {
        formattedExisting[currentDayIndex] = {
          date: nextDay,
          volumeUSD: 0,
          totalValueLockedUSD: latestTvl,
          feesUSD: 0,
        }
      } else {
        latestTvl = formattedExisting[currentDayIndex].totalValueLockedUSD
      }
      timestamp = nextDay
    }

    const dateMap = Object.keys(formattedExisting).map((key) => {
      return formattedExisting[parseInt(key)]
    })

    return {
      data: dateMap,
      error: false,
    }
  } else {
    return {
      data: undefined,
      error,
    }
  }
}
