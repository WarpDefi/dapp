import { ChainId, CHAINS, JSBI, Percent, Token, WAVAX } from '@pangolindex/sdk'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { CommonEVMProvider } from '../WalletProviders';

import { injected } from '../connectors'
import { SupportedNetwork } from './networks';

export type LogoSize = 24 | 32 | 48;

export const PANGOLIN_TOKENS_REPO_RAW_BASE_URL = `https://raw.githubusercontent.com/pangolindex/tokens`;

export const GAS_PRICE = 225;

export const BUNDLE_ID = '1'

export const timeframeOptions = {
  DAY: '1 day',
  WEEK: '1 week',
  MONTH: '1 month',
}

export const MATIC_ADDRESS = '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270'
export const CELO_ADDRESS = '0x471EcE3750Da237f93B8E339c536989b8978a438'

const WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const ARBITRUM_WETH_ADDRESS = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'

export const WETH_ADDRESSES = [WETH_ADDRESS, ARBITRUM_WETH_ADDRESS]

export const POOL_HIDE: { [key: string]: string[] } = {
  [SupportedNetwork.AVALANCHE]: [],
}

export const START_BLOCKS: { [key: string]: number } = {
  [SupportedNetwork.AVALANCHE]: 31422450,
}

export const TOKEN_HIDE: { [key: string]: string[] } = {
  [SupportedNetwork.AVALANCHE]: [],
}

export const PROVIDER_MAPPING: { [chainId in ChainId]: (provider: any) => any } = {
  [ChainId.FUJI]: CommonEVMProvider,
  [ChainId.AVALANCHE]: CommonEVMProvider,
  [ChainId.INKCHAIN_SEPOLIA]: CommonEVMProvider,
  [ChainId.WAGMI]: CommonEVMProvider,
  [ChainId.COSTON]: CommonEVMProvider,
  [ChainId.SONGBIRD]: CommonEVMProvider,
  [ChainId.FLARE_MAINNET]: CommonEVMProvider,
  [ChainId.HEDERA_TESTNET]: CommonEVMProvider,
  [ChainId.HEDERA_MAINNET]: CommonEVMProvider,
  [ChainId.NEAR_MAINNET]: CommonEVMProvider,
  [ChainId.NEAR_TESTNET]: CommonEVMProvider,
  [ChainId.COSTON2]: CommonEVMProvider,
  //TODO: remove this once we have proper implementation
  [ChainId.ETHEREUM]: CommonEVMProvider,
  [ChainId.POLYGON]: CommonEVMProvider,
  [ChainId.FANTOM]: CommonEVMProvider,
  [ChainId.XDAI]: CommonEVMProvider,
  [ChainId.BSC]: CommonEVMProvider,
  [ChainId.ARBITRUM]: CommonEVMProvider,
  [ChainId.CELO]: CommonEVMProvider,
  [ChainId.OKXCHAIN]: CommonEVMProvider,
  [ChainId.VELAS]: CommonEVMProvider,
  [ChainId.AURORA]: CommonEVMProvider,
  [ChainId.CRONOS]: CommonEVMProvider,
  [ChainId.FUSE]: CommonEVMProvider,
  [ChainId.MOONRIVER]: CommonEVMProvider,
  [ChainId.MOONBEAM]: CommonEVMProvider,
  [ChainId.OP]: CommonEVMProvider,
  [ChainId.EVMOS_TESTNET]: CommonEVMProvider,
  [ChainId.EVMOS_MAINNET]: CommonEVMProvider,
  [ChainId.SKALE_BELLATRIX_TESTNET]: CommonEVMProvider,
};

export const SUPPORTED_LIST_URLS__NO_ENS = [
  'https://raw.githubusercontent.com/canarydex/pangolin-tokenlist/main/pangolin_tokenlist.json'
]

export const LANDING_PAGE = 'https://pangolin.exchange/'
export const ANALYTICS_PAGE = 'https://info.pangolin.exchange/'
export const PANGOLIN_API_BASE_URL = "https://api.pangolin.exchange";

export const BIG_INT_SECONDS_IN_WEEK = JSBI.BigInt(60 * 60 * 24 * 7)

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const GOVERNANCE_ADDRESS = '0xb0Ff2b1047d9E8d294c2eD798faE3fA817F43Ee1'

export const PANGOLIN_V3_REWARDER_ADDRESS = '0xbA19AF51023b02AEC7e0c81499a2a2654aac2F1c'

export const ROUTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: '0x0000000000000000000000000000000000000000',
  [ChainId.AVALANCHE]: '0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106',
  [ChainId.INKCHAIN_SEPOLIA]: '0x599cdBb1Ac705A86077345C52e69064De3b02de8',
  [ChainId.ARBITRUM]: '0x0000000000000000000000000000000000000000',
  [ChainId.AURORA]: '0x0000000000000000000000000000000000000000',
  [ChainId.BSC]: '0x0000000000000000000000000000000000000000',
  [ChainId.CELO]: '0x0000000000000000000000000000000000000000',
  [ChainId.COSTON]: '0x0000000000000000000000000000000000000000',
  [ChainId.COSTON2]: '0x0000000000000000000000000000000000000000',
  [ChainId.CRONOS]: '0x0000000000000000000000000000000000000000',
  [ChainId.ETHEREUM]: '0x0000000000000000000000000000000000000000',
  [ChainId.EVMOS_MAINNET]: '0x0000000000000000000000000000000000000000',
  [ChainId.EVMOS_TESTNET]: '0x0000000000000000000000000000000000000000',
  [ChainId.FANTOM]: '0x0000000000000000000000000000000000000000',
  [ChainId.FLARE_MAINNET]: '0x0000000000000000000000000000000000000000',
  [ChainId.FUSE]: '0x0000000000000000000000000000000000000000',
  [ChainId.HEDERA_MAINNET]: '0x0000000000000000000000000000000000000000',
  [ChainId.HEDERA_TESTNET]: '0x0000000000000000000000000000000000000000',
  [ChainId.MOONBEAM]: '0x0000000000000000000000000000000000000000',
  [ChainId.MOONRIVER]: '0x0000000000000000000000000000000000000000',
  [ChainId.NEAR_MAINNET]: '0x0000000000000000000000000000000000000000',
  [ChainId.NEAR_TESTNET]: '0x0000000000000000000000000000000000000000',
  [ChainId.OKXCHAIN]: '0x0000000000000000000000000000000000000000',
  [ChainId.OP]: '0x0000000000000000000000000000000000000000',
  [ChainId.POLYGON]: '0x0000000000000000000000000000000000000000',
  [ChainId.SKALE_BELLATRIX_TESTNET]: '0x0000000000000000000000000000000000000000',
  [ChainId.SONGBIRD]: '0x0000000000000000000000000000000000000000',
  [ChainId.VELAS]: '0x0000000000000000000000000000000000000000',
  [ChainId.WAGMI]: '0x0000000000000000000000000000000000000000',
  [ChainId.XDAI]: '0x0000000000000000000000000000000000000000'
}

export const ROUTER_DAAS_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: CHAINS[ChainId.FUJI]?.contracts?.router_daas ?? ZERO_ADDRESS,
  [ChainId.AVALANCHE]: CHAINS[ChainId.AVALANCHE]?.contracts?.router_daas ?? ZERO_ADDRESS,
  [ChainId.INKCHAIN_SEPOLIA]: CHAINS[ChainId.INKCHAIN_SEPOLIA]?.contracts?.router_daas ?? ZERO_ADDRESS,
  [ChainId.WAGMI]: CHAINS[ChainId.WAGMI]?.contracts?.router_daas ?? ZERO_ADDRESS,
  [ChainId.COSTON]: CHAINS[ChainId.COSTON]?.contracts?.router_daas ?? ZERO_ADDRESS,
  [ChainId.SONGBIRD]: CHAINS[ChainId.SONGBIRD]?.contracts?.router_daas ?? ZERO_ADDRESS,
  [ChainId.FLARE_MAINNET]: CHAINS[ChainId.FLARE_MAINNET]?.contracts?.router_daas ?? ZERO_ADDRESS,
  [ChainId.HEDERA_TESTNET]: CHAINS[ChainId.HEDERA_TESTNET]?.contracts?.router_daas ?? ZERO_ADDRESS,
  [ChainId.HEDERA_MAINNET]: CHAINS[ChainId.HEDERA_MAINNET]?.contracts?.router_daas ?? ZERO_ADDRESS,
  [ChainId.NEAR_MAINNET]: CHAINS[ChainId.NEAR_MAINNET]?.contracts?.router_daas ?? ZERO_ADDRESS,
  [ChainId.NEAR_TESTNET]: CHAINS[ChainId.NEAR_TESTNET]?.contracts?.router_daas ?? ZERO_ADDRESS,
  [ChainId.COSTON2]: CHAINS[ChainId.COSTON2]?.contracts?.router_daas ?? ZERO_ADDRESS,
  [ChainId.ETHEREUM]: ZERO_ADDRESS,
  [ChainId.POLYGON]: ZERO_ADDRESS,
  [ChainId.FANTOM]: ZERO_ADDRESS,
  [ChainId.XDAI]: ZERO_ADDRESS,
  [ChainId.BSC]: ZERO_ADDRESS,
  [ChainId.ARBITRUM]: ZERO_ADDRESS,
  [ChainId.CELO]: ZERO_ADDRESS,
  [ChainId.OKXCHAIN]: ZERO_ADDRESS,
  [ChainId.VELAS]: ZERO_ADDRESS,
  [ChainId.AURORA]: ZERO_ADDRESS,
  [ChainId.CRONOS]: ZERO_ADDRESS,
  [ChainId.FUSE]: ZERO_ADDRESS,
  [ChainId.MOONRIVER]: ZERO_ADDRESS,
  [ChainId.MOONBEAM]: ZERO_ADDRESS,
  [ChainId.OP]: ZERO_ADDRESS,
  [ChainId.EVMOS_TESTNET]: CHAINS[ChainId.EVMOS_TESTNET]?.contracts?.router_daas ?? ZERO_ADDRESS,
  [ChainId.EVMOS_MAINNET]: CHAINS[ChainId.EVMOS_MAINNET]?.contracts?.router_daas ?? ZERO_ADDRESS,
  [ChainId.SKALE_BELLATRIX_TESTNET]: CHAINS[ChainId.SKALE_BELLATRIX_TESTNET]?.contracts?.router_daas ?? ZERO_ADDRESS,
};

