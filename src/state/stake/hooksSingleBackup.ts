import { ChainId, CurrencyAmount, JSBI, Token, TokenAmount, WAVAX } from '@pangolindex/sdk';
import { Pair } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { CNR, PNG, UNDEFINED } from '../../constants';
import { STAKING_REWARDS_INTERFACE } from '../../constants/abis/staking-rewards';
import { PairState, usePair, usePairs } from '../../data/Reserves';
import { useActiveWeb3React } from '../../hooks';
import ERC20_INTERFACE from '../../constants/abis/erc20';
import { NEVER_RELOAD, useMultipleContractSingleData } from '../multicall/hooks';
import { tryParseAmount } from '../swap/hooks';

import useUSDCPrice from '../../utils/useUSDCPrice';
import { useAccount } from 'wagmi';
;

export const STAKING_GENESIS = 1600387200;

export const REWARDS_DURATION_DAYS = 60;

//console.log(TokenAmount);

// TODO add staking rewards addresses here
export const STAKING_REWARDS_INFO: {
  [chainId in ChainId]?: {
    tokens: [Token, Token];
    rewardToken: Token;
    stakingRewardAddress: string;
    rewardTokens: string[];
    weight: string;
    pid: number;
  }[];
} = {
  [ChainId.FUJI]: [
    /*{
      tokens: [CNR[ChainId.FUJI], WAVAX[ChainId.FUJI]],
      rewardToken: CNR[ChainId.FUJI],
      stakingRewardAddress: '0x294f2E52FcD8385F62D58718b1a1A0cF5de5915e',
      rewardTokens: ['0x8D88e48465F30Acfb8daC0b3E35c9D6D7d36abaf'],
      weight: '30x'
    },
    {
      tokens: [CNR[ChainId.FUJI], UNDEFINED[ChainId.FUJI]],
      rewardToken: CNR[ChainId.FUJI],
      stakingRewardAddress: '0x48C79523df62CbA17248143F99739182b5569DfB',
      rewardTokens: ['0x8D88e48465F30Acfb8daC0b3E35c9D6D7d36abaf'],
      weight: '30x'
    },
    {
      tokens: [CNR[ChainId.FUJI], UNDEFINED[ChainId.FUJI]],
      stakingRewardAddress: '0x3ed93c7Ad8208F1BE0C9576Ad98Eb3e4179d7eC1'
    },
    {
      tokens: [WAVAX[ChainId.FUJI], UNDEFINED[ChainId.FUJI]],
      rewardToken: CNR[ChainId.FUJI],
      stakingRewardAddress: '0x5935F6F63FcAA8c9CdAe1867636836008E5c2998',
      rewardTokens: ['0x8D88e48465F30Acfb8daC0b3E35c9D6D7d36abaf'],
      weight: '30x'
    }*/
  ],
  [ChainId.AVALANCHE]: [
    //STAKE POOLS
    {
      tokens: [PNG[ChainId.AVALANCHE], UNDEFINED[ChainId.AVALANCHE]], // 133333333000000000000000
      rewardToken: PNG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x88afdaE1a9F58Da3E68584421937E5F564A0135b',
      rewardTokens: ['0x60781C2586D68229fde47564546784ab3fACA982'],
      weight: '30x',
      pid: -1,
    },
  ],
};

export enum StakingType {
  PAIR,
  SINGLE,
  BOTH,
}

export interface StakingInfo {
  [x: string]: any;
  // the address of the reward contract
  stakingRewardAddress: string;
  // the tokens involved in this pair
  tokens: [Token, Token];

  pid: number;

  // the token in which rewards are distributed
  rewardToken: Token;
  // the amount of token currently staked, or undefined if no account
  stakedAmount: TokenAmount;

  stakedAmountInUsd: TokenAmount;

  // the amount of reward token earned by the active account, or undefined if no account
  earnedAmount: TokenAmount;
  // the total amount of token staked in the contract
  totalStakedAmount: TokenAmount;
  // the amount of token distributed per second to all LPs, constant
  totalRewardRate: TokenAmount;
  // the current amount of token distributed to the active account per second.
  // equivalent to percent of total supply * reward rate
  rewardRate: TokenAmount;
  // total staked Avax in the pool
  totalStakedInWavax: TokenAmount;

  totalStakedInUsd: TokenAmount;

  totalForAuto: TokenAmount;
  // when the period ends
  periodFinish: Date | undefined;
  // calculates a hypothetical amount of token distributed to the active account per second.
  getHypotheticalRewardRate: (
    stakedAmount: TokenAmount,
    totalStakedAmount: TokenAmount,
    totalRewardRate: TokenAmount,
  ) => TokenAmount;
}

