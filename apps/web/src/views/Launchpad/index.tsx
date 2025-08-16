import { InfoPageLayout } from './Layout'
import { Overview } from './Overview'

const LaunchpadPage = () => {
  return (
    <Overview />
  )
}

LaunchpadPage.Layout = InfoPageLayout
LaunchpadPage.chains = [] // set all

export default LaunchpadPage