export const FACTORY_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.FUJI]: '0x0000000000000000000000000000000000000000',
  [ChainId.AVALANCHE]: '0xefa94DE7a4656D787667C749f7E1223D71E9FD88',
  [ChainId.INKCHAIN_SEPOLIA]: '0xeBdFb0147b916CD0b79e10c754e9B081c8713A55',
  [ChainId.ARBITRUM]: '0x0000000000000000000000000000000000000000',
  [ChainId.AURORA]: '0x0000000000000000000000000000000000000000',
  [ChainId.BSC]: '0x0000000000000000000000000000000000000000',
  [ChainId.CELO]: '0x0000000000000000000000000000000000000000',
  [ChainId.COSTON]: '0x0000000000000000000000000000000000000000',
  [ChainId.COSTON2]: '0x0000000000000000000000000000000000000000',
  [ChainId.CRONOS]: '0x0000000000000000000000000000000000000000',
  [ChainId.ETHEREUM]: '0x0000000000000000000000000000000000000000',
  [ChainId.EVMOS_MAINNET]: '0x0000000000000000000000000000000000000000',
  [ChainId.EVMOS_TESTNET]: '0x0000000000000000000000000000000000000000',
  [ChainId.FANTOM]: '0x0000000000000000000000000000000000000000',
  [ChainId.FLARE_MAINNET]: '0x0000000000000000000000000000000000000000',
  [ChainId.FUSE]: '0x0000000000000000000000000000000000000000',
  [ChainId.HEDERA_MAINNET]: '0x0000000000000000000000000000000000000000',
  [ChainId.HEDERA_TESTNET]: '0x0000000000000000000000000000000000000000',
  [ChainId.MOONBEAM]: '0x0000000000000000000000000000000000000000',
  [ChainId.MOONRIVER]: '0x0000000000000000000000000000000000000000',
  [ChainId.NEAR_MAINNET]: '0x0000000000000000000000000000000000000000',
  [ChainId.NEAR_TESTNET]: '0x0000000000000000000000000000000000000000',
  [ChainId.OKXCHAIN]: '0x0000000000000000000000000000000000000000',
  [ChainId.OP]: '0x0000000000000000000000000000000000000000',
  [ChainId.POLYGON]: '0x0000000000000000000000000000000000000000',
  [ChainId.SKALE_BELLATRIX_TESTNET]: '0x0000000000000000000000000000000000000000',
  [ChainId.SONGBIRD]: '0x0000000000000000000000000000000000000000',
  [ChainId.VELAS]: '0x0000000000000000000000000000000000000000',
  [ChainId.WAGMI]: '0x0000000000000000000000000000000000000000',
  [ChainId.XDAI]: '0x0000000000000000000000000000000000000000'
}

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in ChainId]: Token[]
}

export const UNDEFINED: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 0),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, ZERO_ADDRESS, 0),
  [ChainId.INKCHAIN_SEPOLIA]: new Token(ChainId.INKCHAIN_SEPOLIA, ZERO_ADDRESS, 0),
  [ChainId.ARBITRUM]: new Token(ChainId.ARBITRUM, ZERO_ADDRESS, 0),
  [ChainId.AURORA]: new Token(ChainId.AURORA, ZERO_ADDRESS, 0),
  [ChainId.BSC]: new Token(ChainId.BSC, ZERO_ADDRESS, 0),
  [ChainId.CELO]: new Token(ChainId.CELO, ZERO_ADDRESS, 0),
  [ChainId.COSTON]: new Token(ChainId.COSTON, ZERO_ADDRESS, 0),
  [ChainId.COSTON2]: new Token(ChainId.COSTON2, ZERO_ADDRESS, 0),
  [ChainId.CRONOS]: new Token(ChainId.CRONOS, ZERO_ADDRESS, 0),
  [ChainId.ETHEREUM]: new Token(ChainId.ETHEREUM, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_MAINNET]: new Token(ChainId.EVMOS_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_TESTNET]: new Token(ChainId.EVMOS_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.FANTOM]: new Token(ChainId.FANTOM, ZERO_ADDRESS, 0),
  [ChainId.FLARE_MAINNET]: new Token(ChainId.FLARE_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.FUSE]: new Token(ChainId.FUSE, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_MAINNET]: new Token(ChainId.HEDERA_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_TESTNET]: new Token(ChainId.HEDERA_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.MOONBEAM]: new Token(ChainId.MOONBEAM, ZERO_ADDRESS, 0),
  [ChainId.MOONRIVER]: new Token(ChainId.MOONRIVER, ZERO_ADDRESS, 0),
  [ChainId.NEAR_MAINNET]: new Token(ChainId.NEAR_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.NEAR_TESTNET]: new Token(ChainId.NEAR_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.OKXCHAIN]: new Token(ChainId.OKXCHAIN, ZERO_ADDRESS, 0),
  [ChainId.OP]: new Token(ChainId.OP, ZERO_ADDRESS, 0),
  [ChainId.POLYGON]: new Token(ChainId.POLYGON, ZERO_ADDRESS, 0),
  [ChainId.SKALE_BELLATRIX_TESTNET]: new Token(ChainId.SKALE_BELLATRIX_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.SONGBIRD]: new Token(ChainId.SONGBIRD, ZERO_ADDRESS, 0),
  [ChainId.VELAS]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.WAGMI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.XDAI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
}

export const CNR: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, '0x695c1d3Be6be6BcE84989701c60f1F180508B5C5', 18, 'CNR', 'Canary'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0x8D88e48465F30Acfb8daC0b3E35c9D6D7d36abaf', 18, 'CNR', 'Canary'),
  [ChainId.ARBITRUM]: new Token(ChainId.ARBITRUM, ZERO_ADDRESS, 0),
  [ChainId.INKCHAIN_SEPOLIA]: new Token(ChainId.INKCHAIN_SEPOLIA, ZERO_ADDRESS, 0),
  [ChainId.AURORA]: new Token(ChainId.AURORA, ZERO_ADDRESS, 0),
  [ChainId.BSC]: new Token(ChainId.BSC, ZERO_ADDRESS, 0),
  [ChainId.CELO]: new Token(ChainId.CELO, ZERO_ADDRESS, 0),
  [ChainId.COSTON]: new Token(ChainId.COSTON, ZERO_ADDRESS, 0),
  [ChainId.COSTON2]: new Token(ChainId.COSTON2, ZERO_ADDRESS, 0),
  [ChainId.CRONOS]: new Token(ChainId.CRONOS, ZERO_ADDRESS, 0),
  [ChainId.ETHEREUM]: new Token(ChainId.ETHEREUM, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_MAINNET]: new Token(ChainId.EVMOS_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_TESTNET]: new Token(ChainId.EVMOS_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.FANTOM]: new Token(ChainId.FANTOM, ZERO_ADDRESS, 0),
  [ChainId.FLARE_MAINNET]: new Token(ChainId.FLARE_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.FUSE]: new Token(ChainId.FUSE, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_MAINNET]: new Token(ChainId.HEDERA_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_TESTNET]: new Token(ChainId.HEDERA_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.MOONBEAM]: new Token(ChainId.MOONBEAM, ZERO_ADDRESS, 0),
  [ChainId.MOONRIVER]: new Token(ChainId.MOONRIVER, ZERO_ADDRESS, 0),
  [ChainId.NEAR_MAINNET]: new Token(ChainId.NEAR_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.NEAR_TESTNET]: new Token(ChainId.NEAR_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.OKXCHAIN]: new Token(ChainId.OKXCHAIN, ZERO_ADDRESS, 0),
  [ChainId.OP]: new Token(ChainId.OP, ZERO_ADDRESS, 0),
  [ChainId.POLYGON]: new Token(ChainId.POLYGON, ZERO_ADDRESS, 0),
  [ChainId.SKALE_BELLATRIX_TESTNET]: new Token(ChainId.SKALE_BELLATRIX_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.SONGBIRD]: new Token(ChainId.SONGBIRD, ZERO_ADDRESS, 0),
  [ChainId.VELAS]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.WAGMI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.XDAI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
}

