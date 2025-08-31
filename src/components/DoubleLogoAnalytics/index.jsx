import React from 'react'
import styled from 'styled-components'
import TokenLogo from '../CurrencyLogoInfo'

export default function DoubleTokenLogo({ a0, a1, size = 24, margin = false }) {
  const TokenWrapper = styled.div`
    position: relative;
    display: flex;
    flex-direction: row;
    margin-right: ${({ sizeraw, margin }) => margin && (sizeraw / 3 + 8).toString() + 'px'};
  `

  const HigherLogo = styled(TokenLogo)`
    z-index: 2;
    background-color: white;
    border-radius: 50%;
    box-shadow: -4px 3px 10px rgb(0 0 0 / 39%);
  `

  const CoveredLogo = styled(TokenLogo)`
    position: absolute;
    left: ${({ sizeraw }) => (sizeraw / 1.7).toString() + 'px'};
    background-color: white;
    border-radius: 50%;
    box-shadow: -4px 3px 10px rgb(0 0 0 / 39%);
  `

  return (
    <TokenWrapper sizeraw={size} margin={margin}>
      <HigherLogo address={a0} size={size} imageSize={48} sizeraw={size} />
      <CoveredLogo address={a1} size={size} imageSize={48} sizeraw={size} />
    </TokenWrapper>
  )
}
