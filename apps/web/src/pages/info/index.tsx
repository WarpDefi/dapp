import Overview from 'views/V3Info'
import { InfoPageLayout } from 'views/V3Info/components/Layout'

const InfoPage = () => {
  return <Overview />
}

InfoPage.Layout = InfoPageLayout
InfoPage.chains = [] // set all

export default InfoPage
