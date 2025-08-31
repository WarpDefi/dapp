/* eslint-disable max-lines */
import {
  BigintIsh,
  CHAINS,
  ChainId,
  Currency,
  ElixirPool,
  FeeAmount,
  JSBI,
  Tick,
  Token,
  TokenAmount,
  computePoolAddress,
} from '@pangolindex/sdk';
import { BigNumber } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
import { ELIXIR_POOL_STATE_INTERFACE } from 'src/constants/abis/elixirPool';
import { useConcLiqNFTPositionManagerContract } from 'src/utils/contracts';
import { PoolState, TokenId, UsePositionTokenURIResult } from './types';
import { ElixirPoolType, ElixirTick, useElixirPools } from '@/graphql/elixirPools';
import { useMultipleContractSingleData, useSingleCallResult } from '@/state/multicallv3/hooks';
import { useContract, usePangolinV3Rewarder, useTokenContract } from './useContract';
//import { useChainId } from '@/provider';
import { unwrappedTokenV3, wrappedCurrency } from '@/utils/wrappedCurrency';
import { TokenReturnType } from '@/state/stake/hooks';
import { useBlockNumber } from '@/state/applicationv3';
import { PANGOLIN_V3_REWARDER_ADDRESS } from '@/constants';
import { useUSDCPrice } from './useUSDCPrice/evm';
import { useCurrency } from './Tokens';
import { useTokenData } from '@/state/tokens/hooks';
;
import { useActiveWeb3React } from '.';
import { useChainId } from '@/provider';

// Classes are expensive to instantiate, so this caches the recently instantiated pools.
// This avoids re-instantiating pools as the other pools in the same request are loaded.
class PoolCache {
  // Evict after 128 entries. Empirically, a swap uses 64 entries.
  private static MAX_ENTRIES = 128;

  // These are FIFOs, using unshift/pop. This makes recent entries faster to find.
  private static pools: ElixirPool[] = [];
  private static addresses: { key: string; address: string }[] = [];

  static getPoolAddress(
    factoryAddress: string,
    tokenA: Token,
    tokenB: Token,
    fee: FeeAmount,
    chainId: ChainId,
  ): string {
    if (this.addresses.length > this.MAX_ENTRIES) {
      this.addresses = this.addresses.slice(0, this.MAX_ENTRIES / 2);
    }

    const { address: addressA } = tokenA;
    const { address: addressB } = tokenB;
    const key = `${factoryAddress}:${addressA}:${addressB}:${fee.toString()}`;
    const found = this.addresses.find((address) => address.key === key);
    if (found) return found.address;

    const address = {
      key,
      address: computePoolAddress({
        factoryAddress,
        tokenA,
        tokenB,
        fee,
        initCodeHashManualOverride: undefined,
        chainId,
      }),
    };
    this.addresses.unshift(address);
    return address.address;
  }

  static getPool(
    tokenA: Token,
    tokenB: Token,
    fee: FeeAmount,
    initialFee: FeeAmount,
    sqrtPriceX96: BigintIsh,
    liquidity: BigintIsh,
    tick: number,
    ticks?: Array<ElixirTick>,
  ): ElixirPool {
    if (this.pools.length > this.MAX_ENTRIES) {
      this.pools = this.pools.slice(0, this.MAX_ENTRIES / 2);
    }

    const found = this.pools.find(
      (pool) =>
        pool.token0 === tokenA &&
        pool.token1 === tokenB &&
        pool.fee === fee &&
        JSBI.EQ(pool.sqrtRatioX96, sqrtPriceX96) &&
        JSBI.EQ(pool.liquidity, liquidity) &&
        pool.tickCurrent === tick,
    );
    if (found) return found;

    let finalTicks: Array<Tick> = [];
    if (ticks && ticks.length > 0) {
      finalTicks = ticks
        .sort((a, b) => Number.parseInt(a.tickIdx) - Number.parseInt(b.tickIdx))
        .map(
          ({ tickIdx, liquidityGross, liquidityNet }) =>
            new Tick({ index: Number(tickIdx), liquidityGross, liquidityNet }),
        );
    }

    try {
      const pool = new ElixirPool(tokenA, tokenB, fee, initialFee, sqrtPriceX96, liquidity, tick, finalTicks);
      this.pools.unshift(pool);
      return pool;

    } catch (error) {
      const emptyPool = new ElixirPool(tokenA, tokenB, fee, initialFee, sqrtPriceX96, liquidity, tick, []);
      this.pools.unshift(emptyPool);
      return emptyPool;
    }
  }
}

