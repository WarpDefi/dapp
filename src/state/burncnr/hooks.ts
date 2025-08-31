import { TransactionResponse } from '@ethersproject/providers'
import { useActiveWeb3React } from '../../hooks'
import { useBurnCNRContract } from '../../hooks/useContract'
import { calculateGasMargin } from '../../utils'
import { useTransactionAdder } from '../transactions/hooks'
import { useSingleCallResult } from '../multicall/hooks'

export function useBurnCNRIsBurningAllowed(): boolean {
	const burncnrContract = useBurnCNRContract()
	const burningAllowedResult = useSingleCallResult(burncnrContract, 'burningEnabled', [])
	return Boolean(!burningAllowedResult.loading && burningAllowedResult.result != undefined && burningAllowedResult.result[0] === true)
}


export function useClaimCallback(
	account: string | null | undefined
): {
	claimCallback: () => Promise<string>
} {
	const { library, chainId } = useActiveWeb3React()

	const addTransaction = useTransactionAdder()
	const burncnrContract = useBurnCNRContract()

	const claimCallback = async function () {
		if (!account || !library || !chainId || !burncnrContract) return

		return burncnrContract.estimateGas['burn'](1000000000).then(estimatedGasLimit => {
			return burncnrContract
				.burn({ value: 1000000000, gasLimit: calculateGasMargin(estimatedGasLimit) })
				.then((response: TransactionResponse) => {
					addTransaction(response, {
						summary: `Burned CNR 🔥`,
						claim: { recipient: account }
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