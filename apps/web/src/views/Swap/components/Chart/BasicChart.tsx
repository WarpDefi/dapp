import { useTranslation } from '@pancakeswap/localization'
import { Box, ButtonMenu, ButtonMenuItem, Flex, SwapLineChart, Text } from '@pancakeswap/uikit'
import TrandingViewCustom from 'components/TradingViewCustom/TradingViewCustom'
import Script from 'next/script'
import { memo, useMemo, useState } from 'react'
import { useFetchPairPricesV3 } from 'state/swap/hooks'
import { PairDataTimeWindowEnum } from 'state/swap/types'
import styled from 'styled-components'
import PairPriceDisplay from '../../../../components/PairPriceDisplay'
import NoChartAvailable from './NoChartAvailable'
import { getTimeWindowChange } from './utils'

enum CHART_TYPE {
  LINE = 1,
  CANDLE = 2
}

const StyledBox = styled(Box)`
  --space: 75px;
  height: calc(100% - var(--space));
  width: 100%;
  padding: 10px 0;
  @media screen and (max-width: 991px) {
    --space: 110px;
  }
  @media screen and (max-width: 575px) {
    height: 215px;
    padding: 5px 0;
  }
`
const StyledFlex  = styled(Flex)`
  width: 100%;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  @media screen and (max-width: 575px) {
    flex-direction: column;
    align-items: flex-start;
  }
`
const StyledDisplayFlex = styled(Flex)`
  --height: 75px;
  min-height: var(--height);
  @media screen and (max-width: 575px) {
    --height: 65px;
  }
`
const IconImage = styled.div`
  border-radius: 4px;
  padding: 8px;
  cursor: pointer;
  border: 2px solid transparent;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  color: ${({ theme }) => theme.colors.textSubtle};
  + div {
    margin-left: 12px;
    @media screen and (max-width: 991px) {
      margin-left: 8px;
    }
    @media screen and (max-width: 575px) {
      margin-left: 4px;
    }
  }
  &:hover {
    color: ${({ theme }) => theme.colors.hover};
  }
  &.active {
    border-color: #000;
    color: #000 !important;
    background: ${({ theme }) => theme.colors.primary};
  }
  svg {
    --size: 20px;
    display: block;
    width: var(--size);
    height: var(--size);
    @media screen and (max-width: 991px) {
      --size: 18px;
    }
    @media screen and (max-width: 575px) {
      --size: 16px;
    }
  }
`
const StyledListButton = styled(Box)`
  @media screen and (max-width: 575px) {
    width: 100%;
    text-align: right;
  }
`
const StyledButtonMenuItem = styled(ButtonMenuItem)`
  @media screen and (max-width: 991px) {
    padding: 0 12px;
    font-size: 15px;
  }
  @media screen and (max-width: 575px) {
    padding: 0 8px;
    font-size: 14px;
  }
`

