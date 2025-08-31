import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect, useState } from 'react'

import { client } from '../apollo/client'
import {
  PAIR_DATA,
  PAIR_CHART,
  FILTERED_TRANSACTIONS,
  PAIRS_CURRENT,
  PAIRS_BULK,
  PAIRS_HISTORICAL_BULK,
  HOURLY_PAIR_RATES
} from '../apollo/queries'

import { getEthPriceAtDate, getCurrentEthPrice } from './GlobalData'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import {
  getPercentChange,
  get2DayPercentChange,
  isAddress,
  getBlocksFromTimestamps,
  getTimestampsForChanges,
  splitQuery,
  getMostRecentBlockSinceTimestamp
} from '../utils/analytics'
import { timeframeOptions } from '../constants'
import { useLatestBlocks } from './Application'
import { updateNameData } from '../utils/data'

import { ChainId, WAVAX, Token } from '@pangolindex/sdk'
import { useWeb3React } from '@web3-react/core'
import { avalancheBlockClient } from '@/apolloInfo/client'
import { useUSDCPrice } from '@/hooks/useUSDCPrice/evm'

const UPDATE = 'UPDATE'
const UPDATE_PAIR_TXNS = 'UPDATE_PAIR_TXNS'
const UPDATE_CHART_DATA = 'UPDATE_CHART_DATA'
const UPDATE_TOP_PAIRS = 'UPDATE_TOP_PAIRS'
const UPDATE_HOURLY_DATA = 'UPDATE_HOURLY_DATA'

dayjs.extend(utc)

export function safeAccess(object, path) {
  return object
    ? path.reduce(
        (accumulator, currentValue) => (accumulator && accumulator[currentValue] ? accumulator[currentValue] : null),
        object
      )
    : null
}

const PairDataContext = createContext()

function usePairDataContext() {
  return useContext(PairDataContext)
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE: {
      const { pairAddress, data } = payload
      return {
        ...state,
        [pairAddress]: {
          ...state?.[pairAddress],
          ...data
        }
      }
    }

    case UPDATE_TOP_PAIRS: {
      const { topPairs } = payload
      const added = {}
      topPairs.map(pair => {
        return (added[pair.address] = pair)
      })
      return {
        ...state,
        ...added
      }
    }

    case UPDATE_PAIR_TXNS: {
      const { address, transactions } = payload
      return {
        ...state,
        [address]: {
          ...(safeAccess(state, [address]) || {}),
          txns: transactions
        }
      }
    }
    case UPDATE_CHART_DATA: {
      const { address, chartData } = payload
      return {
        ...state,
        [address]: {
          ...(safeAccess(state, [address]) || {}),
          chartData
        }
      }
    }

    case UPDATE_HOURLY_DATA: {
      const { address, hourlyData, timeWindow } = payload
      return {
        ...state,
        [address]: {
          ...state?.[address],
          hourlyData: {
            ...state?.[address]?.hourlyData,
            [timeWindow]: hourlyData
          }
        }
      }
    }

    default: {
      throw Error(`Unexpected action type in DataContext reducer: '${type}'.`)
    }
  }
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, {})

  // update pair specific data
  const update = useCallback((pairAddress, data) => {
    dispatch({
      type: UPDATE,
      payload: {
        pairAddress,
        data
      }
    })
  }, [])

  const updateTopPairs = useCallback(topPairs => {
    dispatch({
      type: UPDATE_TOP_PAIRS,
      payload: {
        topPairs
      }
    })
  }, [])

  const updatePairTxns = useCallback((address, transactions) => {
    dispatch({
      type: UPDATE_PAIR_TXNS,
      payload: { address, transactions }
    })
  }, [])

  const updateChartData = useCallback((address, chartData) => {
    dispatch({
      type: UPDATE_CHART_DATA,
      payload: { address, chartData }
    })
  }, [])

  const updateHourlyData = useCallback((address, hourlyData, timeWindow) => {
    dispatch({
      type: UPDATE_HOURLY_DATA,
      payload: { address, hourlyData, timeWindow }
    })
  }, [])

  return (
    <PairDataContext.Provider
      value={useMemo(
        () => [
          state,
          {
            update,
            updatePairTxns,
            updateChartData,
            updateTopPairs,
            updateHourlyData
          }
        ],
        [state, update, updatePairTxns, updateChartData, updateTopPairs, updateHourlyData]
      )}
    >
      {children}
    </PairDataContext.Provider>
  )
}

