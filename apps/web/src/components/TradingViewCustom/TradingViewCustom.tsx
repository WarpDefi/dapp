import { useTranslation } from '@pancakeswap/localization'
import { Box, Loading, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useDataFeed } from 'hooks/tradingView/useDataFeed'
import { useStreaming } from 'hooks/tradingView/useStream'
import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { usePoolCandle } from 'views/Swap/hooks/usePoolCandle'
import { IChartingLibraryWidget } from "../../../public/charting_library/charting_library"
import { defaultChartProps } from './TradingViewConfig'

const ContainerLoading = styled.div`
  height: 100%;
  width: 100%;
  display:flex;
  justify-content: center;
  align-items: center;
  background: ${({ theme }) => theme.colors.backgroundAlt};
`
/**
 * When the script tag is injected the TradingView object is not immediately
 * available on the window. So we listen for when it gets set
 */
const tradingViewListener = async () => {
  return new Promise<void>((resolve) =>
    Object.defineProperty(window, 'TradingView', {
      configurable: true,
      set(value) {
        this.tv = value
        resolve(value)
      },
    }),
  )
}

const initializeTradingView = (TradingViewObj: any, localeCode: string, opts: any, datafeed: any, chartContainerRef: any) => {
  let timezone = 'Etc/UTC'
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch (e) {
    // noop
  }

  /* eslint-disable new-cap */
  /* eslint-disable no-new */
  // @ts-ignore
  return new TradingViewObj.widget({
    // Advanced Chart Widget uses the legacy embedding scheme,
    // an id property should be specified in the settings object
    ...defaultChartProps,
    container: chartContainerRef.current,
    height: '100%',
    datafeed,
    symbol: opts.symbol,
    interval: opts.resolution,
    timezone,
    locale: localeCode,
    enable_publishing: false,
    allow_symbol_change: true,
    hide_side_toolbar: false,
    enabled_features: ['header_fullscreen_button'],
  })
}

interface TradingViewProps {
  symbol: string
  resolution?: string
}
const TrandingViewCustom = ({ symbol, resolution }: TradingViewProps) => {
  const { currentLanguage } = useTranslation()
  let firstInit  = true
  const chartContainerRef = useRef(null)
  const [isChartReady, setChartReady] = useState<boolean>(false)
  const [isLoading, setLoading] = useState<boolean>(true)
  const tvWidgetRef = useRef<IChartingLibraryWidget | null>(null);
  const { isMobile } = useMatchBreakpoints()
  const [lastTime, setLastTime] = useState<number>(0)
  const symbolAddress = symbol.split("-")
  const pairs = symbolAddress[1].split('_')
  
  // const chartContainerRef = useRef<HTMLDivElement | null>(null);
  // const [isScriptLoaded, setScriptLoaded] = useState(false)
  const  { dataFeed, precision } = useDataFeed()
  const { handleCandle } = useStreaming()
  const newCandleData =  usePoolCandle(pairs, lastTime * 1000 ,  Date.now(), resolution) 
  if(newCandleData && newCandleData?.length > 0) {
    const lastCandle = newCandleData[newCandleData?.length - 1]
    if(lastCandle) {
      handleCandle({
        ...lastCandle,
        symbol: symbolAddress[1].toLowerCase()
      })
      if(lastTime !== lastCandle.timeMs) {
        setLastTime(lastCandle.timeMs)
      }
    }
  }

  const handleLastTime = () => {
    const visibleRange = tvWidgetRef.current?.activeChart().getVisibleRange()
    if(visibleRange && visibleRange?.to) {
      setLastTime(visibleRange?.to)
    }
  }

  const updatePrecision = (_precision: number) => {
    if(tvWidgetRef.current) {
      const _format = `1${'0'.repeat(_precision)}`
      tvWidgetRef.current?.applyOverrides({ 'mainSeriesProperties.minTick': `${_format},1,false` })
    }
  }



  const onReady = () => {
    tvWidgetRef.current?.onChartReady(() => {
      setChartReady(true)
      handleLastTime()
      setTimeout(() => {
        firstInit = false
      })
      tvWidgetRef.current?.activeChart().dataReady(() => {
        setLoading(false);
      });
    })
  }
  
  useEffect(() => {
      const opts: any = {
        resolution,
        symbol,
      }
      setChartReady(false)
      setLoading(true)
      if (isMobile) {
        opts.hide_side_toolbar = true
      }
      // @ts-ignore
      if (window.tv?.widget || window.TradingView?.widget) {
        setTimeout(() => {
          // @ts-ignore
          tvWidgetRef.current = initializeTradingView(window.TradingView || window.tv, currentLanguage.code, opts, dataFeed, chartContainerRef)
          onReady()
        })
      } else {
        tradingViewListener().then((tv) => {
          // @ts-ignore
          window.tv = tv
          tvWidgetRef.current = initializeTradingView(tv, currentLanguage.code, opts, dataFeed, chartContainerRef)
          onReady()
        })
      }

    // Ignore isMobile to avoid re-render TV
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLanguage, symbol, resolution])

  
  useEffect(() => {
    updatePrecision(precision)
  }, [precision, tvWidgetRef, isChartReady])
  
  useEffect(() => {
    if(resolution && tvWidgetRef.current && !firstInit) {
      tvWidgetRef.current?.remove()
      setTimeout(() => {
        handleLastTime()
      }, 1000)
    }
  }, [resolution])

  useEffect(() => {
    return () => {
      tvWidgetRef.current = null
      setLastTime(0)
    }
  },[])
  return (
    <Box overflow="hidden" height="100%" className="tradingview_container">
      {/* <div ref={chartContainerRef} /> */}
      {isLoading && <ContainerLoading><Loading width={40} height={40}/></ContainerLoading> }
      <div style={{height: "100%", minHeight: '250px'}} ref={chartContainerRef}  />
    </Box> 
  )
}

export default TrandingViewCustom
