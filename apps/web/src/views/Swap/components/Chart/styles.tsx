import { Box } from '@pancakeswap/uikit'
import { styled } from 'styled-components'

export const StyledPriceChart = styled(Box)<{
  $isDark: boolean
  $isExpanded: boolean
  $isFullWidthContainer?: boolean
}>`
  border: none;
  // border-radius: 32px;
  width: 100%;
  padding-top: 0;
  ${({ theme }) => theme.mediaQueries.lg} {
    padding-top: 12px;
  }
  ${({ theme }) => theme.mediaQueries.sm} {
    background: ${({ theme }) => theme.colors.backgroundAlt};
    // border: ${({ theme }) => `2px solid ${theme.colors.cardBorder}`};
    // border-radius: ${({ $isExpanded }) => ($isExpanded ? '0' : '8px')};
    width: ${({ $isExpanded, $isFullWidthContainer }) => ($isFullWidthContainer || $isExpanded ? '100%' : '50%')};
    height: ${({ $isExpanded }) => ($isExpanded ? '100%' : '506px')};
    // box-shadow: ${({ theme }) => theme.shadows.card};
  }
`

StyledPriceChart.defaultProps = {
  height: '70%',
}