export const DAIe: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'DAI.e', 'Dai Stablecoin'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70', 18, 'DAI.e', 'Dai Stablecoin'),
  [ChainId.ARBITRUM]: new Token(ChainId.ARBITRUM, ZERO_ADDRESS, 0),
  [ChainId.INKCHAIN_SEPOLIA]: new Token(ChainId.INKCHAIN_SEPOLIA, ZERO_ADDRESS, 0),
  [ChainId.AURORA]: new Token(ChainId.AURORA, ZERO_ADDRESS, 0),
  [ChainId.BSC]: new Token(ChainId.BSC, ZERO_ADDRESS, 0),
  [ChainId.CELO]: new Token(ChainId.CELO, ZERO_ADDRESS, 0),
  [ChainId.COSTON]: new Token(ChainId.COSTON, ZERO_ADDRESS, 0),
  [ChainId.COSTON2]: new Token(ChainId.COSTON2, ZERO_ADDRESS, 0),
  [ChainId.CRONOS]: new Token(ChainId.CRONOS, ZERO_ADDRESS, 0),
  [ChainId.ETHEREUM]: new Token(ChainId.ETHEREUM, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_MAINNET]: new Token(ChainId.EVMOS_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_TESTNET]: new Token(ChainId.EVMOS_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.FANTOM]: new Token(ChainId.FANTOM, ZERO_ADDRESS, 0),
  [ChainId.FLARE_MAINNET]: new Token(ChainId.FLARE_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.FUSE]: new Token(ChainId.FUSE, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_MAINNET]: new Token(ChainId.HEDERA_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_TESTNET]: new Token(ChainId.HEDERA_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.MOONBEAM]: new Token(ChainId.MOONBEAM, ZERO_ADDRESS, 0),
  [ChainId.MOONRIVER]: new Token(ChainId.MOONRIVER, ZERO_ADDRESS, 0),
  [ChainId.NEAR_MAINNET]: new Token(ChainId.NEAR_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.NEAR_TESTNET]: new Token(ChainId.NEAR_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.OKXCHAIN]: new Token(ChainId.OKXCHAIN, ZERO_ADDRESS, 0),
  [ChainId.OP]: new Token(ChainId.OP, ZERO_ADDRESS, 0),
  [ChainId.POLYGON]: new Token(ChainId.POLYGON, ZERO_ADDRESS, 0),
  [ChainId.SKALE_BELLATRIX_TESTNET]: new Token(ChainId.SKALE_BELLATRIX_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.SONGBIRD]: new Token(ChainId.SONGBIRD, ZERO_ADDRESS, 0),
  [ChainId.VELAS]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.WAGMI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.XDAI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
}

export const USDCN: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 6, 'USDC.e', 'USD Coin'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', 6, 'USDC', 'USD Coin'),
  [ChainId.ARBITRUM]: new Token(ChainId.ARBITRUM, ZERO_ADDRESS, 0),
  [ChainId.INKCHAIN_SEPOLIA]: new Token(ChainId.INKCHAIN_SEPOLIA, ZERO_ADDRESS, 0),
  [ChainId.AURORA]: new Token(ChainId.AURORA, ZERO_ADDRESS, 0),
  [ChainId.BSC]: new Token(ChainId.BSC, ZERO_ADDRESS, 0),
  [ChainId.CELO]: new Token(ChainId.CELO, ZERO_ADDRESS, 0),
  [ChainId.COSTON]: new Token(ChainId.COSTON, ZERO_ADDRESS, 0),
  [ChainId.COSTON2]: new Token(ChainId.COSTON2, ZERO_ADDRESS, 0),
  [ChainId.CRONOS]: new Token(ChainId.CRONOS, ZERO_ADDRESS, 0),
  [ChainId.ETHEREUM]: new Token(ChainId.ETHEREUM, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_MAINNET]: new Token(ChainId.EVMOS_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_TESTNET]: new Token(ChainId.EVMOS_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.FANTOM]: new Token(ChainId.FANTOM, ZERO_ADDRESS, 0),
  [ChainId.FLARE_MAINNET]: new Token(ChainId.FLARE_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.FUSE]: new Token(ChainId.FUSE, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_MAINNET]: new Token(ChainId.HEDERA_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_TESTNET]: new Token(ChainId.HEDERA_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.MOONBEAM]: new Token(ChainId.MOONBEAM, ZERO_ADDRESS, 0),
  [ChainId.MOONRIVER]: new Token(ChainId.MOONRIVER, ZERO_ADDRESS, 0),
  [ChainId.NEAR_MAINNET]: new Token(ChainId.NEAR_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.NEAR_TESTNET]: new Token(ChainId.NEAR_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.OKXCHAIN]: new Token(ChainId.OKXCHAIN, ZERO_ADDRESS, 0),
  [ChainId.OP]: new Token(ChainId.OP, ZERO_ADDRESS, 0),
  [ChainId.POLYGON]: new Token(ChainId.POLYGON, ZERO_ADDRESS, 0),
  [ChainId.SKALE_BELLATRIX_TESTNET]: new Token(ChainId.SKALE_BELLATRIX_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.SONGBIRD]: new Token(ChainId.SONGBIRD, ZERO_ADDRESS, 0),
  [ChainId.VELAS]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.WAGMI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.XDAI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
}

export const USDCe: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 6, 'USDC.e', 'USD Coin'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664', 6, 'USDC.e', 'USD Coin'),
  [ChainId.INKCHAIN_SEPOLIA]: new Token(ChainId.INKCHAIN_SEPOLIA, ZERO_ADDRESS, 0),
  [ChainId.ARBITRUM]: new Token(ChainId.ARBITRUM, ZERO_ADDRESS, 0),
  [ChainId.AURORA]: new Token(ChainId.AURORA, ZERO_ADDRESS, 0),
  [ChainId.BSC]: new Token(ChainId.BSC, ZERO_ADDRESS, 0),
  [ChainId.CELO]: new Token(ChainId.CELO, ZERO_ADDRESS, 0),
  [ChainId.COSTON]: new Token(ChainId.COSTON, ZERO_ADDRESS, 0),
  [ChainId.COSTON2]: new Token(ChainId.COSTON2, ZERO_ADDRESS, 0),
  [ChainId.CRONOS]: new Token(ChainId.CRONOS, ZERO_ADDRESS, 0),
  [ChainId.ETHEREUM]: new Token(ChainId.ETHEREUM, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_MAINNET]: new Token(ChainId.EVMOS_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_TESTNET]: new Token(ChainId.EVMOS_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.FANTOM]: new Token(ChainId.FANTOM, ZERO_ADDRESS, 0),
  [ChainId.FLARE_MAINNET]: new Token(ChainId.FLARE_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.FUSE]: new Token(ChainId.FUSE, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_MAINNET]: new Token(ChainId.HEDERA_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_TESTNET]: new Token(ChainId.HEDERA_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.MOONBEAM]: new Token(ChainId.MOONBEAM, ZERO_ADDRESS, 0),
  [ChainId.MOONRIVER]: new Token(ChainId.MOONRIVER, ZERO_ADDRESS, 0),
  [ChainId.NEAR_MAINNET]: new Token(ChainId.NEAR_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.NEAR_TESTNET]: new Token(ChainId.NEAR_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.OKXCHAIN]: new Token(ChainId.OKXCHAIN, ZERO_ADDRESS, 0),
  [ChainId.OP]: new Token(ChainId.OP, ZERO_ADDRESS, 0),
  [ChainId.POLYGON]: new Token(ChainId.POLYGON, ZERO_ADDRESS, 0),
  [ChainId.SKALE_BELLATRIX_TESTNET]: new Token(ChainId.SKALE_BELLATRIX_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.SONGBIRD]: new Token(ChainId.SONGBIRD, ZERO_ADDRESS, 0),
  [ChainId.VELAS]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.WAGMI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.XDAI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
}

