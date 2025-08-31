import { ChainId } from '@pangolindex/sdk';
import { useDummyElixirPositionsFromTokenIds, useDummyGetUserPositions } from './dummy';
import {
  useElixirAddLiquidity,
  useElixirCollectEarnedFees,
  useElixirPositionsFromTokenIds,
  useETHBalances,
  useGetUserPositions,
  useTokenBalances,
} from './evm';

export type UseGetUserPositionsHookType = {
  [chainId in ChainId]: typeof useGetUserPositions | typeof useDummyGetUserPositions;
};

export const useGetUserPositionsHook: UseGetUserPositionsHookType = {
  [ChainId.FUJI]: useGetUserPositions,
  [ChainId.AVALANCHE]: useGetUserPositions,
  [ChainId.WAGMI]: useDummyGetUserPositions,
  [ChainId.COSTON]: useDummyGetUserPositions,
  [ChainId.SONGBIRD]: useDummyGetUserPositions,
  [ChainId.FLARE_MAINNET]: useDummyGetUserPositions,
  [ChainId.HEDERA_TESTNET]: useDummyGetUserPositions,
  [ChainId.HEDERA_MAINNET]: useDummyGetUserPositions,
  [ChainId.NEAR_MAINNET]: useDummyGetUserPositions,
  [ChainId.NEAR_TESTNET]: useDummyGetUserPositions,
  [ChainId.COSTON2]: useDummyGetUserPositions,
  [ChainId.EVMOS_TESTNET]: useGetUserPositions,
  [ChainId.EVMOS_MAINNET]: useGetUserPositions,
  [ChainId.ETHEREUM]: useDummyGetUserPositions,
  [ChainId.POLYGON]: useDummyGetUserPositions,
  [ChainId.FANTOM]: useDummyGetUserPositions,
  [ChainId.XDAI]: useDummyGetUserPositions,
  [ChainId.BSC]: useDummyGetUserPositions,
  [ChainId.ARBITRUM]: useDummyGetUserPositions,
  [ChainId.CELO]: useDummyGetUserPositions,
  [ChainId.OKXCHAIN]: useDummyGetUserPositions,
  [ChainId.VELAS]: useDummyGetUserPositions,
  [ChainId.AURORA]: useDummyGetUserPositions,
  [ChainId.CRONOS]: useDummyGetUserPositions,
  [ChainId.FUSE]: useDummyGetUserPositions,
  [ChainId.MOONRIVER]: useDummyGetUserPositions,
  [ChainId.MOONBEAM]: useDummyGetUserPositions,
  [ChainId.OP]: useDummyGetUserPositions,
  [ChainId.SKALE_BELLATRIX_TESTNET]: useGetUserPositions,
};

export type UseElixirPositionsFromTokenIdsHookType = {
  [chainId in ChainId]: typeof useElixirPositionsFromTokenIds | typeof useDummyElixirPositionsFromTokenIds;
};

export const useElixirPositionsFromTokenIdsHook: UseElixirPositionsFromTokenIdsHookType = {
  [ChainId.FUJI]: useElixirPositionsFromTokenIds,
  [ChainId.AVALANCHE]: useElixirPositionsFromTokenIds,
  [ChainId.WAGMI]: useDummyElixirPositionsFromTokenIds,
  [ChainId.COSTON]: useDummyElixirPositionsFromTokenIds,
  [ChainId.SONGBIRD]: useDummyElixirPositionsFromTokenIds,
  [ChainId.FLARE_MAINNET]: useDummyElixirPositionsFromTokenIds,
  [ChainId.HEDERA_TESTNET]: useDummyElixirPositionsFromTokenIds,
  [ChainId.HEDERA_MAINNET]: useDummyElixirPositionsFromTokenIds,
  [ChainId.NEAR_MAINNET]: useDummyElixirPositionsFromTokenIds,
  [ChainId.NEAR_TESTNET]: useDummyElixirPositionsFromTokenIds,
  [ChainId.COSTON2]: useDummyElixirPositionsFromTokenIds,
  [ChainId.EVMOS_TESTNET]: useElixirPositionsFromTokenIds,
  [ChainId.EVMOS_MAINNET]: useElixirPositionsFromTokenIds,
  [ChainId.ETHEREUM]: useDummyElixirPositionsFromTokenIds,
  [ChainId.POLYGON]: useDummyElixirPositionsFromTokenIds,
  [ChainId.FANTOM]: useDummyElixirPositionsFromTokenIds,
  [ChainId.XDAI]: useDummyElixirPositionsFromTokenIds,
  [ChainId.BSC]: useDummyElixirPositionsFromTokenIds,
  [ChainId.ARBITRUM]: useDummyElixirPositionsFromTokenIds,
  [ChainId.CELO]: useDummyElixirPositionsFromTokenIds,
  [ChainId.OKXCHAIN]: useDummyElixirPositionsFromTokenIds,
  [ChainId.VELAS]: useDummyElixirPositionsFromTokenIds,
  [ChainId.AURORA]: useDummyElixirPositionsFromTokenIds,
  [ChainId.CRONOS]: useDummyElixirPositionsFromTokenIds,
  [ChainId.FUSE]: useDummyElixirPositionsFromTokenIds,
  [ChainId.MOONRIVER]: useDummyElixirPositionsFromTokenIds,
  [ChainId.MOONBEAM]: useDummyElixirPositionsFromTokenIds,
  [ChainId.OP]: useDummyElixirPositionsFromTokenIds,
  [ChainId.SKALE_BELLATRIX_TESTNET]: useElixirPositionsFromTokenIds,
};

