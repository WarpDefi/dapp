import { DashboardPageLayout } from './Layout'
import { Overview } from './Overview'

const DashboardPage = () => {
  return (
    <Overview />
  )
}

DashboardPage.Layout = DashboardPageLayout
DashboardPage.chains = [] // set all

export default DashboardPage