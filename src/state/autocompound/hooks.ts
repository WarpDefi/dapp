/*import { TransactionResponse } from '@ethersproject/providers'
import { useAirdropContract } from '../../hooks/useContract'
import { calculateGasMargin } from '../../utils'
import { useTransactionAdder } from '../transactions/hooks'
import { PNG } from './../../constants/index'*/
//import { TokenAmount, JSBI } from '@pangolindex/sdk'
//import { BigNumber } from '@ethersproject/bignumber'
//import { BigNumber } from '@ethersproject/bignumber';
import { useActiveWeb3React } from '../../hooks'
import { useAutocompoundContract } from '../../hooks/useContract'
import { useSingleCallResult } from '../multicall/hooks'
//import { useMemo } from 'react'

//let gbalance: string| undefined;

export function useTotalDeposited(): Number {
    //const { chainId } = useActiveWeb3React()
    const autocompoundContract = useAutocompoundContract()
    const totalDeposit: Number = useSingleCallResult(autocompoundContract, 'totalDeposits', [])?.result?.[0]
    //const totalSupply = useSingleCallResult(autocompoundContract, 'totalDeposits', [])?.result?.[0]
    //console.log(totalSupply)
    return totalDeposit
}

export function GetBalance(): Number {
    const { account } = useActiveWeb3React()
    const autocompoundContract = useAutocompoundContract()
    const balance: Number = useSingleCallResult(autocompoundContract, 'getBalance', [account ?? undefined])?.result?.[0]
    //const totalSupply = useSingleCallResult(autocompoundContract, 'totalDeposits', [])?.result?.[0]
    return balance
}


export function GetDepositTokensForShares(): Number {
    const { account } = useActiveWeb3React()
    const autocompoundContract = useAutocompoundContract()
    const balance: Number = useSingleCallResult(autocompoundContract, 'getBalance', [account ?? undefined])?.result?.[0]
    const depbalance: Number = useSingleCallResult(autocompoundContract, 'getDepositTokensForShares', [balance == undefined ? 0 : "0x" + Number(balance).toString(16)])?.result?.[0]
    //const totalSupply = useSingleCallResult(autocompoundContract, 'totalDeposits', [])?.result?.[0]
    //console.log(totalSupply)
    return depbalance
}

export async function GetSharesForDepositTokens(amount : string | undefined) {
    const autocompoundContract = await useAutocompoundContract()
    const depbalance: Number = await useSingleCallResult(autocompoundContract, 'getSharesForDepositTokens', [amount])?.result?.[0]
    //const totalSupply = useSingleCallResult(autocompoundContract, 'totalDeposits', [])?.result?.[0]
    //console.log(totalSupply)
    return depbalance
}

export function NextReinvestCalc(): Number {
    const autocompoundContract = useAutocompoundContract()
    const depbalance: Number = useSingleCallResult(autocompoundContract, 'checkReward ', [])?.result?.[0]
    //const totalSupply = useSingleCallResult(autocompoundContract, 'totalDeposits', [])?.result?.[0]
    //console.log(totalSupply)
    return depbalance
}

/*export function useTotalSupply(token?: Token): TokenAmount | undefined {
    const contract = useTokenContract(token?.address, false)
  
    const totalSupply: BigNumber = useSingleCallResult(contract, 'totalSupply')?.result?.[0]
  
    return token && totalSupply ? new TokenAmount(token, totalSupply.toString()) : undefined
  }*/