export function usePoolsViaContract(
  poolKeys: [Currency | undefined, Currency | undefined, FeeAmount | undefined][],
): [PoolState, ElixirPool | null][] {
  const chainId = useChainId();

  const poolTokens: ([Token, Token, FeeAmount] | undefined)[] = useMemo(() => {
    if (!chainId) return new Array(poolKeys.length);

    return poolKeys.map(([currencyA, currencyB, feeAmount]) => {
      if (currencyA && currencyB && feeAmount) {
        const tokenA = wrappedCurrency(currencyA, chainId);
        const tokenB = wrappedCurrency(currencyB, chainId);

        if (!tokenA || !tokenB) return undefined;

        if (tokenA.equals(tokenB)) return undefined;

        return tokenA.sortsBefore(tokenB) ? [tokenA, tokenB, feeAmount] : [tokenB, tokenA, feeAmount];
      }
      return undefined;
    });
  }, [chainId, poolKeys]);

  const poolAddresses: (string | undefined)[] = useMemo(() => {
    const v3CoreFactoryAddress = chainId && CHAINS[chainId].contracts?.elixir?.factory;
    if (!v3CoreFactoryAddress) return new Array(poolTokens.length);

    return poolTokens.map((value) => value && PoolCache.getPoolAddress(v3CoreFactoryAddress, ...value, chainId));
  }, [chainId, poolTokens]);

  const slot0s = useMultipleContractSingleData(poolAddresses, ELIXIR_POOL_STATE_INTERFACE, 'slot0');
  const liquidities = useMultipleContractSingleData(poolAddresses, ELIXIR_POOL_STATE_INTERFACE, 'liquidity');
  const initialFees = useMultipleContractSingleData(poolAddresses, ELIXIR_POOL_STATE_INTERFACE, 'initialFee');

  return useMemo(() => {
    return poolKeys.map((_key, index) => {
      const tokens = poolTokens[index];
      if (!tokens) return [PoolState.INVALID, null];
      const [token0, token1, fee] = tokens;

      if (!slot0s[index]) return [PoolState.INVALID, null];
      const { result: slot0, loading: slot0Loading, valid: slot0Valid } = slot0s[index];

      if (!liquidities[index]) return [PoolState.INVALID, null];
      const { result: liquidity, loading: liquidityLoading, valid: liquidityValid } = liquidities[index];

      if (!initialFees[index]) return [PoolState.INVALID, null];
      const { result: initialFee, loading: initialFeeLoading, valid: initialFeeValid } = initialFees[index];

      if (!tokens || !slot0Valid || !liquidityValid) return [PoolState.INVALID, null];
      if (slot0Loading || liquidityLoading) return [PoolState.LOADING, null];
      if (!slot0 || !liquidity) return [PoolState.NOT_EXISTS, null];
      if (!slot0.sqrtPriceX96 || slot0.sqrtPriceX96.eq(0)) return [PoolState.NOT_EXISTS, null];

      try {
        const pool = PoolCache.getPool(token0, token1, fee, fee, slot0.sqrtPriceX96, liquidity[0], slot0.tick);
        return [PoolState.EXISTS, pool];
      } catch (error) {
        console.error('Error when constructing the pool', error);
        return [PoolState.NOT_EXISTS, null];
      }
    });
  }, [liquidities, poolKeys, slot0s, poolTokens]);
}

