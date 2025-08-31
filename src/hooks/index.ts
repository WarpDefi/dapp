import { Web3Provider } from '@ethersproject/providers'
import { ChainId } from '@pangolindex/sdk'
import { useWeb3React as useWeb3ReactCore } from '@web3-react/core'
import { Web3ReactContextInterface } from '@web3-react/core/dist/types'
import { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { injected } from '../connectors'
import { NetworkContextName } from '../constants'

import {
  useDummyConcLiqPositionFees,
  useDummyPools,
  useDummyPositionTokenURI,
  useDummyUnderlyingTokens,
} from './dummy';
import {
  useConcLiqPositionFees,
  usePoolsViaContract,
  usePoolsViaSubgraph,
  usePoolsViaSubgraphForSwap,
  usePositionTokenURI,
  useUnderlyingTokens,
} from './evm';

export type UsePoolsHookType = {
  [chainId in ChainId]: typeof usePoolsViaContract | typeof useDummyPools;
};

export const usePoolsHook: UsePoolsHookType = {
  [ChainId.FUJI]: usePoolsViaSubgraph,
  [ChainId.AVALANCHE]: usePoolsViaSubgraph,
  [ChainId.WAGMI]: useDummyPools,
  [ChainId.COSTON]: useDummyPools,
  [ChainId.SONGBIRD]: useDummyPools,
  [ChainId.FLARE_MAINNET]: useDummyPools,
  [ChainId.HEDERA_TESTNET]: useDummyPools,
  [ChainId.HEDERA_MAINNET]: useDummyPools,
  [ChainId.NEAR_MAINNET]: useDummyPools,
  [ChainId.NEAR_TESTNET]: useDummyPools,
  [ChainId.COSTON2]: useDummyPools,
  [ChainId.EVMOS_TESTNET]: usePoolsViaSubgraph,
  [ChainId.EVMOS_MAINNET]: usePoolsViaSubgraph,
  [ChainId.ETHEREUM]: useDummyPools,
  [ChainId.POLYGON]: useDummyPools,
  [ChainId.FANTOM]: useDummyPools,
  [ChainId.XDAI]: useDummyPools,
  [ChainId.BSC]: useDummyPools,
  [ChainId.ARBITRUM]: useDummyPools,
  [ChainId.CELO]: useDummyPools,
  [ChainId.OKXCHAIN]: useDummyPools,
  [ChainId.VELAS]: useDummyPools,
  [ChainId.AURORA]: useDummyPools,
  [ChainId.CRONOS]: useDummyPools,
  [ChainId.FUSE]: useDummyPools,
  [ChainId.MOONRIVER]: useDummyPools,
  [ChainId.MOONBEAM]: useDummyPools,
  [ChainId.OP]: useDummyPools,
  [ChainId.SKALE_BELLATRIX_TESTNET]: usePoolsViaSubgraph,
};

export const usePoolsHookForSwap: UsePoolsHookType = {
  [ChainId.FUJI]: usePoolsViaSubgraphForSwap,
  [ChainId.AVALANCHE]: usePoolsViaSubgraphForSwap,
  [ChainId.WAGMI]: useDummyPools,
  [ChainId.COSTON]: useDummyPools,
  [ChainId.SONGBIRD]: useDummyPools,
  [ChainId.FLARE_MAINNET]: useDummyPools,
  [ChainId.HEDERA_TESTNET]: useDummyPools,
  [ChainId.HEDERA_MAINNET]: useDummyPools,
  [ChainId.NEAR_MAINNET]: useDummyPools,
  [ChainId.NEAR_TESTNET]: useDummyPools,
  [ChainId.COSTON2]: useDummyPools,
  [ChainId.EVMOS_TESTNET]: usePoolsViaSubgraph,
  [ChainId.EVMOS_MAINNET]: usePoolsViaSubgraph,
  [ChainId.ETHEREUM]: useDummyPools,
  [ChainId.POLYGON]: useDummyPools,
  [ChainId.FANTOM]: useDummyPools,
  [ChainId.XDAI]: useDummyPools,
  [ChainId.BSC]: useDummyPools,
  [ChainId.ARBITRUM]: useDummyPools,
  [ChainId.CELO]: useDummyPools,
  [ChainId.OKXCHAIN]: useDummyPools,
  [ChainId.VELAS]: useDummyPools,
  [ChainId.AURORA]: useDummyPools,
  [ChainId.CRONOS]: useDummyPools,
  [ChainId.FUSE]: useDummyPools,
  [ChainId.MOONRIVER]: useDummyPools,
  [ChainId.MOONBEAM]: useDummyPools,
  [ChainId.OP]: useDummyPools,
  [ChainId.SKALE_BELLATRIX_TESTNET]: usePoolsViaSubgraph,
};

export type UseUnderlyingTokensHookType = {
  [chainId in ChainId]: typeof useUnderlyingTokens | typeof useDummyUnderlyingTokens;
};

export const useUnderlyingTokensHook: UseUnderlyingTokensHookType = {
  [ChainId.FUJI]: useUnderlyingTokens,
  [ChainId.AVALANCHE]: useUnderlyingTokens,
  [ChainId.WAGMI]: useDummyUnderlyingTokens,
  [ChainId.COSTON]: useDummyUnderlyingTokens,
  [ChainId.SONGBIRD]: useDummyUnderlyingTokens,
  [ChainId.FLARE_MAINNET]: useDummyUnderlyingTokens,
  [ChainId.HEDERA_TESTNET]: useDummyUnderlyingTokens,
  [ChainId.HEDERA_MAINNET]: useDummyUnderlyingTokens,
  [ChainId.NEAR_MAINNET]: useDummyUnderlyingTokens,
  [ChainId.NEAR_TESTNET]: useDummyUnderlyingTokens,
  [ChainId.COSTON2]: useDummyUnderlyingTokens,
  [ChainId.EVMOS_TESTNET]: useUnderlyingTokens,
  [ChainId.EVMOS_MAINNET]: useUnderlyingTokens,
  [ChainId.ETHEREUM]: useDummyUnderlyingTokens,
  [ChainId.POLYGON]: useDummyUnderlyingTokens,
  [ChainId.FANTOM]: useDummyUnderlyingTokens,
  [ChainId.XDAI]: useDummyUnderlyingTokens,
  [ChainId.BSC]: useDummyUnderlyingTokens,
  [ChainId.ARBITRUM]: useDummyUnderlyingTokens,
  [ChainId.CELO]: useDummyUnderlyingTokens,
  [ChainId.OKXCHAIN]: useDummyUnderlyingTokens,
  [ChainId.VELAS]: useDummyUnderlyingTokens,
  [ChainId.AURORA]: useDummyUnderlyingTokens,
  [ChainId.CRONOS]: useDummyUnderlyingTokens,
  [ChainId.FUSE]: useDummyUnderlyingTokens,
  [ChainId.MOONRIVER]: useDummyUnderlyingTokens,
  [ChainId.MOONBEAM]: useDummyUnderlyingTokens,
  [ChainId.OP]: useDummyUnderlyingTokens,
  [ChainId.SKALE_BELLATRIX_TESTNET]: useUnderlyingTokens,
};

export type UseConcLiqPositionFeesHookType = {
  [chainId in ChainId]: typeof useConcLiqPositionFees | typeof useDummyConcLiqPositionFees;
};

export const useConcLiqPositionFeesHook: UseConcLiqPositionFeesHookType = {
  [ChainId.FUJI]: useConcLiqPositionFees,
  [ChainId.AVALANCHE]: useConcLiqPositionFees,
  [ChainId.WAGMI]: useDummyConcLiqPositionFees,
  [ChainId.COSTON]: useDummyConcLiqPositionFees,
  [ChainId.SONGBIRD]: useDummyConcLiqPositionFees,
  [ChainId.FLARE_MAINNET]: useDummyConcLiqPositionFees,
  [ChainId.HEDERA_TESTNET]: useDummyConcLiqPositionFees,
  [ChainId.HEDERA_MAINNET]: useDummyConcLiqPositionFees,
  [ChainId.NEAR_MAINNET]: useDummyConcLiqPositionFees,
  [ChainId.NEAR_TESTNET]: useDummyConcLiqPositionFees,
  [ChainId.COSTON2]: useDummyConcLiqPositionFees,
  [ChainId.EVMOS_TESTNET]: useConcLiqPositionFees,
  [ChainId.EVMOS_MAINNET]: useConcLiqPositionFees,
  [ChainId.ETHEREUM]: useDummyConcLiqPositionFees,
  [ChainId.POLYGON]: useDummyConcLiqPositionFees,
  [ChainId.FANTOM]: useDummyConcLiqPositionFees,
  [ChainId.XDAI]: useDummyConcLiqPositionFees,
  [ChainId.BSC]: useDummyConcLiqPositionFees,
  [ChainId.ARBITRUM]: useDummyConcLiqPositionFees,
  [ChainId.CELO]: useDummyConcLiqPositionFees,
  [ChainId.OKXCHAIN]: useDummyConcLiqPositionFees,
  [ChainId.VELAS]: useDummyConcLiqPositionFees,
  [ChainId.AURORA]: useDummyConcLiqPositionFees,
  [ChainId.CRONOS]: useDummyConcLiqPositionFees,
  [ChainId.FUSE]: useDummyConcLiqPositionFees,
  [ChainId.MOONRIVER]: useDummyConcLiqPositionFees,
  [ChainId.MOONBEAM]: useDummyConcLiqPositionFees,
  [ChainId.OP]: useDummyConcLiqPositionFees,
  [ChainId.SKALE_BELLATRIX_TESTNET]: useConcLiqPositionFees,
};

export type UsePositionTokenURIHookType = {
  [chainId in ChainId]: typeof usePositionTokenURI | typeof useDummyPositionTokenURI;
};

export const usePositionTokenURIHook: UsePositionTokenURIHookType = {
  [ChainId.FUJI]: usePositionTokenURI,
  [ChainId.AVALANCHE]: usePositionTokenURI,
  [ChainId.WAGMI]: useDummyPositionTokenURI,
  [ChainId.COSTON]: useDummyPositionTokenURI,
  [ChainId.SONGBIRD]: useDummyPositionTokenURI,
  [ChainId.FLARE_MAINNET]: useDummyPositionTokenURI,
  [ChainId.HEDERA_TESTNET]: useDummyPositionTokenURI,
  [ChainId.HEDERA_MAINNET]: useDummyPositionTokenURI,
  [ChainId.NEAR_MAINNET]: useDummyPositionTokenURI,
  [ChainId.NEAR_TESTNET]: useDummyPositionTokenURI,
  [ChainId.COSTON2]: useDummyPositionTokenURI,
  [ChainId.EVMOS_TESTNET]: usePositionTokenURI,
  [ChainId.EVMOS_MAINNET]: usePositionTokenURI,
  [ChainId.ETHEREUM]: useDummyPositionTokenURI,
  [ChainId.POLYGON]: useDummyPositionTokenURI,
  [ChainId.FANTOM]: useDummyPositionTokenURI,
  [ChainId.XDAI]: useDummyPositionTokenURI,
  [ChainId.BSC]: useDummyPositionTokenURI,
  [ChainId.ARBITRUM]: useDummyPositionTokenURI,
  [ChainId.CELO]: useDummyPositionTokenURI,
  [ChainId.OKXCHAIN]: useDummyPositionTokenURI,
  [ChainId.VELAS]: useDummyPositionTokenURI,
  [ChainId.AURORA]: useDummyPositionTokenURI,
  [ChainId.CRONOS]: useDummyPositionTokenURI,
  [ChainId.FUSE]: useDummyPositionTokenURI,
  [ChainId.MOONRIVER]: useDummyPositionTokenURI,
  [ChainId.MOONBEAM]: useDummyPositionTokenURI,
  [ChainId.OP]: useDummyPositionTokenURI,
  [ChainId.SKALE_BELLATRIX_TESTNET]: usePositionTokenURI,
};

export function useActiveWeb3React(): Web3ReactContextInterface<Web3Provider> & { chainId?: ChainId } {
  const context = useWeb3ReactCore<Web3Provider>()
  const contextNetwork = useWeb3ReactCore<Web3Provider>(NetworkContextName)
  return context.active ? context : contextNetwork
}

export function useChainId() {
  const { chainId } = useActiveWeb3React()
  return (chainId || ChainId.AVALANCHE) as ChainId
}

export function useEagerConnect() {
  const { activate, active } = useWeb3ReactCore() // specifically using useWeb3ReactCore because of what this hook does
  const [tried, setTried] = useState(false)

  useEffect(() => {
    injected.isAuthorized().then(isAuthorized => {
      if (isAuthorized) {
        activate(injected, undefined, true).catch(() => {
          setTried(true)
        })
      } else {
        if (isMobile && window.ethereum) {
          activate(injected, undefined, true).catch(() => {
            setTried(true)
          })
        } else {
          setTried(true)
        }
      }
    })
  }, [activate]) // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (active) {
      setTried(true)
    }
  }, [active])

  return tried
}

/**
 * Use for network and injected - logs user in
 * and out after checking what network theyre on
 */
export function useInactiveListener(suppress = false) {
  const { active, error, activate } = useWeb3ReactCore() // specifically using useWeb3React because of what this hook does

  useEffect(() => {
    const { ethereum } = window

    if (ethereum && ethereum.on && !active && !error && !suppress) {
      const handleChainChanged = () => {
        // eat errors
        activate(injected, undefined, true).catch(error => {
          console.error('Failed to activate after chain changed', error)
        })
      }

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          // eat errors
          activate(injected, undefined, true).catch(error => {
            console.error('Failed to activate after accounts changed', error)
          })
        }
      }

      ethereum.on('chainChanged', handleChainChanged)
      ethereum.on('accountsChanged', handleAccountsChanged)

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('chainChanged', handleChainChanged)
          ethereum.removeListener('accountsChanged', handleAccountsChanged)
        }
      }
    }
    return undefined
  }, [active, error, suppress, activate])
}
