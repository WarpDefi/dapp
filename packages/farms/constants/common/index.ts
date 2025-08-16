import { ChainId } from '@pancakeswap/chains'
import { ERC20Token } from '@pancakeswap/sdk'
import {
  arbitrumTokens,
  baseTokens,
  bscTokens,
  ethereumTokens,
  lineaTokens,
  opBnbTokens,
  polygonZkEvmTokens,
  zksyncTokens,
} from '@pancakeswap/tokens'
import type { FarmV3SupportedChainId } from '../../src'
import type { CommonPrice } from '../../src/fetchFarmsV3'

export const CAKE_BNB_LP_MAINNET = '0x0eD7e52944161450477ee417DE9Cd3a859b14fD0'

export type PriceHelper = {
  chain: string
  list: ERC20Token[]
}

export const priceHelperTokens = {
  [ChainId.ETHEREUM]: {
    chain: 'ethereum',
    list: [ethereumTokens.weth, ethereumTokens.usdc, ethereumTokens.usdt],
  },
  [ChainId.BSC]: {
    chain: 'bsc',
    list: [bscTokens.wbnb, bscTokens.usdt, bscTokens.busd, bscTokens.eth],
  },
  [ChainId.POLYGON_ZKEVM]: {
    chain: 'polygon_zkevm',
    list: [polygonZkEvmTokens.weth, polygonZkEvmTokens.usdc, polygonZkEvmTokens.usdt, polygonZkEvmTokens.matic],
  },
  [ChainId.ZKSYNC]: {
    chain: 'zksync',
    list: [zksyncTokens.weth, zksyncTokens.usdc, zksyncTokens.usdt],
  },
  [ChainId.ARBITRUM_ONE]: {
    chain: 'arbitrum',
    list: [arbitrumTokens.weth, arbitrumTokens.usdc, arbitrumTokens.usdt, arbitrumTokens.arb, arbitrumTokens.usdplus],
  },
  [ChainId.LINEA]: {
    chain: 'linea',
    list: [lineaTokens.weth, lineaTokens.usdc, lineaTokens.usdt, lineaTokens.wbtc, lineaTokens.dai],
  },
  [ChainId.BASE]: {
    chain: 'base',
    list: [baseTokens.weth, baseTokens.usdbc, baseTokens.dai, baseTokens.cbETH, baseTokens.usdc],
  },
  [ChainId.OPBNB]: {
    chain: 'opbnb',
    list: [opBnbTokens.wbnb, opBnbTokens.usdt],
  },
} satisfies Record<number, PriceHelper>

// for testing purposes
export const DEFAULT_COMMON_PRICE: Record<FarmV3SupportedChainId, CommonPrice> = {
  [ChainId.U2U_NEBULAS]: {},
}
