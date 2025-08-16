import { Address } from "viem"


export const fetchUserInfo = async (address: Address | undefined, query: string) => {
	const res = await fetch(`https://dashboard-testnet-api.grofidex.io/api/users/info/${address}?${query}`)
	const data =  await res.json()
	return data
}

export const fetchUserCurrency = async () => {
	const res = await fetch(`https://dashboard-testnet-api.grofidex.io/api/users/currencies`)
	const data =  await res.json()
	return data
}
