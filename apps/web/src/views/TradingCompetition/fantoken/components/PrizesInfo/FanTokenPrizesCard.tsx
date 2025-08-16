import { useTranslation } from '@pancakeswap/localization'
import { Box, Card, CardHeader, Heading, Text } from '@pancakeswap/uikit'
import { styled } from 'styled-components'
import { fanTokenPrizes } from '../../../../../config/constants/trading-competition/prizes'
import PrizesGrid from '../../../components/PrizesInfo/PrizesGrid/PrizesGrid'

const StyledCard = styled(Card)`
  ${({ theme }) => theme.mediaQueries.md} {
    margin-right: 40px;
    flex: 1;
  }
`

const FanTokenPrizesCard = () => {
  const { t } = useTranslation()

  return (
    <StyledCard>
      <CardHeader>
        <Heading scale="lg" color="secondary">
          {t('Prizes by Team')}
        </Heading>
        <Text color="textSubtle" fontSize="14px">
          {t('Higher trading volume = higher rank!')}
        </Text>
      </CardHeader>
      <PrizesGrid prizesConfig={fanTokenPrizes} />
      <Box p="24px">
        <Text color="textSubtle" fontSize="14px">
          {t(
            'Prizes to be distributed in U2U, LAZIO, PORTO and SANTOS in a distribution of 3:1:1:1 and shared by all members of each respective tier.',
          )}{' '}
          {t(
            'The price of token prizes (U2U, LAZIO, PORTO and SANTOS) in USD will be determined as per their BUSD pair price during the tally period.',
          )}
        </Text>
      </Box>
    </StyledCard>
  )
}

export default FanTokenPrizesCard
