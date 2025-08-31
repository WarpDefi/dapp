import { ChainId } from '@pangolindex/sdk';
import { useUSDCPrice } from './evm';
import { useDummyHook } from '@/state/transactionsv3/updater';


export type UseUSDCPriceHookType = {
  [chainId in ChainId]:
    | typeof useUSDCPrice
    | typeof useUSDCPrice
    | typeof useDummyHook;
};

export const useUSDCPriceHook: UseUSDCPriceHookType = {
  [ChainId.FUJI]: useUSDCPrice,
  [ChainId.AVALANCHE]: useUSDCPrice,
  [ChainId.WAGMI]: useUSDCPrice,
  [ChainId.COSTON]: useUSDCPrice,
  [ChainId.SONGBIRD]: useDummyHook,
  [ChainId.FLARE_MAINNET]: useDummyHook,
  [ChainId.HEDERA_TESTNET]: useDummyHook,
  [ChainId.HEDERA_MAINNET]: useDummyHook,
  [ChainId.NEAR_MAINNET]: useUSDCPrice,
  [ChainId.NEAR_TESTNET]: useUSDCPrice,
  [ChainId.COSTON2]: useUSDCPrice,
  [ChainId.EVMOS_TESTNET]: useUSDCPrice,
  [ChainId.EVMOS_MAINNET]: useUSDCPrice,
  [ChainId.ETHEREUM]: useDummyHook,
  [ChainId.POLYGON]: useDummyHook,
  [ChainId.FANTOM]: useDummyHook,
  [ChainId.XDAI]: useDummyHook,
  [ChainId.BSC]: useDummyHook,
  [ChainId.ARBITRUM]: useDummyHook,
  [ChainId.CELO]: useDummyHook,
  [ChainId.OKXCHAIN]: useDummyHook,
  [ChainId.VELAS]: useDummyHook,
  [ChainId.AURORA]: useDummyHook,
  [ChainId.CRONOS]: useDummyHook,
  [ChainId.FUSE]: useDummyHook,
  [ChainId.MOONRIVER]: useDummyHook,
  [ChainId.MOONBEAM]: useDummyHook,
  [ChainId.OP]: useDummyHook,
  [ChainId.SKALE_BELLATRIX_TESTNET]: useUSDCPrice,
};