async function getBulkPairData(pairList, ethPrice, chainId) {
  const [t1, t2, tWeek] = getTimestampsForChanges()
  const blocks = await getBlocksFromTimestamps([t1, t2, tWeek])
  let b1, b2, bWeek
  if (blocks.length !== 3) {
    b1 = await getMostRecentBlockSinceTimestamp(t1, chainId)
    b2 = await getMostRecentBlockSinceTimestamp(t2, chainId)
    bWeek = await getMostRecentBlockSinceTimestamp(tWeek, chainId)
  } else {
    b1 = blocks[0].number
    b2 = blocks[1].number
    bWeek = blocks[2].number
  }

  try {
    const current = await client.query({
      query: PAIRS_BULK,
      variables: {
        allPairs: pairList
      },
      fetchPolicy: 'cache-first'
    })

    const [oneDayResult, twoDayResult, oneWeekResult] = await Promise.all(
      [b1, b2, bWeek].map(async block => {
        const result = client.query({
          query: PAIRS_HISTORICAL_BULK(block, pairList),
          fetchPolicy: 'cache-first'
        })
        return result
      })
    )

    const oneDayData = oneDayResult?.data?.pairs.reduce((obj, cur, i) => {
      return { ...obj, [cur.address]: cur }
    }, {})

    const twoDayData = twoDayResult?.data?.pairs.reduce((obj, cur, i) => {
      return { ...obj, [cur.address]: cur }
    }, {})

    const oneWeekData = oneWeekResult?.data?.pairs.reduce((obj, cur, i) => {
      return { ...obj, [cur.address]: cur }
    }, {})

    const pairData = await Promise.all(
      current &&
        current.data.pairs.map(async pair => {
          let data = pair
          let oneDayHistory = oneDayData?.[pair.address]
          if (!oneDayHistory) {
            const newData = await client.query({
              query: PAIR_DATA(pair.address, b1),
              fetchPolicy: 'cache-first'
            })
            oneDayHistory = newData.data.pairs[0]
          }
          let twoDayHistory = twoDayData?.[pair.address]
          if (!twoDayHistory) {
            const newData = await client.query({
              query: PAIR_DATA(pair.address, b2),
              fetchPolicy: 'cache-first'
            })
            twoDayHistory = newData.data.pairs[0]
          }
          let oneWeekHistory = oneWeekData?.[pair.address]
          if (!oneWeekHistory) {
            const newData = await client.query({
              query: PAIR_DATA(pair.address, bWeek),
              fetchPolicy: 'cache-first'
            })
            oneWeekHistory = newData.data.pairs[0]
          }
          data = parseData(data, oneDayHistory, twoDayHistory, oneWeekHistory, ethPrice, b1)
          return data
        })
    )
    return pairData
  } catch (e) {
    console.log(e)
  }
}

