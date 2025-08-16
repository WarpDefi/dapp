import { InfoPageLayout } from 'views/Pair/Layout'
import { Overview } from 'views/Pair/Overview'

const InfoPage = () => {
  return <Overview />
}

InfoPage.Layout = InfoPageLayout
InfoPage.chains = [] // set all

export default InfoPage
