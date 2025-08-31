import { Currency } from '@pangolindex/sdk'
import React from 'react'
import styled from 'styled-components'
import CurrencyLogo from '../CurrencyLogoV3'

const Wrapper = styled.div<{ margin: boolean; sizeraw: number }>`
  position: relative;
  display: flex;
  flex-direction: row;
  margin-right: ${({ sizeraw, margin }) => margin && (sizeraw / 3 + 8).toString() + 'px'};
`

interface DoubleCurrencyLogoProps {
  margin?: boolean
  size?: number
  currency0?: Currency
  currency1?: Currency
}

const HigherLogo = styled(CurrencyLogo)`
  z-index: 2;
`
const CoveredLogo = styled(CurrencyLogo)<{ sizeraw: number }>`
  position: absolute;
  left: ${({ sizeraw }) => '-' + (sizeraw / 2).toString() + 'px'} !important;
`

export default function DoubleCurrencyLogo({
  currency0,
  currency1,
  size = 16,
  margin = false
}: DoubleCurrencyLogoProps) {
  const logoSize = size as any; // type conversion
  return (
    <Wrapper sizeraw={size} margin={margin}>
      {currency0 && <HigherLogo currency={currency0} size={logoSize} imageSize={48} />}
      {currency1 && <CoveredLogo currency={currency1} size={logoSize} imageSize={48} sizeraw={size} />}
    </Wrapper>
  )
}
