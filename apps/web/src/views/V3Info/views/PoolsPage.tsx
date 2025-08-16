import { useTranslation } from '@pancakeswap/localization'
import Container from 'components/Layout/Container'
import { useMemo } from 'react'
import PoolTable from '../components/PoolTable'

import { useTopPoolsData } from '../hooks'

const PoolsOverview: React.FC<React.PropsWithChildren> = () => {
  const { t } = useTranslation()
  const topPoolsData = useTopPoolsData()

  const poolsData = useMemo(() => {
    if (topPoolsData) {
      return Object.values(topPoolsData)
    }
    return []
  }, [topPoolsData])

  // const [savedPools] = useWatchlistPools()
  // const watchlistPools = usePoolDatasSWR(savedPools)

  return (
    <Container>
      {/* <Heading scale="lg" mb="16px">
        {t('Your Watchlist')}
      </Heading>
      <Card style={{ display: 'none' }}>
        {watchListPoolsData.length > 0 ? (
          <PoolTable poolDatas={watchListPoolsData} />
        ) : (
          <Text px="24px" py="16px">
            {t('Saved pairs will appear here')}
          </Text>
        )}
      </Card> */}
      <PoolTable poolDatas={poolsData} />
    </Container>
  )
}

export default PoolsOverview
