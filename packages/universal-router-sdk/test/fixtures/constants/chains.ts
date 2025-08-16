import { ChainId } from '@pancakeswap/chains'
import {
  Chain,
  arbitrum,
  arbitrumGoerli,
  base,
  baseGoerli,
  bsc,
  bscTestnet,
  goerli,
  lineaTestnet,
  mainnet,
  polygonZkEvm,
  polygonZkEvmTestnet,
  scrollSepolia as scrollSepolia_,
  zkSync,
  zkSyncTestnet,
} from 'viem/chains'

const scrollSepolia = {
  ...scrollSepolia_,
  contracts: {
    multicall3: {
      address: '0xc50C2b173bD9E07c7e6E19FE4c85F98f5Ea7e75b',
      blockCreated: 9473,
    },
  },
} as const satisfies Chain

export const opbnbTestnet = {
  id: 5_611,
  name: 'opBNB Testnet',
  network: 'opbnb-testnet',
  nativeCurrency: bscTestnet.nativeCurrency,
  rpcUrls: {
    default: {
      http: ['https://opbnb-testnet-rpc.bnbchain.org'],
    },
    public: {
      http: ['https://opbnb-testnet-rpc.bnbchain.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'opBNBScan',
      url: 'https://opbnbscan.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xc50C2b173bD9E07c7e6E19FE4c85F98f5Ea7e75b',
      blockCreated: 3705108,
    },
  },
  testnet: true,
} as const satisfies Chain

export const linea = {
  id: 59_144,
  name: 'Linea Mainnet',
  network: 'linea-mainnet',
  nativeCurrency: { name: 'Linea Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    infura: {
      http: ['https://linea-mainnet.infura.io/v3'],
      webSocket: ['wss://linea-mainnet.infura.io/ws/v3'],
    },
    default: {
      http: ['https://rpc.linea.build'],
      webSocket: ['wss://rpc.linea.build'],
    },
    public: {
      http: ['https://rpc.linea.build'],
      webSocket: ['wss://rpc.linea.build'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://lineascan.build',
    },
    etherscan: {
      name: 'Etherscan',
      url: 'https://lineascan.build',
    },
  },
  contracts: {
    multicall3: {
      address: '0xc50C2b173bD9E07c7e6E19FE4c85F98f5Ea7e75b',
      blockCreated: 42,
    },
  },
  testnet: false,
} as const satisfies Chain

/**
 * Controls some L2 specific behavior, e.g. slippage tolerance, special UI behavior.
 * The expectation is that all of these networks have immediate transaction confirmation.
 */
export const L2_CHAIN_IDS: ChainId[] = [
  ChainId.ARBITRUM_ONE,
  ChainId.ARBITRUM_GOERLI,
  ChainId.POLYGON_ZKEVM,
  ChainId.POLYGON_ZKEVM_TESTNET,
  ChainId.ZKSYNC,
  ChainId.ZKSYNC_TESTNET,
  ChainId.LINEA_TESTNET,
  ChainId.LINEA,
  ChainId.BASE,
  ChainId.BASE_TESTNET,
  ChainId.OPBNB_TESTNET,
]

export const CHAINS = [
  bsc,
  mainnet,
  bscTestnet,
  goerli,
  polygonZkEvm,
  polygonZkEvmTestnet,
  zkSync,
  zkSyncTestnet,
  arbitrum,
  arbitrumGoerli,
  linea,
  lineaTestnet,
  arbitrumGoerli,
  arbitrum,
  base,
  baseGoerli,
  opbnbTestnet,
  scrollSepolia,
]