export const USDT: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 6, 'USDT.e', 'Tether USD'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7', 6, 'USDt', 'Tether USD'),
  [ChainId.INKCHAIN_SEPOLIA]: new Token(ChainId.INKCHAIN_SEPOLIA, ZERO_ADDRESS, 0),
  [ChainId.ARBITRUM]: new Token(ChainId.ARBITRUM, ZERO_ADDRESS, 0),
  [ChainId.AURORA]: new Token(ChainId.AURORA, ZERO_ADDRESS, 0),
  [ChainId.BSC]: new Token(ChainId.BSC, ZERO_ADDRESS, 0),
  [ChainId.CELO]: new Token(ChainId.CELO, ZERO_ADDRESS, 0),
  [ChainId.COSTON]: new Token(ChainId.COSTON, ZERO_ADDRESS, 0),
  [ChainId.COSTON2]: new Token(ChainId.COSTON2, ZERO_ADDRESS, 0),
  [ChainId.CRONOS]: new Token(ChainId.CRONOS, ZERO_ADDRESS, 0),
  [ChainId.ETHEREUM]: new Token(ChainId.ETHEREUM, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_MAINNET]: new Token(ChainId.EVMOS_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_TESTNET]: new Token(ChainId.EVMOS_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.FANTOM]: new Token(ChainId.FANTOM, ZERO_ADDRESS, 0),
  [ChainId.FLARE_MAINNET]: new Token(ChainId.FLARE_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.FUSE]: new Token(ChainId.FUSE, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_MAINNET]: new Token(ChainId.HEDERA_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_TESTNET]: new Token(ChainId.HEDERA_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.MOONBEAM]: new Token(ChainId.MOONBEAM, ZERO_ADDRESS, 0),
  [ChainId.MOONRIVER]: new Token(ChainId.MOONRIVER, ZERO_ADDRESS, 0),
  [ChainId.NEAR_MAINNET]: new Token(ChainId.NEAR_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.NEAR_TESTNET]: new Token(ChainId.NEAR_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.OKXCHAIN]: new Token(ChainId.OKXCHAIN, ZERO_ADDRESS, 0),
  [ChainId.OP]: new Token(ChainId.OP, ZERO_ADDRESS, 0),
  [ChainId.POLYGON]: new Token(ChainId.POLYGON, ZERO_ADDRESS, 0),
  [ChainId.SKALE_BELLATRIX_TESTNET]: new Token(ChainId.SKALE_BELLATRIX_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.SONGBIRD]: new Token(ChainId.SONGBIRD, ZERO_ADDRESS, 0),
  [ChainId.VELAS]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.WAGMI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.XDAI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
}

export const USDTe: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 6, 'USDT.e', 'Tether USD'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0xc7198437980c041c805A1EDcbA50c1Ce5db95118', 6, 'USDT.e', 'Tether USD'),
  [ChainId.INKCHAIN_SEPOLIA]: new Token(ChainId.INKCHAIN_SEPOLIA, ZERO_ADDRESS, 0),
  [ChainId.ARBITRUM]: new Token(ChainId.ARBITRUM, ZERO_ADDRESS, 0),
  [ChainId.AURORA]: new Token(ChainId.AURORA, ZERO_ADDRESS, 0),
  [ChainId.BSC]: new Token(ChainId.BSC, ZERO_ADDRESS, 0),
  [ChainId.CELO]: new Token(ChainId.CELO, ZERO_ADDRESS, 0),
  [ChainId.COSTON]: new Token(ChainId.COSTON, ZERO_ADDRESS, 0),
  [ChainId.COSTON2]: new Token(ChainId.COSTON2, ZERO_ADDRESS, 0),
  [ChainId.CRONOS]: new Token(ChainId.CRONOS, ZERO_ADDRESS, 0),
  [ChainId.ETHEREUM]: new Token(ChainId.ETHEREUM, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_MAINNET]: new Token(ChainId.EVMOS_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_TESTNET]: new Token(ChainId.EVMOS_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.FANTOM]: new Token(ChainId.FANTOM, ZERO_ADDRESS, 0),
  [ChainId.FLARE_MAINNET]: new Token(ChainId.FLARE_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.FUSE]: new Token(ChainId.FUSE, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_MAINNET]: new Token(ChainId.HEDERA_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_TESTNET]: new Token(ChainId.HEDERA_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.MOONBEAM]: new Token(ChainId.MOONBEAM, ZERO_ADDRESS, 0),
  [ChainId.MOONRIVER]: new Token(ChainId.MOONRIVER, ZERO_ADDRESS, 0),
  [ChainId.NEAR_MAINNET]: new Token(ChainId.NEAR_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.NEAR_TESTNET]: new Token(ChainId.NEAR_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.OKXCHAIN]: new Token(ChainId.OKXCHAIN, ZERO_ADDRESS, 0),
  [ChainId.OP]: new Token(ChainId.OP, ZERO_ADDRESS, 0),
  [ChainId.POLYGON]: new Token(ChainId.POLYGON, ZERO_ADDRESS, 0),
  [ChainId.SKALE_BELLATRIX_TESTNET]: new Token(ChainId.SKALE_BELLATRIX_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.SONGBIRD]: new Token(ChainId.SONGBIRD, ZERO_ADDRESS, 0),
  [ChainId.VELAS]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.WAGMI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.XDAI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
}

export const XAVA: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'XAVA', 'Avalaunch Token'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0xd1c3f94DE7e5B45fa4eDBBA472491a9f4B166FC4', 18, 'XAVA', 'Avalaunch Token'),
  [ChainId.INKCHAIN_SEPOLIA]: new Token(ChainId.INKCHAIN_SEPOLIA, ZERO_ADDRESS, 0),
  [ChainId.ARBITRUM]: new Token(ChainId.ARBITRUM, ZERO_ADDRESS, 0),
  [ChainId.AURORA]: new Token(ChainId.AURORA, ZERO_ADDRESS, 0),
  [ChainId.BSC]: new Token(ChainId.BSC, ZERO_ADDRESS, 0),
  [ChainId.CELO]: new Token(ChainId.CELO, ZERO_ADDRESS, 0),
  [ChainId.COSTON]: new Token(ChainId.COSTON, ZERO_ADDRESS, 0),
  [ChainId.COSTON2]: new Token(ChainId.COSTON2, ZERO_ADDRESS, 0),
  [ChainId.CRONOS]: new Token(ChainId.CRONOS, ZERO_ADDRESS, 0),
  [ChainId.ETHEREUM]: new Token(ChainId.ETHEREUM, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_MAINNET]: new Token(ChainId.EVMOS_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_TESTNET]: new Token(ChainId.EVMOS_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.FANTOM]: new Token(ChainId.FANTOM, ZERO_ADDRESS, 0),
  [ChainId.FLARE_MAINNET]: new Token(ChainId.FLARE_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.FUSE]: new Token(ChainId.FUSE, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_MAINNET]: new Token(ChainId.HEDERA_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_TESTNET]: new Token(ChainId.HEDERA_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.MOONBEAM]: new Token(ChainId.MOONBEAM, ZERO_ADDRESS, 0),
  [ChainId.MOONRIVER]: new Token(ChainId.MOONRIVER, ZERO_ADDRESS, 0),
  [ChainId.NEAR_MAINNET]: new Token(ChainId.NEAR_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.NEAR_TESTNET]: new Token(ChainId.NEAR_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.OKXCHAIN]: new Token(ChainId.OKXCHAIN, ZERO_ADDRESS, 0),
  [ChainId.OP]: new Token(ChainId.OP, ZERO_ADDRESS, 0),
  [ChainId.POLYGON]: new Token(ChainId.POLYGON, ZERO_ADDRESS, 0),
  [ChainId.SKALE_BELLATRIX_TESTNET]: new Token(ChainId.SKALE_BELLATRIX_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.SONGBIRD]: new Token(ChainId.SONGBIRD, ZERO_ADDRESS, 0),
  [ChainId.VELAS]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.WAGMI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.XDAI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
}

export const AMPL: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 9, 'AMPL', 'Ampleforth secured by Meter Passport'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0x027dbcA046ca156De9622cD1e2D907d375e53aa7', 9, 'AMPL', 'Ampleforth secured by Meter Passport'),
  [ChainId.INKCHAIN_SEPOLIA]: new Token(ChainId.INKCHAIN_SEPOLIA, ZERO_ADDRESS, 0),
  [ChainId.ARBITRUM]: new Token(ChainId.ARBITRUM, ZERO_ADDRESS, 0),
  [ChainId.AURORA]: new Token(ChainId.AURORA, ZERO_ADDRESS, 0),
  [ChainId.BSC]: new Token(ChainId.BSC, ZERO_ADDRESS, 0),
  [ChainId.CELO]: new Token(ChainId.CELO, ZERO_ADDRESS, 0),
  [ChainId.COSTON]: new Token(ChainId.COSTON, ZERO_ADDRESS, 0),
  [ChainId.COSTON2]: new Token(ChainId.COSTON2, ZERO_ADDRESS, 0),
  [ChainId.CRONOS]: new Token(ChainId.CRONOS, ZERO_ADDRESS, 0),
  [ChainId.ETHEREUM]: new Token(ChainId.ETHEREUM, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_MAINNET]: new Token(ChainId.EVMOS_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_TESTNET]: new Token(ChainId.EVMOS_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.FANTOM]: new Token(ChainId.FANTOM, ZERO_ADDRESS, 0),
  [ChainId.FLARE_MAINNET]: new Token(ChainId.FLARE_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.FUSE]: new Token(ChainId.FUSE, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_MAINNET]: new Token(ChainId.HEDERA_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_TESTNET]: new Token(ChainId.HEDERA_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.MOONBEAM]: new Token(ChainId.MOONBEAM, ZERO_ADDRESS, 0),
  [ChainId.MOONRIVER]: new Token(ChainId.MOONRIVER, ZERO_ADDRESS, 0),
  [ChainId.NEAR_MAINNET]: new Token(ChainId.NEAR_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.NEAR_TESTNET]: new Token(ChainId.NEAR_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.OKXCHAIN]: new Token(ChainId.OKXCHAIN, ZERO_ADDRESS, 0),
  [ChainId.OP]: new Token(ChainId.OP, ZERO_ADDRESS, 0),
  [ChainId.POLYGON]: new Token(ChainId.POLYGON, ZERO_ADDRESS, 0),
  [ChainId.SKALE_BELLATRIX_TESTNET]: new Token(ChainId.SKALE_BELLATRIX_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.SONGBIRD]: new Token(ChainId.SONGBIRD, ZERO_ADDRESS, 0),
  [ChainId.VELAS]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.WAGMI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.XDAI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
}

