import { TransactionResponse } from '@ethersproject/providers'
import { useActiveWeb3React } from '../../hooks'
import { useAirdropContract } from '../../hooks/useContract'
import { calculateGasMargin } from '../../utils'
import { useTransactionAdder } from '../transactions/hooks'
import { TokenAmount, JSBI } from '@pangolindex/sdk'
import { PNG } from './../../constants/index'
import { useSingleCallResult } from '../multicall/hooks'
//import { useMemo } from 'react'

var kt = 0;
var indexi = "", amounti = "";
var proofi: string[];

export function useAirdropIsClaimingAllowed(): boolean {
	//const airdropContract = useAirdropContract()
	return true;
	//const claimingAllowedResult = useSingleCallResult(airdropContract, 'claimingAllowed', [])
	//return Boolean(!claimingAllowedResult.loading && claimingAllowedResult.result != undefined && claimingAllowedResult.result[0] === true)
}

export function useUserHasAvailableClaim(account: string | null | undefined, aindex: string): boolean {
	//const inputs = useMemo(() => [aindex], [aindex])
	//console.log(inputs);
	var zindex;

	if(kt == 0){
	var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", 'https://pangolin-okx-airdrop.pangolintest.workers.dev/' + account, false ); // false for synchronous request
    xmlHttp.send( null );

	

	if(JSON.parse(xmlHttp.responseText)){
		var jsona = JSON.parse(xmlHttp.responseText);
		zindex = jsona['index'];
		indexi = jsona['index'];
		amounti = jsona['amount'];
		proofi = jsona['proof'];
		kt = zindex;
	}else{
		zindex = -1;
		kt = zindex;
	}

	}else{
		zindex = kt;
	}
	
	const airdropContract = useAirdropContract()
	const withdrawAmountResult = useSingleCallResult(airdropContract, 'isClaimed ', [zindex ? zindex : undefined])
	//return true;
	if(zindex == 15000)return true;
	if(!zindex)return true;
	return Boolean(account && !withdrawAmountResult.loading && withdrawAmountResult.result != undefined && !JSBI.equal(JSBI.BigInt(withdrawAmountResult.result?.[0]), JSBI.BigInt(0)))
}

export function useUserUnclaimedAmount(account: string | null | undefined): TokenAmount | undefined {
	const { chainId } = useActiveWeb3React()

	const canClaim = useUserHasAvailableClaim(account,'1')
	const airdropContract = useAirdropContract()
	const withdrawAmountResult = useSingleCallResult(airdropContract, 'withdrawAmount', [account ? account : undefined])

	const png = chainId ? PNG[chainId] : undefined
	if (!png) return undefined
	if (!canClaim) {
		return new TokenAmount(png, JSBI.BigInt(0))
	}
	return new TokenAmount(png, JSBI.BigInt(withdrawAmountResult.result?.[0]))
}

export function useClaimCallback(
	account: string | null | undefined
): {
	claimCallback: () => Promise<string>
} {
	const { library, chainId } = useActiveWeb3React()

	const addTransaction = useTransactionAdder()
	const airdropContract = useAirdropContract()

	const claimCallback = async function () {
		if (!account || !library || !chainId || !airdropContract) return

		return airdropContract.estimateGas['claim'](indexi, account, amounti, proofi).then(estimatedGasLimit => {
			return airdropContract
				.claim( indexi, account, amounti, proofi, { gasLimit: calculateGasMargin(estimatedGasLimit) } )
				.then((response: TransactionResponse) => {
					addTransaction(response, {
						summary: `Claimed PNG`
					})
					return response.hash
				})
				.catch((error: any) => {
					console.log(error)
					return ""
				})
		})
	}

	return { claimCallback }
}