/*const calculateTotalStakedAmountInAvaxFromBag = function(
  chainId: ChainId,
  totalSupply: JSBI,
  avaxBagPairReserveOfBag: JSBI,
  avaxBagPairReserveOfOtherToken: JSBI,
  stakingTokenPairReserveOfBag: JSBI,
  totalStakedAmount: TokenAmount,
): TokenAmount
{
  if (JSBI.equal(totalSupply, JSBI.BigInt(0)) || JSBI.equal(avaxBagPairReserveOfBag, JSBI.BigInt(0)))
    return new TokenAmount(WAVAX[chainId], JSBI.BigInt(0))

  const oneToken = JSBI.BigInt(1000000000000000000)
  const avaxBagRatio = JSBI.divide(JSBI.multiply(oneToken, avaxBagPairReserveOfOtherToken), avaxBagPairReserveOfBag)
  const valueOfBagInAvax = JSBI.divide(JSBI.multiply(stakingTokenPairReserveOfBag, avaxBagRatio), oneToken)

  return new TokenAmount(WAVAX[chainId], JSBI.divide(
      JSBI.multiply(
        JSBI.multiply(totalStakedAmount.raw, valueOfBagInAvax),
        JSBI.BigInt(2) // this is b/c the value of LP shares are ~double the value of the wavax they entitle owner to
      ),
      totalSupply
    )
  )
}*/

const calculateTotalStakedAmountInAvaxFromBagNew = function (
  amountStaked: JSBI,
  amountAvailable: JSBI,
  avaxPngPairReserveOfPng: JSBI,
  avaxPngPairReserveOfWavax: JSBI,
  reserveInPng: JSBI,
): TokenAmount {
  if (JSBI.EQ(amountAvailable, JSBI.BigInt(0))) {
    return new TokenAmount(WAVAX[ChainId.AVALANCHE], JSBI.BigInt(0));
  }

  const oneToken = JSBI.BigInt(1000000000000000000);
  const avaxPngRatio = JSBI.divide(JSBI.multiply(oneToken, avaxPngPairReserveOfWavax), avaxPngPairReserveOfPng);
  const valueOfPngInAvax = JSBI.divide(JSBI.multiply(reserveInPng, avaxPngRatio), oneToken);

  return new TokenAmount(
    WAVAX[ChainId.AVALANCHE],
    JSBI.divide(
      JSBI.multiply(
        JSBI.multiply(amountStaked, valueOfPngInAvax),
        JSBI.BigInt(2), // this is b/c the value of LP shares are ~double the value of the wavax they entitle owner to
      ),
      amountAvailable,
    ),
  );
};

const calculateTotalStakedAmountInAvaxNew = function (
  amountStaked: JSBI,
  amountAvailable: JSBI,
  reserveInWavax: JSBI,
): TokenAmount {
  if (JSBI.GT(amountAvailable, 0)) {
    // take the total amount of LP tokens staked, multiply by AVAX value of all LP tokens, divide by all LP tokens
    return new TokenAmount(
      WAVAX[ChainId.AVALANCHE],
      JSBI.divide(
        JSBI.multiply(
          JSBI.multiply(amountStaked, reserveInWavax),
          JSBI.BigInt(2), // this is b/c the value of LP shares are ~double the value of the wavax they entitle owner to
        ),
        amountAvailable,
      ),
    );
  } else {
    return new TokenAmount(WAVAX[ChainId.AVALANCHE], JSBI.BigInt(0));
  }
};

const calculateTotalStakedAmountInAvaxAuto = function (
  chainId: ChainId,
  totalSupply: JSBI,
  totalSupplyCRL: JSBI,
  reserveInWavax: JSBI,
  totalStakedAmount: TokenAmount,
): TokenAmount {
  let hesapla = JSBI.divide(reserveInWavax, JSBI.divide(totalSupplyCRL, totalSupply));
  //let hesapla = JSBI.BigInt(1791000000000000000000)
  //console.log(totalSupplyCRL.toString())
  //console.log(totalSupply.toString())
  if (JSBI.equal(totalSupply, JSBI.BigInt(0))) return new TokenAmount(WAVAX[chainId], JSBI.BigInt(0));

  // take the total amount of LP tokens staked, multiply by AVAX value of all LP tokens, divide by all LP tokens
  return new TokenAmount(
    WAVAX[chainId],
    JSBI.divide(
      JSBI.multiply(
        JSBI.multiply(totalStakedAmount.raw, hesapla),
        JSBI.BigInt(2), // this is b/c the value of LP shares are ~double the value of the wavax they entitle owner to
      ),
      totalSupply,
    ),
  );
};

const calculateTotalStakedAmountInAvaxFromToken = function (
  chainId: ChainId,
  avaxTokenPairReserveOfAvax: JSBI,
  avaxTokenPairReserveOfToken: JSBI,
  totalStakedAmount: TokenAmount,
): TokenAmount {
  if (JSBI.equal(avaxTokenPairReserveOfToken, JSBI.BigInt(0))) return new TokenAmount(WAVAX[chainId], JSBI.BigInt(0));

  const oneToken = JSBI.BigInt(1000000000000000000);
  const avaxTokenRatio = JSBI.divide(JSBI.multiply(oneToken, avaxTokenPairReserveOfAvax), avaxTokenPairReserveOfToken);

  return new TokenAmount(WAVAX[chainId], JSBI.divide(JSBI.multiply(totalStakedAmount.raw, avaxTokenRatio), oneToken));
};