export function usePoolsViaSubgraph(
  poolKeys: [Currency | undefined, Currency | undefined, FeeAmount | undefined][],
): [PoolState, ElixirPool | null][] {
  const chainId = useChainId();

  const poolTokens: ([Token, Token, FeeAmount] | undefined)[] = useMemo(() => {
    if (!chainId) return new Array(poolKeys.length);

    return poolKeys.map(([currencyA, currencyB, feeAmount]) => {
      if (currencyA && currencyB && feeAmount) {
        const tokenA = wrappedCurrency(currencyA, chainId);
        const tokenB = wrappedCurrency(currencyB, chainId);

        if (!tokenA || !tokenB) return undefined;

        if (tokenA.equals(tokenB)) return undefined;

        return tokenA.sortsBefore(tokenB) ? [tokenA, tokenB, feeAmount] : [tokenB, tokenA, feeAmount];
      }
      return undefined;
    });
  }, [chainId, poolKeys]);

  const poolAddresses: string[] = useMemo(() => {
    const v3CoreFactoryAddress = chainId && CHAINS[chainId].contracts?.elixir?.factory;
    if (!v3CoreFactoryAddress) return new Array(poolTokens.length);

    return poolTokens.map((value) => value && PoolCache.getPoolAddress(v3CoreFactoryAddress, ...value, chainId));
  }, [chainId, poolTokens]);

  const { isLoading, data: elixirPools } = useElixirPools(poolAddresses);

  const poolsMapping = (elixirPools || [])?.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as { [address: string]: ElixirPoolType });

  return useMemo(() => {
    return poolKeys.map((_key, index) => {
      const tokens = poolTokens[index];
      if (!tokens) return [PoolState.INVALID, null];
      const [token0, token1, fee] = tokens;
      const address = poolAddresses[index];
      const poolData = poolsMapping[address] || {};

      const sqrtPrice = poolData.sqrtPrice;
      const liquidity = poolData.liquidity;
      if (isLoading) return [PoolState.LOADING, null];
      if (!sqrtPrice || !liquidity) return [PoolState.NOT_EXISTS, null];
      if (!sqrtPrice || sqrtPrice === '0') return [PoolState.NOT_EXISTS, null];

      try {
        const pool = PoolCache.getPool(
          token0,
          token1,
          Number(poolData?.feeTier),
          Number(poolData?.initialFee),
          sqrtPrice,
          liquidity,
          Number(poolData.tick),
          poolData.ticks,
        );
        return [PoolState.EXISTS, pool];
      } catch (error) {
        console.error('Error when constructing the pool', error);
        return [PoolState.NOT_EXISTS, null];
      }
    });
  }, [poolKeys, elixirPools, poolTokens]);
}

export function usePoolsViaSubgraphForSwap(
  poolKeys: [Currency | undefined, Currency | undefined, FeeAmount | undefined][],
): [PoolState, ElixirPool | null][] {
  const chainId = useChainId();

  const poolTokens: ([Token, Token, FeeAmount] | undefined)[] = useMemo(() => {
    if (!chainId) return new Array(poolKeys.length);

    return poolKeys.map(([currencyA, currencyB, feeAmount]) => {
      if (currencyA && currencyB && feeAmount) {
        const tokenA = wrappedCurrency(currencyA, chainId);
        const tokenB = wrappedCurrency(currencyB, chainId);

        if (!tokenA || !tokenB) return undefined;

        if (tokenA.equals(tokenB)) return undefined;

        return tokenA.sortsBefore(tokenB) ? [tokenA, tokenB, feeAmount] : [tokenB, tokenA, feeAmount];
      }
      return undefined;
    });
  }, [chainId, poolKeys]);

  const poolAddresses: string[] = useMemo(() => {
    const v3CoreFactoryAddress = chainId && CHAINS[chainId].contracts?.elixir?.factory;
    if (!v3CoreFactoryAddress) return new Array(poolTokens.length);

    return poolTokens.map((value) => value && PoolCache.getPoolAddress(v3CoreFactoryAddress, ...value, chainId));
  }, [chainId, poolTokens]);

  const { isLoading, data: elixirPools } = useElixirPools(poolAddresses);

  const poolsMapping = (elixirPools || [])?.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as { [address: string]: ElixirPoolType });

  return useMemo(() => {
    return poolKeys.map((_key, index) => {
      const tokens = poolTokens[index];
      if (!tokens) return [PoolState.INVALID, null];
      const [token0, token1, fee] = tokens;
      const address = poolAddresses[index];
      const poolData = poolsMapping[address] || {};

      const sqrtPrice = poolData.sqrtPrice;
      const liquidity = poolData.liquidity;
      if (isLoading) return [PoolState.LOADING, null];
      if (!sqrtPrice || !liquidity) return [PoolState.NOT_EXISTS, null];
      if (!sqrtPrice || sqrtPrice === '0') return [PoolState.NOT_EXISTS, null];

      try {
        const pool = PoolCache.getPool(
          token0,
          token1,
          Number(poolData?.initialFee),
          Number(poolData?.initialFee),
          sqrtPrice,
          liquidity,
          Number(poolData.tick),
          poolData.ticks,
        );
        return [PoolState.EXISTS, pool];
      } catch (error) {
        console.error('Error when constructing the pool', error);
        return [PoolState.NOT_EXISTS, null];
      }
    });
  }, [poolKeys, elixirPools, poolTokens]);
}