function parseData(data, oneDayData, twoDayData, oneWeekData, ethPrice, oneDayBlock) {
  // get volume changes
  const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
    data?.volumeUSD,
    oneDayData?.volumeUSD ? oneDayData.volumeUSD : 0,
    twoDayData?.volumeUSD ? twoDayData.volumeUSD : 0
  )
  const [oneDayVolumeUntracked, volumeChangeUntracked] = get2DayPercentChange(
    data?.untrackedVolumeUSD,
    oneDayData?.untrackedVolumeUSD ? parseFloat(oneDayData?.untrackedVolumeUSD) : 0,
    twoDayData?.untrackedVolumeUSD ? twoDayData?.untrackedVolumeUSD : 0
  )
  const oneWeekVolumeUSD = parseFloat(oneWeekData ? data?.volumeUSD - oneWeekData?.volumeUSD : data.volumeUSD)

  // set volume properties
  data.oneDayVolumeUSD = parseFloat(oneDayVolumeUSD)
  data.oneWeekVolumeUSD = oneWeekVolumeUSD
  data.volumeChangeUSD = volumeChangeUSD
  data.oneDayVolumeUntracked = oneDayVolumeUntracked
  data.volumeChangeUntracked = volumeChangeUntracked

  // set liquiditry properties
  data.trackedReserveUSD = data.trackedReserveETH * ethPrice
  data.liquidityChangeUSD = getPercentChange(data.reserveUSD, oneDayData?.reserveUSD)

  // format if pair hasnt existed for a day or a week
  if (!oneDayData && data && data.createdAtBlockNumber > oneDayBlock) {
    data.oneDayVolumeUSD = parseFloat(data.volumeUSD)
  }
  if (!oneDayData && data) {
    data.oneDayVolumeUSD = parseFloat(data.volumeUSD)
  }
  if (!oneWeekData && data) {
    data.oneWeekVolumeUSD = parseFloat(data.volumeUSD)
  }

  // format incorrect names
  updateNameData(data)

  // Convert token0 and token1 to Token format
  if (data.token0 && data.token1) {
    data.token0 = new Token(
      43114, // Default to Avalanche chainId
      data.token0.address,
      parseInt(data.token0.decimals),
      data.token0.symbol,
      data.token0.name
    )
    data.token1 = new Token(
      43114, // Default to Avalanche chainId
      data.token1.address,
      parseInt(data.token1.decimals),
      data.token1.symbol,
      data.token1.name
    )
  }

  return data
}

const getPairTransactions = async pairAddress => {
  const transactions = {}

  try {
    const result = await client.query({
      query: FILTERED_TRANSACTIONS,
      variables: {
        allPairs: [pairAddress]
      },
      fetchPolicy: 'no-cache'
    })
    transactions.mints = result.data.mints
    transactions.burns = result.data.burns
    transactions.swaps = result.data.swaps

    const avaxPrice = await getCurrentEthPrice()

    for (let i = 0; i < transactions.mints.length; i++) {
      transactions.mints[i].amountUSD = (parseFloat(transactions.mints[i].amountUSD) * avaxPrice).toString()
    }
    for (let i = 0; i < transactions.burns.length; i++) {
      transactions.burns[i].amountUSD = (parseFloat(transactions.burns[i].amountUSD) * avaxPrice).toString()
    }
    for (let i = 0; i < transactions.swaps.length; i++) {
      transactions.swaps[i].amountUSD = (parseFloat(transactions.swaps[i].amountUSD) * avaxPrice).toString()
    }
  } catch (e) {
    console.log(e)
  }

  return transactions
}

const getPairChartData = async pairAddress => {
  let data = []
  const utcEndTime = dayjs.utc()
  const utcStartTime = utcEndTime.subtract(1, 'year').startOf('minute')
  const startTime = utcStartTime.unix() - 1

  try {
    let allFound = false
    let skip = 0
    while (!allFound) {
      const result = await client.query({
        query: PAIR_CHART,
        variables: {
          pairAddress: pairAddress,
          skip
        },
        fetchPolicy: 'cache-first'
      })
      skip += 1000
      data = data.concat(result.data.pairDayDatas)
      if (result.data.pairDayDatas.length < 1000) {
        allFound = true
      }
    }

    const dayIndexSet = new Set()
    const dayIndexArray = []
    const oneDay = 24 * 60 * 60
    data.forEach((dayData, i) => {
      // add the day index to the set of days
      dayIndexSet.add((data[i].date / oneDay).toFixed(0))
      dayIndexArray.push(data[i])
      dayData.dailyVolumeUSD = parseFloat(dayData.dailyVolumeUSD)
      dayData.reserveUSD = parseFloat(dayData.reserveUSD)
    })

    if (data[0]) {
      // fill in empty days
      let timestamp = data[0].date ? data[0].date : startTime
      let latestLiquidityUSD = data[0].reserveUSD
      let index = 1
      while (timestamp < utcEndTime.unix() - oneDay) {
        const nextDay = timestamp + oneDay
        const currentDayIndex = (nextDay / oneDay).toFixed(0)
        if (!dayIndexSet.has(currentDayIndex)) {
          data.push({
            date: nextDay,
            dayString: nextDay,
            dailyVolumeUSD: 0,
            reserveUSD: latestLiquidityUSD
          })
        } else {
          latestLiquidityUSD = dayIndexArray[index].reserveUSD
          index = index + 1
        }
        timestamp = nextDay
      }
    }

    data = data.sort((a, b) => (parseInt(a.date) > parseInt(b.date) ? 1 : -1))

    for (let j = 0; j < data.length; j++) {
      let latestAvaxPrice
      if (j === data.length - 1) {
        latestAvaxPrice = await getCurrentEthPrice()
      } else {
        latestAvaxPrice = await getEthPriceAtDate(data[j].date)
      }
      data[j].dailyVolumeUSD = data[j].dailyVolumeUSD * latestAvaxPrice
      data[j].reserveUSD = data[j].reserveUSD * latestAvaxPrice
    }
  } catch (e) {
    console.log(e)
  }

  return data
}

