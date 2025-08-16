import { InfoPageLayout } from './Layout'
import { LoanProvider } from './LoanContext'
import { Overview } from './Overview'

const LoanPage = () => {
  return (
    <LoanProvider>
      <Overview />
    </LoanProvider>
  )
}

LoanPage.Layout = InfoPageLayout
LoanPage.chains = [] // set all

export default LoanPage
