import { useTranslation } from '@pancakeswap/localization'
import { Button, Heading, Text } from '@pancakeswap/uikit'
import { useRouter } from 'next/router'
import { CompetitionProps } from 'views/TradingCompetition/types'
import { useAccount } from 'wagmi'

const MakeProfile: React.FC<React.PropsWithChildren<CompetitionProps>> = ({ onDismiss }) => {
  const { address: account } = useAccount()
  const { t } = useTranslation()
  const router = useRouter()

  const handleClick = () => {
    router.push(`/profile/${account.toLowerCase()}`)
    onDismiss()
  }

  return (
    <>
      <Heading scale="md" mb="24px">
        {t('Make a profile!')}
      </Heading>
      <Text color="textSubtle">
        {t('It looks like you’ve disabled your account by removing your GroFi DEX Collectible (NFT) profile picture.')}
      </Text>
      <Button mt="24px" width="100%" onClick={handleClick}>
        {t('Make a profile!')}
      </Button>
    </>
  )
}

export default MakeProfile
