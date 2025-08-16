import { SUPPORT_STAKING } from 'config/constants/supportChains'
import { InfoPageLayout } from 'views/Staking/Layout'
import { Overview } from 'views/Staking/Overview'

const InfoPage = () => {
  return <Overview />
}

InfoPage.Layout = InfoPageLayout
InfoPage.chains = SUPPORT_STAKING

export default InfoPage