export const QI: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'QI', 'Benqi Finance: QI Token'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5', 18, 'QI', 'Benqi Finance: QI Token'),
  [ChainId.INKCHAIN_SEPOLIA]: new Token(ChainId.INKCHAIN_SEPOLIA, ZERO_ADDRESS, 0),
  [ChainId.ARBITRUM]: new Token(ChainId.ARBITRUM, ZERO_ADDRESS, 0),
  [ChainId.AURORA]: new Token(ChainId.AURORA, ZERO_ADDRESS, 0),
  [ChainId.BSC]: new Token(ChainId.BSC, ZERO_ADDRESS, 0),
  [ChainId.CELO]: new Token(ChainId.CELO, ZERO_ADDRESS, 0),
  [ChainId.COSTON]: new Token(ChainId.COSTON, ZERO_ADDRESS, 0),
  [ChainId.COSTON2]: new Token(ChainId.COSTON2, ZERO_ADDRESS, 0),
  [ChainId.CRONOS]: new Token(ChainId.CRONOS, ZERO_ADDRESS, 0),
  [ChainId.ETHEREUM]: new Token(ChainId.ETHEREUM, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_MAINNET]: new Token(ChainId.EVMOS_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_TESTNET]: new Token(ChainId.EVMOS_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.FANTOM]: new Token(ChainId.FANTOM, ZERO_ADDRESS, 0),
  [ChainId.FLARE_MAINNET]: new Token(ChainId.FLARE_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.FUSE]: new Token(ChainId.FUSE, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_MAINNET]: new Token(ChainId.HEDERA_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_TESTNET]: new Token(ChainId.HEDERA_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.MOONBEAM]: new Token(ChainId.MOONBEAM, ZERO_ADDRESS, 0),
  [ChainId.MOONRIVER]: new Token(ChainId.MOONRIVER, ZERO_ADDRESS, 0),
  [ChainId.NEAR_MAINNET]: new Token(ChainId.NEAR_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.NEAR_TESTNET]: new Token(ChainId.NEAR_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.OKXCHAIN]: new Token(ChainId.OKXCHAIN, ZERO_ADDRESS, 0),
  [ChainId.OP]: new Token(ChainId.OP, ZERO_ADDRESS, 0),
  [ChainId.POLYGON]: new Token(ChainId.POLYGON, ZERO_ADDRESS, 0),
  [ChainId.SKALE_BELLATRIX_TESTNET]: new Token(ChainId.SKALE_BELLATRIX_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.SONGBIRD]: new Token(ChainId.SONGBIRD, ZERO_ADDRESS, 0),
  [ChainId.VELAS]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.WAGMI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.XDAI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
}

export const LINKe: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'LINK.e', 'Avalanche Bridge: Chainlink Token'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0x5947BB275c521040051D82396192181b413227A3', 18, 'LINK.e', 'Avalanche Bridge: Chainlink Token'),
  [ChainId.INKCHAIN_SEPOLIA]: new Token(ChainId.INKCHAIN_SEPOLIA, ZERO_ADDRESS, 0),
  [ChainId.ARBITRUM]: new Token(ChainId.ARBITRUM, ZERO_ADDRESS, 0),
  [ChainId.AURORA]: new Token(ChainId.AURORA, ZERO_ADDRESS, 0),
  [ChainId.BSC]: new Token(ChainId.BSC, ZERO_ADDRESS, 0),
  [ChainId.CELO]: new Token(ChainId.CELO, ZERO_ADDRESS, 0),
  [ChainId.COSTON]: new Token(ChainId.COSTON, ZERO_ADDRESS, 0),
  [ChainId.COSTON2]: new Token(ChainId.COSTON2, ZERO_ADDRESS, 0),
  [ChainId.CRONOS]: new Token(ChainId.CRONOS, ZERO_ADDRESS, 0),
  [ChainId.ETHEREUM]: new Token(ChainId.ETHEREUM, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_MAINNET]: new Token(ChainId.EVMOS_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_TESTNET]: new Token(ChainId.EVMOS_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.FANTOM]: new Token(ChainId.FANTOM, ZERO_ADDRESS, 0),
  [ChainId.FLARE_MAINNET]: new Token(ChainId.FLARE_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.FUSE]: new Token(ChainId.FUSE, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_MAINNET]: new Token(ChainId.HEDERA_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_TESTNET]: new Token(ChainId.HEDERA_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.MOONBEAM]: new Token(ChainId.MOONBEAM, ZERO_ADDRESS, 0),
  [ChainId.MOONRIVER]: new Token(ChainId.MOONRIVER, ZERO_ADDRESS, 0),
  [ChainId.NEAR_MAINNET]: new Token(ChainId.NEAR_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.NEAR_TESTNET]: new Token(ChainId.NEAR_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.OKXCHAIN]: new Token(ChainId.OKXCHAIN, ZERO_ADDRESS, 0),
  [ChainId.OP]: new Token(ChainId.OP, ZERO_ADDRESS, 0),
  [ChainId.POLYGON]: new Token(ChainId.POLYGON, ZERO_ADDRESS, 0),
  [ChainId.SKALE_BELLATRIX_TESTNET]: new Token(ChainId.SKALE_BELLATRIX_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.SONGBIRD]: new Token(ChainId.SONGBIRD, ZERO_ADDRESS, 0),
  [ChainId.VELAS]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.WAGMI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.XDAI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
}

export const YAK: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'YAK', 'Yield Yak: Yak Token'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0x59414b3089ce2AF0010e7523Dea7E2b35d776ec7', 18, 'YAK', 'Yield Yak: Yak Token'),
  [ChainId.INKCHAIN_SEPOLIA]: new Token(ChainId.INKCHAIN_SEPOLIA, ZERO_ADDRESS, 0),
  [ChainId.ARBITRUM]: new Token(ChainId.ARBITRUM, ZERO_ADDRESS, 0),
  [ChainId.AURORA]: new Token(ChainId.AURORA, ZERO_ADDRESS, 0),
  [ChainId.BSC]: new Token(ChainId.BSC, ZERO_ADDRESS, 0),
  [ChainId.CELO]: new Token(ChainId.CELO, ZERO_ADDRESS, 0),
  [ChainId.COSTON]: new Token(ChainId.COSTON, ZERO_ADDRESS, 0),
  [ChainId.COSTON2]: new Token(ChainId.COSTON2, ZERO_ADDRESS, 0),
  [ChainId.CRONOS]: new Token(ChainId.CRONOS, ZERO_ADDRESS, 0),
  [ChainId.ETHEREUM]: new Token(ChainId.ETHEREUM, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_MAINNET]: new Token(ChainId.EVMOS_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_TESTNET]: new Token(ChainId.EVMOS_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.FANTOM]: new Token(ChainId.FANTOM, ZERO_ADDRESS, 0),
  [ChainId.FLARE_MAINNET]: new Token(ChainId.FLARE_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.FUSE]: new Token(ChainId.FUSE, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_MAINNET]: new Token(ChainId.HEDERA_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_TESTNET]: new Token(ChainId.HEDERA_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.MOONBEAM]: new Token(ChainId.MOONBEAM, ZERO_ADDRESS, 0),
  [ChainId.MOONRIVER]: new Token(ChainId.MOONRIVER, ZERO_ADDRESS, 0),
  [ChainId.NEAR_MAINNET]: new Token(ChainId.NEAR_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.NEAR_TESTNET]: new Token(ChainId.NEAR_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.OKXCHAIN]: new Token(ChainId.OKXCHAIN, ZERO_ADDRESS, 0),
  [ChainId.OP]: new Token(ChainId.OP, ZERO_ADDRESS, 0),
  [ChainId.POLYGON]: new Token(ChainId.POLYGON, ZERO_ADDRESS, 0),
  [ChainId.SKALE_BELLATRIX_TESTNET]: new Token(ChainId.SKALE_BELLATRIX_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.SONGBIRD]: new Token(ChainId.SONGBIRD, ZERO_ADDRESS, 0),
  [ChainId.VELAS]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.WAGMI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.XDAI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
}

