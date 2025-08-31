import { ChainId } from '@pangolindex/sdk'
import AVALANCHE_LOGO_URL from '../assets/images/avalanche_token_round.png'

export enum SupportedNetwork {
  AVALANCHE,
}

export type NetworkInfo = {
  chainId: ChainId
  id: SupportedNetwork
  route: string
  name: string
  imageURL: string
  bgColor: string
  primaryColor: string
  secondaryColor: string
}

export const AvalancheNetworkInfo: NetworkInfo = {
  chainId: 43114,
  id: SupportedNetwork.AVALANCHE,
  route: 'avax',
  name: 'Avalanche',
  bgColor: '#e84142',
  primaryColor: '#e84142',
  secondaryColor: '#e84142',
  imageURL: AVALANCHE_LOGO_URL,
}

export const SUPPORTED_NETWORK_VERSIONS: NetworkInfo[] = [
  AvalancheNetworkInfo,
]
