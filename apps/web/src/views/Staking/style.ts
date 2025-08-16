import { Box, Heading, Text } from '@pancakeswap/uikit'
import styled from 'styled-components'

export const BorderLayout = styled(Box)`
  border-radius: 8px;
  border: 2px solid ${({ theme }) => theme.colors.cardBorder};
  box-shadow: ${({ theme }) => theme.shadows.card};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  &:not(:last-child) {
    margin-bottom: 24px;
  }
`

export const StyledBox = styled(Box)`
  width: calc((100% - var(--space)) / 2);
  position: relative;
  @media screen and (max-width: 767px) {
    width: 100%;
  }
  &:first-child {
    &:before {
      content: '';
      position: absolute;
      top: 0;
      right: -41px;
      width: 2px;
      height: 100%;
      background: #445434;
      @media screen and (max-width: 1199px) {
        right: -31px;
      }
      @media screen and (max-width: 991px) {
        right: -41px;
      }
      @media screen and (max-width: 767px) {
        height: 2px;
        width: 100%;
        top: calc(100% + 18px);
        right: auto;
      }
    }
  }
`
export const StyledTextTitle = styled(Text)`
  font-family: 'Metuo', sans-serif;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.textSubtle};
  display: flex;
`

export const StakingH1 = styled(Heading)`
  font-size: 24px;
  font-weight: 700;
  line-height: calc(56 / 52);
  margin-bottom: 12px;
  ${({ theme }) => theme.mediaQueries.sm} {
    font-size: 32px;
    font-weight: 900;
    margin-bottom: 16px;
  }
  ${({ theme }) => theme.mediaQueries.lg} {
    font-size: 36px;
    margin-bottom: 20px;
  }
  ${({ theme }) => theme.mediaQueries.xl} {
    font-size: 44px;
  }
  ${({ theme }) => theme.mediaQueries.xxl} {
    font-size: 52px;
  }
`
export const StakingText = styled.p`
  color: ${({ theme }) => theme.colors.textSubtle};
  font-size: 14px;
  font-weight: 500;
  line-height: calc(24 / 18);
  margin-bottom: 10px;
  ${({ theme }) => theme.mediaQueries.sm} {
    font-size: 16px;
    font-weight: 600;
    max-width: 600px;
  }
  ${({ theme }) => theme.mediaQueries.lg} {
    font-size: 18px;
    max-width: 100%;
  }
  ${({ theme }) => theme.mediaQueries.xxxl} {
    font-size: 20px;
  }
`
export const StyledIcon = styled.div`
  --size: 36px;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(225, 250, 187, 0.2);
  @media screen and (max-width: 1199px) {
    --size: 32px;
  }
`
export const StyledIconImage = styled.img`
  --size: 24px;
  width: var(--size);
  margin: auto;
  @media screen and (max-width: 1199px) {
    --size: 20px;
  }
`
export const StyledButton = styled(Box)`
  cursor: pointer;
  text-align: center;
  flex: 1;
  color: ${({ theme }) => theme.colors.textSubtle};
  font-size: 14px;
  font-weight: 600;
  &:not(:last-child) {
    margin-right: 5px;
  }
  &.active {
    color: ${({ theme }) => theme.colors.primary};
    .divider {
      background: ${({ theme }) => theme.colors.hover};
    }
  }
  .divider {
    border: 2px solid ${({ theme }) => theme.colors.cardBorder};
    background: ${({ theme }) => theme.colors.textSubtle};
    height: 10px;
    width: 100%;
    border-radius: 2px;
    margin-bottom: 4px;
    @media screen and (max-width: 374px) {
      height: 8px;
    }
  }
  @media screen and (max-width: 374px) {
    font-size: 13px;
  }
`
