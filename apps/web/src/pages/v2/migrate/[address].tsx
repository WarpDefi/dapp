import { ChainId } from '@pancakeswap/chains'
import { useTranslation } from '@pancakeswap/localization'
import { AppHeader } from 'components/App'
import { BodyWrapper } from 'components/App/AppBody'
import Container from 'components/Layout/Container'
import { useRouter } from 'next/router'
import { safeGetAddress } from 'utils'
import LiquidityFormProvider from 'views/AddLiquidityV3/formViews/V3FormView/form/LiquidityFormProvider'
import { Migrate } from 'views/AddLiquidityV3/Migrate'

function MigratePage() {
  // const { t } = useTranslation()

  const router = useRouter()

  const address = safeGetAddress(router.query.address)

  const { t } = useTranslation()

  return (
    <LiquidityFormProvider>
      <Container>
        <BodyWrapper style={{ maxWidth: '858px' }}>
          <AppHeader title={t('Migrate Liquidity')} />
          {address && <Migrate v2PairAddress={address} />}
        </BodyWrapper>
      </Container>
    </LiquidityFormProvider>
  )
}

export default MigratePage

MigratePage.screen = true
MigratePage.chains = [ChainId.BSC, ChainId.ETHEREUM, ChainId.BSC_TESTNET, ChainId.GOERLI]
