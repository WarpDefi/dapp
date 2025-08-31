import React, { useState, useCallback } from 'react'
import styled, {  } from 'styled-components'


import { ButtonCustom, ButtonPrimary } from '../Button'


import { usePredictionContract } from '../../hooks/useContract'
import { useSingleCallResult } from '../../state/multicall/hooks'
import CurrencyCustomInputPanel from '../CurrencyCustomInputPanel'



const InputPanel = styled.div<{ hideInput?: boolean }>`
  position: relative;
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '20px')};
  z-index: 1;
`

export default function PredictionBetPanel() {

//let tokenW = chainId ? CNR[chainId] : undefined

const [typedValue, setTypedValue] = useState('')
const onUserInput = useCallback((typedValue: string) => {
  setTypedValue(typedValue)
}, [])

const valuesh = Number(typedValue) * 1000000000000000000
const stakingContract = usePredictionContract()

const epoch = useSingleCallResult(stakingContract, 'currentEpoch')?.result?.[0]
const avaxprice = useSingleCallResult(stakingContract, 'avaxPrice')?.result?.[0]
const epoching = Number(epoch) - 1
const round = useSingleCallResult(stakingContract, 'rounds', [20])?.result
const lockprice = round?.[4]

async function BetBearAvax() {
  if(stakingContract)
    stakingContract.betBear({ 'value':Number(valuesh), gasLimit: 210000 })
}

async function BetBullAvax() {
  if(stakingContract)
    stakingContract.betBull({ 'value':Number(valuesh), gasLimit: 210000 })
}

  return (
    <InputPanel>
    OYUN:{`${epoching}`} - LOCKPRICE:{`${lockprice}`} - LASTPRICE:{`${avaxprice}`}
    <CurrencyCustomInputPanel
            value={typedValue}
            onUserInput={onUserInput}
            showMaxButton={false}
            id="bet-avax"
          />
      <ButtonCustom data-tip data-for='happyFace' padding="8px" borderRadius="8px" onClick={BetBullAvax}>
              Up
            </ButtonCustom>
            <ButtonPrimary data-tip data-for='happyFace' padding="8px" borderRadius="8px" onClick={BetBearAvax}>
              Down
            </ButtonPrimary>
    </InputPanel>
  )
}
