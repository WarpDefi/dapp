import { useState } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { Token, TokenAmount } from '@pangolindex/sdk'
import { usePairContract, useTokenContract } from '../hooks/useContract'
import { useSingleCallResult } from '../state/multicall/hooks'
import { client } from '../apollo/client'
import { PAIR_24 } from '../apollo/queries'
import { getTimestampsForChanges } from '../utils'
import { usePairData } from '../contexts/PairData'
import useUSDCPrice from '../utils/useUSDCPrice'
import { WAVAX, ChainId } from '@pangolindex/sdk'
import { useActiveWeb3React } from '../hooks'

// returns undefined if input token is undefined, or fails to get token contract,
// or contract total supply cannot be fetched

export function useTotalSupply(token?: Token): TokenAmount | undefined {
  const contract = useTokenContract(token?.address, false)

  const totalSupply: BigNumber = useSingleCallResult(contract, 'totalSupply')?.result?.[0]

  return token && totalSupply ? new TokenAmount(token, totalSupply.toString()) : undefined  
}



export function useAprs(MCJ: any, pid: any){
  const { chainId } = useActiveWeb3React()
  const ethPrice = useUSDCPrice(WAVAX[chainId ? chainId : ChainId.AVALANCHE])
  const avaxprice = Number(ethPrice?.toFixed(2));

  const {
    oneDayVolumeUSD,
    reserveUSD
  } = usePairData('0x5a2be3aa5ed59cc120c1aee2f03146de02dfc280')
    //console.log(oneDayVolumeUSD + " - " + (reserveUSD * Number(avaxprice)) + " - " + (oneDayVolumeUSD * 0.003) + " - " + (((oneDayVolumeUSD * 0.003) * 368) / (reserveUSD * Number(avaxprice))) * 100)

    /*const zetp = pid == -1 ? 0 : pid
    const MCJ3 = useMiniChefContract(MCJ)
    const LPT = useSingleCallResult(MCJ3, 'lpToken', [zetp])?.result?.[0]*/
    const [t1] = getTimestampsForChanges()
    const LP = usePairContract(MCJ, false)

    //let b1 = await getMostRecentBlockSinceTimestamp(t1)


    const [liquAPR, setliquAPR] = useState('')
    //const [bonusPrice, setbonusPrice] = useState('')

    //let day = 24*60*60;
    //let start_of_today = ((Date.now() - Date.now() % day) / 1000) - 86400;
    let key = t1 / 86400;

    client.query({query: PAIR_24(LP?.address.toLocaleLowerCase() + "-" + key.toString().split(".")[0])}).then(result => {
        if(result.data.pairDayData != null){
            setliquAPR('0');
            //console.log(result.data.pairDayData.dailyVolumeUSD);
            //setliquAPR((((((p1 + (Number(result.data.pairDayData.dailyVolumeUSD)*0.003)) / p1)-1)*100)*365).toFixed(2))
        }
      })  

    return liquAPR
}