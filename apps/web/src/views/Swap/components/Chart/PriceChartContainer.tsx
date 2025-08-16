import { ChainId, Currency, WNATIVE } from '@pancakeswap/sdk'
import { CAKE } from '@pancakeswap/tokens'
import { Flex, IconButton, SyncAltIcon, Text } from '@pancakeswap/uikit'
import { CurrencyLogo, DoubleCurrencyLogo } from 'components/Logo'
import useTheme from 'hooks/useTheme'
import styled from 'styled-components'
import { PoolData } from 'views/V3Info/types'
import BnbWbnbNotice from './BnbWbnbNotice'
import PriceChart from './PriceChart'

type PriceChartContainerProps = {
  inputCurrencyId: string | undefined
  inputCurrency?: Currency
  outputCurrencyId: string | undefined
  outputCurrency?: Currency
  isChartExpanded: boolean
  setIsChartExpanded: React.Dispatch<React.SetStateAction<boolean>> | null
  isChartDisplayed: boolean
  currentSwapPrice: {
    [key: string]: number
  }
  isMobile?: boolean
  isFullWidthContainer?: boolean
  poolDatas?: Array<PoolData>
  onCurrencySelectClick?: () => void
}

const StyledFlex = styled(Flex)`
  @media screen and (max-width: 991px) {
    display: none;
  }
`
const FlexPointer = styled(Flex)`
  cursor: pointer;
  align-items: center;
  padding: 8px 12px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.backgroundItem};
  @media screen and (max-width: 575px) {
    padding: 6px 10px;
  }
`
const BorderLayout = styled.div`
  border: 2px solid ${({ theme }) => theme.colors.cardBorder};
  box-shadow: ${({ theme }) => theme.shadows.card};
  border-radius: 8px;
  padding: 16px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
`
const StyledIconButton = styled(IconButton)`
  --size: 24px;
  width: var(--size);
  height: var(--size);
  margin-left: 12px;
  @media screen and (max-width: 575px) {
    --size: 20px;
    margin-left: 8px;
  }
`

const PriceChartContainer: React.FC<React.PropsWithChildren<PriceChartContainerProps>> = ({
  inputCurrency,
  outputCurrency,
  isChartExpanded,
  setIsChartExpanded,
  isChartDisplayed,
  isMobile,
  isFullWidthContainer = true,
  currentSwapPrice,
  onCurrencySelectClick,
}) => {
  const token0Address = inputCurrency?.wrapped.address?.toLowerCase()
  const token1Address = outputCurrency?.wrapped.address?.toLowerCase()
  const isPairReversed = false
  // const [isPairReversed, setIsPairReversed] = useState(false)
  // const togglePairReversed = useCallback(() => setIsPairReversed((prePairReversed) => !prePairReversed), [])

  const { isDark } = useTheme()

  if (!isChartDisplayed) {
    return null
  }

  const isWrap =
    inputCurrency &&
    outputCurrency &&
    WNATIVE[inputCurrency.chainId].equals(inputCurrency.wrapped) &&
    WNATIVE[outputCurrency.chainId].equals(outputCurrency.wrapped)

  const isRewardWrap =
    inputCurrency &&
    outputCurrency &&
    (WNATIVE[inputCurrency.chainId].equals(inputCurrency.wrapped) ||
      WNATIVE[outputCurrency.chainId].equals(outputCurrency.wrapped)) &&
    (CAKE[ChainId.U2U_NEBULAS].equals(inputCurrency.wrapped) ||
      CAKE[ChainId.U2U_NEBULAS].equals(outputCurrency.wrapped))

  return (
    <BorderLayout>
      <StyledFlex justifyContent="space-between" mb="12px">
        <FlexPointer
          className="border-neubrutal"
          onClick={onCurrencySelectClick}
        >
          {outputCurrency ? (
            <DoubleCurrencyLogo currency0={inputCurrency} currency1={outputCurrency} size={24} margin />
          ) : (
            inputCurrency && <CurrencyLogo currency={inputCurrency} size="24px" style={{ marginRight: '8px' }} />
          )}
          {inputCurrency && (
            <Text fontSize={['14px', '14px', '15px']} color="text" bold>
              {outputCurrency ? `${inputCurrency.symbol}/${outputCurrency.symbol}` : inputCurrency.symbol}
            </Text>
          )}
          <StyledIconButton variant="text" onClick={onCurrencySelectClick}>
            <SyncAltIcon color="primary" />
          </StyledIconButton>
        </FlexPointer>
      </StyledFlex>
      {isWrap || isRewardWrap ? (
        <BnbWbnbNotice isDark={isDark} isChartExpanded />
      ) : (
        <PriceChart
          token0Address={isPairReversed ? token1Address : token0Address}
          token1Address={isPairReversed ? token0Address : token1Address}
          inputCurrency={isPairReversed ? outputCurrency : inputCurrency}
          outputCurrency={isPairReversed ? inputCurrency : outputCurrency}
          isDark={isDark}
          isChartExpanded={isChartExpanded}
          setIsChartExpanded={setIsChartExpanded}
          isMobile={isMobile}
          isFullWidthContainer={isFullWidthContainer}
          currentSwapPrice={currentSwapPrice}
        />
      )}
    </BorderLayout>
  )
}

export default PriceChartContainer