export type UseElixirAddLiquidityHookType = {
  [chainId in ChainId]: typeof useElixirAddLiquidity;
};

export const useElixirAddLiquidityHook: UseElixirAddLiquidityHookType = {
  [ChainId.FUJI]: useElixirAddLiquidity,
  [ChainId.AVALANCHE]: useElixirAddLiquidity,
  [ChainId.WAGMI]: useElixirAddLiquidity,
  [ChainId.COSTON]: useElixirAddLiquidity,
  [ChainId.SONGBIRD]: useElixirAddLiquidity,
  [ChainId.FLARE_MAINNET]: useElixirAddLiquidity,
  [ChainId.HEDERA_TESTNET]: useElixirAddLiquidity,
  [ChainId.HEDERA_MAINNET]: useElixirAddLiquidity,
  [ChainId.NEAR_MAINNET]: useElixirAddLiquidity,
  [ChainId.NEAR_TESTNET]: useElixirAddLiquidity,
  [ChainId.COSTON2]: useElixirAddLiquidity,
  [ChainId.EVMOS_TESTNET]: useElixirAddLiquidity,
  [ChainId.EVMOS_MAINNET]: useElixirAddLiquidity,
  [ChainId.ETHEREUM]: useElixirAddLiquidity,
  [ChainId.POLYGON]: useElixirAddLiquidity,
  [ChainId.FANTOM]: useElixirAddLiquidity,
  [ChainId.XDAI]: useElixirAddLiquidity,
  [ChainId.BSC]: useElixirAddLiquidity,
  [ChainId.ARBITRUM]: useElixirAddLiquidity,
  [ChainId.CELO]: useElixirAddLiquidity,
  [ChainId.OKXCHAIN]: useElixirAddLiquidity,
  [ChainId.VELAS]: useElixirAddLiquidity,
  [ChainId.AURORA]: useElixirAddLiquidity,
  [ChainId.CRONOS]: useElixirAddLiquidity,
  [ChainId.FUSE]: useElixirAddLiquidity,
  [ChainId.MOONRIVER]: useElixirAddLiquidity,
  [ChainId.MOONBEAM]: useElixirAddLiquidity,
  [ChainId.OP]: useElixirAddLiquidity,
  [ChainId.SKALE_BELLATRIX_TESTNET]: useElixirAddLiquidity,
};

export type UseElixirCollectEarnedFeesHookType = {
  [chainId in ChainId]: typeof useElixirCollectEarnedFees;
};

export const useElixirCollectEarnedFeesHook: UseElixirCollectEarnedFeesHookType = {
  [ChainId.FUJI]: useElixirCollectEarnedFees,
  [ChainId.AVALANCHE]: useElixirCollectEarnedFees,
  [ChainId.WAGMI]: useElixirCollectEarnedFees,
  [ChainId.COSTON]: useElixirCollectEarnedFees,
  [ChainId.SONGBIRD]: useElixirCollectEarnedFees,
  [ChainId.FLARE_MAINNET]: useElixirCollectEarnedFees,
  [ChainId.HEDERA_TESTNET]: useElixirCollectEarnedFees,
  [ChainId.HEDERA_MAINNET]: useElixirCollectEarnedFees,
  [ChainId.NEAR_MAINNET]: useElixirCollectEarnedFees,
  [ChainId.NEAR_TESTNET]: useElixirCollectEarnedFees,
  [ChainId.COSTON2]: useElixirCollectEarnedFees,
  [ChainId.EVMOS_TESTNET]: useElixirCollectEarnedFees,
  [ChainId.EVMOS_MAINNET]: useElixirCollectEarnedFees,
  [ChainId.ETHEREUM]: useElixirCollectEarnedFees,
  [ChainId.POLYGON]: useElixirCollectEarnedFees,
  [ChainId.FANTOM]: useElixirCollectEarnedFees,
  [ChainId.XDAI]: useElixirCollectEarnedFees,
  [ChainId.BSC]: useElixirCollectEarnedFees,
  [ChainId.ARBITRUM]: useElixirCollectEarnedFees,
  [ChainId.CELO]: useElixirCollectEarnedFees,
  [ChainId.OKXCHAIN]: useElixirCollectEarnedFees,
  [ChainId.VELAS]: useElixirCollectEarnedFees,
  [ChainId.AURORA]: useElixirCollectEarnedFees,
  [ChainId.CRONOS]: useElixirCollectEarnedFees,
  [ChainId.FUSE]: useElixirCollectEarnedFees,
  [ChainId.MOONRIVER]: useElixirCollectEarnedFees,
  [ChainId.MOONBEAM]: useElixirCollectEarnedFees,
  [ChainId.OP]: useElixirCollectEarnedFees,
  [ChainId.SKALE_BELLATRIX_TESTNET]: useElixirCollectEarnedFees,
};

