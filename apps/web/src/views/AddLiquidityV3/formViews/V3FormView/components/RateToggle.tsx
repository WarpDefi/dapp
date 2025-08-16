import { useTranslation } from '@pancakeswap/localization'
import { Currency } from '@pancakeswap/sdk'
import { Button, Flex, SyncAltIcon, Text } from '@pancakeswap/uikit'
import { styled } from 'styled-components'

const RateToggleButton = styled(Button)`
  border-radius: 6px;
  padding-left: 8px;
  padding-right: 8px;
  svg {
    fill: ${({ theme }) => theme.colors.primary};
  }
  &:hover {
    svg {
      fill: ${({ theme }) => theme.colors.black};
    }
  }
`

export default function RateToggle({
  currencyA,
  handleRateToggle,
}: {
  currencyA?: Currency | null
  handleRateToggle: () => void
}) {
  const { t } = useTranslation()

  return currencyA ? (
    <Flex justifyContent="center" alignItems="center">
      <Text mr="4px" color="textSubtle">
        {t('View prices in')}
      </Text>
      <RateToggleButton
        className="button-hover"
        variant="secondary"
        scale="sm"
        onClick={handleRateToggle}
        startIcon={<SyncAltIcon />}
      >
        {currencyA?.symbol}
      </RateToggleButton>
    </Flex>
  ) : null
}
