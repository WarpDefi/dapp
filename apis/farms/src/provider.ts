import { ChainId } from '@pancakeswap/chains'
import { createPublicClient, http, PublicClient } from 'viem'
import { bsc } from 'viem/chains'
import { defineChain } from 'viem/utils'

const requireCheck = [U2U_TESTNET_NODE]

const u2uNebulas = defineChain({
  id: 2484,
  name: 'U2U Nebulas',
  network: 'u2u-nebulas',
  nativeCurrency: {
    decimals: 18,
    name: 'U2U',
    symbol: 'U2U',
  },
  rpcUrls: {
    default: { http: ['https://rpc-nebulas-testnet.uniultra.xyz/'] },
    public: { http: ['https://rpc-nebulas-testnet.uniultra.xyz/'] },
  },
  blockExplorers: {
    etherscan: { name: 'U2U Scan', url: 'https://testnet.u2uscan.xyz/' },
    default: { name: 'U2U Scan', url: 'https://testnet.u2uscan.xyz/' },
  },
  contracts: {
    multicall3: {
      address: '0xc50C2b173bD9E07c7e6E19FE4c85F98f5Ea7e75b',
      blockCreated: 19541237,
    },
  },
})

export const u2uNebulasClient = createPublicClient({
  chain: u2uNebulas,
  transport: http(),
})

export const bscClient = createPublicClient({
  chain: bsc,
  transport: http(),
})

export const viemProviders = ({ chainId }: { chainId?: ChainId }): PublicClient => {
  switch (chainId) {
    case ChainId.U2U_NEBULAS:
      return u2uNebulasClient
    case ChainId.BSC:
      return bscClient
    default:
      return u2uNebulasClient
  }
}