export const WBTCe: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 8, 'WBTC.e', 'Yield Yak: Yak Token'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0x50b7545627a5162F82A992c33b87aDc75187B218', 8, 'WBTC.e', 'Yield Yak: Yak Token'),
  [ChainId.INKCHAIN_SEPOLIA]: new Token(ChainId.INKCHAIN_SEPOLIA, ZERO_ADDRESS, 0),
  [ChainId.ARBITRUM]: new Token(ChainId.ARBITRUM, ZERO_ADDRESS, 0),
  [ChainId.AURORA]: new Token(ChainId.AURORA, ZERO_ADDRESS, 0),
  [ChainId.BSC]: new Token(ChainId.BSC, ZERO_ADDRESS, 0),
  [ChainId.CELO]: new Token(ChainId.CELO, ZERO_ADDRESS, 0),
  [ChainId.COSTON]: new Token(ChainId.COSTON, ZERO_ADDRESS, 0),
  [ChainId.COSTON2]: new Token(ChainId.COSTON2, ZERO_ADDRESS, 0),
  [ChainId.CRONOS]: new Token(ChainId.CRONOS, ZERO_ADDRESS, 0),
  [ChainId.ETHEREUM]: new Token(ChainId.ETHEREUM, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_MAINNET]: new Token(ChainId.EVMOS_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_TESTNET]: new Token(ChainId.EVMOS_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.FANTOM]: new Token(ChainId.FANTOM, ZERO_ADDRESS, 0),
  [ChainId.FLARE_MAINNET]: new Token(ChainId.FLARE_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.FUSE]: new Token(ChainId.FUSE, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_MAINNET]: new Token(ChainId.HEDERA_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_TESTNET]: new Token(ChainId.HEDERA_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.MOONBEAM]: new Token(ChainId.MOONBEAM, ZERO_ADDRESS, 0),
  [ChainId.MOONRIVER]: new Token(ChainId.MOONRIVER, ZERO_ADDRESS, 0),
  [ChainId.NEAR_MAINNET]: new Token(ChainId.NEAR_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.NEAR_TESTNET]: new Token(ChainId.NEAR_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.OKXCHAIN]: new Token(ChainId.OKXCHAIN, ZERO_ADDRESS, 0),
  [ChainId.OP]: new Token(ChainId.OP, ZERO_ADDRESS, 0),
  [ChainId.POLYGON]: new Token(ChainId.POLYGON, ZERO_ADDRESS, 0),
  [ChainId.SKALE_BELLATRIX_TESTNET]: new Token(ChainId.SKALE_BELLATRIX_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.SONGBIRD]: new Token(ChainId.SONGBIRD, ZERO_ADDRESS, 0),
  [ChainId.VELAS]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.WAGMI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.XDAI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
}

export const PNG: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'PNG', 'Pangolin'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0x60781C2586D68229fde47564546784ab3fACA982', 18, 'PNG', 'Pangolin'),
  [ChainId.INKCHAIN_SEPOLIA]: new Token(ChainId.INKCHAIN_SEPOLIA, ZERO_ADDRESS, 0),
  [ChainId.ARBITRUM]: new Token(ChainId.ARBITRUM, ZERO_ADDRESS, 0),
  [ChainId.AURORA]: new Token(ChainId.AURORA, ZERO_ADDRESS, 0),
  [ChainId.BSC]: new Token(ChainId.BSC, ZERO_ADDRESS, 0),
  [ChainId.CELO]: new Token(ChainId.CELO, ZERO_ADDRESS, 0),
  [ChainId.COSTON]: new Token(ChainId.COSTON, ZERO_ADDRESS, 0),
  [ChainId.COSTON2]: new Token(ChainId.COSTON2, ZERO_ADDRESS, 0),
  [ChainId.CRONOS]: new Token(ChainId.CRONOS, ZERO_ADDRESS, 0),
  [ChainId.ETHEREUM]: new Token(ChainId.ETHEREUM, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_MAINNET]: new Token(ChainId.EVMOS_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_TESTNET]: new Token(ChainId.EVMOS_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.FANTOM]: new Token(ChainId.FANTOM, ZERO_ADDRESS, 0),
  [ChainId.FLARE_MAINNET]: new Token(ChainId.FLARE_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.FUSE]: new Token(ChainId.FUSE, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_MAINNET]: new Token(ChainId.HEDERA_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_TESTNET]: new Token(ChainId.HEDERA_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.MOONBEAM]: new Token(ChainId.MOONBEAM, ZERO_ADDRESS, 0),
  [ChainId.MOONRIVER]: new Token(ChainId.MOONRIVER, ZERO_ADDRESS, 0),
  [ChainId.NEAR_MAINNET]: new Token(ChainId.NEAR_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.NEAR_TESTNET]: new Token(ChainId.NEAR_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.OKXCHAIN]: new Token(ChainId.OKXCHAIN, ZERO_ADDRESS, 0),
  [ChainId.OP]: new Token(ChainId.OP, ZERO_ADDRESS, 0),
  [ChainId.POLYGON]: new Token(ChainId.POLYGON, ZERO_ADDRESS, 0),
  [ChainId.SKALE_BELLATRIX_TESTNET]: new Token(ChainId.SKALE_BELLATRIX_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.SONGBIRD]: new Token(ChainId.SONGBIRD, ZERO_ADDRESS, 0),
  [ChainId.VELAS]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.WAGMI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.XDAI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
}

export const WETHe: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'WETH.e', 'Wrapped Ethereum'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB', 18, 'WETH.e', 'Wrapped Ethereum'),
  [ChainId.INKCHAIN_SEPOLIA]: new Token(ChainId.INKCHAIN_SEPOLIA, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped Ethereum'),
  [ChainId.ARBITRUM]: new Token(ChainId.ARBITRUM, ZERO_ADDRESS, 0),
  [ChainId.AURORA]: new Token(ChainId.AURORA, ZERO_ADDRESS, 0),
  [ChainId.BSC]: new Token(ChainId.BSC, ZERO_ADDRESS, 0),
  [ChainId.CELO]: new Token(ChainId.CELO, ZERO_ADDRESS, 0),
  [ChainId.COSTON]: new Token(ChainId.COSTON, ZERO_ADDRESS, 0),
  [ChainId.COSTON2]: new Token(ChainId.COSTON2, ZERO_ADDRESS, 0),
  [ChainId.CRONOS]: new Token(ChainId.CRONOS, ZERO_ADDRESS, 0),
  [ChainId.ETHEREUM]: new Token(ChainId.ETHEREUM, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_MAINNET]: new Token(ChainId.EVMOS_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_TESTNET]: new Token(ChainId.EVMOS_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.FANTOM]: new Token(ChainId.FANTOM, ZERO_ADDRESS, 0),
  [ChainId.FLARE_MAINNET]: new Token(ChainId.FLARE_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.FUSE]: new Token(ChainId.FUSE, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_MAINNET]: new Token(ChainId.HEDERA_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_TESTNET]: new Token(ChainId.HEDERA_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.MOONBEAM]: new Token(ChainId.MOONBEAM, ZERO_ADDRESS, 0),
  [ChainId.MOONRIVER]: new Token(ChainId.MOONRIVER, ZERO_ADDRESS, 0),
  [ChainId.NEAR_MAINNET]: new Token(ChainId.NEAR_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.NEAR_TESTNET]: new Token(ChainId.NEAR_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.OKXCHAIN]: new Token(ChainId.OKXCHAIN, ZERO_ADDRESS, 0),
  [ChainId.OP]: new Token(ChainId.OP, ZERO_ADDRESS, 0),
  [ChainId.POLYGON]: new Token(ChainId.POLYGON, ZERO_ADDRESS, 0),
  [ChainId.SKALE_BELLATRIX_TESTNET]: new Token(ChainId.SKALE_BELLATRIX_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.SONGBIRD]: new Token(ChainId.SONGBIRD, ZERO_ADDRESS, 0),
  [ChainId.VELAS]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.WAGMI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.XDAI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
}

export const sAVAX: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'sAVAX', 'Benqi Finance: SAVAX Token'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE', 18, 'sAVAX', 'Benqi Finance: SAVAX Token'),
  [ChainId.INKCHAIN_SEPOLIA]: new Token(ChainId.INKCHAIN_SEPOLIA, ZERO_ADDRESS, 0),
  [ChainId.ARBITRUM]: new Token(ChainId.ARBITRUM, ZERO_ADDRESS, 0),
  [ChainId.AURORA]: new Token(ChainId.AURORA, ZERO_ADDRESS, 0),
  [ChainId.BSC]: new Token(ChainId.BSC, ZERO_ADDRESS, 0),
  [ChainId.CELO]: new Token(ChainId.CELO, ZERO_ADDRESS, 0),
  [ChainId.COSTON]: new Token(ChainId.COSTON, ZERO_ADDRESS, 0),
  [ChainId.COSTON2]: new Token(ChainId.COSTON2, ZERO_ADDRESS, 0),
  [ChainId.CRONOS]: new Token(ChainId.CRONOS, ZERO_ADDRESS, 0),
  [ChainId.ETHEREUM]: new Token(ChainId.ETHEREUM, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_MAINNET]: new Token(ChainId.EVMOS_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_TESTNET]: new Token(ChainId.EVMOS_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.FANTOM]: new Token(ChainId.FANTOM, ZERO_ADDRESS, 0),
  [ChainId.FLARE_MAINNET]: new Token(ChainId.FLARE_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.FUSE]: new Token(ChainId.FUSE, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_MAINNET]: new Token(ChainId.HEDERA_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_TESTNET]: new Token(ChainId.HEDERA_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.MOONBEAM]: new Token(ChainId.MOONBEAM, ZERO_ADDRESS, 0),
  [ChainId.MOONRIVER]: new Token(ChainId.MOONRIVER, ZERO_ADDRESS, 0),
  [ChainId.NEAR_MAINNET]: new Token(ChainId.NEAR_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.NEAR_TESTNET]: new Token(ChainId.NEAR_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.OKXCHAIN]: new Token(ChainId.OKXCHAIN, ZERO_ADDRESS, 0),
  [ChainId.OP]: new Token(ChainId.OP, ZERO_ADDRESS, 0),
  [ChainId.POLYGON]: new Token(ChainId.POLYGON, ZERO_ADDRESS, 0),
  [ChainId.SKALE_BELLATRIX_TESTNET]: new Token(ChainId.SKALE_BELLATRIX_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.SONGBIRD]: new Token(ChainId.SONGBIRD, ZERO_ADDRESS, 0),
  [ChainId.VELAS]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.WAGMI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.XDAI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
}

