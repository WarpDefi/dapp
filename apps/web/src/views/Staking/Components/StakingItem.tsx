import { useTranslation } from '@pancakeswap/localization'
import { Button, Flex, Text, useModal, useToast } from '@pancakeswap/uikit'
import { formatNumber } from '@pancakeswap/utils/formatBalance'
import BigNumber from 'bignumber.js'
import { ToastDescriptionWithTx } from 'components/Toast'
import useCatchTxError from 'hooks/useCatchTxError'
import { useStakingContract } from 'hooks/useContract'
import { useState } from 'react'
import styled from 'styled-components'
import { claimReward, unStake, withdraw } from 'utils/calls/staking'
import useStakingConfig from '../Hooks/useStakingConfig'
import { StakedInfo, useStakingList } from '../Hooks/useStakingList'
import ConfirmRewardModal from '../Modal/ConfirmRewardModal'
import { BorderLayout, StyledBox, StyledTextTitle } from '../style'
import { UnStakeActions } from './UnStakeActions'

const StyledFlex = styled(Flex)`
  --space: 80px;
  gap: var(--space);
  @media screen and (max-width: 1199px) {
    --space: 60px;
  }
  @media screen and (max-width: 991px) {
    --space: 80px;
  }
  @media screen and (max-width: 767px) {
    --space: 40px;
    flex-direction: column;
  }
`
const StyledButton = styled(Button) `
  height: 40px;
  min-width: 120px;
  margin-bottom: 8px;
`
const StyledText = styled(Text)`
  text-overflow: ellipsis;
  overflow: hidden;
  font-size: 24px;
  line-height: 1;
  margin-right: 10px;
  margin-bottom: 8px;
  max-width: 320px;
  @media screen and (max-width: 1199px) {
    font-size: 22px;
  }
  @media screen and (max-width: 991px) {
    max-width: 400px;
  }
  @media screen and (max-width: 767px) {
    max-width: 100%;
  }
`

type StakingProps = {
  stakedInfo: StakedInfo
  periodTime: number
  isUnStake: boolean
}

const StakingItem = ({ stakedInfo, periodTime, isUnStake }: StakingProps) => {
  const { t } = useTranslation()
  const { toastSuccess } = useToast()
  const { fetchWithCatchTxError } = useCatchTxError()

  const [ isClaiming, setIsClaiming ] = useState(false)
  const [ isUnStaking, setIsUnStaking] = useState(false)
  const [ isWithdrawing, setIsWithdrawing] = useState(false)

  const enableClaim = stakedInfo.reward.gt(BigNumber(0))

  const stakingContract = useStakingContract()
  const { currency } = useStakingConfig()
  const { refresh } = useStakingList()

  
  const handUnStake = async () => {
    if (isUnStaking) return
    setIsUnStaking(true)
    const receipt = await fetchWithCatchTxError(() => unStake(stakingContract, stakedInfo.id))
    if (receipt?.status) {
      toastSuccess(
        t('Success!'),
        <ToastDescriptionWithTx txHash={receipt.transactionHash}>
          {t('You have successfully unStaked.')}
        </ToastDescriptionWithTx>,
      )
      refresh()
    }
    setIsUnStaking(false)
  }


  const [onUnstakeConfirm] = useModal(
    <ConfirmRewardModal title="Confirm Unstake" stakedInfo={stakedInfo} onConfirm={handUnStake}/>
  )

  async function handleClaim() {
    if (isClaiming) return
    setIsClaiming(true)
    const receipt = await fetchWithCatchTxError(() => claimReward(stakingContract, stakedInfo.id))
    if (receipt?.status) {
      toastSuccess(
        t('Success!'),
        <ToastDescriptionWithTx txHash={receipt.transactionHash}>
          {t('You have successfully claimed.')}
        </ToastDescriptionWithTx>,
      )
      refresh()
    }
    setIsClaiming(false)
  }

  async function handleWithdraw() {
    if (isWithdrawing) return
    setIsWithdrawing(true)
    const receipt = await fetchWithCatchTxError(() => withdraw(stakingContract, stakedInfo.id))
    if (receipt?.status) {
      toastSuccess(
        t('Success!'),
        <ToastDescriptionWithTx txHash={receipt.transactionHash}>
          {t('You have successfully withdrawn.')}
        </ToastDescriptionWithTx>,
      )
      refresh()
    }
    setIsWithdrawing(false)
  }

  const renderAction = () => {
    if (!isUnStake) {
      return (
        <StyledButton
          ml="auto"
          height="40px"
          variant="secondary"
          className="button-hover"
          onClick={onUnstakeConfirm}
        >
          {isUnStaking ? t('Unstaking...') : t('Unstake')}
        </StyledButton>
      )
    }
    return (
      <UnStakeActions
        title={isWithdrawing ? t('Withdrawing...') : t('Withdraw')}
        data={stakedInfo}
        periodTime={periodTime}
        handleWithdraw={handleWithdraw}
      />
    )
  }
  

  return (
    <BorderLayout p={["16px 20px", "20px", "20px", "20px", "20px 24px"]}>
      <StyledFlex>
        <StyledBox>
          <StyledTextTitle fontSize={["16px", "18px", "18px", "20px"]}>{t('Staked Amount')} ({currency.symbol})</StyledTextTitle>
          <Flex flexWrap="wrap" alignItems="center" justifyContent="space-between" mt={["12px", "16px", "20px"]} width="100%">
            <StyledText>
              { formatNumber(Number(stakedInfo.amountDisplay)) }
            </StyledText>
            {renderAction()}
          </Flex>
        </StyledBox>
        <StyledBox>
          <StyledTextTitle fontSize={["16px", "18px", "18px", "20px"]}>
            <Text fontFamily="'Metuo', sans-serif" fontSize={["16px", "18px", "18px", "20px"]} fontWeight="900" color="secondary" mr="6px">
              {currency.symbol}
            </Text>
            {t('Reward')}
          </StyledTextTitle>
          <Flex flexWrap="wrap" alignItems="center" justifyContent="space-between" mt={["12px", "16px", "20px"]} width="100%">
            <StyledText>
              {stakedInfo.rewardDisplay}
            </StyledText>
            <StyledButton disabled={!enableClaim} ml="auto" className="button-hover" onClick={handleClaim}>
              {isClaiming ? t('Claiming...'): t('Claim')}
            </StyledButton>
          </Flex>
        </StyledBox>
      </StyledFlex>
    </BorderLayout>
  )
}

export default StakingItem