// gets the staking info from the network for the active chain id
export function useStakingInfo(
  stakingType: StakingType,
  pairToFilterBy?: Pair | null,
  totaldeposit = 0,
): StakingInfo[] {
  const { chainId, account } = useActiveWeb3React();

  const info = useMemo(
    () =>
      chainId
        ? (STAKING_REWARDS_INFO[chainId]?.filter(stakingRewardInfo =>
            pairToFilterBy === undefined
              ? true
              : pairToFilterBy === null
                ? false
                : pairToFilterBy.involvesToken(stakingRewardInfo.tokens[0]) &&
                  pairToFilterBy.involvesToken(stakingRewardInfo.tokens[1]),
          ) ?? [])
        : [],
    [chainId, pairToFilterBy],
  );

  const bag = PNG[chainId ? chainId : ChainId.AVALANCHE];
  const rewardTokens = useMemo(() => info.map(({ rewardToken }) => rewardToken), [info]);
  const rewardTokensArray = useMemo(() => info.map(({ rewardTokens }) => rewardTokens), [info]);
  const pids = useMemo(() => info.map(({ pid }) => pid), [info]);
  const rewardsAddresses = useMemo(() => info.map(({ stakingRewardAddress }) => stakingRewardAddress), [info]);
  const weight = useMemo(() => info.map(({ weight }) => weight), [info]);
  const accountArg = useMemo(() => [account ?? undefined], [account]);

  // get all the info from the staking rewards contracts
  const tokens = useMemo(() => info.map(({ tokens }) => tokens), [info]);
  const balances = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'balanceOf', accountArg);
  const earnedAmounts = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'earned',
    accountArg,
  );
  const totalSupplies = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'totalSupply');
  const pairs = usePairs(tokens);
  const avaxPairs = usePairs(tokens.map(pair => [WAVAX[chainId ? chainId : ChainId.AVALANCHE], pair[0]]));
  const [avaxBagPairState, avaxBagPair] = usePair(WAVAX[chainId ? chainId : ChainId.AVALANCHE], bag);

  const pairAddresses = useMemo(() => {
    const pairsHaveLoaded = pairs?.every(([state, pair]) => state === PairState.EXISTS);
    if (!pairsHaveLoaded) return [];
    else return pairs.map(([state, pair]) => pair?.liquidityToken.address);
  }, [pairs]);
  const pairTotalSupplies = useMultipleContractSingleData(pairAddresses, ERC20_INTERFACE, 'totalSupply');

  // tokens per second, constants
  const rewardRates = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'rewardRate',
    undefined,
    NEVER_RELOAD,
  );
  const periodFinishes = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'periodFinish',
    undefined,
    NEVER_RELOAD,
  );

  const usdPrice = useUSDCPrice(WAVAX[chainId ? chainId : ChainId.AVALANCHE]);

  return useMemo(() => {
    if (!chainId || !bag) return [];

    return rewardsAddresses.reduce<StakingInfo[]>((memo, rewardsAddress, index) => {
      //if(rewardsAddress == "0x54bc07F489bCBAb4BBac9dE8f5bB98517D442C9d")console.log(rewardsAddress)
      // these two are dependent on account

      const rewardToken = rewardTokens[index];
      const rewardTokenArray = rewardTokensArray[index];
      const pid = pids[index];
      const weightx = weight[index];
      const balanceState = balances[index];
      const earnedAmountState = earnedAmounts[index];

      const stakingTotalSupplyState = totalSupplies[index];
      const pairTotalSupplyState = pairTotalSupplies[index];

      // these get fetched regardless of account
      const totalSupplyState = totalSupplies[index];
      const rewardRateState = rewardRates[index];
      const periodFinishState = periodFinishes[index];

      const tokens = info[index].tokens;
      const [avaxTokenPairState, avaxTokenPair] = avaxPairs[index];
      const isPair = tokens[1] !== UNDEFINED[tokens[1].chainId];
      const [pairState, pair] = pairs[index];
      //if(rewardsAddress == "0x54bc07F489bCBAb4BBac9dE8f5bB98517D442C9d")console.log(pair)

      /* const pairAddresses = useMemo(() => {
        const pairsHaveLoaded = pairs?.every(([state, pair]) => state === PairState.EXISTS)
        if (!pairsHaveLoaded) return []
        else return pairs.map(([state, pair]) => pair?.liquidityToken.address)
      }, [pairs])*/

      //const pairTotalSupplies = useMultipleContractSingleData(pairAddresses, ERC20_INTERFACE, 'totalSupply')

      if ((isPair && stakingType === StakingType.SINGLE) || (!isPair && stakingType === StakingType.PAIR)) {
        return memo;
      }
      if (
        // these may be undefined if not logged in
        !balanceState?.loading &&
        !earnedAmountState?.loading &&
        // always need these
        totalSupplyState &&
        !totalSupplyState.loading &&
        rewardRateState &&
        !rewardRateState.loading &&
        periodFinishState &&
        !periodFinishState.loading &&
        pairTotalSupplyState &&
        !pairTotalSupplyState.loading &&
        ((isPair && pair && pairState !== PairState.LOADING) || !isPair) &&
        avaxBagPair &&
        avaxBagPairState !== PairState.LOADING
      ) {
        if (
          balanceState?.error ||
          earnedAmountState?.error ||
          totalSupplyState.error ||
          rewardRateState.error ||
          periodFinishState.error ||
          //pairTotalSupplyState.error ||
          (isPair && (pairState === PairState.INVALID || pairState === PairState.NOT_EXISTS)) ||
          avaxBagPairState === PairState.INVALID ||
          avaxBagPairState === PairState.NOT_EXISTS
        ) {
          return memo;
        }

        if (isNaN(totaldeposit)) return [];
        const totalSupply = totaldeposit != 0 ? JSBI.BigInt(totaldeposit) : JSBI.BigInt(totalSupplyState.result?.[0]);
        //const totalSupply = JSBI.BigInt(totalSupplyState.result?.[0])
        let totalStakedInWavax: TokenAmount;
        let stakedAmountInAvax: TokenAmount;
        let stakedAmountInUsd: TokenAmount;
        let totalStakedInUsd: TokenAmount;
        let totalForAuto: TokenAmount;
        let stakedAmount: TokenAmount;
        let totalRewardRate: TokenAmount;
        let totalStakedAmount: TokenAmount;

        if (isPair && pair) {
          const wavax = tokens[0].equals(WAVAX[tokens[0].chainId]) ? tokens[0] : tokens[1];
          const dummyPair = new Pair(new TokenAmount(tokens[0], '0'), new TokenAmount(tokens[1], '0'), chainId);
          const SupplyStaked = JSBI.BigInt(balanceState?.result?.[0] ?? 0);
          const totalSupplyStaked = JSBI.BigInt(stakingTotalSupplyState?.result?.[0] ?? 0);
          const totalSupplyAvailable = JSBI.BigInt(pairTotalSupplyState?.result?.[0] ?? 0);

          totalStakedAmount = new TokenAmount(dummyPair.liquidityToken, totalSupply);
          stakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(balanceState?.result?.[0] ?? 0));
          totalRewardRate = new TokenAmount(bag, JSBI.BigInt(rewardRateState.result?.[0]));
          const isAvaxPool = tokens[0].equals(WAVAX[tokens[0].chainId]);
          //console.log(JSBI.BigInt(totalSupplyState.result?.[0]).toString())
          //console.log(totalStakedAmount.toSignificant())
          if (totaldeposit != 0) {
            totalForAuto = calculateTotalStakedAmountInAvaxAuto(
              chainId,
              totalSupply,
              JSBI.BigInt(totalSupplies[0].result?.[0]),
              pair.reserveOfToken(wavax).raw,
              totalStakedAmount,
            );
          } else {
            totalForAuto = new TokenAmount(tokens[0], '0');
          }

          totalStakedInWavax = isAvaxPool
            ? calculateTotalStakedAmountInAvaxNew(
                totalSupplyStaked,
                totalSupplyAvailable,
                pair.reserveOfToken(wavax).raw,
              )
            : calculateTotalStakedAmountInAvaxFromBagNew(
                totalSupplyStaked,
                totalSupplyAvailable,
                avaxBagPair.reserveOfToken(bag).raw,
                avaxBagPair.reserveOfToken(WAVAX[tokens[1].chainId]).raw,
                pair.reserveOfToken(bag).raw,
              );

          stakedAmountInAvax = isAvaxPool
            ? calculateTotalStakedAmountInAvaxNew(SupplyStaked, totalSupplyAvailable, pair.reserveOfToken(wavax).raw)
            : calculateTotalStakedAmountInAvaxFromBagNew(
                SupplyStaked,
                totalSupplyAvailable,
                avaxBagPair.reserveOfToken(bag).raw,
                avaxBagPair.reserveOfToken(WAVAX[tokens[1].chainId]).raw,
                pair.reserveOfToken(bag).raw,
              );

          totalStakedInUsd = totalStakedInWavax && (usdPrice?.quote(totalStakedInWavax, chainId) as TokenAmount);
          stakedAmountInUsd = stakedAmountInAvax && (usdPrice?.quote(stakedAmountInAvax, chainId) as TokenAmount);

          //console.log(pair.reserve1.toSignificant())
          //console.log(rewardsAddress + " - " + pair.reserveOfToken(wavax).raw)
        } else {
          const isTokenAvax = tokens[0].equals(WAVAX[tokens[0].chainId]);

          if (
            !isTokenAvax &&
            (avaxTokenPairState === PairState.INVALID || avaxTokenPairState === PairState.NOT_EXISTS)
          ) {
            console.error('Invalid pair requested');
            return memo;
          }
          totalForAuto = new TokenAmount(tokens[0], '0');
          totalStakedAmount = new TokenAmount(tokens[0], totalSupply);
          stakedAmount = new TokenAmount(tokens[0], JSBI.BigInt(balanceState?.result?.[0] ?? 0));
          totalRewardRate = new TokenAmount(bag, JSBI.BigInt(rewardRateState.result?.[0]));
          totalStakedInWavax = isTokenAvax
            ? totalStakedAmount
            : avaxTokenPair
              ? calculateTotalStakedAmountInAvaxFromToken(
                  chainId,
                  avaxTokenPair.reserveOfToken(WAVAX[tokens[0].chainId]).raw,
                  avaxTokenPair.reserveOfToken(tokens[0]).raw,
                  totalStakedAmount,
                )
              : new TokenAmount(WAVAX[tokens[0].chainId], JSBI.BigInt(0));

          stakedAmountInAvax = isTokenAvax
            ? totalStakedAmount
            : avaxTokenPair
              ? calculateTotalStakedAmountInAvaxFromToken(
                  chainId,
                  avaxTokenPair.reserveOfToken(WAVAX[tokens[0].chainId]).raw,
                  avaxTokenPair.reserveOfToken(tokens[0]).raw,
                  stakedAmount,
                )
              : new TokenAmount(WAVAX[tokens[0].chainId], JSBI.BigInt(0));

          totalStakedInUsd = totalStakedInWavax && (usdPrice?.quote(totalStakedInWavax, chainId) as TokenAmount);
          stakedAmountInUsd = stakedAmountInAvax && (usdPrice?.quote(stakedAmountInAvax, chainId) as TokenAmount);
        }

        const getHypotheticalRewardRate = (
          stakedAmount: TokenAmount,
          totalStakedAmount: TokenAmount,
          totalRewardRate: TokenAmount,
        ): TokenAmount => {
          return new TokenAmount(
            bag,
            JSBI.greaterThan(totalStakedAmount.raw, JSBI.BigInt(0))
              ? JSBI.divide(JSBI.multiply(totalRewardRate.raw, stakedAmount.raw), totalStakedAmount.raw)
              : JSBI.BigInt(0),
          );
        };

        const individualRewardRate = getHypotheticalRewardRate(stakedAmount, totalStakedAmount, totalRewardRate);

        const periodFinishMs = periodFinishState.result?.[0]?.mul(1000)?.toNumber();
        //console.log(totalRewardRate.multiply(JSBI.BigInt(60 * 60 * 24 * 7)).toFixed(0))
        memo.push({
          stakingRewardAddress: rewardsAddress,
          tokens: tokens,
          pid: pid,
          rewardToken: rewardToken,
          rewardTokensArray: rewardTokenArray,
          weight: weightx,
          periodFinish: periodFinishMs > 0 ? new Date(periodFinishMs) : undefined,
          earnedAmount: new TokenAmount(bag, JSBI.BigInt(earnedAmountState?.result?.[0] ?? 0)),
          rewardRate: individualRewardRate,
          totalRewardRate: totalRewardRate,
          stakedAmount: stakedAmount,
          stakedAmountInAvax: stakedAmountInAvax,
          stakedAmountInUsd: stakedAmountInUsd,
          totalStakedAmount: totalStakedAmount,
          totalForAuto: totalForAuto,
          totalStakedInWavax: totalStakedInWavax,
          totalStakedInUsd: totalStakedInUsd,
          getHypotheticalRewardRate,
        });
      }

      return memo;
    }, []);
  }, [
    balances,
    chainId,
    earnedAmounts,
    info,
    periodFinishes,
    rewardRates,
    rewardTokens,
    rewardTokensArray,
    weight,
    rewardsAddresses,
    totalSupplies,
    avaxBagPairState,
    pairs,
    bag,
    avaxBagPair,
    avaxPairs,
    stakingType,
  ]);
}