export const ROCO: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'ROCO', 'Roco Finance: ROCO Token'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0xb2a85C5ECea99187A977aC34303b80AcbDdFa208', 18, 'ROCO', 'Roco Finance: ROCO Token'),
  [ChainId.INKCHAIN_SEPOLIA]: new Token(ChainId.INKCHAIN_SEPOLIA, ZERO_ADDRESS, 0),
  [ChainId.ARBITRUM]: new Token(ChainId.ARBITRUM, ZERO_ADDRESS, 0),
  [ChainId.AURORA]: new Token(ChainId.AURORA, ZERO_ADDRESS, 0),
  [ChainId.BSC]: new Token(ChainId.BSC, ZERO_ADDRESS, 0),
  [ChainId.CELO]: new Token(ChainId.CELO, ZERO_ADDRESS, 0),
  [ChainId.COSTON]: new Token(ChainId.COSTON, ZERO_ADDRESS, 0),
  [ChainId.COSTON2]: new Token(ChainId.COSTON2, ZERO_ADDRESS, 0),
  [ChainId.CRONOS]: new Token(ChainId.CRONOS, ZERO_ADDRESS, 0),
  [ChainId.ETHEREUM]: new Token(ChainId.ETHEREUM, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_MAINNET]: new Token(ChainId.EVMOS_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_TESTNET]: new Token(ChainId.EVMOS_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.FANTOM]: new Token(ChainId.FANTOM, ZERO_ADDRESS, 0),
  [ChainId.FLARE_MAINNET]: new Token(ChainId.FLARE_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.FUSE]: new Token(ChainId.FUSE, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_MAINNET]: new Token(ChainId.HEDERA_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_TESTNET]: new Token(ChainId.HEDERA_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.MOONBEAM]: new Token(ChainId.MOONBEAM, ZERO_ADDRESS, 0),
  [ChainId.MOONRIVER]: new Token(ChainId.MOONRIVER, ZERO_ADDRESS, 0),
  [ChainId.NEAR_MAINNET]: new Token(ChainId.NEAR_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.NEAR_TESTNET]: new Token(ChainId.NEAR_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.OKXCHAIN]: new Token(ChainId.OKXCHAIN, ZERO_ADDRESS, 0),
  [ChainId.OP]: new Token(ChainId.OP, ZERO_ADDRESS, 0),
  [ChainId.POLYGON]: new Token(ChainId.POLYGON, ZERO_ADDRESS, 0),
  [ChainId.SKALE_BELLATRIX_TESTNET]: new Token(ChainId.SKALE_BELLATRIX_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.SONGBIRD]: new Token(ChainId.SONGBIRD, ZERO_ADDRESS, 0),
  [ChainId.VELAS]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.WAGMI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.XDAI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
}

export const JPYC: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'JPYC', 'JPY Coin: JPYC Token'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB', 18, 'JPYC', 'JPY Coin: JPYC Token'),
  [ChainId.INKCHAIN_SEPOLIA]: new Token(ChainId.INKCHAIN_SEPOLIA, ZERO_ADDRESS, 0),
  [ChainId.ARBITRUM]: new Token(ChainId.ARBITRUM, ZERO_ADDRESS, 0),
  [ChainId.AURORA]: new Token(ChainId.AURORA, ZERO_ADDRESS, 0),
  [ChainId.BSC]: new Token(ChainId.BSC, ZERO_ADDRESS, 0),
  [ChainId.CELO]: new Token(ChainId.CELO, ZERO_ADDRESS, 0),
  [ChainId.COSTON]: new Token(ChainId.COSTON, ZERO_ADDRESS, 0),
  [ChainId.COSTON2]: new Token(ChainId.COSTON2, ZERO_ADDRESS, 0),
  [ChainId.CRONOS]: new Token(ChainId.CRONOS, ZERO_ADDRESS, 0),
  [ChainId.ETHEREUM]: new Token(ChainId.ETHEREUM, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_MAINNET]: new Token(ChainId.EVMOS_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_TESTNET]: new Token(ChainId.EVMOS_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.FANTOM]: new Token(ChainId.FANTOM, ZERO_ADDRESS, 0),
  [ChainId.FLARE_MAINNET]: new Token(ChainId.FLARE_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.FUSE]: new Token(ChainId.FUSE, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_MAINNET]: new Token(ChainId.HEDERA_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_TESTNET]: new Token(ChainId.HEDERA_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.MOONBEAM]: new Token(ChainId.MOONBEAM, ZERO_ADDRESS, 0),
  [ChainId.MOONRIVER]: new Token(ChainId.MOONRIVER, ZERO_ADDRESS, 0),
  [ChainId.NEAR_MAINNET]: new Token(ChainId.NEAR_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.NEAR_TESTNET]: new Token(ChainId.NEAR_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.OKXCHAIN]: new Token(ChainId.OKXCHAIN, ZERO_ADDRESS, 0),
  [ChainId.OP]: new Token(ChainId.OP, ZERO_ADDRESS, 0),
  [ChainId.POLYGON]: new Token(ChainId.POLYGON, ZERO_ADDRESS, 0),
  [ChainId.SKALE_BELLATRIX_TESTNET]: new Token(ChainId.SKALE_BELLATRIX_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.SONGBIRD]: new Token(ChainId.SONGBIRD, ZERO_ADDRESS, 0),
  [ChainId.VELAS]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.WAGMI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.XDAI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
}

export const YAY: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'YAY', 'YAY Games: YAY Token'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0x01C2086faCFD7aA38f69A6Bd8C91BEF3BB5adFCa', 18, 'YAY', 'YAY Games: YAY Token'),
  [ChainId.INKCHAIN_SEPOLIA]: new Token(ChainId.INKCHAIN_SEPOLIA, ZERO_ADDRESS, 0),
  [ChainId.ARBITRUM]: new Token(ChainId.ARBITRUM, ZERO_ADDRESS, 0),
  [ChainId.AURORA]: new Token(ChainId.AURORA, ZERO_ADDRESS, 0),
  [ChainId.BSC]: new Token(ChainId.BSC, ZERO_ADDRESS, 0),
  [ChainId.CELO]: new Token(ChainId.CELO, ZERO_ADDRESS, 0),
  [ChainId.COSTON]: new Token(ChainId.COSTON, ZERO_ADDRESS, 0),
  [ChainId.COSTON2]: new Token(ChainId.COSTON2, ZERO_ADDRESS, 0),
  [ChainId.CRONOS]: new Token(ChainId.CRONOS, ZERO_ADDRESS, 0),
  [ChainId.ETHEREUM]: new Token(ChainId.ETHEREUM, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_MAINNET]: new Token(ChainId.EVMOS_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_TESTNET]: new Token(ChainId.EVMOS_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.FANTOM]: new Token(ChainId.FANTOM, ZERO_ADDRESS, 0),
  [ChainId.FLARE_MAINNET]: new Token(ChainId.FLARE_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.FUSE]: new Token(ChainId.FUSE, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_MAINNET]: new Token(ChainId.HEDERA_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_TESTNET]: new Token(ChainId.HEDERA_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.MOONBEAM]: new Token(ChainId.MOONBEAM, ZERO_ADDRESS, 0),
  [ChainId.MOONRIVER]: new Token(ChainId.MOONRIVER, ZERO_ADDRESS, 0),
  [ChainId.NEAR_MAINNET]: new Token(ChainId.NEAR_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.NEAR_TESTNET]: new Token(ChainId.NEAR_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.OKXCHAIN]: new Token(ChainId.OKXCHAIN, ZERO_ADDRESS, 0),
  [ChainId.OP]: new Token(ChainId.OP, ZERO_ADDRESS, 0),
  [ChainId.POLYGON]: new Token(ChainId.POLYGON, ZERO_ADDRESS, 0),
  [ChainId.SKALE_BELLATRIX_TESTNET]: new Token(ChainId.SKALE_BELLATRIX_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.SONGBIRD]: new Token(ChainId.SONGBIRD, ZERO_ADDRESS, 0),
  [ChainId.VELAS]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.WAGMI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.XDAI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
}