const getHourlyRateData = async (pairAddress, startTime, latestBlock) => {
  try {
    const utcEndTime = dayjs.utc()
    let time = startTime

    // create an array of hour start times until we reach current hour
    const timestamps = []
    while (time <= utcEndTime.unix() /* - 3600*/) {
      timestamps.push(time)
      time += 3600
    }

    // backout if invalid timestamp format
    if (timestamps.length === 0) {
      return []
    }

    // once you have all the timestamps, get the blocks for each timestamp in a bulk query
    let blocks

    blocks = await getBlocksFromTimestamps(timestamps, 100)

    // catch failing case
    if (!blocks || blocks?.length === 0) {
      return []
    }

    if (latestBlock) {
      blocks = blocks.filter(b => {
        return parseFloat(b.number) <= parseFloat(latestBlock)
      })
    }

    const result = await splitQuery(HOURLY_PAIR_RATES, avalancheBlockClient, [pairAddress], blocks, 100)

    // format token ETH price results
    const values = []
    for (const row in result) {
      const timestamp = row.split('t')[1]
      if (timestamp) {
        values.push({
          timestamp,
          rate0: parseFloat(result[row]?.token0Price),
          rate1: parseFloat(result[row]?.token1Price)
        })
      }
    }

    const formattedHistoryRate0 = []
    const formattedHistoryRate1 = []

    // for each hour, construct the open and close price
    for (let i = 0; i < values.length - 1; i++) {
      formattedHistoryRate0.push({
        timestamp: values[i].timestamp,
        open: parseFloat(values[i].rate0),
        close: parseFloat(values[i + 1].rate0)
      })
      formattedHistoryRate1.push({
        timestamp: values[i].timestamp,
        open: parseFloat(values[i].rate1),
        close: parseFloat(values[i + 1].rate1)
      })
    }

    return [formattedHistoryRate0, formattedHistoryRate1]
  } catch (e) {
    console.log(e)
    return [[], []]
  }
}

export function Updater() {
  const [, { updateTopPairs }] = usePairDataContext()
  //const [ethPrice] = useEthPrice()
  const { chainId } = useWeb3React()
  let ethPrice0 = useUSDCPrice(WAVAX[ChainId.AVALANCHE])
  const ethPrice = Number(ethPrice0?.toFixed(2));
  useEffect(() => {
    async function getData() {
      // get top pairs by reserves
      const {
        data: { pairs }
      } = await client.query({
        query: PAIRS_CURRENT
      })

      // format as array of addresses
      const formattedPairs = pairs.map(pair => {
        return pair.address
      })

      // get data for every pair in list
      const topPairs = await getBulkPairData(formattedPairs, ethPrice, chainId)
      topPairs && updateTopPairs(topPairs)
    }
    ethPrice && getData()
  }, [ethPrice, updateTopPairs, chainId])
  return null
}

