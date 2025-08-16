import { Trans } from '@pancakeswap/localization'
import { AutoColumn, LockIcon, Text } from '@pancakeswap/uikit'
import { DisableCard } from 'components/Card'
import styled from 'styled-components'

const StyledText = styled(Text)`
  @media screen and (max-width: 575px) {
    font-size: 14px;
  }
`

export default function LockedDeposit({ children, locked, ...rest }) {
  return locked ? (
    <DisableCard {...rest}>
      <AutoColumn justify="center" gap="8px">
        <LockIcon width="24px" height="24px" color="textDisabled" />
        <StyledText bold color="textDisabled" textAlign="center">
          <Trans>The market price is outside your specified price range. Single-asset deposit only.</Trans>
        </StyledText>
      </AutoColumn>
    </DisableCard>
  ) : (
    children
  )
}
