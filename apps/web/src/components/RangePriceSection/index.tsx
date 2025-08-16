import { useTranslation } from '@pancakeswap/localization'
import { Currency } from '@pancakeswap/sdk'
import { Heading, Text } from '@pancakeswap/uikit'
import { LightCardProps, LightGreyCard } from 'components/Card'
import styled from 'styled-components'

interface RangePriceSectionProps extends LightCardProps {
  title: string
  currency0?: Currency
  currency1?: Currency
  price: string
}

const StyledLightGreyCard = styled(LightGreyCard)`
  border: 2px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.shadows.card};
`

export const RangePriceSection = ({ title, currency0, currency1, price, ...props }: RangePriceSectionProps) => {
  const { t } = useTranslation()
  return (
    <StyledLightGreyCard
      {...props}
      style={{
        paddingTop: '8px',
        paddingBottom: '8px',
        textAlign: 'center',
      }}
    >
      <Text fontSize="12px" color="secondary" bold textTransform="uppercase" mb="4px">
        {title}
      </Text>
      <Heading mb="4px">{price}</Heading>
      <Text fontSize="12px" color="textSubtle">
        {t('%assetA% per %assetB%', {
          assetA: currency0?.symbol ?? '',
          assetB: currency1?.symbol ?? '',
        })}
      </Text>
    </StyledLightGreyCard>
  )
}
