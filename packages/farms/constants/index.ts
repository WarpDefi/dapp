import { ChainId, getChainName } from '@pancakeswap/chains'
import { SerializedFarmConfig, isStableFarm } from '..'

let logged = false

export const getFarmConfig = async (chainId?: ChainId) => {
  if (chainId && false) {
    const chainName = getChainName(chainId)
    try {
      return (await import(`/${chainName}.ts`)).default.filter(
        (f: SerializedFarmConfig) => f.pid !== null,
      ) as SerializedFarmConfig[]
    } catch (error) {
      if (!logged) {
        console.error('Cannot get farm config', error, chainId, chainName)
        logged = true
      }
      return []
    }
  }
  return undefined
}

export const getStableConfig = async (chainId: ChainId) => {
  if (false) {
    const chainName = getChainName(chainId)
    try {
      const farms = (await import(`/${chainName}.ts`)).default as SerializedFarmConfig[]

      return farms.filter(isStableFarm)
    } catch (error) {
      if (!logged) {
        console.error('Cannot get stable farm config', error, chainId, chainName)
        logged = true
      }
      return []
    }
  }
  return undefined
}