export function useStakingInfoFor(
  stakingType: StakingType,
  pairToFilterBy?: Pair | null,
  totaldeposit = 0,
): StakingInfo[] {
  const { chainId, account } = useActiveWeb3React();

  const info = useMemo(
    () =>
      chainId
        ? (STAKING_REWARDS_INFO[chainId]?.filter(stakingRewardInfo =>
            pairToFilterBy === undefined
              ? true
              : pairToFilterBy === null
                ? false
                : pairToFilterBy.involvesToken(stakingRewardInfo.tokens[0]) &&
                  pairToFilterBy.involvesToken(stakingRewardInfo.tokens[1]),
          ) ?? [])
        : [],
    [chainId, pairToFilterBy],
  );

  const bag = CNR[chainId ? chainId : ChainId.AVALANCHE];
  const rewardTokens = useMemo(() => info.map(({ rewardToken }) => rewardToken), [info]);
  const rewardTokensArray = useMemo(() => info.map(({ rewardTokens }) => rewardTokens), [info]);
  const pids = useMemo(() => info.map(({ pid }) => pid), [info]);
  const rewardsAddresses = useMemo(() => info.map(({ stakingRewardAddress }) => stakingRewardAddress), [info]);
  const weight = useMemo(() => info.map(({ weight }) => weight), [info]);
  const accountArg = useMemo(() => [account ?? undefined], [account]);

  // get all the info from the staking rewards contracts
  const tokens = useMemo(() => info.map(({ tokens }) => tokens), [info]);
  const balances = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'balanceOf', accountArg);
  const earnedAmounts = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'earned',
    accountArg,
  );
  const totalSupplies = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'totalSupply');
  const pairs = usePairs(tokens);
  const avaxPairs = usePairs(tokens.map(pair => [WAVAX[chainId ? chainId : ChainId.AVALANCHE], pair[0]]));
  const [avaxBagPairState, avaxBagPair] = usePair(WAVAX[chainId ? chainId : ChainId.AVALANCHE], bag);

  const pairAddresses = useMemo(() => {
    const pairsHaveLoaded = pairs?.every(([state, pair]) => state === PairState.EXISTS);
    if (!pairsHaveLoaded) return [];
    else return pairs.map(([state, pair]) => pair?.liquidityToken.address);
  }, [pairs]);
  const pairTotalSupplies = useMultipleContractSingleData(pairAddresses, ERC20_INTERFACE, 'totalSupply');

  // tokens per second, constants
  const rewardRates = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'rewardRate',
    undefined,
    NEVER_RELOAD,
  );
  const periodFinishes = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'periodFinish',
    undefined,
    NEVER_RELOAD,
  );

  const usdPrice = useUSDCPrice(WAVAX[chainId ? chainId : ChainId.AVALANCHE]);

  return useMemo(() => {
    if (!chainId || !bag) return [];

    return rewardsAddresses.reduce<StakingInfo[]>((memo, rewardsAddress, index) => {
      //if(rewardsAddress == "0x54bc07F489bCBAb4BBac9dE8f5bB98517D442C9d")console.log(rewardsAddress)
      // these two are dependent on account

      const rewardToken = rewardTokens[index];
      const rewardTokenArray = rewardTokensArray[index];
      const pid = pids[index];
      const weightx = weight[index];
      const balanceState = balances[index];
      const earnedAmountState = earnedAmounts[index];

      const stakingTotalSupplyState = totalSupplies[index];
      const pairTotalSupplyState = pairTotalSupplies[index];

      // these get fetched regardless of account
      const totalSupplyState = totalSupplies[index];
      const rewardRateState = rewardRates[index];
      const periodFinishState = periodFinishes[index];

      const tokens = info[index].tokens;
      const [avaxTokenPairState, avaxTokenPair] = avaxPairs[index];
      const isPair = tokens[1] !== UNDEFINED[tokens[1].chainId];
      const [pairState, pair] = pairs[index];
      //if(rewardsAddress == "0x54bc07F489bCBAb4BBac9dE8f5bB98517D442C9d")console.log(pair)

      /* const pairAddresses = useMemo(() => {
        const pairsHaveLoaded = pairs?.every(([state, pair]) => state === PairState.EXISTS)
        if (!pairsHaveLoaded) return []
        else return pairs.map(([state, pair]) => pair?.liquidityToken.address)
      }, [pairs])*/

      //const pairTotalSupplies = useMultipleContractSingleData(pairAddresses, ERC20_INTERFACE, 'totalSupply')

      if ((isPair && stakingType === StakingType.SINGLE) || (!isPair && stakingType === StakingType.PAIR)) {
        return memo;
      }
      if (
        // these may be undefined if not logged in
        !balanceState?.loading &&
        !earnedAmountState?.loading &&
        // always need these
        totalSupplyState &&
        !totalSupplyState.loading &&
        rewardRateState &&
        !rewardRateState.loading &&
        periodFinishState &&
        !periodFinishState.loading &&
        pairTotalSupplyState &&
        !pairTotalSupplyState.loading &&
        ((isPair && pair && pairState !== PairState.LOADING) || !isPair) &&
        avaxBagPair &&
        avaxBagPairState !== PairState.LOADING
      ) {
        if (
          balanceState?.error ||
          earnedAmountState?.error ||
          totalSupplyState.error ||
          rewardRateState.error ||
          periodFinishState.error ||
          //pairTotalSupplyState.error ||
          (isPair && (pairState === PairState.INVALID || pairState === PairState.NOT_EXISTS)) ||
          avaxBagPairState === PairState.INVALID ||
          avaxBagPairState === PairState.NOT_EXISTS
        ) {
          return memo;
        }

        if (isNaN(totaldeposit)) return [];
        const totalSupply = totaldeposit != 0 ? JSBI.BigInt(totaldeposit) : JSBI.BigInt(totalSupplyState.result?.[0]);
        //const totalSupply = JSBI.BigInt(totalSupplyState.result?.[0])
        let totalStakedInWavax: TokenAmount;
        let stakedAmountInAvax: TokenAmount;
        let stakedAmountInUsd: TokenAmount;
        let totalStakedInUsd: TokenAmount;
        let totalForAuto: TokenAmount;
        let stakedAmount: TokenAmount;
        let totalRewardRate: TokenAmount;
        let totalStakedAmount: TokenAmount;

        if (isPair && pair) {
          const wavax = tokens[0].equals(WAVAX[tokens[0].chainId]) ? tokens[0] : tokens[1];
          const dummyPair = new Pair(new TokenAmount(tokens[0], '0'), new TokenAmount(tokens[1], '0'), chainId);
          const SupplyStaked = JSBI.BigInt(balanceState?.result?.[0] ?? 0);
          const totalSupplyStaked = JSBI.BigInt(stakingTotalSupplyState?.result?.[0] ?? 0);
          const totalSupplyAvailable = JSBI.BigInt(pairTotalSupplyState?.result?.[0] ?? 0);

          totalStakedAmount = new TokenAmount(dummyPair.liquidityToken, totalSupply);
          stakedAmount = new TokenAmount(dummyPair.liquidityToken, JSBI.BigInt(balanceState?.result?.[0] ?? 0));
          totalRewardRate = new TokenAmount(bag, JSBI.BigInt(rewardRateState.result?.[0]));
          const isAvaxPool = tokens[0].equals(WAVAX[tokens[0].chainId]);
          //console.log(JSBI.BigInt(totalSupplyState.result?.[0]).toString())
          //console.log(totalStakedAmount.toSignificant())
          if (totaldeposit != 0) {
            totalForAuto = calculateTotalStakedAmountInAvaxAuto(
              chainId,
              totalSupply,
              JSBI.BigInt(totalSupplies[0].result?.[0]),
              pair.reserveOfToken(wavax).raw,
              totalStakedAmount,
            );
          } else {
            totalForAuto = new TokenAmount(tokens[0], '0');
          }

          totalStakedInWavax = isAvaxPool
            ? calculateTotalStakedAmountInAvaxNew(
                totalSupplyStaked,
                totalSupplyAvailable,
                pair.reserveOfToken(wavax).raw,
              )
            : calculateTotalStakedAmountInAvaxFromBagNew(
                totalSupplyStaked,
                totalSupplyAvailable,
                avaxBagPair.reserveOfToken(bag).raw,
                avaxBagPair.reserveOfToken(WAVAX[tokens[1].chainId]).raw,
                pair.reserveOfToken(bag).raw,
              );

          stakedAmountInAvax = isAvaxPool
            ? calculateTotalStakedAmountInAvaxNew(SupplyStaked, totalSupplyAvailable, pair.reserveOfToken(wavax).raw)
            : calculateTotalStakedAmountInAvaxFromBagNew(
                SupplyStaked,
                totalSupplyAvailable,
                avaxBagPair.reserveOfToken(bag).raw,
                avaxBagPair.reserveOfToken(WAVAX[tokens[1].chainId]).raw,
                pair.reserveOfToken(bag).raw,
              );

          totalStakedInUsd = totalStakedInWavax && (usdPrice?.quote(totalStakedInWavax, chainId) as TokenAmount);
          stakedAmountInUsd = stakedAmountInAvax && (usdPrice?.quote(stakedAmountInAvax, chainId) as TokenAmount);

          //console.log(pair.reserve1.toSignificant())
          //console.log(rewardsAddress + " - " + pair.reserveOfToken(wavax).raw)
        } else {
          const isTokenAvax = tokens[0].equals(WAVAX[tokens[0].chainId]);

          if (
            !isTokenAvax &&
            (avaxTokenPairState === PairState.INVALID || avaxTokenPairState === PairState.NOT_EXISTS)
          ) {
            console.error('Invalid pair requested');
            return memo;
          }
          totalForAuto = new TokenAmount(tokens[0], '0');
          totalStakedAmount = new TokenAmount(tokens[0], totalSupply);
          stakedAmount = new TokenAmount(tokens[0], JSBI.BigInt(balanceState?.result?.[0] ?? 0));
          totalRewardRate = new TokenAmount(bag, JSBI.BigInt(rewardRateState.result?.[0]));
          totalStakedInWavax = isTokenAvax
            ? totalStakedAmount
            : avaxTokenPair
              ? calculateTotalStakedAmountInAvaxFromToken(
                  chainId,
                  avaxTokenPair.reserveOfToken(WAVAX[tokens[0].chainId]).raw,
                  avaxTokenPair.reserveOfToken(tokens[0]).raw,
                  totalStakedAmount,
                )
              : new TokenAmount(WAVAX[tokens[0].chainId], JSBI.BigInt(0));

          stakedAmountInAvax = isTokenAvax
            ? totalStakedAmount
            : avaxTokenPair
              ? calculateTotalStakedAmountInAvaxFromToken(
                  chainId,
                  avaxTokenPair.reserveOfToken(WAVAX[tokens[0].chainId]).raw,
                  avaxTokenPair.reserveOfToken(tokens[0]).raw,
                  stakedAmount,
                )
              : new TokenAmount(WAVAX[tokens[0].chainId], JSBI.BigInt(0));

          totalStakedInUsd = totalStakedInWavax && (usdPrice?.quote(totalStakedInWavax, chainId) as TokenAmount);
          stakedAmountInUsd = stakedAmountInAvax && (usdPrice?.quote(stakedAmountInAvax, chainId) as TokenAmount);
        }

        const getHypotheticalRewardRate = (
          stakedAmount: TokenAmount,
          totalStakedAmount: TokenAmount,
          totalRewardRate: TokenAmount,
        ): TokenAmount => {
          return new TokenAmount(
            bag,
            JSBI.greaterThan(totalStakedAmount.raw, JSBI.BigInt(0))
              ? JSBI.divide(JSBI.multiply(totalRewardRate.raw, stakedAmount.raw), totalStakedAmount.raw)
              : JSBI.BigInt(0),
          );
        };

        const individualRewardRate = getHypotheticalRewardRate(stakedAmount, totalStakedAmount, totalRewardRate);

        const periodFinishMs = periodFinishState.result?.[0]?.mul(1000)?.toNumber();
        //console.log(totalRewardRate.multiply(JSBI.BigInt(60 * 60 * 24 * 7)).toFixed(0))
        memo.push({
          stakingRewardAddress: rewardsAddress,
          tokens: tokens,
          pid: pid,
          rewardToken: rewardToken,
          rewardTokensArray: rewardTokenArray,
          weight: weightx,
          periodFinish: periodFinishMs > 0 ? new Date(periodFinishMs) : undefined,
          earnedAmount: new TokenAmount(bag, JSBI.BigInt(earnedAmountState?.result?.[0] ?? 0)),
          rewardRate: individualRewardRate,
          totalRewardRate: totalRewardRate,
          stakedAmount: stakedAmount,
          stakedAmountInAvax: stakedAmountInAvax,
          stakedAmountInUsd: stakedAmountInUsd,
          totalStakedAmount: totalStakedAmount,
          totalForAuto: totalForAuto,
          totalStakedInWavax: totalStakedInWavax,
          totalStakedInUsd: totalStakedInUsd,
          getHypotheticalRewardRate,
        });
      }

      return memo;
    }, []);
  }, [
    balances,
    chainId,
    earnedAmounts,
    info,
    periodFinishes,
    rewardRates,
    rewardTokens,
    rewardTokensArray,
    weight,
    rewardsAddresses,
    totalSupplies,
    avaxBagPairState,
    pairs,
    bag,
    avaxBagPair,
    avaxPairs,
    stakingType,
  ]);
}