export function useAllPoolsViaSubgraph(): { isLoading: boolean; allPools: [PoolState, ElixirPool | null][] } {
  const chainId = useChainId();
  const { isLoading, data: elixirPools } = useElixirPools();

  const allPools: [PoolState, ElixirPool | null][] = useMemo(() => {
    return (elixirPools || []).map((poolData) => {
      const token0 = new Token(
        chainId,
        poolData?.token0?.id,
        Number(poolData?.token0?.decimals),
        poolData?.token0?.symbol,
        poolData?.token0?.name,
      );

      const token1 = new Token(
        chainId,
        poolData?.token1?.id,
        Number(poolData?.token1?.decimals),
        poolData?.token1?.symbol,
        poolData?.token1?.name,
      );

      const sqrtPrice = poolData.sqrtPrice;
      const liquidity = poolData.liquidity;
      if (isLoading) return [PoolState.LOADING, null];
      if (!sqrtPrice || !liquidity) return [PoolState.NOT_EXISTS, null];
      if (!sqrtPrice || sqrtPrice === '0') return [PoolState.NOT_EXISTS, null];

      try {
        const pool = PoolCache.getPool(
          token0,
          token1,
          Number(poolData?.feeTier),
          Number(poolData?.initialFee),
          sqrtPrice,
          liquidity,
          Number(poolData.tick),
          poolData.ticks,
        );
        return [PoolState.EXISTS, pool];
      } catch (error) {
        console.error('Error when constructing the pool', error);
        return [PoolState.NOT_EXISTS, null];
      }
    });
  }, [elixirPools, chainId, isLoading]);

  return { isLoading, allPools };
}

export function useUnderlyingTokens(
  token0?: TokenReturnType,
  token1?: TokenReturnType,
  fee?: FeeAmount,
): [TokenAmount | undefined, TokenAmount | undefined] {
  const poolAddress =
    token0 && token1 && fee ? ElixirPool.getAddress(token0, token1, fee, undefined, undefined) : undefined;

  const token0Contract = useTokenContract(token0?.address, false);
  const token1Contract = useTokenContract(token1?.address, false);
  const { result: token0result } = useSingleCallResult(token0Contract ? token0Contract : undefined, 'balanceOf', [
    poolAddress,
  ]);
  const { result: token1result } = useSingleCallResult(token1Contract ? token1Contract : undefined, 'balanceOf', [
    poolAddress,
  ]);

  return useMemo(() => {
    if (!token0 || !token1 || !fee || !poolAddress) {
      return [undefined, undefined];
    }
    const underlyingToken0 = token0result ? new TokenAmount(token0, token0result[0]) : undefined;
    const underlyingToken1 = token1result ? new TokenAmount(token1, token1result[0]) : undefined;
    return [underlyingToken0, underlyingToken1];
  }, [token0, token1, token0result, token1result]);
}

export function getBonusRewardEndTime(
  token0: Token,
  token1: Token,
  fee?: FeeAmount,
) {
  const poolAddress =
    token0 && token1 && fee ? ElixirPool.getAddress(token0, token1, fee, undefined, undefined) : undefined;

  const PangolinV3RewarderContract = usePangolinV3Rewarder(PANGOLIN_V3_REWARDER_ADDRESS);
  const { result: result } = useSingleCallResult(PangolinV3RewarderContract ? PangolinV3RewarderContract : undefined, 'getEndTime', [
    poolAddress,
  ]);
  if (!result) return 0;
  return result;
}

export function getBonusRewardTokens(
  token0?: TokenReturnType,
  token1?: TokenReturnType,
  fee?: FeeAmount,
) {
  const poolAddress =
    token0 && token1 && fee ? ElixirPool.getAddress(token0, token1, fee, undefined, undefined) : undefined;

  const PangolinV3RewarderContract = usePangolinV3Rewarder(PANGOLIN_V3_REWARDER_ADDRESS);
  const { result: result } = useSingleCallResult(PangolinV3RewarderContract ? PangolinV3RewarderContract : undefined, 'getRewardTokens', [
    poolAddress,
  ]);

  return result;
}

