/* eslint-disable react/no-array-index-key */
import { ChainDefault } from '@pancakeswap/chains'
import { useTranslation } from '@pancakeswap/localization'
import { WNATIVE } from '@pancakeswap/sdk'
import {
  AutoColumn,
  Button,
  CloseIcon,
  Flex,
  Heading,
  IconButton,
  ModalBody,
  ModalHeader,
  ModalProps,
  ModalTitle,
  ModalWrapper,
  Text
} from '@pancakeswap/uikit'

import { LightGreyCard } from 'components/Card'
import { CurrencyLogo } from 'components/Logo'
import styled from 'styled-components'

const StyledLightGreyCard = styled(LightGreyCard)`
  border-width: 2px;
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.shadows.card};
`

type ConfirmModalProps = {
  stakedInfo: {
    amountDisplay: string,
    rewardDisplay: string
  }
  onConfirm: () => void;

} & ModalProps

const ConfirmRewardModal: React.FC<React.PropsWithChildren<ConfirmModalProps>> = ({
  onDismiss,
  title,
  stakedInfo,
  onConfirm
}) => {
  const { t } = useTranslation()

  const onCloseCallback = () => {
    onDismiss?.()
  }

  const handleConfirm = () => {
    onConfirm()
    onCloseCallback()
  }

  return (
    <ModalWrapper minWidth="375px">
      <ModalHeader >
        <ModalTitle>
          <Heading>{title}</Heading>
        </ModalTitle>
        <IconButton variant="text" onClick={onCloseCallback}>
          <CloseIcon width="24px" color="text" />
        </IconButton>
      </ModalHeader>
      <ModalBody py="24px" maxWidth="375px" width="100%">
      <AutoColumn gap="8px" mb="16px">
        <StyledLightGreyCard>
          <Flex justifyContent="space-between" as="label" alignItems="center">
            <Flex alignItems="center">
              <CurrencyLogo currency={WNATIVE[ChainDefault]} size='20px'/>
              <Text small color="textSubtle" id="remove-liquidity-tokena-symbol" ml="4px">
                {t('Staked')} 
              </Text>
            </Flex>
            <Flex>
              <Text small>
                {stakedInfo?.amountDisplay} U2U
                {/* <FormattedCurrencyAmount currencyAmount={liquidityValue0} /> */}
              </Text>
            </Flex>
          </Flex>
          <Flex justifyContent="flex-end" mb="8px">
            <Text fontSize="10px" color="textSubtle" ml="4px" />
          </Flex>
   
          {/* <Divider /> */}
          <Flex justifyContent="space-between" as="label" alignItems="center">
            <Flex alignItems="center">
              <CurrencyLogo currency={WNATIVE[ChainDefault]} size='20px'/>
              <Text small color="textSubtle" id="remove-liquidity-tokena-symbol" ml="4px">
                 {t('Reward')}
              </Text>
            </Flex>
            <Flex>
              <Text small>
                {parseFloat(stakedInfo.rewardDisplay)} U2U
                {/* <FormattedCurrencyAmount currencyAmount={feeValue0} /> */}
              </Text>
            </Flex>
          </Flex>

        </StyledLightGreyCard>
      </AutoColumn>
      <Button
        width="100%"
        onClick={handleConfirm}
        className="button-hover"
      >
        {t('Confirm')}
      </Button>
      </ModalBody>
    </ModalWrapper>
  )
}

export default ConfirmRewardModal
