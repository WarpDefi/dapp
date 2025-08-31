import { Web3Provider } from '@ethersproject/providers'
import { InjectedConnector } from '@pangolindex/web3-react-injected-connector'

import { NetworkConnector } from './NetworkConnector'

const NETWORK_URL = import.meta.env.VITE_APP_NETWORK_URL

export const NETWORK_CHAIN_ID: number = parseInt(import.meta.env.VITE_APP_CHAIN_ID ?? '43114')

if (typeof NETWORK_URL === 'undefined') {
  throw new Error(`VITE_APP_NETWORK_URL must be a defined environment variable`)
}

export const network = new NetworkConnector({
  urls: { [NETWORK_CHAIN_ID]: NETWORK_URL }
})

let networkLibrary: Web3Provider | undefined
export function getNetworkLibrary(): Web3Provider {
  return (networkLibrary = networkLibrary ?? new Web3Provider(network.provider as any))
}

export const injected = new InjectedConnector({
  supportedChainIds: [43114, 43113, 534351, 534352, 421613]
})