export function getRewardMultipliers(
  token0?: TokenReturnType,
  token1?: TokenReturnType,
  fee?: FeeAmount,
) {
  const poolAddress =
    token0 && token1 && fee ? ElixirPool.getAddress(token0, token1, fee, undefined, undefined) : undefined;

  const PangolinV3RewarderContract = usePangolinV3Rewarder(PANGOLIN_V3_REWARDER_ADDRESS);
  const { result: result } = useSingleCallResult(PangolinV3RewarderContract ? PangolinV3RewarderContract : undefined, 'getRewardMultipliers', [
    poolAddress,
  ]);

  return result;
}

export function getPendingRewards(
  token0?: TokenReturnType,
  token1?: TokenReturnType,
  tokenId?: number,
  rewardAmount?: number,
  fee?: FeeAmount,
) {
  const poolAddress =
    token0 && token1 && fee ? ElixirPool.getAddress(token0, token1, fee, undefined, undefined) : undefined;

  const args =
    poolAddress !== undefined &&
      tokenId !== undefined &&
      rewardAmount !== undefined
      ? [poolAddress, tokenId, rewardAmount]
      : ["0x0000000000000000000000000000000000000000", 0, 0]

  const PangolinV3RewarderContract = usePangolinV3Rewarder(PANGOLIN_V3_REWARDER_ADDRESS);
  const { result: result } = useSingleCallResult(PangolinV3RewarderContract, 'pendingRewards', args);

  return result;
}


const MAX_UINT128 = BigNumber.from(2).pow(128).sub(1);

// compute current + counterfactual fees for a conc liq position
export function useConcLiqPositionFees(
  pool?: ElixirPool,
  tokenId?: BigNumber,
): [TokenAmount, TokenAmount] | [undefined, undefined] {
  const chainId = useChainId();
  const positionManager = useConcLiqNFTPositionManagerContract(false);
  const tokenIdHexString = tokenId?.toHexString();
  const owner: string | undefined = useSingleCallResult(tokenId ? positionManager : null, 'ownerOf', [tokenIdHexString])
    .result?.[0];
  const latestBlockNumber = useBlockNumber();
  // we can't use multicall for this because we need to simulate the call from a specific address
  // latestBlockNumber is included to ensure data stays up-to-date every block
  const [amounts, setAmounts] = useState<[BigNumber, BigNumber] | undefined>();
  useEffect(() => {
    if (positionManager && tokenIdHexString && owner) {
      positionManager.callStatic
        .collect(
          {
            tokenId: tokenIdHexString,
            recipient: owner, // some tokens might fail if transferred to address(0)
            amount0Max: MAX_UINT128,
            amount1Max: MAX_UINT128,
          },
          { from: owner }, // need to simulate the call as the owner
        )
        .then((results) => {
          setAmounts([results.amount0, results.amount1]);
        });
    }
  }, [positionManager, tokenIdHexString, owner, latestBlockNumber]);

  return useMemo(() => {
    if (pool && amounts) {
      return [
        TokenAmount.fromRawAmount(unwrappedTokenV3(pool.token0, chainId) as Token, amounts[0].toString()),
        TokenAmount.fromRawAmount(unwrappedTokenV3(pool.token1, chainId) as Token, amounts[1].toString()),
      ];
    } else {
      return [undefined, undefined];
    }
  }, [pool, amounts, chainId]);
}

const STARTS_WITH = 'data:application/json;base64,';

export function usePositionTokenURI(tokenId: TokenId | undefined): UsePositionTokenURIResult {
  const positionManager = useConcLiqNFTPositionManagerContract(false);
  const inputs = useMemo(
    () => [tokenId instanceof BigNumber ? tokenId.toHexString() : tokenId?.toString(16)],
    [tokenId],
  );
  const { result, error, loading, valid } = useSingleCallResult(tokenId ? positionManager : null, 'tokenURI', inputs);
  const res = useMemo(() => {
    if (error || !valid || !tokenId) {
      return {
        valid: false,
        loading: false,
      };
    }
    if (loading) {
      return {
        valid: true,
        loading: true,
      };
    }
    if (!result) {
      return {
        valid: false,
        loading: false,
      };
    }
    const [tokenURI] = result as [string];
    if (!tokenURI || !tokenURI.startsWith(STARTS_WITH))
      return {
        valid: false,
        loading: false,
      };

    try {
      const json = JSON.parse(atob(tokenURI.slice(STARTS_WITH.length)));
      return {
        valid: true,
        loading: false,
        result: json,
      };
    } catch (error) {
      return { valid: false, loading: false };
    }
  }, [error, loading, result, tokenId, valid]);

  return res;
}
/* eslint-enable max-lines */
