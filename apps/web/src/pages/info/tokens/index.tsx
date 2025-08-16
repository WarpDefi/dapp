import { InfoPageLayout } from 'views/V3Info/components/Layout'
import Token from 'views/V3Info/views/TokensPage'

const TokenPage = () => {
  return <Token />
}

TokenPage.Layout = InfoPageLayout
TokenPage.chains = [] // set all

export default TokenPage
