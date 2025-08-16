import { Box, Button } from "@pancakeswap/uikit"
import styled from "styled-components"

export const Layout = styled.div`
  --item: 3;
  --space: 30px;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space);
  margin-top: 30px;
  @media screen and (max-width: 991px) {
    --item: 2;
  }
  @media screen and (max-width: 767px) {
    --item: 1;
  }
  > * {
    width: calc((100% - (var(--item) - 1) * var(--space)) / var(--item));
    @media screen and (max-width: 767px) {
      max-width: 480px;
      margin: auto;
    }
  }
`

export const StyledNeubrutal = styled(Box)`
  border-radius: ${({ theme }) => theme.radii.card};
  box-shadow: ${({ theme }) => theme.shadows.card};
  border: 2px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.backgroundAlt};
`

export const StyledButton = styled(Button)`
  height: 42px !important;
  font-weight: 700 !important;
`

export const StyledTypography = styled.div`
  max-width: 880px;
  color: ${({ theme }) => theme.colors.textSubtle};
  font-size: 15px;
  font-weight: 400;
  line-height: 1.5;
  @media screen and (max-width: 1559px) {
    font-size: 14px;
  }
  h1 {
    color: ${({ theme }) => theme.colors.text};
    font-family: 'Metuo', sans-serif;
    font-size: 22px;
    font-weight: 900;
    line-height: calc(24/20);
    margin-bottom: 16px;
    @media screen and (max-width: 1559px) {
      font-size: 20px;
    }
    @media screen and (max-width: 575px) {
      font-size: 18px;
    }
    @media screen and (max-width: 424px) {
      margin-bottom: 12px;
    }
  }
  h2 {
    color: ${({ theme }) => theme.colors.text};
    font-family: 'Metuo', sans-serif;
    font-size: 18px;
    font-weight: 600;
    line-height: calc(28/18);
  }
  h3 {
    color: ${({ theme }) => theme.colors.text};
    font-family: 'Metuo', sans-serif;
    font-size: 16px;
    font-weight: 700;
    line-height: calc(24/16);
    margin-bottom: 8px;
    @media screen and (max-width: 575px) {
      font-size: 15px;
      margin-bottom: 6px;
    }
  }
  p {
    font-size: 15px;
    font-weight: 400;
    line-height: 1.5;
    @media screen and (max-width: 1559px) {
      font-size: 14px;
    }
  }
  a {
    color: ${({ theme }) => theme.colors.primary};
    transition: all 0.3s;
    vertical-align: bottom;
    overflow: hidden;
    max-width: 100%;
    text-overflow: ellipsis;
    display: inline-block;
    &:hover {
      color: ${({ theme }) => theme.colors.hover};
    }
  }
  span {
    color: ${({ theme }) => theme.colors.textHighlight};
  }
  ul {
    list-style: none;
    padding: 10px 20px;
    border-radius: ${({ theme }) => theme.radii.card};
    // background: ${({ theme }) => theme.colors.backgroundItem};
    li {
      display: flex;
      justify-content: space-between;
      padding: 2px 0;
      &:not(:last-child) {
        border-bottom: 1px dashed ${({ theme }) => theme.colors.backgroundItem};
      }
      p {
        min-width: 105px;
      }
    }
    @media screen and (max-width: 575px) {
      padding: 8px 16px;
    }
  }
`