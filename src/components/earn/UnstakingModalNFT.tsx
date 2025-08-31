import React, { useCallback, useState } from 'react'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import Modal from '../Modal'
import { AutoColumn } from '../Column'
import styled from 'styled-components'
import { RowBetween } from '../Row'
import { TYPE, CloseIcon } from '../../theme'
import { ButtonError } from '../Button'
import { useActiveWeb3React } from '../../hooks'
import { useNFTTokenContract, useStakingContractNFT } from '../../hooks/useContract'
import { TransactionResponse } from '@ethersproject/providers'
import { LoadingView, SubmittedView } from '../ModalViews'
import { NFTCONTRACT_ADDRESS, NFTSTAKE_ADDRESS } from '../../constants'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { useSingleCallResult } from '../../state/multicall/hooks'
import { calculateGasMargin } from '../../utils'

const ContentWrapper = styled(AutoColumn)`
   width: 100%;
   padding: 1rem;
 `

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
  selectedNFTS: any[]
}

export default function UnstakingModalNFT({ isOpen, onDismiss, selectedNFTS }: StakingModalProps) {
  const { account, chainId } = useActiveWeb3React()

  //const [approval, setApproval] = useState()
  const [attempting, setAttempting] = useState<boolean>(false)
  const [hash, setHash] = useState<string | undefined>()
  const wrappedOnDismiss = useCallback(() => {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }, [onDismiss])

  const addTransaction = useTransactionAdder()

  // approval data for stake
  const deadline = useTransactionDeadline()
  const stakingContract = useStakingContractNFT(chainId ? NFTSTAKE_ADDRESS[chainId] : undefined)
  const nftContract = useNFTTokenContract(chainId ? NFTCONTRACT_ADDRESS[chainId] : undefined)
  const isApprovedForAll = useSingleCallResult(nftContract, 'isApprovedForAll', [account ? account : undefined, chainId ? NFTSTAKE_ADDRESS[chainId] : undefined])
  const appResult = isApprovedForAll?.result?.[0]

  async function onStake() {
    setAttempting(true)
    if (stakingContract  && deadline) {
      if (appResult) {
        await stakingContract.estimateGas['withdraw'](selectedNFTS).then(estimatedGasLimit => {
        stakingContract.
        withdraw(selectedNFTS,
          { gasLimit: calculateGasMargin(estimatedGasLimit) }
          )
          .then((response: TransactionResponse) => {
            //console.log(response)
            addTransaction(response, {
              summary: `Withdraw NFTs`
            })
            setHash(response.hash)
          })
          .catch((error: any) => {
            setAttempting(false)
            console.log(error)
          })
        })
      } else {
        setAttempting(false)
        throw new Error('Attempting to stake without approval or a signature. Please contact support.')
      }
    }
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <TYPE.mediumHeader>Withdraw</TYPE.mediumHeader>
            <CloseIcon onClick={wrappedOnDismiss} />
          </RowBetween>

          <RowBetween>
            <ButtonError
              disabled={!appResult}
              error={false}
              onClick={onStake}
            >
              Withdraw
            </ButtonError>
          </RowBetween>
        </ContentWrapper >
      )
      }
      {
        attempting && !hash && (
          <LoadingView onDismiss={wrappedOnDismiss}>
            <AutoColumn gap="12px" justify={'center'}>
              <TYPE.largeHeader>Withdrawing Tokens</TYPE.largeHeader>
              <TYPE.body fontSize={20}>NFTs</TYPE.body>
            </AutoColumn>
          </LoadingView>
        )
      }
      {
        attempting && hash && (
          <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
            <AutoColumn gap="12px" justify={'center'}>
              <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
              <TYPE.body fontSize={20}>Withdrawed NFTs</TYPE.body>
            </AutoColumn>
          </SubmittedView>
        )
      }
    </Modal >
  )
}
