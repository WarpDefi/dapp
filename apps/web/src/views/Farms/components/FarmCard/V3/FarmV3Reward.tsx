import { ChainId } from '@pancakeswap/sdk'
import { CAKE } from '@pancakeswap/tokens'
import { Balance, Button, Flex } from '@pancakeswap/uikit'
import { useRouter } from 'next/router'
import { useRewardBalance } from 'state/farms/hooks'
import styled from 'styled-components'

const BalanceWrap = styled(Balance)`
  color: ${({ theme }) => theme.colors.primary};
`

export function FarmV3Reward() {
  const router = useRouter()
  const { data: balance } = useRewardBalance()
  const handleCollect = () => {
    router.push(`/trade?outputCurrency=U2U&inputCurrency=${CAKE[ChainId.U2U_NEBULAS].address.toLowerCase()}`)
  }

  return (
    <Flex alignItems="center">
      <BalanceWrap value={Number(balance)} decimals={2} fontWeight={600} fontSize={20} marginRight={3} />
      <Button className="button-hover" size="sm" onClick={handleCollect}>
        {' '}
        Collect U2U
      </Button>
    </Flex>
  )
}