export const FITFI: { [chainId in ChainId]: Token } = {
  [ChainId.FUJI]: new Token(ChainId.FUJI, ZERO_ADDRESS, 18, 'FITFI', 'Step App: FITFI Token'),
  [ChainId.AVALANCHE]: new Token(ChainId.AVALANCHE, '0x714f020C54cc9D104B6F4f6998C63ce2a31D1888', 18, 'FITFI', 'Step App: FITFI Token'),
  [ChainId.INKCHAIN_SEPOLIA]: new Token(ChainId.INKCHAIN_SEPOLIA, ZERO_ADDRESS, 0),
  [ChainId.ARBITRUM]: new Token(ChainId.ARBITRUM, ZERO_ADDRESS, 0),
  [ChainId.AURORA]: new Token(ChainId.AURORA, ZERO_ADDRESS, 0),
  [ChainId.BSC]: new Token(ChainId.BSC, ZERO_ADDRESS, 0),
  [ChainId.CELO]: new Token(ChainId.CELO, ZERO_ADDRESS, 0),
  [ChainId.COSTON]: new Token(ChainId.COSTON, ZERO_ADDRESS, 0),
  [ChainId.COSTON2]: new Token(ChainId.COSTON2, ZERO_ADDRESS, 0),
  [ChainId.CRONOS]: new Token(ChainId.CRONOS, ZERO_ADDRESS, 0),
  [ChainId.ETHEREUM]: new Token(ChainId.ETHEREUM, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_MAINNET]: new Token(ChainId.EVMOS_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.EVMOS_TESTNET]: new Token(ChainId.EVMOS_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.FANTOM]: new Token(ChainId.FANTOM, ZERO_ADDRESS, 0),
  [ChainId.FLARE_MAINNET]: new Token(ChainId.FLARE_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.FUSE]: new Token(ChainId.FUSE, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_MAINNET]: new Token(ChainId.HEDERA_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.HEDERA_TESTNET]: new Token(ChainId.HEDERA_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.MOONBEAM]: new Token(ChainId.MOONBEAM, ZERO_ADDRESS, 0),
  [ChainId.MOONRIVER]: new Token(ChainId.MOONRIVER, ZERO_ADDRESS, 0),
  [ChainId.NEAR_MAINNET]: new Token(ChainId.NEAR_MAINNET, ZERO_ADDRESS, 0),
  [ChainId.NEAR_TESTNET]: new Token(ChainId.NEAR_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.OKXCHAIN]: new Token(ChainId.OKXCHAIN, ZERO_ADDRESS, 0),
  [ChainId.OP]: new Token(ChainId.OP, ZERO_ADDRESS, 0),
  [ChainId.POLYGON]: new Token(ChainId.POLYGON, ZERO_ADDRESS, 0),
  [ChainId.SKALE_BELLATRIX_TESTNET]: new Token(ChainId.SKALE_BELLATRIX_TESTNET, ZERO_ADDRESS, 0),
  [ChainId.SONGBIRD]: new Token(ChainId.SONGBIRD, ZERO_ADDRESS, 0),
  [ChainId.VELAS]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.WAGMI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
  [ChainId.XDAI]: new Token(ChainId.VELAS, ZERO_ADDRESS, 0),
}

export const MINICHEF_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.AVALANCHE]: "0x1f806f7C8dED893fd3caE279191ad7Aa3798E928"
}

export const MINICHEFSP_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.AVALANCHE]: "0xA73B1887054F424F967A3644aC72826A989826DB"
}

export const MINICHEFSPV2_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.AVALANCHE]: "0x2E9433248814182D4e521BeE45028E7f8Ca96Efa"
}

export const AIRDROP_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.AVALANCHE]: "0x2e303ba0Fc6b64E47B3a6ce71b25B458D6C74E3D"
}

export const CNR_STAKE_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.AVALANCHE]: "0x39124Af473501Ccd83a5791eA1eFBc2e6dd78f10"
}

export const AUTOCOMPOUND_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.AVALANCHE]: "0x10D317cD416416674D9E67250E93529B8800A684"
}

export const BURNCNR_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.AVALANCHE]: ZERO_ADDRESS
}

export const PREDICTION_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.AVALANCHE]: ZERO_ADDRESS
}

export const NFTSTAKE_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.AVALANCHE]: "0x68400906742aab0b25ab6420a8fdfaf298a776d8"
}

export const NFTCONTRACT_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.AVALANCHE]: "0x86211e8a52040ba2080467adfd21731687b87571"
}

const WAVAX_ONLY: ChainTokenList = {
  [ChainId.FUJI]: [WAVAX[ChainId.FUJI]],
  [ChainId.AVALANCHE]: [WAVAX[ChainId.AVALANCHE]],
  [ChainId.ARBITRUM]: [WAVAX[ChainId.ARBITRUM]],
  [ChainId.AURORA]: [WAVAX[ChainId.AURORA]],
  [ChainId.BSC]: [WAVAX[ChainId.BSC]],
  [ChainId.CELO]: [WAVAX[ChainId.CELO]],
  [ChainId.COSTON]: [WAVAX[ChainId.COSTON]],
  [ChainId.COSTON2]: [WAVAX[ChainId.COSTON2]],
  [ChainId.CRONOS]: [WAVAX[ChainId.CRONOS]],
  [ChainId.ETHEREUM]: [WAVAX[ChainId.ETHEREUM]],
  [ChainId.EVMOS_MAINNET]: [WAVAX[ChainId.EVMOS_MAINNET]],
  [ChainId.EVMOS_TESTNET]: [WAVAX[ChainId.EVMOS_TESTNET]],
  [ChainId.FANTOM]: [WAVAX[ChainId.FANTOM]],
  [ChainId.FLARE_MAINNET]: [WAVAX[ChainId.FLARE_MAINNET]],
  [ChainId.FUSE]: [WAVAX[ChainId.FUSE]],
  [ChainId.HEDERA_MAINNET]: [WAVAX[ChainId.HEDERA_MAINNET]],
  [ChainId.HEDERA_TESTNET]: [WAVAX[ChainId.HEDERA_TESTNET]],
  [ChainId.MOONBEAM]: [WAVAX[ChainId.MOONBEAM]],
  [ChainId.MOONRIVER]: [WAVAX[ChainId.MOONRIVER]],
  [ChainId.NEAR_MAINNET]: [WAVAX[ChainId.NEAR_MAINNET]],
  [ChainId.NEAR_TESTNET]: [WAVAX[ChainId.NEAR_TESTNET]],
  [ChainId.OKXCHAIN]: [WAVAX[ChainId.OKXCHAIN]],
  [ChainId.OP]: [WAVAX[ChainId.OP]],
  [ChainId.POLYGON]: [WAVAX[ChainId.POLYGON]],
  [ChainId.SKALE_BELLATRIX_TESTNET]: [WAVAX[ChainId.SKALE_BELLATRIX_TESTNET]],
  [ChainId.SONGBIRD]: [WAVAX[ChainId.SONGBIRD]],
  [ChainId.VELAS]: [WAVAX[ChainId.VELAS]],
  [ChainId.WAGMI]: [WAVAX[ChainId.WAGMI]],
  [ChainId.XDAI]: [WAVAX[ChainId.XDAI]],
}

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WAVAX_ONLY,
  [ChainId.AVALANCHE]: [...WAVAX_ONLY[ChainId.AVALANCHE]],
}

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */
export const CUSTOM_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {
  [ChainId.AVALANCHE]: {

  }
}

// used for display in the default list when adding liquidity
export const SUGGESTED_BASES: ChainTokenList = {
  ...WAVAX_ONLY,
  [ChainId.AVALANCHE]: [...WAVAX_ONLY[ChainId.AVALANCHE]]
}

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  ...WAVAX_ONLY,
  [ChainId.AVALANCHE]: [...WAVAX_ONLY[ChainId.AVALANCHE]]
}

export const PINNED_PAIRS: { readonly [chainId in ChainId]?: [Token, Token][] } = {
  [ChainId.AVALANCHE]: [
  ]
}

export interface WalletInfo {
  connector?: AbstractConnector
  name: string
  iconName: string
  description: string
  href: string | null
  color: string
  primary?: true
  mobile?: true
  mobileOnly?: true
}

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  INJECTED: {
    connector: injected,
    name: 'Injected',
    iconName: 'arrow-right.svg',
    description: 'Injected web3 provider.',
    href: null,
    color: '#010101',
    primary: true
  },
  METAMASK: {
    connector: injected,
    name: 'MetaMask',
    iconName: 'metamask.png',
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D'
  },
  OKXWALLET: {
    connector: injected,
    name: 'OKX Wallet',
    iconName: 'okxwallet.png',
    description: 'Your portal to Web3.',
    href: null,
    color: '#E8831D'
  }
}

export const NetworkContextName = 'NETWORK'

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 50
// 60 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = "600"

export const BIG_INT_ZERO = JSBI.BigInt(0)

// one basis point
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
export const BIPS_BASE = JSBI.BigInt(10000)
// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(300), BIPS_BASE) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE) // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(JSBI.BigInt(1000), BIPS_BASE) // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(1500), BIPS_BASE) // 15%

// used to ensure the user doesn't send so much ETH so they end up with <.01
export const MIN_ETH: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)) // .01 ETH
export const BETTER_TRADE_LINK_THRESHOLD = new Percent(JSBI.BigInt(75), JSBI.BigInt(10000))
