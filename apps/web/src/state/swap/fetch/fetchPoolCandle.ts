import { ChainId } from '@pancakeswap/chains'
import { gql } from 'graphql-request'
import { v3InfoClients } from 'utils/graphql'

interface CandleResults {
  [key: string]: {
    high1: string
    close1: string
    open1: string
    low1: string
    high: string
    close: string
    open: string
    low: string
    volumeToken1: string
    periodStartUnix: number
    date,
    timeMs: number
  }[]
}

const POOL_CANDLE_15M = gql`
query getCandle($token0: String, $token1: String, $from: Int, $to: Int) {
  pool15MinuteCandleDatas(where: {pool_: {token0: $token0, token1: $token1}, periodStartUnix_gte: $from, periodStartUnix_lte: $to}) {
    high1
    close1
    open1
    low1
    volumeToken1
    periodStartUnix
  }
}
`
const POOL_CANDLE_30M = gql`
query getCandle($token0: String, $token1: String, $from: Int, $to: Int) {
  pool30MinuteCandleDatas(where: {pool_: {token0: $token0, token1: $token1}, periodStartUnix_gte: $from, periodStartUnix_lte: $to}) {
    high1
    close1
    open1
    low1
    volumeToken1
    periodStartUnix
  }
}
`

const POOL_CANDLE_5M = gql`
query getCandle($token0: String, $token1: String, $from: Int, $to: Int) {
  pool5MinuteCandleDatas(where: {pool_: {token0: $token0, token1: $token1}, periodStartUnix_gte: $from, periodStartUnix_lte: $to}) {
    high1
    close1
    open1
    low1
    volumeToken1
    periodStartUnix
  }
}
`
const POOL_CANDLE_HOUR = gql`
query getCandle($token0: String, $token1: String, $from: Int, $to: Int) {
  poolHourCandleDatas(where: {pool_: {token0: $token0, token1: $token1}, periodStartUnix_gte: $from, periodStartUnix_lte: $to}) {
    high1
    close1
    open1
    low1
    volumeToken1
    periodStartUnix
  }
}
`

const POOL_CANDLE_MINUTE = gql`
query getCandle($token0: String, $token1: String, $from: Int, $to: Int) {
  poolMinuteCandleDatas(where: {pool_: {token0: $token0, token1: $token1}, periodStartUnix_gte: $from, periodStartUnix_lte: $to}) {
    high1
    close1
    open1
    low1
    volumeToken1
    periodStartUnix
  }
}
`
const POOL_CANDLE_DAY= gql`
query getCandle($token0: String, $token1: String, $from: Int, $to: Int) {
  poolDayCandleDatas(where: {pool_: {token0: $token0, token1: $token1}, date_gte: $from, date_lte: $to}) {
    high1
    close1
    open1
    low1
    volumeToken1
    date
  }
}
`
const POOL_CANDLE_MONTH= gql`
query getCandle($token0: String, $token1: String, $from: Int, $to: Int) {
  poolMonthCandleDatas(where: {pool_: {token0: $token0, token1: $token1}, date_gte: $from, date_lte: $to}) {
    high1
    close1
    open1
    low1
    volumeToken1
    date
  }
}
`

const POOL_CANDLE_WEEK= gql`
query getCandle($token0: String, $token1: String, $from: Int, $to: Int) {
  poolWeekCandleDatas(where: {pool_: {token0: $token0, token1: $token1}, date_gte: $from, date_lte: $to}) {
    high1
    close1
    open1
    low1
    volumeToken1
    date
  }
}
`
const getQueryByResolution = (resolution: string | number) => {
  switch (resolution) {
    case '1':
      return POOL_CANDLE_MINUTE
    case '5':
      return POOL_CANDLE_5M
    case '15':
      return POOL_CANDLE_15M
    case '30':
      return POOL_CANDLE_30M
    case '60':
      return POOL_CANDLE_HOUR
    case '1W':
      return POOL_CANDLE_WEEK
    case '1D':
      return POOL_CANDLE_DAY
    case '1M':
      return POOL_CANDLE_MONTH
    default:
      return POOL_CANDLE_HOUR
  }
}


export const  fetchPoolCandleByInterval = async (pairs: Array<string>, from: number, to: number, resolution: string | number) => {
  const client = v3InfoClients[ChainId.U2U_NEBULAS]
  const query = getQueryByResolution(resolution)
  const keyByResolution = {
    '1': 'poolMinuteCandleDatas',
    '5': 'pool5MinuteCandleDatas',
    '15': 'pool15MinuteCandleDatas',
    '30': 'pool30MinuteCandleDatas',
    '60': 'poolHourCandleDatas',
    '1W': 'poolWeekCandleDatas',
    '1D': 'poolDayCandleDatas',
    '1M': 'poolMonthCandleDatas'
  }
  const res = await client.request<CandleResults>(query, {
    token0: pairs[0]?.toLowerCase(),
    token1: pairs[1]?.toLowerCase(),
    from: Math.ceil(from / 1000),
    to: Math.ceil(to / 1000)
  })

  const list = res[keyByResolution[resolution]]

  const data = list
  ? list?.map((m) => {
    const low = m.low1 || m.low
    const high = m.high1 || m.high
    const open = m.open1 || m.open
    const close = m.close1 || m.close
      return {
        time: m.date ? m.date * 1000 : m.periodStartUnix * 1000,
        low: Number(low),
        high: Number(high),
        open: Number(open),
        close: Number(close),
        volume: m.volumeToken1,
        timeMs: m.date || m.periodStartUnix
      }
    })
  : []
  return data
}