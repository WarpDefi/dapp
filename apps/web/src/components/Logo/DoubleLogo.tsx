import { Currency } from '@pancakeswap/sdk'
import { styled } from 'styled-components'
import CurrencyLogo from './CurrencyLogo'

const Wrapper = styled.div<{ margin: boolean }>`
  --size: 36px;
  --space: 12px;
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-right: ${({ margin }) => margin && `var(--space)`};
  width: var(--size);
  height: var(--size);
  @media screen and (max-width: 575px) {
    --size: 32px;
    --space: 8px;
  }
`

interface DoubleCurrencyLogoProps {
  margin?: boolean
  size?: number
  currency0?: Currency
  currency1?: Currency
}

export default function DoubleCurrencyLogo({
  currency0,
  currency1,
  size = 20,
  margin = false,
}: DoubleCurrencyLogoProps) {
  return (
    <Wrapper margin={margin}>
      {currency0 && (
        <CurrencyLogo
          currency={currency0}
          size={`${size.toString()}px`}
          style={{ position: 'absolute', top: 0, left: 0 }}
        />
      )}
      {currency1 && (
        <CurrencyLogo
          currency={currency1}
          size={`${size.toString()}px`}
          style={{ position: 'absolute', bottom: 0, right: 0 }}
        />
      )}
    </Wrapper>
  )
}
