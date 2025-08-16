import { Box, Text } from "@pancakeswap/uikit"
import styled from "styled-components"

export const BorderCard = styled(Box)`
  border: 2px solid ${({ theme }) => theme.colors.cardBorder};
  box-shadow: ${({ theme }) => theme.shadows.card};
  border-radius: ${({ theme }) => theme.radii.card};
  padding: 20px 24px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  @media screen and (max-width: 991px) {
    padding: 20px;
  }
  @media screen and (max-width: 575px) {
    padding: 16px;
  }
`
export const StyledTitle = styled(Text)`
  font-family: 'Metuo', sans-serif;
  font-size: 24px;
  font-weight: 900;
  line-height: 1;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 32px;
  @media screen and (max-width: 1439px) {
    font-size: 22px;
    margin-bottom: 28px;
  }
  @media screen and (max-width: 991px) {
    font-size: 20px;
    margin-bottom: 24px;
  }
  @media screen and (max-width: 575px) {
    font-size: 18px;
    margin-bottom: 20px;
  }
`

export const CustomTooltipContainer = styled(Box)`
 	background: ${({ theme }) => theme.colors.backgroundItem};
  border-radius: ${({ theme }) => theme.radii.card}; 
	padding: 0;
	border: 2px solid ${({ theme }) => theme.colors.cardBorder};
	box-shadow: ${({ theme }) => theme.shadows.input};
	outline: none;
  overflow: hidden;
`
export const TooltipLabel = styled(Box)`
  background: ${({ theme }) => theme.colors.primaryDark};
	padding: 5px 20px; 
  color: ${({ theme }) => theme.colors.black}; 
	font-size: 14px;
	font-weight: 700;
	border-bottom: 2px solid ${({ theme }) => theme.colors.cardBorder};
`
export const TooltipContent = styled(Box)`
  padding: 5px 20px;
  color: white;
  line-height: 16px;
  font-size: 10px;
  span {
    fonsize: 12px;
    font-weight: 700;
    margin-left: 2px;
  }
`
export const Circle = styled.div<{color: string, size?: string}>`
	width: ${({ size }) => (size || '9px')};
	height: ${({ size }) => (size || '9px')};
	border-radius: 50%;
	background: ${({ color }) => color};
	margin-right: 4px;
`

export const StyledNoData = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100%;
  img {
    height: 60px;
    @media screen and (max-width: 575px) {
      height: 50px;
    }
  }
  span {
    margin-top: 16px;
    color: ${({ theme }) => theme.colors.textExtra};
    font-size: 16px;
    font-weight: 500;
    @media screen and (max-width: 575px) {
      font-size: 15px;
    }
  }
`