export type UseTokenBalancesHookType = {
  [chainId in ChainId]: typeof useTokenBalances;
};

export const useTokenBalancesHook: UseTokenBalancesHookType = {
  [ChainId.FUJI]: useTokenBalances,
  [ChainId.AVALANCHE]: useTokenBalances,
  [ChainId.WAGMI]: useTokenBalances,
  [ChainId.COSTON]: useTokenBalances,
  [ChainId.SONGBIRD]: useTokenBalances,
  [ChainId.FLARE_MAINNET]: useTokenBalances,
  [ChainId.HEDERA_TESTNET]: useTokenBalances,
  [ChainId.HEDERA_MAINNET]: useTokenBalances,
  [ChainId.NEAR_MAINNET]: useTokenBalances,
  [ChainId.NEAR_TESTNET]: useTokenBalances,
  [ChainId.COSTON2]: useTokenBalances,
  [ChainId.EVMOS_TESTNET]: useTokenBalances,
  [ChainId.EVMOS_MAINNET]: useTokenBalances,
  // TODO: We need to check following chains
  [ChainId.ETHEREUM]: useTokenBalances,
  [ChainId.POLYGON]: useTokenBalances,
  [ChainId.FANTOM]: useTokenBalances,
  [ChainId.XDAI]: useTokenBalances,
  [ChainId.BSC]: useTokenBalances,
  [ChainId.ARBITRUM]: useTokenBalances,
  [ChainId.CELO]: useTokenBalances,
  [ChainId.OKXCHAIN]: useTokenBalances,
  [ChainId.VELAS]: useTokenBalances,
  [ChainId.AURORA]: useTokenBalances,
  [ChainId.CRONOS]: useTokenBalances,
  [ChainId.FUSE]: useTokenBalances,
  [ChainId.MOONRIVER]: useTokenBalances,
  [ChainId.MOONBEAM]: useTokenBalances,
  [ChainId.OP]: useTokenBalances,
  [ChainId.SKALE_BELLATRIX_TESTNET]: useTokenBalances,
};

export type UseAccountBalanceHookType = {
  [chainId in ChainId]: typeof useETHBalances;
};

export const useAccountBalanceHook: UseAccountBalanceHookType = {
  [ChainId.FUJI]: useETHBalances,
  [ChainId.AVALANCHE]: useETHBalances,
  [ChainId.WAGMI]: useETHBalances,
  [ChainId.COSTON]: useETHBalances,
  [ChainId.SONGBIRD]: useETHBalances,
  [ChainId.FLARE_MAINNET]: useETHBalances,
  [ChainId.HEDERA_TESTNET]: useETHBalances,
  [ChainId.HEDERA_MAINNET]: useETHBalances,
  [ChainId.NEAR_MAINNET]: useETHBalances,
  [ChainId.NEAR_TESTNET]: useETHBalances,
  [ChainId.COSTON2]: useETHBalances,
  // TODO: Need to implement following chains
  [ChainId.ETHEREUM]: useETHBalances,
  [ChainId.POLYGON]: useETHBalances,
  [ChainId.FANTOM]: useETHBalances,
  [ChainId.XDAI]: useETHBalances,
  [ChainId.BSC]: useETHBalances,
  [ChainId.ARBITRUM]: useETHBalances,
  [ChainId.CELO]: useETHBalances,
  [ChainId.OKXCHAIN]: useETHBalances,
  [ChainId.VELAS]: useETHBalances,
  [ChainId.AURORA]: useETHBalances,
  [ChainId.CRONOS]: useETHBalances,
  [ChainId.FUSE]: useETHBalances,
  [ChainId.MOONRIVER]: useETHBalances,
  [ChainId.MOONBEAM]: useETHBalances,
  [ChainId.OP]: useETHBalances,
  [ChainId.EVMOS_TESTNET]: useETHBalances,
  [ChainId.EVMOS_MAINNET]: useETHBalances,
  [ChainId.SKALE_BELLATRIX_TESTNET]: useETHBalances,
};