export function useHourlyRateData(pairAddress, timeWindow) {
  const [state, { updateHourlyData }] = usePairDataContext()
  const chartData = state?.[pairAddress]?.hourlyData?.[timeWindow]
  const [latestBlock] = useLatestBlocks()

  useEffect(() => {
    const currentTime = dayjs.utc()
    const windowSize =
      timeWindow === timeframeOptions.DAY ? 'day' : timeWindow === timeframeOptions.MONTH ? 'month' : 'week'
    const startTime =
      timeWindow === timeframeOptions.ALL_TIME
        ? 1589760000
        : currentTime
            .subtract(1, windowSize)
            .startOf('hour')
            .unix()

    async function fetch() {
      const data = await getHourlyRateData(pairAddress, startTime, latestBlock)
      updateHourlyData(pairAddress, data, timeWindow)
    }
    if (!chartData) {
      fetch()
    }
  }, [chartData, timeWindow, pairAddress, updateHourlyData, latestBlock])

  return chartData
}

/**
 * @todo
 * store these updates to reduce future redundant calls
 */
export function useDataForList(pairList) {
  const [state] = usePairDataContext()
  let ethPrice0 = useUSDCPrice(WAVAX[ChainId.AVALANCHE])
  const ethPrice = Number(ethPrice0?.toFixed(2));

  const [stale, setStale] = useState(false)
  const [fetched, setFetched] = useState([])

  // reset
  useEffect(() => {
    if (pairList) {
      setStale(false)
      setFetched()
    }
  }, [pairList])

  useEffect(() => {
    async function fetchNewPairData() {
      const newFetched = []
      const unfetched = []

      pairList.map(async pair => {
        const currentData = state?.[pair.address]
        if (!currentData) {
          unfetched.push(pair.address)
        } else {
          newFetched.push(currentData)
        }
      })

      const newPairData = await getBulkPairData(
        unfetched.map(pair => {
          return pair
        }),
        ethPrice
      )
      setFetched(newFetched.concat(newPairData))
    }
    if (ethPrice && pairList && pairList.length > 0 && !fetched && !stale) {
      setStale(true)
      fetchNewPairData()
    }
  }, [ethPrice, state, pairList, stale, fetched])

  const formattedFetch =
    fetched &&
    fetched.reduce((obj, cur) => {
      return { ...obj, [cur?.address]: cur }
    }, {})

  return formattedFetch
}

/**
 * Get all the current and 24hr changes for a pair
 */
export function usePairData(pairAddress) {
  const [state, { update }] = usePairDataContext()
  let ethPrice0 = useUSDCPrice(WAVAX[ChainId.AVALANCHE])
  const ethPrice = Number(ethPrice0?.toFixed(2));
  const pairData = state?.[pairAddress]

  useEffect(() => {
    async function fetchData() {
      if (!pairData && pairAddress) {
        const data = await getBulkPairData([pairAddress], ethPrice)
        data && update(pairAddress, data[0])
      }
    }
    if (!pairData && pairAddress && ethPrice && isAddress(pairAddress)) {
      fetchData()
    }
  }, [pairAddress, pairData, update, ethPrice])
  return pairData || {}
}

/**
 * Get most recent txns for a pair
 */
export function usePairTransactions(pairAddress) {
  const [state, { updatePairTxns }] = usePairDataContext()
  const pairTxns = state?.[pairAddress]?.txns
  useEffect(() => {
    async function checkForTxns() {
      if (!pairTxns) {
        const transactions = await getPairTransactions(pairAddress)
        updatePairTxns(pairAddress, transactions)
      }
    }
    checkForTxns()
  }, [pairTxns, pairAddress, updatePairTxns])
  return pairTxns
}

export function usePairChartData(pairAddress) {
  const [state, { updateChartData }] = usePairDataContext()
  const chartData = state?.[pairAddress]?.chartData

  useEffect(() => {
    async function checkForChartData() {
      if (!chartData) {
        const data = await getPairChartData(pairAddress)
        updateChartData(pairAddress, data)
      }
    }
    checkForChartData()
  }, [chartData, pairAddress, updateChartData])
  return chartData
}

/**
 * Get list of all pairs in Uniswap
 */
export function useAllPairData() {
  const [state] = usePairDataContext()
  return state || {}
}
