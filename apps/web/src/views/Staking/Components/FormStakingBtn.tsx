import { useTranslation } from '@pancakeswap/localization'
import { Button, useToast } from '@pancakeswap/uikit'
import { bigIntToBigNumber } from '@pancakeswap/utils/bigNumber'
import BigNumber from 'bignumber.js'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { ToastDescriptionWithTx } from 'components/Toast'
import { gql } from 'graphql-request'
import useCatchTxError from 'hooks/useCatchTxError'
import { useStakingContract } from 'hooks/useContract'
import { useAtom } from 'jotai'
import { useState } from 'react'
import { resetStakingState, updateStakingAmountError } from 'state/staking/actions'
import { useStakingState } from 'state/staking/hooks'
import { stakingReducerAtom } from 'state/staking/reducer'
import styled from 'styled-components'
import { stake } from 'utils/calls/staking'
import { ammStakingClients } from 'utils/graphql'
import { useAccount } from 'wagmi'
import useStakingConfig from '../Hooks/useStakingConfig'
import { useStakingList } from '../Hooks/useStakingList'

const StyledButton = styled(Button)`
  @media screen and (max-width: 991px) {
    height: 44px;
  }
`

interface ContractsResponse {
  contracts: {
    id: string
  }[]
}

const FormStakingBtn = () => {
  const { t } = useTranslation()

  const { address: account } = useAccount()
  const { stakingAmount, stakingAmountError } = useStakingState()
  const { currency } = useStakingConfig()

  const [, dispatch] = useAtom(stakingReducerAtom)
  const stakingContract = useStakingContract()
  const { refresh } = useStakingList()
  const [ isStaking, setIsStaking ] = useState(false)

  const { toastSuccess } = useToast()
  // const { fetchWithCatchTxError, loading: isPending } = useCatchTxError()
  const { fetchWithCatchTxError } = useCatchTxError()

  const getContractId = async () => {
    try {
      const CONTRACT_ID_QUERY = gql`
        query getContractId {
          contracts(where: {tokenId: "0"}) {
            id
          }
        }
      `
      const { contracts } = await ammStakingClients.request<ContractsResponse>(CONTRACT_ID_QUERY)
      return contracts.length === 0 ? null : contracts[0].id
    } catch(e) {
      return null
    }
  }

  const handleStake = async () => {
    try {
      if (stakingAmount === '' || BigNumber(stakingAmount).eq(0)) {
        dispatch(updateStakingAmountError(t('Enter an amount')))
        return
      }
      if (stakingAmountError) {
        return
      }
      setIsStaking(true)
      const contractId = '0x0000000000000000000000000000000000000000' // await getContractId() ?? '0x0000000000000000000000000000000000000000'
      const value = BigNumber(stakingAmount).multipliedBy(bigIntToBigNumber(10n ** BigInt(currency?.decimals ?? 18)))
      const receipt = await fetchWithCatchTxError(() => stake(stakingContract, value.toFixed(0, BigNumber.ROUND_DOWN), contractId))
      if (receipt?.status) {
        toastSuccess(
          t('Success!'),
          <ToastDescriptionWithTx txHash={receipt.transactionHash}>
            {t('You have successfully staked.')}
          </ToastDescriptionWithTx>,
        )
        dispatch(resetStakingState())
        refresh()
      }
      setIsStaking(false)
    } catch (e) {
      console.error(e)
      setIsStaking(false)
    }
  }

  if (!account) {
    return <ConnectWalletButton width="100%" />
  }
  return (
    <StyledButton
      width="100%"
      className="button-hover"
      disabled={isStaking}
      onClick={handleStake}
    >
      {isStaking ? t('Staking...') : t('Stake')}
    </StyledButton>
  )
}

export default FormStakingBtn
