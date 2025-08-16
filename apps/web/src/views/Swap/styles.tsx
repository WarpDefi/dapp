import { Box, Flex } from '@pancakeswap/uikit'
import { styled } from 'styled-components'

export const StyledSwapContainer = styled(Flex)<{ $isChartExpanded: boolean }>`
  flex-shrink: 0;
  height: fit-content;
  padding: 0;
  width: 100%;
  ${({ theme }) => theme.mediaQueries.sm} {
    width: auto;
    padding: 0 16px;
  }
  ${({ theme }) => theme.mediaQueries.xxl} {
    ${({ $isChartExpanded }) => ($isChartExpanded ? 'padding: 0 120px' : 'padding: 0 16px')};
  }
`

export const StyledInputCurrencyWrapper = styled(Box)`
  width: 100%;
  ${({ theme }) => theme.mediaQueries.sm} {
    width: 400px;
  }
`
