
// import { useStreaming } from './useStreaming'

import { Decimal } from "@pancakeswap/swap-sdk-core";
import { useState } from "react";
import { fetchPoolCandleByInterval } from "state/swap/fetch/fetchPoolCandle";
import { PeriodParams } from "../../../public/charting_library/charting_library";
import { useStreaming } from "./useStream";
// import { usePoolCandle } from "views/Swap/hooks/usePoolCandle";



  
  const lastBarsCache = new Map()
  // DatafeedConfiguration implementation
  const configurationData = {
    // Represents the resolutions for bars supported by your datafeed
    supported_resolutions: [1, 5, 15, 60, '1D', '1W', '1M'],
    // The `symbols_types` arguments are used for the `searchSymbols` method if a user selects this symbol type
    symbols_types: [{ name: 'crypto', value: 'crypto' }]
  }

  Decimal.set({
    precision: 20,
    rounding: Decimal.ROUND_HALF_UP,
    toExpNeg: -7,
    toExpPos: 21
  });
  
export const useDataFeed = () => {
  const [precision, setPrecision] = useState<number>(4)
  const {subscribeOnStream, unsubscribeFromStream} = useStreaming()
  const dataFeed = {
    onReady: (callback: any) => {
      setTimeout(() => callback(configurationData))
    },
    resolveSymbol: async (symbolFull: any, onSymbolResolvedCallback: any, onResolveErrorCallback: any) => {
      if (!symbolFull) {
        onResolveErrorCallback('Cannot resolve symbol')
        return ''
      }
      const splitSymbol = symbolFull.split('-')
      const symbolName = splitSymbol[0]
      const symbolInfo = {
        name: symbolFull,
        full_name: splitSymbol[1],
        key: splitSymbol[1],
        ticket: splitSymbol[1],
        description: symbolName.toUpperCase(),
        session: '24x7',
        // eslint-disable-next-line new-cap
        // exchange: symbolItem.exchange,
        // timezone: moment.tz.guess() || 'Asia/Singapore',
        minmov: 1,
        pricescale: '1e8',
        has_intraday: true,
        has_no_volume: false,
        has_weekly_and_monthly: true,
        supported_resolutions: configurationData.supported_resolutions,
        volume_precision: 3,
        data_status: 'streaming'
      }
      onSymbolResolvedCallback(symbolInfo)
      return symbolInfo
    },

    getBars: async (
      symbolInfo: any,
      resolution: string,
      periodParams: PeriodParams,
      onResult: any,
      onError: any,
    ) => {
      const {	
        from: rangeStartDate,
        to: rangeEndDate,
        firstDataRequest
      } = periodParams
      const from = rangeStartDate * 1000
      const to = rangeEndDate * 1000
      const tokens = symbolInfo.ticket.split('_')
      const urlParameters: any = {
        token0: tokens[0].trim()?.toLowerCase(),
        token1: tokens[1].trim()?.toLowerCase(),
        from,
        to
      }
      try {
        const listCandle = await fetchPoolCandleByInterval([urlParameters.token0, urlParameters.token1], from, to, resolution)
        if (listCandle.length === 0) {
          // "noData" should be set if there is no data in the requested period
          onResult([], { noData: true })
          if(firstDataRequest) return
        }
        let bars: any = []
        listCandle.forEach((bar: any) => {
          if (bar.time >= from && bar.time < to) {
            bars = [
              ...bars,
              {
                time: bar.time,
                low: bar.low,
                high: bar.high,
                open: bar.open,
                close: bar.close,
                volume: bar.volume
              }
            ]
          }
        })
        if (firstDataRequest) {
          if(bars.length > 0) {
            const lastBar = bars[bars.length - 1]
            const _precision = new Decimal(Math.min(lastBar.close,bars[0].close)).toSignificantDigits(4)
            const _decimal = _precision.decimalPlaces()
            setPrecision(_decimal > 4 ? _decimal : 4)
            lastBarsCache.set(symbolInfo.key, {
              ...lastBar
            })
          }
        }
        onResult(bars, { noData: false })
      } catch (error) {
        onError(error)
      }
    },

    subscribeBars: (symbolInfo: any, resolution: any, onRealtimeCallback: any, subscriberUID: any, onResetCacheNeededCallback: any) => {
      subscribeOnStream(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback, lastBarsCache.get(symbolInfo.key))
    },
    unsubscribeBars: (subscriberUID: any) => {
      unsubscribeFromStream(subscriberUID)
    }
  }
  return {
    dataFeed,
    precision
  }

}