export function useTotalBagEarned(): TokenAmount | undefined {
  const chainId = useChainId();
  const bag = chainId ? CNR[chainId] : undefined;
  const stakingInfos = useStakingInfo(StakingType.BOTH);

  return useMemo(() => {
    if (!bag) return undefined;
    return (
      stakingInfos?.reduce(
        (accumulator, stakingInfo) => accumulator.add(stakingInfo.earnedAmount),
        new TokenAmount(bag, '0'),
      ) ?? new TokenAmount(bag, '0')
    );
  }, [stakingInfos, bag]);
}

// based on typed value
export function useDerivedStakeInfo(
  typedValue: string,
  stakingToken: Token,
  userLiquidityUnstaked: TokenAmount | undefined,
): {
  parsedAmount?: CurrencyAmount;
  error?: string;
} {
  const { account } = useActiveWeb3React();

  const parsedInput: CurrencyAmount | undefined = tryParseAmount(typedValue, stakingToken);

  const parsedAmount =
    parsedInput && userLiquidityUnstaked && JSBI.lessThanOrEqual(parsedInput.raw, userLiquidityUnstaked.raw)
      ? parsedInput
      : undefined;

  let error: string | undefined;
  if (!account) {
    error = 'Connect Wallet';
  }
  if (!parsedAmount) {
    error = error ?? 'Enter an amount';
  }

  return {
    parsedAmount,
    error,
  };
}

// based on typed value
export function useDerivedUnstakeInfo(
  typedValue: string,
  stakingAmount: TokenAmount,
): {
  parsedAmount?: CurrencyAmount;
  error?: string;
} {
  const { account } = useActiveWeb3React();

  const parsedInput: CurrencyAmount | undefined = tryParseAmount(typedValue, stakingAmount.token);

  const parsedAmount =
    parsedInput && JSBI.lessThanOrEqual(parsedInput.raw, stakingAmount.raw) ? parsedInput : undefined;

  let error: string | undefined;
  if (!account) {
    error = 'Connect Wallet';
  }
  if (!parsedAmount) {
    error = error ?? 'Enter an amount';
  }

  return {
    parsedAmount,
    error,
  };
}