const RESOLUTION_CANDLE = ['1m', '5m','15m', '1H', '1D', '1W', '1M']
const RESOLUTION_LINE = ['1D', '1W', '1M', '1Y' ]
const BasicChart = ({
  token0Address,
  token1Address,
  isChartExpanded,
  inputCurrency,
  outputCurrency,
  isMobile,
  currentSwapPrice,
}) => {
  const [chartType, setChartType] = useState<number>(CHART_TYPE.LINE)
  const [timeWindow, setTimeWindow] = useState<PairDataTimeWindowEnum | number>(0)
  const [resolutionIndex, setResolutionIndex] = useState<number>(0)
  const [resolution, setResolution] = useState<string>('1')
  const LIST_RESOLUTION = chartType === CHART_TYPE.CANDLE ? RESOLUTION_CANDLE : RESOLUTION_LINE
  const handleSetChartType = (type: number) => {
    if(type === CHART_TYPE.CANDLE) {
      setResolution('15')
      setTimeWindow(0)
      setResolutionIndex(2)
    } else {
      setTimeWindow(0)
    }
    setChartType(type)
  }
  const handleSetTimeWindow = (timeDay: PairDataTimeWindowEnum | number) => {
    if(chartType === CHART_TYPE.LINE) {
      setTimeWindow(timeDay)
    } else {
      setResolutionIndex(timeDay)
    }
    switch(timeDay) {
      case 0:
        setResolution('1')
        break
      case 1:
        setResolution('5')
        break
      case 2:
        setResolution('15')
        break
      case 3:
        setResolution('60')
        break
      case 4:
        setResolution('1D')
        break
      case 5:
        setResolution('1W')
        break
      case 6:
        setResolution('1M')
        break
      default:
        setResolution('15')
    }
  }

  const { data: pairPrices = [] } = useFetchPairPricesV3({
    token0Address,
    token1Address,
    timeWindow,
    currentSwapPrice,
  })
  const [hoverValue, setHoverValue] = useState<number | undefined>()
  const [hoverDate, setHoverDate] = useState<string | undefined>()
  const valueToDisplay = hoverValue || pairPrices[pairPrices.length - 1]?.value
  const {
    changePercentage: changePercentageToCurrent,
    changeValue: changeValueToCurrent,
    isChangePositive: isChangePositiveToCurrent,
  } = useMemo(() => getTimeWindowChange(pairPrices), [pairPrices])
  const { changePercentage, changeValue, isChangePositive } = useMemo(() => {
    if (hoverValue) {
      const lastItem = pairPrices[pairPrices.length - 1]
      if (lastItem) {
        const copyPairPrices = [...pairPrices]
        copyPairPrices[pairPrices.length - 1] = { ...lastItem, value: hoverValue }
        return getTimeWindowChange(copyPairPrices)
      }
    }
    return {
      changePercentage: changePercentageToCurrent,
      changeValue: changeValueToCurrent,
      isChangePositive: isChangePositiveToCurrent,
    }
  }, [pairPrices, hoverValue, changePercentageToCurrent, changeValueToCurrent, isChangePositiveToCurrent])
  const chartHeight = useMemo(() => (isChartExpanded ? 'calc(100vh - 220px)' : 'calc(100% - 77px)'), [isChartExpanded])
  const {
    t,
    currentLanguage: { locale },
  } = useTranslation()
  const currentDate = useMemo(() => {
    if (!hoverDate) {
      return new Date().toLocaleString(locale, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
      })
    }
    return null
  }, [hoverDate, locale])

  // Sometimes we might receive array full of zeros for obscure tokens while trying to derive data
  // In that case chart is not useful to users
  const isBadData = useMemo(
    () =>
      pairPrices &&
      pairPrices.length > 0 &&
      pairPrices.every(
        (price) => !price.value || price.value === 0 || price.value === Infinity || Number.isNaN(price.value),
      ),
    [pairPrices],
  )

  if (isBadData) {
    return <NoChartAvailable token0Address={token0Address} token1Address={token1Address} isMobile={isMobile} />
  }


  return (
    <>
      <Flex justifyContent={["flex-end"]} position={["relative", "relative", "relative", "relative", "absolute"]} right="0" top={["auto", "auto", "auto", "auto", "-60px"]}>
        <IconImage onClick={() => { handleSetChartType(CHART_TYPE.LINE) }} className={chartType === CHART_TYPE.LINE ? 'active' : ''}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21" fill="none">
            <g clip-path="url(#clip0_70_5252)">
            <path d="M19.2807 19.2492H4.28068C3.61764 19.2492 2.98175 18.9858 2.51291 18.517C2.04407 18.0481 1.78068 17.4122 1.78068 16.7492V1.76919C1.78068 1.54817 1.69288 1.33621 1.5366 1.17993C1.38032 1.02365 1.16836 0.935852 0.947347 0.935852C0.726333 0.935852 0.514372 1.02365 0.358091 1.17993C0.201811 1.33621 0.114014 1.54817 0.114014 1.76919L0.114014 16.7492C0.115337 17.8538 0.554749 18.9129 1.33586 19.694C2.11698 20.4751 3.17602 20.9145 4.28068 20.9159H19.2807C19.5017 20.9159 19.7137 20.8281 19.8699 20.6718C20.0262 20.5155 20.114 20.3035 20.114 20.0825C20.114 19.8615 20.0262 19.6495 19.8699 19.4933C19.7137 19.337 19.5017 19.2492 19.2807 19.2492Z" fill="currentColor"/>
            </g>
            <path d="M5.10195 13.3721C5.32295 13.3721 5.53488 13.2843 5.69112 13.128L8.67945 10.1396C8.83829 9.98833 9.04925 9.90393 9.26862 9.90393C9.48799 9.90393 9.69895 9.98833 9.85779 10.1396L11.6678 11.9496C12.1366 12.4183 12.7724 12.6816 13.4353 12.6816C14.0982 12.6816 14.734 12.4183 15.2028 11.9496L19.8578 7.29465C20.0096 7.13748 20.0936 6.92697 20.0917 6.70848C20.0898 6.48998 20.0021 6.28097 19.8476 6.12646C19.6931 5.97196 19.4841 5.88432 19.2656 5.88242C19.0471 5.88052 18.8366 5.96451 18.6795 6.11631L14.0245 10.7705C13.8682 10.9267 13.6563 11.0145 13.4353 11.0145C13.2143 11.0145 13.0024 10.9267 12.8461 10.7705L11.0361 8.96131C10.5673 8.49263 9.93153 8.22935 9.26862 8.22935C8.60571 8.22935 7.96994 8.49263 7.50112 8.96131L4.51279 11.9496C4.39628 12.0662 4.31694 12.2147 4.2848 12.3763C4.25266 12.5379 4.26916 12.7054 4.33222 12.8577C4.39528 13.0099 4.50206 13.1401 4.63907 13.2316C4.77608 13.3232 4.93716 13.3721 5.10195 13.3721Z" fill="currentColor"/>
            <defs>
            <clipPath id="clip0_70_5252">
            <rect width="20" height="20" fill="white" transform="translate(0.114014 0.935852)"/>
            </clipPath>
            </defs>
          </svg>
        </IconImage>
        <IconImage onClick={() => { handleSetChartType(CHART_TYPE.CANDLE) }} className={chartType === CHART_TYPE.CANDLE ? 'active' : ''}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21" fill="none">
            <g clip-path="url(#clip0_70_5245)">
            <path d="M19.2807 19.2692H2.61401C2.393 19.2692 2.18104 19.1814 2.02476 19.0251C1.86848 18.8688 1.78068 18.6569 1.78068 18.4359V1.76919C1.78068 1.54817 1.69288 1.33621 1.5366 1.17993C1.38032 1.02365 1.16836 0.935852 0.947347 0.935852C0.726333 0.935852 0.514372 1.02365 0.358091 1.17993C0.201811 1.33621 0.114014 1.54817 0.114014 1.76919L0.114014 18.4359C0.114014 19.0989 0.377406 19.7348 0.846247 20.2036C1.31509 20.6725 1.95097 20.9359 2.61401 20.9359H19.2807C19.5017 20.9359 19.7137 20.8481 19.8699 20.6918C20.0262 20.5355 20.114 20.3235 20.114 20.1025C20.114 19.8815 20.0262 19.6695 19.8699 19.5133C19.7137 19.357 19.5017 19.2692 19.2807 19.2692Z" fill="currentColor"/>
            <path d="M12.6141 17.603C12.8351 17.603 13.0471 17.5152 13.2034 17.359C13.3596 17.2027 13.4474 16.9907 13.4474 16.7697V10.9364C13.4474 10.7153 13.3596 10.5034 13.2034 10.3471C13.0471 10.1908 12.8351 10.103 12.6141 10.103C12.3931 10.103 12.1811 10.1908 12.0248 10.3471C11.8686 10.5034 11.7808 10.7153 11.7808 10.9364V16.7697C11.7808 16.9907 11.8686 17.2027 12.0248 17.359C12.1811 17.5152 12.3931 17.603 12.6141 17.603Z" fill="currentColor"/>
            <path d="M5.94735 17.603C6.16836 17.603 6.38032 17.5152 6.5366 17.359C6.69288 17.2027 6.78068 16.9907 6.78068 16.7697V10.9364C6.78068 10.7153 6.69288 10.5034 6.5366 10.3471C6.38032 10.1908 6.16836 10.103 5.94735 10.103C5.72633 10.103 5.51437 10.1908 5.35809 10.3471C5.20181 10.5034 5.11401 10.7153 5.11401 10.9364V16.7697C5.11401 16.9907 5.20181 17.2027 5.35809 17.359C5.51437 17.5152 5.72633 17.603 5.94735 17.603Z" fill="currentColor"/>
            <path d="M15.9474 17.6025C16.1684 17.6025 16.3803 17.5147 16.5366 17.3584C16.6929 17.2022 16.7807 16.9902 16.7807 16.7692V6.76919C16.7807 6.54817 16.6929 6.33621 16.5366 6.17993C16.3803 6.02365 16.1684 5.93585 15.9474 5.93585C15.7263 5.93585 15.5144 6.02365 15.3581 6.17993C15.2018 6.33621 15.114 6.54817 15.114 6.76919V16.7692C15.114 16.9902 15.2018 17.2022 15.3581 17.3584C15.5144 17.5147 15.7263 17.6025 15.9474 17.6025Z" fill="currentColor"/>
            <path d="M9.2806 17.6025C9.50162 17.6025 9.71358 17.5147 9.86986 17.3584C10.0261 17.2022 10.1139 16.9902 10.1139 16.7692V6.76919C10.1139 6.54817 10.0261 6.33621 9.86986 6.17993C9.71358 6.02365 9.50162 5.93585 9.2806 5.93585C9.05959 5.93585 8.84763 6.02365 8.69134 6.17993C8.53506 6.33621 8.44727 6.54817 8.44727 6.76919V16.7692C8.44727 16.9902 8.53506 17.2022 8.69134 17.3584C8.84763 17.5147 9.05959 17.6025 9.2806 17.6025Z" fill="currentColor"/>
            </g>
            <defs>
            <clipPath id="clip0_70_5245">
            <rect width="20" height="20" fill="white" transform="translate(0.114014 0.935852)"/>
            </clipPath>
            </defs>
          </svg>
        </IconImage>
      </Flex>
      <Flex
        flexDirection={['column', null, null, null, null, null, 'row']}
        alignItems={['flex-start', null, null, null, null, null, 'center']}
        justifyContent="space-between"
        flexWrap="wrap"
      >
        <StyledFlex>
          <StyledDisplayFlex flexDirection="column" pt="12px">
            <PairPriceDisplay
              value={pairPrices?.length > 0 && valueToDisplay}
              inputSymbol={inputCurrency?.symbol}
              outputSymbol={outputCurrency?.symbol}
            >
              <Text color={isChangePositive ? 'success' : 'failure'} fontSize="20px" ml="4px" bold>
                {`${isChangePositive ? '+' : ''}${changeValue.toFixed(3)} (${changePercentage}%)`}
              </Text>
            </PairPriceDisplay>
            <Text small color="secondary">
              {hoverDate || currentDate}
            </Text>
          </StyledDisplayFlex>
          <StyledListButton>
            {LIST_RESOLUTION.length > 0 && (
              <ButtonMenu activeIndex={chartType === CHART_TYPE.CANDLE ? resolutionIndex : timeWindow} onItemClick={handleSetTimeWindow} scale="sm">
                  {
                    LIST_RESOLUTION.map((item: string) => {
                      return <StyledButtonMenuItem key={item}>{t(item)}</StyledButtonMenuItem>
                    })
                  }
              </ButtonMenu>
            )}
          </StyledListButton>
        </StyledFlex>
      </Flex>
      <StyledBox>
        {chartType === CHART_TYPE.LINE ? (
          <SwapLineChart
            data={pairPrices}
            setHoverValue={setHoverValue}
            setHoverDate={setHoverDate}
            isChangePositive={isChangePositiveToCurrent}
            isChartExpanded={isChartExpanded}
            timeWindow={timeWindow}
          />
        ) : (
          <TrandingViewCustom resolution={resolution} symbol={`${inputCurrency?.symbol}/${outputCurrency?.symbol}-${inputCurrency?.wrapped.address}_${outputCurrency?.wrapped.address}`}/>
        )}
      </StyledBox>
      <Script src="../../../charting_library/charting_library.js" strategy="lazyOnload"/>
    </>
  )
}

export default memo(BasicChart, (prev, next) => {
  return (
    prev.token0Address === next.token0Address &&
    prev.token1Address === next.token1Address &&
    prev.isChartExpanded === next.isChartExpanded &&
    prev.isMobile === next.isMobile &&
    prev.isChartExpanded === next.isChartExpanded &&
    ((prev.currentSwapPrice !== null &&
      next.currentSwapPrice !== null &&
      prev.currentSwapPrice[prev.token0Address] === next.currentSwapPrice[next.token0Address] &&
      prev.currentSwapPrice[prev.token1Address] === next.currentSwapPrice[next.token1Address]) ||
      (prev.currentSwapPrice === null && next.currentSwapPrice === null))
  )
})
