// import { CurrencyLogo, DoubleCurrencyLogo } from 'views/Info/components/CurrencyLogo'
import BasicChart from './BasicChart'
import { StyledPriceChart } from './styles'

const PriceChart = ({
  inputCurrency,
  outputCurrency,
  isDark,
  isChartExpanded,
  setIsChartExpanded,
  isMobile,
  isFullWidthContainer,
  token0Address,
  token1Address,
  currentSwapPrice,
}) => {
  // const toggleExpanded = () => setIsChartExpanded((currentIsExpanded) => !currentIsExpanded)

  return (
    <>
    <StyledPriceChart
      height="80%"
      overflow="unset"
      $isDark={isDark}
      $isExpanded={isChartExpanded}
      $isFullWidthContainer={isFullWidthContainer}
      position="relative"
    >
      <BasicChart
        token0Address={token0Address}
        token1Address={token1Address}
        isChartExpanded={isChartExpanded}
        inputCurrency={inputCurrency}
        outputCurrency={outputCurrency}
        isMobile={isMobile}
        currentSwapPrice={currentSwapPrice}
      />
    </StyledPriceChart>
    </>
  )
}

export default PriceChart
