import {
  CAVAX,
  CHAINS,
  ChainId,
  Currency,
  CurrencyAmount,
  JSBI,
  Pair,
  Token,
  TokenAmount,
  WAVAX,
} from '@pangolindex/sdk';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BigNumber } from 'ethers';
import { useEffect, useMemo } from 'react';
//import { CNR, USDT, ETH, LINK, PNG, UNDEFINED, WBTCe, YAK, AVE, USDTe, WETHe, LINKe, QI, XAVA, ELK, LYD, DAIe, SUSHIe, AAVEe, OLIVE, USDCe, JOE, YTS, PEFI, SNOB, MOVR, WET, SHERPA } from '../../constants'
import {
  AMPL,
  CNR,
  DAIe,
  FITFI,
  JPYC,
  LINKe,
  MINICHEFSPV2_ADDRESS,
  MINICHEFSP_ADDRESS,
  MINICHEF_ADDRESS,
  PANGOLIN_API_BASE_URL,
  PNG,
  QI,
  ROCO,
  UNDEFINED,
  USDCN,
  USDCe,
  USDT,
  USDTe,
  WBTCe,
  WETHe,
  XAVA,
  YAK,
  YAY,
  sAVAX,
} from '../../constants';
//import { CNR, PNG, UNDEFINED, USDCe, USDTe} from '../../constants'
import { STAKING_REWARDS_INTERFACE } from '../../constants/abis/staking-rewards';
//import { PairState, usePair, usePairs } from '../../data/Reserves'
import ERC20_INTERFACE from '../../constants/abis/erc20';
import { PairState, usePair, usePairs } from '../../data/ReservesPangolin';
import { useActiveWeb3React } from '../../hooks';
//import { usePairContract } from '../../hooks/useContract'
import {
  NEVER_RELOAD,
  useMultipleContractMultipleData,
  useMultipleContractSingleData,
  useSingleCallResult,
  useSingleContractMultipleData,
} from '../multicall/hooks';
import { tryParseAmount } from '../swap/hooks';
//import { Interface } from '@ethersproject/abi'
//import { abi as IPangolinPairABI } from '@pangolindex/exchange-contracts/artifacts/contracts/pangolin-core/interfaces/IPangolinPair.sol/IPangolinPair.json'
import { FunctionFragment, Interface } from '@ethersproject/abi';
import { parseBytes32String } from '@ethersproject/strings';
import ERC20_BYTES32_ABI from './erc20_bytes32.json';
import IPangolinPair from './IPangolinPair.sol/IPangolinPair.json';
import REWARDERVIAMULTIPLIER_ABI from './rewarder-via-multiplier.json';

import { useAccount } from 'wagmi';
import { useAllTokens } from '../../hooks/useAllTokens';
import { useMiniChefContract, useMiniChefSPContract, useMiniChefSPV2Contract } from '../../hooks/useContract';
import { isAddress } from '../../utils';
import useUSDCPrice from '../../utils/useUSDCPrice';
import { Call, ListenerOptions, parseCallKey, toCallKey, useMulticallAtom } from '../multicall/atom';
import { useChainId } from '@/provider';
;

export const STAKING_GENESIS = 1600387200;

export const REWARDS_DURATION_DAYS = 60;

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export declare type TokenReturnType = Token | undefined | null;
declare type MethodArg = string | number | BigNumber;
declare type OptionalMethodInputs = Array<MethodArg | MethodArg[] | undefined> | undefined;

export const BIG_INT_SECONDS_IN_WEEK = JSBI.BigInt(60 * 60 * 24 * 7);
export const BIG_INT_ZERO = JSBI.BigInt(0);
export const BIG_INT_TWO = JSBI.BigInt(2);

const PAIR_INTERFACE = new Interface(IPangolinPair.abi);
const ERC20_BYTES32_INTERFACE = new Interface(ERC20_BYTES32_ABI);

const pangolinApi = axios.create({
  baseURL: PANGOLIN_API_BASE_URL,
  timeout: 10000,
});

export const STAKING_REWARDS_SP_V2_INFO: {
  [chainId in ChainId]?: {
    tokens: [Token, Token];
    rewardToken: Token;
    stakingRewardAddress: string;
    rewardTokens: string[];
    isSuper: boolean;
    weight: string;
    pid: number;
  }[];
} = {
  [ChainId.FUJI]: [],
  [ChainId.AVALANCHE]: [
    {
      tokens: [WAVAX[ChainId.AVALANCHE], PNG[ChainId.AVALANCHE]],
      rewardToken: PNG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x2E9433248814182D4e521BeE45028E7f8Ca96Efa',
      rewardTokens: ['0x60781C2586D68229fde47564546784ab3fACA982', '0x8D88e48465F30Acfb8daC0b3E35c9D6D7d36abaf'],
      isSuper: true,
      weight: '1x',
      pid: 0,
    },
  ],
};

export const STAKING_REWARDS_SP_INFO: {
  [chainId in ChainId]?: {
    tokens: [Token, Token];
    rewardToken: Token;
    stakingRewardAddress: string;
    rewardTokens: string[];
    isSuper: boolean;
    weight: string;
    pid: number;
  }[];
} = {
  [ChainId.FUJI]: [],
  [ChainId.AVALANCHE]: [
    {
      tokens: [WAVAX[ChainId.AVALANCHE], PNG[ChainId.AVALANCHE]],
      rewardToken: PNG[ChainId.AVALANCHE],
      stakingRewardAddress: '0xA73B1887054F424F967A3644aC72826A989826DB',
      rewardTokens: ['0x60781C2586D68229fde47564546784ab3fACA982', '0x8D88e48465F30Acfb8daC0b3E35c9D6D7d36abaf'],
      isSuper: true,
      weight: '1x',
      pid: 0,
    },
  ],
};

// TODO add staking rewards addresses here
export const STAKING_REWARDS_INFO: {
  [chainId in ChainId]?: {
    tokens: [Token, Token];
    rewardToken: Token;
    stakingRewardAddress: string;
    rewardTokens: string[];
    isSuper: boolean;
    weight: string;
    pid: number;
  }[];
} = {
  [ChainId.FUJI]: [],
  [ChainId.AVALANCHE]: [
    {
      tokens: [WAVAX[ChainId.AVALANCHE], PNG[ChainId.AVALANCHE]],
      rewardToken: PNG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x1f806f7C8dED893fd3caE279191ad7Aa3798E928',
      rewardTokens: ['0x60781C2586D68229fde47564546784ab3fACA982'],
      isSuper: false,
      weight: '5.63x',
      pid: -1,
    },
    {
      tokens: [WAVAX[ChainId.AVALANCHE], USDCN[ChainId.AVALANCHE]],
      rewardToken: PNG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x1f806f7C8dED893fd3caE279191ad7Aa3798E928',
      rewardTokens: ['0x60781C2586D68229fde47564546784ab3fACA982'],
      isSuper: false,
      weight: '5.63x',
      pid: -1,
    },
    {
      tokens: [WAVAX[ChainId.AVALANCHE], WETHe[ChainId.AVALANCHE]],
      rewardToken: PNG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x1f806f7C8dED893fd3caE279191ad7Aa3798E928',
      rewardTokens: ['0x60781C2586D68229fde47564546784ab3fACA982'],
      isSuper: false,
      weight: '5.63x',
      pid: -1,
    },
    {
      tokens: [WAVAX[ChainId.AVALANCHE], USDT[ChainId.AVALANCHE]],
      rewardToken: PNG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x1f806f7C8dED893fd3caE279191ad7Aa3798E928',
      rewardTokens: ['0x60781C2586D68229fde47564546784ab3fACA982'],
      isSuper: false,
      weight: '5.63x',
      pid: -1,
    },
    {
      tokens: [WAVAX[ChainId.AVALANCHE], USDCe[ChainId.AVALANCHE]],
      rewardToken: PNG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x1f806f7C8dED893fd3caE279191ad7Aa3798E928',
      rewardTokens: ['0x60781C2586D68229fde47564546784ab3fACA982'],
      isSuper: false,
      weight: '5.63x',
      pid: -1,
    },
    {
      tokens: [WAVAX[ChainId.AVALANCHE], USDTe[ChainId.AVALANCHE]],
      rewardToken: PNG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x1f806f7C8dED893fd3caE279191ad7Aa3798E928',
      rewardTokens: ['0x60781C2586D68229fde47564546784ab3fACA982'],
      isSuper: false,
      weight: '5.63x',
      pid: -1,
    },
    {
      tokens: [WAVAX[ChainId.AVALANCHE], XAVA[ChainId.AVALANCHE]],
      rewardToken: PNG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x1f806f7C8dED893fd3caE279191ad7Aa3798E928',
      rewardTokens: ['0x60781C2586D68229fde47564546784ab3fACA982'],
      isSuper: false,
      weight: '5.63x',
      pid: -1,
    },
    {
      tokens: [WAVAX[ChainId.AVALANCHE], AMPL[ChainId.AVALANCHE]],
      rewardToken: PNG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x1f806f7C8dED893fd3caE279191ad7Aa3798E928',
      rewardTokens: ['0x60781C2586D68229fde47564546784ab3fACA982'],
      isSuper: false,
      weight: '5.63x',
      pid: -1,
    },
    {
      tokens: [WAVAX[ChainId.AVALANCHE], QI[ChainId.AVALANCHE]],
      rewardToken: PNG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x1f806f7C8dED893fd3caE279191ad7Aa3798E928',
      rewardTokens: ['0x60781C2586D68229fde47564546784ab3fACA982'],
      isSuper: false,
      weight: '5.63x',
      pid: -1,
    },
    {
      tokens: [WAVAX[ChainId.AVALANCHE], LINKe[ChainId.AVALANCHE]],
      rewardToken: PNG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x1f806f7C8dED893fd3caE279191ad7Aa3798E928',
      rewardTokens: ['0x60781C2586D68229fde47564546784ab3fACA982'],
      isSuper: false,
      weight: '5.63x',
      pid: -1,
    },
    {
      tokens: [WAVAX[ChainId.AVALANCHE], YAK[ChainId.AVALANCHE]],
      rewardToken: PNG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x1f806f7C8dED893fd3caE279191ad7Aa3798E928',
      rewardTokens: ['0x60781C2586D68229fde47564546784ab3fACA982'],
      isSuper: false,
      weight: '5.63x',
      pid: -1,
    },
    {
      tokens: [USDCN[ChainId.AVALANCHE], WBTCe[ChainId.AVALANCHE]],
      rewardToken: PNG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x1f806f7C8dED893fd3caE279191ad7Aa3798E928',
      rewardTokens: ['0x60781C2586D68229fde47564546784ab3fACA982'],
      isSuper: false,
      weight: '5.63x',
      pid: -1,
    },
    {
      tokens: [USDCN[ChainId.AVALANCHE], USDCe[ChainId.AVALANCHE]],
      rewardToken: PNG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x1f806f7C8dED893fd3caE279191ad7Aa3798E928',
      rewardTokens: ['0x60781C2586D68229fde47564546784ab3fACA982'],
      isSuper: false,
      weight: '5.63x',
      pid: -1,
    },
    {
      tokens: [PNG[ChainId.AVALANCHE], USDCN[ChainId.AVALANCHE]],
      rewardToken: PNG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x1f806f7C8dED893fd3caE279191ad7Aa3798E928',
      rewardTokens: ['0x60781C2586D68229fde47564546784ab3fACA982'],
      isSuper: false,
      weight: '5.63x',
      pid: -1,
    },
    {
      tokens: [WAVAX[ChainId.AVALANCHE], WBTCe[ChainId.AVALANCHE]],
      rewardToken: PNG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x1f806f7C8dED893fd3caE279191ad7Aa3798E928',
      rewardTokens: ['0x60781C2586D68229fde47564546784ab3fACA982'],
      isSuper: false,
      weight: '5.63x',
      pid: -1,
    },
    {
      tokens: [sAVAX[ChainId.AVALANCHE], WAVAX[ChainId.AVALANCHE]],
      rewardToken: PNG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x1f806f7C8dED893fd3caE279191ad7Aa3798E928',
      rewardTokens: ['0x60781C2586D68229fde47564546784ab3fACA982'],
      isSuper: false,
      weight: '5.63x',
      pid: -1,
    },
    {
      tokens: [WAVAX[ChainId.AVALANCHE], ROCO[ChainId.AVALANCHE]],
      rewardToken: PNG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x1f806f7C8dED893fd3caE279191ad7Aa3798E928',
      rewardTokens: ['0x60781C2586D68229fde47564546784ab3fACA982'],
      isSuper: false,
      weight: '5.63x',
      pid: -1,
    },
    {
      tokens: [USDCN[ChainId.AVALANCHE], JPYC[ChainId.AVALANCHE]],
      rewardToken: PNG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x1f806f7C8dED893fd3caE279191ad7Aa3798E928',
      rewardTokens: ['0x60781C2586D68229fde47564546784ab3fACA982'],
      isSuper: false,
      weight: '5.63x',
      pid: -1,
    },
    {
      tokens: [WAVAX[ChainId.AVALANCHE], YAY[ChainId.AVALANCHE]],
      rewardToken: PNG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x1f806f7C8dED893fd3caE279191ad7Aa3798E928',
      rewardTokens: ['0x60781C2586D68229fde47564546784ab3fACA982'],
      isSuper: false,
      weight: '5.63x',
      pid: -1,
    },
    {
      tokens: [WAVAX[ChainId.AVALANCHE], FITFI[ChainId.AVALANCHE]],
      rewardToken: PNG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x1f806f7C8dED893fd3caE279191ad7Aa3798E928',
      rewardTokens: ['0x60781C2586D68229fde47564546784ab3fACA982'],
      isSuper: false,
      weight: '5.63x',
      pid: -1,
    },
    {
      tokens: [USDCe[ChainId.AVALANCHE], USDTe[ChainId.AVALANCHE]],
      rewardToken: PNG[ChainId.AVALANCHE],
      stakingRewardAddress: '0x1f806f7C8dED893fd3caE279191ad7Aa3798E928',
      rewardTokens: ['0x60781C2586D68229fde47564546784ab3fACA982'],
      isSuper: false,
      weight: '5.63x',
      pid: -1,
    },
  ],
};

export enum StakingType {
  PAIR,
  SINGLE,
  BOTH,
}

export interface AprResult {
  swapFeeApr: number;
  stakingApr: number;
  combinedApr: number;
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

export interface MinichefStakingInfo {
  [x: string]: any;

  // the token in which rewards are distributed
  rewardToken: Token;
  // the amount of token currently staked, or undefined if no account

  stakedAmountInUsd: TokenAmount;
  // the amount of token distributed per second to all LPs, constant
  totalRewardRate: TokenAmount;
  // the current amount of token distributed to the active account per second.
  // equivalent to percent of total supply * reward rate
  rewardRate: TokenAmount;

  totalForAuto: TokenAmount;
  // when the period ends
  // calculates a hypothetical amount of token distributed to the active account per second.
  getHypotheticalRewardRate: (
    stakedAmount: TokenAmount,
    totalStakedAmount: TokenAmount,
    totalRewardRate: TokenAmount,
  ) => TokenAmount;
  // array of extra reward tokens (super farms)
  rewardTokens?: Array<Token>;
  // pair address
  pairAddress?: string;
  // farm id
  pid: number;
  // array of extra pending rewards (super farms)
  extraPendingRewards: JSBI[];
  // the tokens involved in this pair
  tokens: [Token, Token];
  // the pool weight
  multiplier: JSBI;
  // total staked AVAX in the pool
  totalStakedInWavax: TokenAmount;
  totalStakedInUsd: TokenAmount;
  // array of addresses of extra reward tokens
  rewardTokensAddress?: Array<string>;
  // address of the rewarder contract (used to add extra tokens as rewards for farm)
  rewardsAddress?: string;
  // extra reward tokens multipliers
  rewardTokensMultiplier?: Array<JSBI>;
  getExtraTokensWeeklyRewardRate?: (
    rewardRatePerWeek: TokenAmount,
    token: Token,
    tokenMultiplier: JSBI | undefined,
  ) => TokenAmount;

  // apr from swap fees
  swapFeeApr?: number;
  // apr from rewards
  stakingApr?: number;
  // swapFeeApr + stakingApr
  combinedApr?: number;
  // the address of the reward contract
  stakingRewardAddress: string;
  // the amount of token currently staked, or undefined if no account
  stakedAmount: TokenAmount;
  // the amount of reward token earned by the active account, or undefined if no account
  earnedAmount: TokenAmount;
  // the total amount of token staked in the contract
  totalStakedAmount: TokenAmount;
  // the amount of token distributed per second to all LPs, constant
  totalRewardRatePerSecond: TokenAmount;
  totalRewardRatePerWeek: TokenAmount;
  // the current amount of token distributed to the active account per week.
  // equivalent to percent of total supply * reward rate * (60 * 60 * 24 * 7)
  rewardRatePerWeek: TokenAmount;
  // when the period ends
  periodFinish: Date | undefined;
  // has the reward period expired
  isPeriodFinished: boolean;
  // calculates a hypothetical amount of token distributed to the active account per second.
  getHypotheticalWeeklyRewardRate: (
    stakedAmount: TokenAmount,
    totalStakedAmount: TokenAmount,
    totalRewardRatePerSecond: TokenAmount,
  ) => TokenAmount;
}

export interface DoubleSideStaking {
  tokens: [Token, Token];
  stakingRewardAddress: string;
  version: number;
  multiplier?: number;
}

export interface Result extends ReadonlyArray<any> {
  readonly [key: string]: any;
}

export interface CallState {
  readonly valid: boolean;
  readonly result: Result | undefined;
  readonly loading: boolean;
  readonly syncing: boolean;
  readonly error: boolean;
}

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
        JSBI.divide(
          JSBI.multiply(
            JSBI.multiply(amountStaked, reserveInWavax),
            JSBI.BigInt(2), // this is b/c the value of LP shares are ~double the value of the wavax they entitle owner to
          ),
          amountAvailable,
        ),
        JSBI.BigInt(1000000000000),
      ),
    );
  } else {
    return new TokenAmount(WAVAX[ChainId.AVALANCHE], JSBI.BigInt(0));
  }
};

const calculateTotalStakedAmountInForStable = function (
  amountStaked: JSBI,
  amountAvailable: JSBI,
  reserveInWavax: JSBI,
): TokenAmount {
  if (JSBI.GT(amountAvailable, 0)) {
    // take the total amount of LP tokens staked, multiply by AVAX value of all LP tokens, divide by all LP tokens
    return new TokenAmount(
      WAVAX[ChainId.AVALANCHE],
      JSBI.multiply(
        JSBI.divide(
          JSBI.multiply(
            JSBI.multiply(amountStaked, reserveInWavax),
            JSBI.BigInt(2), // this is b/c the value of LP shares are ~double the value of the wavax they entitle owner to
          ),
          amountAvailable,
        ),
        JSBI.BigInt(1000000000000),
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
  const hesapla = JSBI.divide(reserveInWavax, JSBI.divide(totalSupplyCRL, totalSupply));
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
  avaxTokenPairreserveOfToken: JSBI,
  totalStakedAmount: TokenAmount,
): TokenAmount {
  if (JSBI.equal(avaxTokenPairreserveOfToken, JSBI.BigInt(0))) return new TokenAmount(WAVAX[chainId], JSBI.BigInt(0));

  const oneToken = JSBI.BigInt(1000000000000000000);
  const avaxTokenRatio = JSBI.divide(JSBI.multiply(oneToken, avaxTokenPairReserveOfAvax), avaxTokenPairreserveOfToken);

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

  const bag = CNR[chainId ? chainId : ChainId.AVALANCHE];
  const png = PNG[chainId ? chainId : ChainId.AVALANCHE];
  const rewardTokens = useMemo(() => info.map(({ rewardToken }) => rewardToken), [info]);
  const rewardTokensArray = useMemo(() => info.map(({ rewardTokens }) => rewardTokens), [info]);
  const rewardsAddresses = useMemo(() => info.map(({ stakingRewardAddress }) => stakingRewardAddress), [info]);
  const pids = useMemo(() => info.map(({ pid }) => pid), [info]);
  const isSupers = useMemo(() => info.map(({ isSuper }) => isSuper), [info]);
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
  const pendingRewards =
    useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'pendingRewards', accountArg) ?? 0;

  const pairs = usePairs(tokens);
  const avaxPairs = usePairs(tokens.map(pair => [WAVAX[chainId ? chainId : ChainId.AVALANCHE], pair[0]]));
  const [avaxBagPairState, avaxBagPair] = usePair(WAVAX[chainId ? chainId : ChainId.AVALANCHE], bag);

  const pairAddresses = useMemo(() => {
    const pairsHaveLoaded = pairs?.every(([state, pair]) => state === PairState.EXISTS);
    if (!pairsHaveLoaded) return [];
    else return pairs.map(([state, pair]) => pair?.liquidityToken.address);
  }, [pairs]);
  const pairTotalSupplies = useMultipleContractSingleData(pairAddresses, ERC20_INTERFACE, 'totalSupply');

  /*const PAIR_INTERFACE = new Interface(IPangolinPairABI)

  const pgllpstblN = useMemo(() => ['0xc13E562d92F7527c4389Cd29C67DaBb0667863eA' ?? undefined], ['0xc13E562d92F7527c4389Cd29C67DaBb0667863eA'])
  const resultsstblN = useMultipleContractSingleData(pgllpstblN, PAIR_INTERFACE, 'getReserves')
  const pglresstblN = resultsstblN[0].result?.reserve1 * 1000000000000*/

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
      const isSuper = isSupers[index];
      const weightx = weight[index];
      const balanceState = balances[index];
      const earnedAmountState = earnedAmounts[index];
      const pendingRewardsState = pendingRewards[index];

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
        !pendingRewardsState?.loading &&
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
          pendingRewardsState?.error ||
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
        const totalSupply = totaldeposit !== 0 ? JSBI.BigInt(totaldeposit) : JSBI.BigInt(totalSupplyState.result?.[0]);
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
          const isStablePoolN =
            tokens[0].equals(USDCe[tokens[0].chainId]) && tokens[1].equals(USDTe[tokens[1].chainId]);
          if (totaldeposit !== 0) {
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
            : isStablePoolN
              ? calculateTotalStakedAmountInForStable(
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
            : isStablePoolN
              ? calculateTotalStakedAmountInForStable(
                  SupplyStaked,
                  totalSupplyAvailable,
                  pair.reserveOfToken(wavax).raw,
                )
              : calculateTotalStakedAmountInAvaxFromBagNew(
                  SupplyStaked,
                  totalSupplyAvailable,
                  avaxBagPair.reserveOfToken(bag).raw,
                  avaxBagPair.reserveOfToken(WAVAX[tokens[1].chainId]).raw,
                  pair.reserveOfToken(bag).raw,
                );

          totalStakedInUsd = isStablePoolN
            ? totalStakedInWavax
            : totalStakedInWavax && (usdPrice?.quote(totalStakedInWavax, chainId) as TokenAmount);
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

        //console.log(pendingRewardsState?.result?.[2] ?? 0)
        memo.push({
          stakingRewardAddress: rewardsAddress,
          tokens: tokens,
          pid: pid,
          rewardToken: rewardToken,
          rewardTokensArray: rewardTokenArray,
          weight: weightx,
          periodFinish: periodFinishMs > 0 ? new Date(periodFinishMs) : undefined,
          earnedAmount: new TokenAmount(bag, JSBI.BigInt(earnedAmountState?.result?.[0] ?? 0)),
          rewardCNR: new TokenAmount(bag, JSBI.BigInt(pendingRewardsState?.result?.[0] ?? 0)),
          rewardPNG: new TokenAmount(png, JSBI.BigInt(pendingRewardsState?.result?.[1] ?? 0)),
          rewardBonus: 1,
          isSuper: isSuper,
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
    chainId,
    bag,
    rewardsAddresses,
    rewardTokens,
    rewardTokensArray,
    pids,
    isSupers,
    weight,
    balances,
    earnedAmounts,
    pendingRewards,
    totalSupplies,
    pairTotalSupplies,
    rewardRates,
    periodFinishes,
    info,
    avaxPairs,
    pairs,
    stakingType,
    avaxBagPair,
    avaxBagPairState,
    totaldeposit,
    png,
    usdPrice,
  ]);
}

const DEFIEDGE_TOKEN = '0xd947375F78df5B8FeEa6814eCd999ee64507a057';
export const PANGOLIN_PAIR_INTERFACE = new Interface(IPangolinPair.abi);
const REWARDER_VIA_MULTIPLIER_INTERFACE = new Interface(REWARDERVIAMULTIPLIER_ABI);

export function getExtraTokensWeeklyRewardRate(
  rewardRatePerWeek: TokenAmount,
  token: Token,
  tokenMultiplier: JSBI | undefined,
) {
  const png = PNG[token.chainId];
  const EXPONENT = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(png.decimals));

  const rewardMultiplier = JSBI.BigInt(tokenMultiplier || 1);

  const unadjustedRewardPerWeek = JSBI.multiply(rewardMultiplier, rewardRatePerWeek?.raw);

  const finalReward = JSBI.divide(unadjustedRewardPerWeek, EXPONENT);

  return new TokenAmount(token, finalReward);
}

const tokenComparator = ({ address: addressA }: { address: string }, { address: addressB }: { address: string }) => {
  // Sort AVAX last
  if (addressA === WAVAX[ChainId.AVALANCHE].address) return 1;
  else if (addressB === WAVAX[ChainId.AVALANCHE].address) return -1;
  // Sort PNG first
  else if (addressA === PNG[ChainId.AVALANCHE].address) return -1;
  else if (addressB === PNG[ChainId.AVALANCHE].address) return 1;
  // Sort USDC first
  else if (addressA === USDCN[ChainId.AVALANCHE].address) return -1;
  else if (addressB === USDCN[ChainId.AVALANCHE].address) return 1;
  // Sort USDCe first
  else if (addressA === USDCe[ChainId.AVALANCHE].address) return -1;
  else if (addressB === USDCe[ChainId.AVALANCHE].address) return 1;
  else return 0;
};

export const useMinichefPools = (): { [key: string]: number } => {
  const minichefContract = useMiniChefContract();
  const blocksPerFetch = useMemo(() => ({ blocksPerFetch: 100 }), []);
  const lpTokens = useSingleCallResult(minichefContract, 'lpTokens', undefined, blocksPerFetch).result;
  const lpTokensArr = lpTokens?.[0];

  return useMemo(() => {
    const poolMap: { [key: string]: number } = {};
    if (lpTokensArr) {
      lpTokensArr.forEach((address: string, index: number) => {
        if (address !== DEFIEDGE_TOKEN) {
          poolMap[address] = index;
        }
      });
    }
    return poolMap;
  }, [lpTokensArr]);
};

export const useMinichefSPPools = (): { [key: string]: number } => {
  const minichefContract = useMiniChefSPContract();
  const blocksPerFetch = useMemo(() => ({ blocksPerFetch: 100 }), []);
  const lpTokens = useSingleCallResult(minichefContract, 'lpTokens', undefined, blocksPerFetch).result;
  const lpTokensArr = lpTokens?.[0];

  return useMemo(() => {
    const poolMap: { [key: string]: number } = {};
    if (lpTokensArr) {
      lpTokensArr.forEach((address: string, index: number) => {
        if (address !== DEFIEDGE_TOKEN) {
          poolMap[address] = index;
        }
      });
    }
    return poolMap;
  }, [lpTokensArr]);
};

export const useMinichefSPV2Pools = (): { [key: string]: number } => {
  const minichefContract = useMiniChefSPV2Contract();
  const blocksPerFetch = useMemo(() => ({ blocksPerFetch: 100 }), []);
  const lpTokens = useSingleCallResult(minichefContract, 'lpTokens', undefined, blocksPerFetch).result;
  const lpTokensArr = lpTokens?.[0];

  return useMemo(() => {
    const poolMap: { [key: string]: number } = {};
    if (lpTokensArr) {
      lpTokensArr.forEach((address: string, index: number) => {
        if (address !== DEFIEDGE_TOKEN) {
          poolMap[address] = index;
        }
      });
    }
    return poolMap;
  }, [lpTokensArr]);
};

export function useGetExtraPendingRewards(
  rewardsAddresses: (string | undefined)[],
  userPendingRewardsState: CallState[],
) {
  const { account } = useActiveWeb3React();

  const pendingTokensParams = useMemo(() => {
    const params: [0, string, string][] = [];
    for (let index = 0; index < rewardsAddresses.length; index++) {
      const userPendingRewardRes = userPendingRewardsState[index]?.result as BigNumber | undefined;
      params.push([0, account ?? ZERO_ADDRESS, userPendingRewardRes ? userPendingRewardRes.toString() : '0']);
    }
    return params;
  }, [account, rewardsAddresses.length, userPendingRewardsState]);

  const extraPendingTokensRewardsState = useMultipleContractMultipleData(
    rewardsAddresses,
    REWARDER_VIA_MULTIPLIER_INTERFACE,
    'pendingTokens',
    pendingTokensParams,
  );

  return extraPendingTokensRewardsState;
}

export function calculateTotalStakedAmountInAvax(
  amountStaked: JSBI,
  amountAvailable: JSBI,
  reserveInWavax: JSBI,
  chainId: ChainId,
): TokenAmount {
  if (JSBI.GT(amountAvailable, 0)) {
    // take the total amount of LP tokens staked, multiply by AVAX value of all LP tokens, divide by all LP tokens
    return new TokenAmount(
      WAVAX[chainId],
      JSBI.divide(
        JSBI.divide(
          JSBI.multiply(
            JSBI.multiply(amountStaked, reserveInWavax),
            JSBI.BigInt(2), // this is b/c the value of LP shares are ~double the value of the wavax they entitle owner to
          ),
          amountAvailable,
        ),
        JSBI.BigInt(1000000000000),
      ),
    );
  } else {
    return new TokenAmount(WAVAX[chainId], JSBI.BigInt(0));
  }
}

export function calculateTotalStakedAmountInAvaxFromPng(
  amountStaked: JSBI,
  amountAvailable: JSBI,
  avaxPngPairReserveOfPng: JSBI,
  avaxPngPairReserveOfWavax: JSBI,
  reserveInPng: JSBI,
  chainId: ChainId,
): TokenAmount {
  if (JSBI.EQ(amountAvailable, JSBI.BigInt(0))) {
    return new TokenAmount(WAVAX[chainId], JSBI.BigInt(0));
  }

  const oneToken = JSBI.BigInt(1000000000000000000);
  const avaxPngRatio = JSBI.divide(JSBI.multiply(oneToken, avaxPngPairReserveOfWavax), avaxPngPairReserveOfPng);
  const valueOfPngInAvax = JSBI.divide(JSBI.multiply(reserveInPng, avaxPngRatio), oneToken);

  return new TokenAmount(
    WAVAX[chainId],
    JSBI.divide(
      JSBI.multiply(
        JSBI.multiply(amountStaked, valueOfPngInAvax),
        JSBI.BigInt(2), // this is b/c the value of LP shares are ~double the value of the wavax they entitle owner to
      ),
      amountAvailable,
    ),
  );
}

const BYTES32_REGEX = /^0x[a-fA-F0-9]{64}$/;
function parseStringOrBytes32(str: string | undefined, bytes32: string | undefined, defaultValue: string): string {
  return str && str.length > 0
    ? str
    : bytes32 && BYTES32_REGEX.test(bytes32)
      ? parseBytes32String(bytes32)
      : defaultValue;
}

export function useTokensContract(tokensAddress: string[] = []): Array<TokenReturnType> | undefined | null {
  const chainId = useChainId();
  const tokens = useAllTokens();

  const tokensName = useMultipleContractSingleData(tokensAddress, ERC20_INTERFACE, 'name', undefined, NEVER_RELOAD);
  const tokensNameBytes32 = useMultipleContractSingleData(
    tokensAddress,
    ERC20_BYTES32_INTERFACE,
    'name',
    undefined,
    NEVER_RELOAD,
  );
  const symbols = useMultipleContractSingleData(tokensAddress, ERC20_INTERFACE, 'symbol', undefined, NEVER_RELOAD);
  const symbolsBytes32 = useMultipleContractSingleData(
    tokensAddress,
    ERC20_BYTES32_INTERFACE,
    'symbol',
    undefined,
    NEVER_RELOAD,
  );
  const decimals = useMultipleContractSingleData(tokensAddress, ERC20_INTERFACE, 'decimals', undefined, NEVER_RELOAD);

  return useMemo(() => {
    if (!tokensAddress || tokensAddress?.length === 0) return [];
    if (!chainId) return [];

    return tokensAddress.reduce<Token[]>((acc, tokenAddress, index) => {
      const tokenName = tokensName?.[index];
      const tokenNameBytes32 = tokensNameBytes32?.[index];
      const symbol = symbols?.[index];
      const symbolBytes32 = symbolsBytes32?.[index];
      const decimal = decimals?.[index];
      const address = isAddress(tokenAddress);

      if (!!address && tokens[address]) {
        // if we have user tokens already
        acc.push(tokens[address]);
      } else if (
        tokenName?.loading === false &&
        tokenNameBytes32?.loading === false &&
        symbol?.loading === false &&
        symbolBytes32?.loading === false &&
        decimal?.loading === false &&
        address &&
        (decimal?.result?.[0] || decimal?.result?.[0] === 0)
      ) {
        const token = new Token(
          chainId,
          address,
          decimal?.result?.[0],
          parseStringOrBytes32(symbol?.result?.[0], symbolBytes32?.result?.[0], 'UNKNOWN'),
          parseStringOrBytes32(tokenName?.result?.[0], tokenNameBytes32?.result?.[0], 'Unknown Token'),
        );

        acc.push(token);
      }

      return acc;
    }, []);
  }, [chainId, decimals, symbols, symbolsBytes32, tokensName, tokensNameBytes32, tokens, tokensAddress]);
}

export function wrappedCurrency(currency: Currency | undefined, chainId: ChainId | undefined): Token | undefined {
  return chainId && currency === CAVAX[chainId] ? WAVAX[chainId] : currency instanceof Token ? currency : undefined;
}

export function usePairsContract(
  currencies: [Currency | undefined, Currency | undefined][],
): [PairState, Pair | null][] {
  const chainId = useChainId();

  const tokens = useMemo(
    () =>
      currencies.map(([currencyA, currencyB]) => [
        wrappedCurrency(currencyA, chainId),
        wrappedCurrency(currencyB, chainId),
      ]),
    [chainId, currencies],
  );

  const pairAddresses = useMemo(
    () =>
      tokens.map(([tokenA, tokenB]) => {
        return tokenA && tokenB && !tokenA.equals(tokenB)
          ? Pair.getAddress(tokenA, tokenB, chainId ? chainId : ChainId.AVALANCHE)
          : undefined;
      }),
    [tokens, chainId],
  );

  const results = useMultipleContractSingleData(pairAddresses, PAIR_INTERFACE, 'getReserves');

  return useMemo(() => {
    return results.map((result, i) => {
      const { result: reserves, loading } = result;
      const tokenA = tokens[i][0];
      const tokenB = tokens[i][1];

      if (loading) return [PairState.LOADING, null];
      if (!tokenA || !tokenB || tokenA.equals(tokenB)) return [PairState.INVALID, null];
      if (!reserves) return [PairState.NOT_EXISTS, null];
      const { reserve0, reserve1 } = reserves;
      const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA];
      return [
        PairState.EXISTS,
        new Pair(
          new TokenAmount(token0, reserve0.toString()),
          new TokenAmount(token1, reserve1.toString()),
          chainId ? chainId : ChainId.AVALANCHE,
        ),
      ];
    });
  }, [results, tokens, chainId]);
}

interface CallResult {
  readonly valid: boolean;
  readonly data: string | undefined;
  readonly blockNumber: number | undefined;
}

const INVALID_RESULT: CallResult = { valid: false, blockNumber: undefined, data: undefined };
const INVALID_CALL_STATE: CallState = { valid: false, result: undefined, loading: false, syncing: false, error: false };
const LOADING_CALL_STATE: CallState = { valid: true, result: undefined, loading: true, syncing: true, error: false };

function toCallState(
  callResult: CallResult | undefined,
  contractInterface: Interface | undefined,
  fragment: FunctionFragment | undefined,
  latestBlockNumber: number | undefined,
): CallState {
  if (!callResult) return INVALID_CALL_STATE;
  const { valid, data, blockNumber } = callResult;
  if (!valid) return INVALID_CALL_STATE;
  if (valid && !blockNumber) return LOADING_CALL_STATE;
  if (!contractInterface || !fragment || !latestBlockNumber) return LOADING_CALL_STATE;
  const success = data && data.length > 2;
  const syncing = (blockNumber ?? 0) < latestBlockNumber;
  let result: Result | undefined = undefined;
  if (success && data) {
    try {
      result = contractInterface.decodeFunctionResult(fragment, data);
    } catch (error) {
      return {
        valid: true,
        loading: false,
        error: true,
        syncing,
        result,
      };
    }
  }
  return {
    valid: true,
    loading: false,
    syncing,
    result: result,
    error: !success,
  };
}

function useCallsData(calls: (Call | undefined)[], options?: ListenerOptions): CallResult[] {
  const chainId = useChainId();
  const { multicallState, addMulticallListeners, removeMulticallListeners } = useMulticallAtom();

  const callResults = multicallState.callResults;

  const serializedCallKeys: string = useMemo(
    () =>
      JSON.stringify(
        calls
          ?.filter((c): c is Call => Boolean(c))
          ?.map(toCallKey)
          ?.sort() ?? [],
      ),
    [calls],
  );
  // update listeners when there is an actual change that persists for at least 100ms
  useEffect(() => {
    const callKeys: string[] = JSON.parse(serializedCallKeys);
    if (!chainId || callKeys.length === 0) return undefined;
    const calls = callKeys.map(key => parseCallKey(key));

    addMulticallListeners({
      chainId,
      calls,
      options,
    });

    return () => {
      removeMulticallListeners({
        chainId,
        calls,
        options,
      });
    };
  }, [addMulticallListeners, chainId, options, removeMulticallListeners, serializedCallKeys]);

  return useMemo(
    () =>
      calls.map<CallResult>(call => {
        if (!chainId || !call) return INVALID_RESULT;

        const result = callResults[chainId]?.[toCallKey(call)];
        let data;
        if (result?.data && result?.data !== '0x') {
          data = result.data;
        }

        return { valid: true, data, blockNumber: result?.blockNumber };
      }),
    [calls, chainId, callResults],
  );
}

export async function fetchChunkedAprs(pids: string[], chainId: ChainId, chunkSize = 4) {
  const pidChunks: string[][] = [];

  for (let i = 0; i < pids.length; i += chunkSize) {
    const pidChunk = pids.slice(i, i + chunkSize);
    pidChunks.push(pidChunk);
  }

  const chunkedResults = await Promise.all(
    pidChunks.map(chunk => pangolinApi.get<AprResult[]>(`/v2/${chainId}/pangolin/aprs/${chunk.join(',')}`)),
  );

  const datas = chunkedResults.map(response => response.data);

  return datas.flat();
}

export function useMichefFarmsAprs(pids: string[]) {
  const chainId = useChainId();

  return useQuery({
    queryKey: ['get-minichef-farms-apr', chainId, pids],
    queryFn: async () => {
      const aprs = await fetchChunkedAprs(pids, chainId);

      const results: { [x: string]: AprResult } = {}; // key is the pid
      aprs.forEach((value, index) => {
        const pid = pids[index];
        results[pid] = value;
      });

      return results;
    },
  });
}

const dummyApr: AprResult = {
  combinedApr: 0,
  stakingApr: 0,
  swapFeeApr: 0,
};

export const useMinichefSPStakingInfos = (version = 2, pairToFilterBy?: Pair | null): MinichefStakingInfo[] => {
  const { account } = useActiveWeb3React();
  const chainId = useChainId();

  const minichefContract = useMiniChefSPContract();
  const poolMap = useMinichefSPPools();
  const lpTokens = useMemo(() => Object.keys(poolMap), [poolMap]);

  //const pids = useMemo(() => Object.values(poolMap).map((pid) => pid.toString()), [poolMap]);

  //const { data: farmsAprs } = useMichefFarmsAprs(pids);

  // if chain is not avalanche skip the first pool because it's dummyERC20
  if (chainId !== ChainId.AVALANCHE) {
    lpTokens.shift();
  }

  const emptyArr = useMemo(() => [], []);

  const _tokens0Call = useMultipleContractSingleData(
    lpTokens,
    PANGOLIN_PAIR_INTERFACE,
    'token0',
    undefined,
    NEVER_RELOAD,
  );
  const _tokens1Call = useMultipleContractSingleData(
    lpTokens,
    PANGOLIN_PAIR_INTERFACE,
    'token1',
    undefined,
    NEVER_RELOAD,
  );

  const tokens0Adrr = useMemo(() => {
    return _tokens0Call.map(result => {
      return result.result && result.result.length > 0 ? result.result[0] : null;
    });
  }, [_tokens0Call]);

  const tokens1Adrr = useMemo(() => {
    return _tokens1Call.map(result => (result.result && result.result.length > 0 ? result.result[0] : null));
  }, [_tokens1Call]);

  const tokens0 = useTokensContract(tokens0Adrr);
  const tokens1 = useTokensContract(tokens1Adrr);

  const info = useMemo(() => {
    const filterPair = (item: DoubleSideStaking) => {
      if (pairToFilterBy === undefined) {
        return true;
      }
      if (pairToFilterBy === null) {
        return false;
      }
      return pairToFilterBy.involvesToken(item.tokens[0]) && pairToFilterBy.involvesToken(item.tokens[1]);
    };

    const _infoTokens: DoubleSideStaking[] = [];
    if (tokens0 && tokens1 && tokens0?.length === tokens1?.length) {
      tokens0.forEach((token0, index) => {
        const token1 = tokens1[index];
        if (token0 && token1) {
          _infoTokens.push({
            tokens: [token0, token1],
            stakingRewardAddress: minichefContract?.address ?? '',
            version: version,
          });
        }
      });
      return _infoTokens.filter(filterPair);
    }
    return _infoTokens;
  }, [chainId, minichefContract, tokens0, tokens1, pairToFilterBy, version]);

  const _tokens = useMemo(() => (info ? info.map(({ tokens }) => tokens) : emptyArr), [info]);
  const pairs = usePairsContract(_tokens);
  // @dev: If no farms load, you likely loaded an incorrect config from doubleSideConfig.js
  // Enable this and look for an invalid pair

  const pairAddresses = useMemo(() => {
    return pairs.map(([, pair]) => pair?.liquidityToken.address);
  }, [pairs]);

  const minichefAddress = useMemo(() => [MINICHEFSP_ADDRESS[chainId]], [chainId]);
  const pairTotalSupplies = useMultipleContractSingleData(pairAddresses, ERC20_INTERFACE, 'totalSupply');
  const balances = useMultipleContractSingleData(pairAddresses, ERC20_INTERFACE, 'balanceOf', minichefAddress);

  const [avaxPngPairState, avaxPngPair] = usePair(WAVAX[chainId], PNG[chainId]);

  const poolIdArray = useMemo(() => {
    if (!pairAddresses || !poolMap) return emptyArr;

    const NOT_FOUND = -1;
    const results = pairAddresses.map(address => poolMap[address ?? ''] ?? NOT_FOUND);
    if (results.some(result => result === NOT_FOUND)) return emptyArr;
    return results;
  }, [poolMap, pairAddresses]);

  const poolsIdInput = useMemo(() => {
    if (!poolIdArray) return emptyArr;
    return poolIdArray.map(pid => [pid]);
  }, [poolIdArray]);

  const poolInfos = useSingleContractMultipleData(minichefContract, 'poolInfo', poolsIdInput ?? emptyArr);

  const rewarders = useSingleContractMultipleData(minichefContract, 'rewarder', poolsIdInput ?? emptyArr);

  const userInfoInput = useMemo(() => {
    if (!poolIdArray || !account) return emptyArr;
    return poolIdArray.map(pid => [pid, account]);
  }, [poolIdArray, account]);

  const userInfos = useSingleContractMultipleData(minichefContract, 'userInfo', userInfoInput ?? emptyArr);

  const pendingRewards = useSingleContractMultipleData(minichefContract, 'pendingReward', userInfoInput ?? emptyArr);

  const rewardsAddresses = useMemo(() => {
    if ((rewarders || []).length === 0) return emptyArr;
    if (rewarders.some(item => item.loading)) return emptyArr;
    return rewarders.map(reward => reward?.result?.[0]);
  }, [rewarders]);

  const rewardTokensMultipliers = useMultipleContractSingleData(
    rewardsAddresses,
    REWARDER_VIA_MULTIPLIER_INTERFACE,
    'getRewardMultipliers',
    undefined,
  );

  const rewardPerSecond = useSingleCallResult(minichefContract, 'rewardPerSecond', undefined).result;
  const totalAllocPoint = useSingleCallResult(minichefContract, 'totalAllocPoint', undefined).result;
  const rewardsExpiration = useSingleCallResult(minichefContract, 'rewardsExpiration', undefined).result;
  const usdPriceTmp = useUSDCPrice(WAVAX[chainId]);
  const usdPrice = CHAINS[chainId]?.mainnet ? usdPriceTmp : undefined;

  const extraPendingTokensRewardsState = useGetExtraPendingRewards(rewardsAddresses, pendingRewards);

  return useMemo(() => {
    if (!chainId || !PNG[chainId]) return [];

    return pairAddresses.reduce<any[]>((memo, _pairAddress, index) => {
      const pairTotalSupplyState = pairTotalSupplies[index];
      const balanceState = balances[index];
      const poolInfo = poolInfos[index];
      const userPoolInfo = userInfos[index];
      const [pairState, pair] = pairs[index];
      const pendingRewardInfo = pendingRewards[index];
      const rewardTokensMultiplier = rewardTokensMultipliers[index];
      const rewardsAddress = rewardsAddresses[index];
      const extraPendingTokensRewardState = extraPendingTokensRewardsState[index];
      const extraPendingTokensRewards = extraPendingTokensRewardState?.result as
        | { amounts: BigNumber[]; tokens: string[] }
        | undefined;

      if (
        pairTotalSupplyState?.loading === false &&
        poolInfo?.loading === false &&
        balanceState?.loading === false &&
        pair &&
        avaxPngPair &&
        pairState !== PairState.LOADING &&
        avaxPngPairState !== PairState.LOADING &&
        rewardPerSecond &&
        totalAllocPoint &&
        rewardsExpiration?.[0] &&
        extraPendingTokensRewardState?.loading === false
      ) {
        if (
          balanceState?.error ||
          pairTotalSupplyState.error ||
          pairState === PairState.INVALID ||
          pairState === PairState.NOT_EXISTS ||
          avaxPngPairState === PairState.INVALID ||
          avaxPngPairState === PairState.NOT_EXISTS
        ) {
          console.error('Failed to load staking rewards info');
          return memo;
        }
        const pid = poolMap[pair.liquidityToken.address].toString();
        // get the LP token
        const token0 = pair?.token0;
        const token1 = pair?.token1;

        const tokens = [token0, token1].sort(tokenComparator) as [Token, Token];

        const dummyPair = new Pair(new TokenAmount(tokens[0], '0'), new TokenAmount(tokens[1], '0'), chainId);
        const lpToken = dummyPair.liquidityToken;

        const poolAllocPointAmount = new TokenAmount(lpToken, JSBI.BigInt(poolInfo?.result?.['allocPoint']));
        const totalAllocPointAmount = new TokenAmount(lpToken, JSBI.BigInt(totalAllocPoint?.[0]));
        const rewardRatePerSecAmount = new TokenAmount(PNG[chainId], JSBI.BigInt(rewardPerSecond?.[0]));
        const poolRewardRate = new TokenAmount(
          PNG[chainId],
          JSBI.divide(JSBI.multiply(poolAllocPointAmount.raw, rewardRatePerSecAmount.raw), totalAllocPointAmount.raw),
        );

        const totalRewardRatePerWeek = new TokenAmount(
          PNG[chainId],
          JSBI.multiply(poolRewardRate.raw, BIG_INT_SECONDS_IN_WEEK),
        );

        const periodFinishMs = rewardsExpiration?.[0]?.mul(1000)?.toNumber();
        // periodFinish will be 0 immediately after a reward contract is initialized
        const isPeriodFinished =
          periodFinishMs === 0 ? false : periodFinishMs < Date.now() || poolAllocPointAmount.equalTo('0');

        const totalSupplyStaked = JSBI.BigInt(balanceState?.result?.[0]);
        const totalSupplyAvailable = JSBI.BigInt(pairTotalSupplyState?.result?.[0]);
        const totalStakedAmount = new TokenAmount(lpToken, JSBI.BigInt(balanceState?.result?.[0]));
        const stakedAmount = new TokenAmount(lpToken, JSBI.BigInt(userPoolInfo?.result?.['amount'] ?? 0));
        const earnedAmount = new TokenAmount(PNG[chainId], JSBI.BigInt(pendingRewardInfo?.result?.['pending'] ?? 0));
        const multiplier = JSBI.BigInt(poolInfo?.result?.['allocPoint']);

        let totalStakedInUsd = CHAINS[(chainId as ChainId) || ChainId].mainnet
          ? new TokenAmount(DAIe[chainId], BIG_INT_ZERO)
          : undefined;
        const totalStakedInWavax = new TokenAmount(WAVAX[chainId], BIG_INT_ZERO);

        if (JSBI.equal(totalSupplyAvailable, BIG_INT_ZERO)) {
          // Default to 0 values above avoiding division by zero errors
        } else if (pair.involvesToken(DAIe[chainId])) {
          const pairValueInDAI = JSBI.multiply(pair.reserveOfToken(DAIe[chainId]).raw, BIG_INT_TWO);
          const stakedValueInDAI = JSBI.divide(JSBI.multiply(pairValueInDAI, totalSupplyStaked), totalSupplyAvailable);
          totalStakedInUsd = CHAINS[(chainId as ChainId) || ChainId].mainnet
            ? new TokenAmount(DAIe[chainId], stakedValueInDAI)
            : undefined;
        } else if (pair.involvesToken(USDCe[chainId])) {
          const pairValueInUSDC = JSBI.multiply(pair.reserveOfToken(USDCe[chainId]).raw, BIG_INT_TWO);
          const stakedValueInUSDC = JSBI.divide(
            JSBI.multiply(pairValueInUSDC, totalSupplyStaked),
            totalSupplyAvailable,
          );
          totalStakedInUsd = CHAINS[(chainId as ChainId) || ChainId].mainnet
            ? new TokenAmount(USDCe[chainId], stakedValueInUSDC)
            : undefined;
        } else if (pair.involvesToken(USDCN[chainId])) {
          const pairValueInUSDC = JSBI.multiply(pair.reserveOfToken(USDCN[chainId]).raw, BIG_INT_TWO);
          const stakedValueInUSDC = JSBI.divide(
            JSBI.multiply(pairValueInUSDC, totalSupplyStaked),
            totalSupplyAvailable,
          );
          totalStakedInUsd = CHAINS[(chainId as ChainId) || ChainId].mainnet
            ? new TokenAmount(USDCN[chainId], stakedValueInUSDC)
            : undefined;
        } else if (pair.involvesToken(USDTe[chainId])) {
          const pairValueInUSDT = JSBI.multiply(pair.reserveOfToken(USDTe[chainId]).raw, BIG_INT_TWO);
          const stakedValueInUSDT = JSBI.divide(
            JSBI.multiply(pairValueInUSDT, totalSupplyStaked),
            totalSupplyAvailable,
          );
          totalStakedInUsd = CHAINS[(chainId as ChainId) || ChainId].mainnet
            ? new TokenAmount(USDTe[chainId], stakedValueInUSDT)
            : undefined;
        } else if (pair.involvesToken(WAVAX[chainId])) {
          const _totalStakedInWavax = calculateTotalStakedAmountInAvax(
            totalSupplyStaked,
            totalSupplyAvailable,
            pair.reserveOfToken(WAVAX[chainId]).raw,
            chainId,
          );
          totalStakedInUsd = CHAINS[(chainId as ChainId) || ChainId].mainnet
            ? _totalStakedInWavax && (usdPrice?.quote(_totalStakedInWavax, chainId) as TokenAmount)
            : undefined;
        } else if (pair.involvesToken(PNG[chainId])) {
          const _totalStakedInWavax = calculateTotalStakedAmountInAvaxFromPng(
            totalSupplyStaked,
            totalSupplyAvailable,
            avaxPngPair.reserveOfToken(PNG[chainId]).raw,
            avaxPngPair.reserveOfToken(WAVAX[chainId]).raw,
            pair.reserveOfToken(PNG[chainId]).raw,
            chainId,
          );
          totalStakedInUsd = CHAINS[(chainId as ChainId) || ChainId].mainnet
            ? _totalStakedInWavax && (usdPrice?.quote(_totalStakedInWavax, chainId) as TokenAmount)
            : undefined;
        } else {
          // Contains no stablecoin, WAVAX, nor PNG
          console.info(`Could not identify total staked value for pair ${pair.liquidityToken.address}`);
        }

        const getHypotheticalWeeklyRewardRate = (
          _stakedAmount: TokenAmount,
          _totalStakedAmount: TokenAmount,
          _totalRewardRatePerSecond: TokenAmount,
        ): TokenAmount => {
          return new TokenAmount(
            PNG[chainId],
            JSBI.greaterThan(_totalStakedAmount.raw, JSBI.BigInt(0))
              ? JSBI.divide(
                  JSBI.multiply(
                    JSBI.multiply(_totalRewardRatePerSecond.raw, _stakedAmount.raw),
                    BIG_INT_SECONDS_IN_WEEK,
                  ),
                  _totalStakedAmount.raw,
                )
              : JSBI.BigInt(0),
          );
        };

        const userRewardRatePerWeek = getHypotheticalWeeklyRewardRate(stakedAmount, totalStakedAmount, poolRewardRate);

        const farmApr = /*farmsAprs?.[pid] ??*/ dummyApr;

        const { rewardTokensAddress, extraPendingRewards } = (extraPendingTokensRewards?.amounts ?? []).reduce(
          (memo, rewardAmount: BigNumber, index) => {
            memo.rewardTokensAddress.push(extraPendingTokensRewards?.tokens?.[index] ?? '');
            memo.extraPendingRewards.push(JSBI.BigInt(rewardAmount.toString()));
            return memo;
          },
          {
            rewardTokensAddress: [] as string[],
            extraPendingRewards: [] as JSBI[],
          },
        );

        memo.push({
          pid,
          stakingRewardAddress: MINICHEFSP_ADDRESS[chainId] ?? '',
          tokens,
          earnedAmount,
          rewardRatePerWeek: userRewardRatePerWeek,
          totalRewardRatePerSecond: poolRewardRate,
          totalRewardRatePerWeek: totalRewardRatePerWeek,
          stakedAmount,
          totalStakedAmount,
          totalStakedInWavax,
          totalStakedInUsd: totalStakedInUsd ?? new TokenAmount(USDCN[chainId], '0'),
          multiplier,
          periodFinish: periodFinishMs > 0 ? new Date(periodFinishMs) : undefined,
          isPeriodFinished,
          getHypotheticalWeeklyRewardRate,
          getExtraTokensWeeklyRewardRate,
          rewardTokensArray: [],
          rewardTokensAddress: rewardTokensAddress,
          rewardTokensMultiplier: [BigNumber.from(1), ...(rewardTokensMultiplier?.result?.[0] || [])],
          rewardsAddress,
          swapFeeApr: farmApr.swapFeeApr,
          stakingApr: farmApr.stakingApr,
          combinedApr: farmApr.combinedApr,
          extraPendingRewards,
        });
      }

      return memo;
    }, [] as MinichefStakingInfo[]);
  }, [
    chainId,
    PNG[chainId],
    pairTotalSupplies,
    poolInfos,
    userInfos,
    pairs,
    avaxPngPair,
    avaxPngPairState,
    rewardPerSecond,
    totalAllocPoint,
    pendingRewards,
    rewardsExpiration,
    balances,
    usdPrice,
    pairAddresses,
    extraPendingTokensRewardsState,
    rewardsAddresses,
    rewardTokensMultipliers,
    poolMap,
  ]);
};

export const useMinichefSPStakingInfosV2 = (version = 2, pairToFilterBy?: Pair | null): MinichefStakingInfo[] => {
  const { account } = useActiveWeb3React();
  const chainId = useChainId();

  const minichefContract = useMiniChefSPV2Contract();
  const poolMap = useMinichefSPV2Pools();
  const lpTokens = useMemo(() => Object.keys(poolMap), [poolMap]);

  //const pids = useMemo(() => Object.values(poolMap).map((pid) => pid.toString()), [poolMap]);

  //const { data: farmsAprs } = useMichefFarmsAprs(pids);

  // if chain is not avalanche skip the first pool because it's dummyERC20
  if (chainId !== ChainId.AVALANCHE) {
    lpTokens.shift();
  }

  const emptyArr = useMemo(() => [], []);

  const _tokens0Call = useMultipleContractSingleData(
    lpTokens,
    PANGOLIN_PAIR_INTERFACE,
    'token0',
    undefined,
    NEVER_RELOAD,
  );
  const _tokens1Call = useMultipleContractSingleData(
    lpTokens,
    PANGOLIN_PAIR_INTERFACE,
    'token1',
    undefined,
    NEVER_RELOAD,
  );

  const tokens0Adrr = useMemo(() => {
    return _tokens0Call.map(result => {
      return result.result && result.result.length > 0 ? result.result[0] : null;
    });
  }, [_tokens0Call]);

  const tokens1Adrr = useMemo(() => {
    return _tokens1Call.map(result => (result.result && result.result.length > 0 ? result.result[0] : null));
  }, [_tokens1Call]);

  const tokens0 = useTokensContract(tokens0Adrr);
  const tokens1 = useTokensContract(tokens1Adrr);

  const info = useMemo(() => {
    const filterPair = (item: DoubleSideStaking) => {
      if (pairToFilterBy === undefined) {
        return true;
      }
      if (pairToFilterBy === null) {
        return false;
      }
      return pairToFilterBy.involvesToken(item.tokens[0]) && pairToFilterBy.involvesToken(item.tokens[1]);
    };

    const _infoTokens: DoubleSideStaking[] = [];
    if (tokens0 && tokens1 && tokens0?.length === tokens1?.length) {
      tokens0.forEach((token0, index) => {
        const token1 = tokens1[index];
        if (token0 && token1) {
          _infoTokens.push({
            tokens: [token0, token1],
            stakingRewardAddress: minichefContract?.address ?? '',
            version: version,
          });
        }
      });
      return _infoTokens.filter(filterPair);
    }
    return _infoTokens;
  }, [chainId, minichefContract, tokens0, tokens1, pairToFilterBy, version]);

  const _tokens = useMemo(() => (info ? info.map(({ tokens }) => tokens) : emptyArr), [info]);
  const pairs = usePairsContract(_tokens);
  // @dev: If no farms load, you likely loaded an incorrect config from doubleSideConfig.js
  // Enable this and look for an invalid pair

  const pairAddresses = useMemo(() => {
    return pairs.map(([, pair]) => pair?.liquidityToken.address);
  }, [pairs]);

  const minichefAddress = useMemo(() => [MINICHEFSPV2_ADDRESS[chainId]], [chainId]);
  const pairTotalSupplies = useMultipleContractSingleData(pairAddresses, ERC20_INTERFACE, 'totalSupply');
  const balances = useMultipleContractSingleData(pairAddresses, ERC20_INTERFACE, 'balanceOf', minichefAddress);

  const [avaxPngPairState, avaxPngPair] = usePair(WAVAX[chainId], PNG[chainId]);

  const poolIdArray = useMemo(() => {
    if (!pairAddresses || !poolMap) return emptyArr;

    const NOT_FOUND = -1;
    const results = pairAddresses.map(address => poolMap[address ?? ''] ?? NOT_FOUND);
    if (results.some(result => result === NOT_FOUND)) return emptyArr;
    return results;
  }, [poolMap, pairAddresses]);

  const poolsIdInput = useMemo(() => {
    if (!poolIdArray) return emptyArr;
    return poolIdArray.map(pid => [pid]);
  }, [poolIdArray]);

  const poolInfos = useSingleContractMultipleData(minichefContract, 'poolInfo', poolsIdInput ?? emptyArr);

  const rewarders = useSingleContractMultipleData(minichefContract, 'rewarder', poolsIdInput ?? emptyArr);

  const userInfoInput = useMemo(() => {
    if (!poolIdArray || !account) return emptyArr;
    return poolIdArray.map(pid => [pid, account]);
  }, [poolIdArray, account]);

  const userInfos = useSingleContractMultipleData(minichefContract, 'userInfo', userInfoInput ?? emptyArr);

  const pendingRewards = useSingleContractMultipleData(minichefContract, 'pendingReward', userInfoInput ?? emptyArr);

  const rewardsAddresses = useMemo(() => {
    if ((rewarders || []).length === 0) return emptyArr;
    if (rewarders.some(item => item.loading)) return emptyArr;
    return rewarders.map(reward => reward?.result?.[0]);
  }, [rewarders]);

  const rewardTokensMultipliers = useMultipleContractSingleData(
    rewardsAddresses,
    REWARDER_VIA_MULTIPLIER_INTERFACE,
    'getRewardMultipliers',
    undefined,
  );

  //const rewardPerSeconds = useSingleCallResult(minichefContract, 'rewardPerSecond', undefined).result;
  //const totalAllocPoint = useSingleCallResult(minichefContract, 'totalAllocPoint', undefined).result;
  //const rewardsExpirations = useSingleCallResult(minichefContract, 'rewardsExpiration', undefined).result;
  const usdPriceTmp = useUSDCPrice(WAVAX[chainId]);
  const usdPrice = CHAINS[chainId]?.mainnet ? usdPriceTmp : undefined;

  const extraPendingTokensRewardsState = useGetExtraPendingRewards(rewardsAddresses, pendingRewards);

  return useMemo(() => {
    if (!chainId || !PNG[chainId]) return [];

    return pairAddresses.reduce<any[]>((memo, _pairAddress, index) => {
      const pairTotalSupplyState = pairTotalSupplies[index];
      const balanceState = balances[index];
      const poolInfo = poolInfos[index];
      const userPoolInfo = userInfos[index];
      const [pairState, pair] = pairs[index];
      const pendingRewardInfo = pendingRewards[index];
      const rewardTokensMultiplier = rewardTokensMultipliers[index];
      const rewardsAddress = rewardsAddresses[index];
      const extraPendingTokensRewardState = extraPendingTokensRewardsState[index];
      const extraPendingTokensRewards = extraPendingTokensRewardState?.result as
        | { amounts: BigNumber[]; tokens: string[] }
        | undefined;

      if (
        pairTotalSupplyState?.loading === false &&
        poolInfo?.loading === false &&
        balanceState?.loading === false &&
        pair &&
        avaxPngPair &&
        pairState !== PairState.LOADING &&
        avaxPngPairState !== PairState.LOADING &&
        //rewardPerSecond &&
        //totalAllocPoint &&
        //rewardsExpiration?.[0] &&
        extraPendingTokensRewardState?.loading === false
      ) {
        if (
          balanceState?.error ||
          pairTotalSupplyState.error ||
          pairState === PairState.INVALID ||
          pairState === PairState.NOT_EXISTS ||
          avaxPngPairState === PairState.INVALID ||
          avaxPngPairState === PairState.NOT_EXISTS
        ) {
          console.error('Failed to load staking rewards info');
          return memo;
        }
        const pid = poolMap[pair.liquidityToken.address].toString();
        // get the LP token
        const token0 = pair?.token0;
        const token1 = pair?.token1;

        const tokens = [token0, token1].sort(tokenComparator) as [Token, Token];

        const dummyPair = new Pair(new TokenAmount(tokens[0], '0'), new TokenAmount(tokens[1], '0'), chainId);
        const lpToken = dummyPair.liquidityToken;

        //const poolAllocPointAmount = new TokenAmount(lpToken, JSBI.BigInt(poolInfo?.result?.['allocPoint']));
        //const totalAllocPointAmount = new TokenAmount(lpToken, JSBI.BigInt(totalAllocPoint?.[0]));
        const rewardRatePerSecAmount = new TokenAmount(
          PNG[chainId],
          JSBI.BigInt(poolInfo?.result?.['rewardPerSecond']),
        );
        /*const poolRewardRate = new TokenAmount(
          PNG[chainId],
          JSBI.divide(JSBI.multiply(poolAllocPointAmount.raw, rewardRatePerSecAmount.raw), totalAllocPointAmount.raw),
        );*/
        const poolRewardRate = new TokenAmount(PNG[chainId], JSBI.BigInt(rewardRatePerSecAmount.raw));

        const totalRewardRatePerWeek = new TokenAmount(
          PNG[chainId],
          JSBI.multiply(poolRewardRate.raw, BIG_INT_SECONDS_IN_WEEK),
        );

        const periodFinishMs = poolInfo?.result?.['rewardsExpiration']?.mul(1000)?.toNumber();
        // periodFinish will be 0 immediately after a reward contract is initialized
        const isPeriodFinished = periodFinishMs === 0 ? false : periodFinishMs < Date.now(); //|| poolAllocPointAmount.equalTo('0');

        const totalSupplyStaked = JSBI.BigInt(balanceState?.result?.[0]);
        const totalSupplyAvailable = JSBI.BigInt(pairTotalSupplyState?.result?.[0]);
        const totalStakedAmount = new TokenAmount(lpToken, JSBI.BigInt(balanceState?.result?.[0]));
        const stakedAmount = new TokenAmount(lpToken, JSBI.BigInt(userPoolInfo?.result?.['amount'] ?? 0));
        const earnedAmount = new TokenAmount(PNG[chainId], JSBI.BigInt(pendingRewardInfo?.result?.['pending'] ?? 0));
        //const multiplier = JSBI.BigInt(poolInfo?.result?.['allocPoint']);

        let totalStakedInUsd = CHAINS[(chainId as ChainId) || ChainId].mainnet
          ? new TokenAmount(DAIe[chainId], BIG_INT_ZERO)
          : undefined;
        const totalStakedInWavax = new TokenAmount(WAVAX[chainId], BIG_INT_ZERO);

        if (JSBI.equal(totalSupplyAvailable, BIG_INT_ZERO)) {
          // Default to 0 values above avoiding division by zero errors
        } else if (pair.involvesToken(DAIe[chainId])) {
          const pairValueInDAI = JSBI.multiply(pair.reserveOfToken(DAIe[chainId]).raw, BIG_INT_TWO);
          const stakedValueInDAI = JSBI.divide(JSBI.multiply(pairValueInDAI, totalSupplyStaked), totalSupplyAvailable);
          totalStakedInUsd = CHAINS[(chainId as ChainId) || ChainId].mainnet
            ? new TokenAmount(DAIe[chainId], stakedValueInDAI)
            : undefined;
        } else if (pair.involvesToken(USDCe[chainId])) {
          const pairValueInUSDC = JSBI.multiply(pair.reserveOfToken(USDCe[chainId]).raw, BIG_INT_TWO);
          const stakedValueInUSDC = JSBI.divide(
            JSBI.multiply(pairValueInUSDC, totalSupplyStaked),
            totalSupplyAvailable,
          );
          totalStakedInUsd = CHAINS[(chainId as ChainId) || ChainId].mainnet
            ? new TokenAmount(USDCe[chainId], stakedValueInUSDC)
            : undefined;
        } else if (pair.involvesToken(USDCN[chainId])) {
          const pairValueInUSDC = JSBI.multiply(pair.reserveOfToken(USDCN[chainId]).raw, BIG_INT_TWO);
          const stakedValueInUSDC = JSBI.divide(
            JSBI.multiply(pairValueInUSDC, totalSupplyStaked),
            totalSupplyAvailable,
          );
          totalStakedInUsd = CHAINS[(chainId as ChainId) || ChainId].mainnet
            ? new TokenAmount(USDCN[chainId], stakedValueInUSDC)
            : undefined;
        } else if (pair.involvesToken(USDTe[chainId])) {
          const pairValueInUSDT = JSBI.multiply(pair.reserveOfToken(USDTe[chainId]).raw, BIG_INT_TWO);
          const stakedValueInUSDT = JSBI.divide(
            JSBI.multiply(pairValueInUSDT, totalSupplyStaked),
            totalSupplyAvailable,
          );
          totalStakedInUsd = CHAINS[(chainId as ChainId) || ChainId].mainnet
            ? new TokenAmount(USDTe[chainId], stakedValueInUSDT)
            : undefined;
        } else if (pair.involvesToken(WAVAX[chainId])) {
          const _totalStakedInWavax = calculateTotalStakedAmountInAvax(
            totalSupplyStaked,
            totalSupplyAvailable,
            pair.reserveOfToken(WAVAX[chainId]).raw,
            chainId,
          );
          totalStakedInUsd = CHAINS[(chainId as ChainId) || ChainId].mainnet
            ? _totalStakedInWavax && (usdPrice?.quote(_totalStakedInWavax, chainId) as TokenAmount)
            : undefined;
        } else if (pair.involvesToken(PNG[chainId])) {
          const _totalStakedInWavax = calculateTotalStakedAmountInAvaxFromPng(
            totalSupplyStaked,
            totalSupplyAvailable,
            avaxPngPair.reserveOfToken(PNG[chainId]).raw,
            avaxPngPair.reserveOfToken(WAVAX[chainId]).raw,
            pair.reserveOfToken(PNG[chainId]).raw,
            chainId,
          );
          totalStakedInUsd = CHAINS[(chainId as ChainId) || ChainId].mainnet
            ? _totalStakedInWavax && (usdPrice?.quote(_totalStakedInWavax, chainId) as TokenAmount)
            : undefined;
        } else {
          // Contains no stablecoin, WAVAX, nor PNG
          console.info(`Could not identify total staked value for pair ${pair.liquidityToken.address}`);
        }

        const getHypotheticalWeeklyRewardRate = (
          _stakedAmount: TokenAmount,
          _totalStakedAmount: TokenAmount,
          _totalRewardRatePerSecond: TokenAmount,
        ): TokenAmount => {
          return new TokenAmount(
            PNG[chainId],
            JSBI.greaterThan(_totalStakedAmount.raw, JSBI.BigInt(0))
              ? JSBI.divide(
                  JSBI.multiply(
                    JSBI.multiply(_totalRewardRatePerSecond.raw, _stakedAmount.raw),
                    BIG_INT_SECONDS_IN_WEEK,
                  ),
                  _totalStakedAmount.raw,
                )
              : JSBI.BigInt(0),
          );
        };

        const userRewardRatePerWeek = getHypotheticalWeeklyRewardRate(stakedAmount, totalStakedAmount, poolRewardRate);

        const farmApr = /*farmsAprs?.[pid] ??*/ dummyApr;

        const { rewardTokensAddress, extraPendingRewards } = (extraPendingTokensRewards?.amounts ?? []).reduce(
          (memo, rewardAmount: BigNumber, index) => {
            memo.rewardTokensAddress.push(extraPendingTokensRewards?.tokens?.[index] ?? '');
            memo.extraPendingRewards.push(JSBI.BigInt(rewardAmount.toString()));
            return memo;
          },
          {
            rewardTokensAddress: [] as string[],
            extraPendingRewards: [] as JSBI[],
          },
        );

        memo.push({
          pid,
          stakingRewardAddress: MINICHEFSPV2_ADDRESS[chainId] ?? '',
          tokens,
          earnedAmount,
          rewardRatePerWeek: userRewardRatePerWeek,
          totalRewardRatePerSecond: poolRewardRate,
          totalRewardRatePerWeek: totalRewardRatePerWeek,
          stakedAmount,
          totalStakedAmount,
          totalStakedInWavax,
          totalStakedInUsd: totalStakedInUsd ?? new TokenAmount(USDCN[chainId], '0'),
          //multiplier,
          periodFinish: periodFinishMs > 0 ? new Date(periodFinishMs) : undefined,
          isPeriodFinished,
          getHypotheticalWeeklyRewardRate,
          getExtraTokensWeeklyRewardRate,
          rewardTokensArray: [],
          rewardTokensAddress: rewardTokensAddress,
          rewardTokensMultiplier: [BigNumber.from(1), ...(rewardTokensMultiplier?.result?.[0] || [])],
          rewardsAddress,
          swapFeeApr: farmApr.swapFeeApr,
          stakingApr: farmApr.stakingApr,
          combinedApr: farmApr.combinedApr,
          extraPendingRewards,
        });
      }

      return memo;
    }, [] as MinichefStakingInfo[]);
  }, [
    chainId,
    PNG[chainId],
    pairTotalSupplies,
    poolInfos,
    userInfos,
    pairs,
    avaxPngPair,
    avaxPngPairState,
    //rewardPerSecond,
    //totalAllocPoint,
    pendingRewards,
    //rewardsExpiration,
    balances,
    usdPrice,
    pairAddresses,
    extraPendingTokensRewardsState,
    rewardsAddresses,
    rewardTokensMultipliers,
    poolMap,
  ]);
};

export const useMinichefSPv1StakingInfos = (version = 2, pairToFilterBy?: Pair | null): MinichefStakingInfo[] => {
  const { chainId, account } = useActiveWeb3React();

  const minichefContract = useMiniChefSPContract();
  const poolMap = useMinichefSPPools();
  const lpTokens = useMemo(() => Object.keys(poolMap), [poolMap]);

  //const pids = useMemo(() => Object.values(poolMap).map((pid) => pid.toString()), [poolMap]);

  //const { data: farmsAprs } = useMichefFarmsAprs(pids);

  // if chain is not avalanche skip the first pool because it's dummyERC20
  if (chainId !== ChainId.AVALANCHE) {
    lpTokens.shift();
  }

  const emptyArr = useMemo(() => [], []);

  /*const PANGOLIN_PAIR_INTERFACE = new Interface(IPangolinPair.abi);

  const _tokens0Call = useMultipleContractSingleData(
    lpTokens,
    PANGOLIN_PAIR_INTERFACE,
    'token0',
    undefined,
    NEVER_RELOAD,
  );
  const _tokens1Call = useMultipleContractSingleData(
    lpTokens,
    PANGOLIN_PAIR_INTERFACE,
    'token1',
    undefined,
    NEVER_RELOAD,
  );

  const tokens0Adrr = useMemo(() => {
    return _tokens0Call.map((result) => {
      return result.result && result.result.length > 0 ? result.result[0] : null;
    });
  }, [_tokens0Call]);


  const tokens1Adrr = useMemo(() => {
    return _tokens1Call.map((result) => (result.result && result.result.length > 0 ? result.result[0] : null));
  }, [_tokens1Call]);

  const tokens0 = useTokensContract(tokens0Adrr);
  const tokens1 = useTokensContract(tokens1Adrr);*/

  const info = useMemo(
    () =>
      chainId
        ? (STAKING_REWARDS_SP_INFO[chainId]?.filter(stakingRewardInfo =>
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

  const _tokens = useMemo(() => (info ? info.map(({ tokens }) => tokens) : emptyArr), [emptyArr, info]);
  console.log(_tokens);
  const pairs = usePairsContract(_tokens);
  // @dev: If no farms load, you likely loaded an incorrect config from doubleSideConfig.js
  // Enable this and look for an invalid pair

  const pairAddresses = useMemo(() => {
    return pairs.map(([, pair]) => pair?.liquidityToken.address);
  }, [pairs]);
  const rewardTokensArray = useMemo(() => info.map(({ rewardTokens }) => rewardTokens), [info]);
  const minichefAddress = useMemo(() => [chainId ? MINICHEF_ADDRESS[chainId] : undefined], [chainId]);
  const pairTotalSupplies = useMultipleContractSingleData(pairAddresses, ERC20_INTERFACE, 'totalSupply');
  const balances = useMultipleContractSingleData(pairAddresses, ERC20_INTERFACE, 'balanceOf', minichefAddress);

  const [avaxPngPairState, avaxPngPair] = usePair(
    chainId ? WAVAX[chainId] : undefined,
    chainId ? PNG[chainId] : undefined,
  );

  const poolIdArray = useMemo(() => {
    if (!pairAddresses || !poolMap) return emptyArr;

    const NOT_FOUND = -1;
    const results = pairAddresses.map(address => poolMap[address ?? ''] ?? NOT_FOUND);
    if (results.some(result => result === NOT_FOUND)) return emptyArr;
    return results;
  }, [pairAddresses, poolMap, emptyArr]);

  const poolsIdInput = useMemo(() => {
    if (!poolIdArray) return emptyArr;
    return poolIdArray.map((pid: any) => [pid]);
  }, [emptyArr, poolIdArray]);

  const poolInfos = useSingleContractMultipleData(minichefContract, 'poolInfo', poolsIdInput ?? emptyArr);

  const rewarders = useSingleContractMultipleData(minichefContract, 'rewarder', poolsIdInput ?? emptyArr);

  const userInfoInput = useMemo(() => {
    if (!poolIdArray || !account) return emptyArr;
    return poolIdArray.map((pid: any) => [pid, account]);
  }, [poolIdArray, account, emptyArr]);

  const userInfos = useSingleContractMultipleData(minichefContract, 'userInfo', userInfoInput ?? emptyArr);

  const pendingRewards = useSingleContractMultipleData(minichefContract, 'pendingReward', userInfoInput ?? emptyArr);

  const rewardsAddresses = useMemo(() => {
    if ((rewarders || []).length === 0) return emptyArr;
    if (rewarders.some(item => item.loading)) return emptyArr;
    return rewarders.map(reward => reward?.result?.[0]);
  }, [emptyArr, rewarders]);

  const rewardTokensMultipliers = useMultipleContractSingleData(
    rewardsAddresses,
    REWARDER_VIA_MULTIPLIER_INTERFACE,
    'getRewardMultipliers',
    undefined,
  );

  const rewardPerSecond = useSingleCallResult(minichefContract, 'rewardPerSecond', undefined).result;
  const totalAllocPoint = useSingleCallResult(minichefContract, 'totalAllocPoint', undefined).result;
  const rewardsExpiration = useSingleCallResult(minichefContract, 'rewardsExpiration', undefined).result;
  const usdPriceTmp = useUSDCPrice(chainId ? WAVAX[chainId] : undefined);
  const usdPrice = chainId ? (CHAINS[chainId]?.mainnet ? usdPriceTmp : undefined) : undefined;

  const extraPendingTokensRewardsState = useGetExtraPendingRewards(rewardsAddresses, pendingRewards);

  return useMemo(() => {
    if (!chainId || !PNG[chainId]) return [];

    return pairAddresses.reduce<any[]>((memo, _pairAddress, index) => {
      const pairTotalSupplyState = pairTotalSupplies[index];
      const balanceState = balances[index];
      const poolInfo = poolInfos[index];
      const rewardTokenArray = rewardTokensArray[index];
      const userPoolInfo = userInfos[index];
      const [pairState, pair] = pairs[index];
      const pendingRewardInfo = pendingRewards[index];
      const rewardTokensMultiplier = rewardTokensMultipliers[index];
      const rewardsAddress = rewardsAddresses[index];
      const extraPendingTokensRewardState = extraPendingTokensRewardsState[index];
      const extraPendingTokensRewards = extraPendingTokensRewardState?.result as
        | { amounts: BigNumber[]; tokens: string[] }
        | undefined;

      if (
        pairTotalSupplyState?.loading === false &&
        poolInfo?.loading === false &&
        balanceState?.loading === false &&
        pair &&
        avaxPngPair &&
        pairState !== PairState.LOADING &&
        avaxPngPairState !== PairState.LOADING &&
        rewardPerSecond &&
        totalAllocPoint &&
        rewardsExpiration?.[0] //&&
        // extraPendingTokensRewardState?.loading === false
      ) {
        if (
          balanceState?.error ||
          pairTotalSupplyState.error ||
          pairState === PairState.INVALID ||
          pairState === PairState.NOT_EXISTS ||
          avaxPngPairState === PairState.INVALID ||
          avaxPngPairState === PairState.NOT_EXISTS
        ) {
          console.error('Failed to load staking rewards info');
          return memo;
        }
        const pid = poolMap[pair.liquidityToken.address].toString();
        // get the LP token
        const token0 = pair?.token0;
        const token1 = pair?.token1;

        const tokens = [token0, token1].sort(tokenComparator) as [Token, Token];

        const dummyPair = new Pair(new TokenAmount(tokens[0], '0'), new TokenAmount(tokens[1], '0'), chainId);
        const lpToken = dummyPair.liquidityToken;

        const poolAllocPointAmount = new TokenAmount(lpToken, JSBI.BigInt(poolInfo?.result?.['allocPoint']));
        const totalAllocPointAmount = new TokenAmount(lpToken, JSBI.BigInt(totalAllocPoint?.[0]));
        const rewardRatePerSecAmount = new TokenAmount(PNG[chainId], JSBI.BigInt(rewardPerSecond?.[0]));
        const poolRewardRate = new TokenAmount(
          PNG[chainId],
          JSBI.divide(JSBI.multiply(poolAllocPointAmount.raw, rewardRatePerSecAmount.raw), totalAllocPointAmount.raw),
        );

        const totalRewardRatePerWeek = new TokenAmount(
          PNG[chainId],
          JSBI.multiply(poolRewardRate.raw, BIG_INT_SECONDS_IN_WEEK),
        );

        const periodFinishMs = rewardsExpiration?.[0]?.mul(1000)?.toNumber();
        // periodFinish will be 0 immediately after a reward contract is initialized
        const isPeriodFinished =
          periodFinishMs === 0 ? false : periodFinishMs < Date.now() || poolAllocPointAmount.equalTo('0');

        const totalSupplyStaked = JSBI.BigInt(balanceState?.result?.[0]);
        const totalSupplyAvailable = JSBI.BigInt(pairTotalSupplyState?.result?.[0]);
        const totalStakedAmount = new TokenAmount(lpToken, JSBI.BigInt(balanceState?.result?.[0]));
        const stakedAmount = new TokenAmount(lpToken, JSBI.BigInt(userPoolInfo?.result?.['amount'] ?? 0));
        const earnedAmount = new TokenAmount(PNG[chainId], JSBI.BigInt(pendingRewardInfo?.result?.['pending'] ?? 0));
        const multiplier = JSBI.BigInt(poolInfo?.result?.['allocPoint']);

        let totalStakedInUsd = CHAINS[(chainId as ChainId) || ChainId].mainnet
          ? new TokenAmount(DAIe[chainId], BIG_INT_ZERO)
          : undefined;
        const totalStakedInWavax = new TokenAmount(WAVAX[chainId], BIG_INT_ZERO);

        if (JSBI.equal(totalSupplyAvailable, BIG_INT_ZERO)) {
          // Default to 0 values above avoiding division by zero errors
        } else if (pair.involvesToken(DAIe[chainId])) {
          const pairValueInDAI = JSBI.multiply(pair.reserveOfToken(DAIe[chainId]).raw, BIG_INT_TWO);
          const stakedValueInDAI = JSBI.divide(JSBI.multiply(pairValueInDAI, totalSupplyStaked), totalSupplyAvailable);
          totalStakedInUsd = CHAINS[(chainId as ChainId) || ChainId].mainnet
            ? new TokenAmount(DAIe[chainId], stakedValueInDAI)
            : undefined;
        } else if (pair.involvesToken(USDCe[chainId])) {
          const pairValueInUSDC = JSBI.multiply(pair.reserveOfToken(USDCe[chainId]).raw, BIG_INT_TWO);
          const stakedValueInUSDC = JSBI.divide(
            JSBI.multiply(pairValueInUSDC, totalSupplyStaked),
            totalSupplyAvailable,
          );
          totalStakedInUsd = CHAINS[(chainId as ChainId) || ChainId].mainnet
            ? new TokenAmount(USDCe[chainId], stakedValueInUSDC)
            : undefined;
        } else if (pair.involvesToken(USDCN[chainId])) {
          const pairValueInUSDC = JSBI.multiply(pair.reserveOfToken(USDCN[chainId]).raw, BIG_INT_TWO);
          const stakedValueInUSDC = JSBI.divide(
            JSBI.multiply(pairValueInUSDC, totalSupplyStaked),
            totalSupplyAvailable,
          );
          totalStakedInUsd = CHAINS[(chainId as ChainId) || ChainId].mainnet
            ? new TokenAmount(USDCN[chainId], stakedValueInUSDC)
            : undefined;
        } else if (pair.involvesToken(USDTe[chainId])) {
          const pairValueInUSDT = JSBI.multiply(pair.reserveOfToken(USDTe[chainId]).raw, BIG_INT_TWO);
          const stakedValueInUSDT = JSBI.divide(
            JSBI.multiply(pairValueInUSDT, totalSupplyStaked),
            totalSupplyAvailable,
          );
          totalStakedInUsd = CHAINS[(chainId as ChainId) || ChainId].mainnet
            ? new TokenAmount(USDTe[chainId], stakedValueInUSDT)
            : undefined;
        } else if (pair.involvesToken(WAVAX[chainId])) {
          const _totalStakedInWavax = calculateTotalStakedAmountInAvax(
            totalSupplyStaked,
            totalSupplyAvailable,
            pair.reserveOfToken(WAVAX[chainId]).raw,
            chainId,
          );
          totalStakedInUsd = CHAINS[(chainId as ChainId) || ChainId].mainnet
            ? _totalStakedInWavax && (usdPrice?.quote(_totalStakedInWavax, chainId) as TokenAmount)
            : undefined;
        } else if (pair.involvesToken(PNG[chainId])) {
          const _totalStakedInWavax = calculateTotalStakedAmountInAvaxFromPng(
            totalSupplyStaked,
            totalSupplyAvailable,
            avaxPngPair.reserveOfToken(PNG[chainId]).raw,
            avaxPngPair.reserveOfToken(WAVAX[chainId]).raw,
            pair.reserveOfToken(PNG[chainId]).raw,
            chainId,
          );
          totalStakedInUsd = CHAINS[(chainId as ChainId) || ChainId].mainnet
            ? _totalStakedInWavax && (usdPrice?.quote(_totalStakedInWavax, chainId) as TokenAmount)
            : undefined;
        } else {
          // Contains no stablecoin, WAVAX, nor PNG
          console.info(`Could not identify total staked value for pair ${pair.liquidityToken.address}`);
        }

        const getHypotheticalWeeklyRewardRate = (
          _stakedAmount: TokenAmount,
          _totalStakedAmount: TokenAmount,
          _totalRewardRatePerSecond: TokenAmount,
        ): TokenAmount => {
          return new TokenAmount(
            PNG[chainId],
            JSBI.greaterThan(_totalStakedAmount.raw, JSBI.BigInt(0))
              ? JSBI.divide(
                  JSBI.multiply(
                    JSBI.multiply(_totalRewardRatePerSecond.raw, _stakedAmount.raw),
                    BIG_INT_SECONDS_IN_WEEK,
                  ),
                  _totalStakedAmount.raw,
                )
              : JSBI.BigInt(0),
          );
        };

        const userRewardRatePerWeek = getHypotheticalWeeklyRewardRate(stakedAmount, totalStakedAmount, poolRewardRate);

        //const farmApr = farmsAprs?.[pid] ?? dummyApr;

        const { rewardTokensAddress, extraPendingRewards } = (extraPendingTokensRewards?.amounts ?? []).reduce(
          (memo, rewardAmount: BigNumber, index) => {
            memo.rewardTokensAddress.push(extraPendingTokensRewards?.tokens?.[index] ?? '');
            memo.extraPendingRewards.push(JSBI.BigInt(rewardAmount.toString()));
            return memo;
          },
          {
            rewardTokensAddress: [] as string[],
            extraPendingRewards: [] as JSBI[],
          },
        );

        memo.push({
          pid,
          stakingRewardAddress: MINICHEF_ADDRESS[chainId] ?? '',
          tokens,
          earnedAmount,
          rewardRate: userRewardRatePerWeek,
          totalRewardRate: totalRewardRatePerWeek,
          totalRewardRatePerSecond: poolRewardRate,
          totalRewardRatePerWeek: totalRewardRatePerWeek,
          stakedAmount,
          stakedAmountInAvax: stakedAmount,
          stakedAmountInUsd: stakedAmount,
          totalStakedAmount,
          totalStakedInWavax,
          totalStakedInUsd: totalStakedInUsd ?? new TokenAmount(USDCN[chainId], '0'),
          totalForAuto: 0,
          multiplier,
          periodFinish: periodFinishMs > 0 ? new Date(periodFinishMs) : undefined,
          isPeriodFinished,
          getHypotheticalRewardRate: getHypotheticalWeeklyRewardRate,
          getHypotheticalWeeklyRewardRate,
          getExtraTokensWeeklyRewardRate,
          rewardToken: PNG[ChainId.AVALANCHE],
          rewardTokensArray: rewardTokenArray,
          rewardTokensAddress,
          rewardTokensMultiplier: [BigNumber.from(1), ...(rewardTokensMultiplier?.result?.[0] || [])],
          rewardsAddress,
          //swapFeeApr: farmApr.swapFeeApr,
          //stakingApr: farmApr.stakingApr,
          //combinedApr: farmApr.combinedApr,
          extraPendingRewards,
          rewardBonus: 1,
          isSuper: false,
          rewardCNR: new TokenAmount(PNG[chainId], JSBI.BigInt(0)),
          rewardPNG: new TokenAmount(PNG[chainId], JSBI.BigInt(0)),
        });
      }

      return memo;
    }, [] as MinichefStakingInfo[]);
  }, [
    chainId,
    pairAddresses,
    pairTotalSupplies,
    balances,
    poolInfos,
    rewardTokensArray,
    userInfos,
    pairs,
    pendingRewards,
    rewardTokensMultipliers,
    rewardsAddresses,
    extraPendingTokensRewardsState,
    avaxPngPair,
    avaxPngPairState,
    rewardPerSecond,
    totalAllocPoint,
    rewardsExpiration,
    poolMap,
    usdPrice,
  ]);
};

export const useMinichefStakingInfos = (version = 2, pairToFilterBy?: Pair | null): MinichefStakingInfo[] => {
  const { chainId, account } = useActiveWeb3React();

  const minichefContract = useMiniChefContract();
  const poolMap = useMinichefPools();
  const lpTokens = useMemo(() => Object.keys(poolMap), [poolMap]);

  //const pids = useMemo(() => Object.values(poolMap).map((pid) => pid.toString()), [poolMap]);

  //const { data: farmsAprs } = useMichefFarmsAprs(pids);

  // if chain is not avalanche skip the first pool because it's dummyERC20
  if (chainId !== ChainId.AVALANCHE) {
    lpTokens.shift();
  }

  const emptyArr = useMemo(() => [], []);

  /*const PANGOLIN_PAIR_INTERFACE = new Interface(IPangolinPair.abi);

  const _tokens0Call = useMultipleContractSingleData(
    lpTokens,
    PANGOLIN_PAIR_INTERFACE,
    'token0',
    undefined,
    NEVER_RELOAD,
  );
  const _tokens1Call = useMultipleContractSingleData(
    lpTokens,
    PANGOLIN_PAIR_INTERFACE,
    'token1',
    undefined,
    NEVER_RELOAD,
  );

  const tokens0Adrr = useMemo(() => {
    return _tokens0Call.map((result) => {
      return result.result && result.result.length > 0 ? result.result[0] : null;
    });
  }, [_tokens0Call]);


  const tokens1Adrr = useMemo(() => {
    return _tokens1Call.map((result) => (result.result && result.result.length > 0 ? result.result[0] : null));
  }, [_tokens1Call]);

  const tokens0 = useTokensContract(tokens0Adrr);
  const tokens1 = useTokensContract(tokens1Adrr);*/

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

  const _tokens = useMemo(() => (info ? info.map(({ tokens }) => tokens) : emptyArr), [emptyArr, info]);
  const pairs = usePairsContract(_tokens);
  // @dev: If no farms load, you likely loaded an incorrect config from doubleSideConfig.js
  // Enable this and look for an invalid pair

  const pairAddresses = useMemo(() => {
    return pairs.map(([, pair]) => pair?.liquidityToken.address);
  }, [pairs]);
  const rewardTokensArray = useMemo(() => info.map(({ rewardTokens }) => rewardTokens), [info]);
  const minichefAddress = useMemo(() => [chainId ? MINICHEF_ADDRESS[chainId] : undefined], [chainId]);
  const pairTotalSupplies = useMultipleContractSingleData(pairAddresses, ERC20_INTERFACE, 'totalSupply');
  const balances = useMultipleContractSingleData(pairAddresses, ERC20_INTERFACE, 'balanceOf', minichefAddress);

  const [avaxPngPairState, avaxPngPair] = usePair(
    chainId ? WAVAX[chainId] : undefined,
    chainId ? PNG[chainId] : undefined,
  );

  const poolIdArray = useMemo(() => {
    if (!pairAddresses || !poolMap) return emptyArr;

    const NOT_FOUND = -1;
    const results = pairAddresses.map(address => poolMap[address ?? ''] ?? NOT_FOUND);
    if (results.some(result => result === NOT_FOUND)) return emptyArr;
    return results;
  }, [pairAddresses, poolMap, emptyArr]);

  const poolsIdInput = useMemo(() => {
    if (!poolIdArray) return emptyArr;
    return poolIdArray.map((pid: any) => [pid]);
  }, [emptyArr, poolIdArray]);

  const poolInfos = useSingleContractMultipleData(minichefContract, 'poolInfo', poolsIdInput ?? emptyArr);

  const rewarders = useSingleContractMultipleData(minichefContract, 'rewarder', poolsIdInput ?? emptyArr);

  const userInfoInput = useMemo(() => {
    if (!poolIdArray || !account) return emptyArr;
    return poolIdArray.map((pid: any) => [pid, account]);
  }, [poolIdArray, account, emptyArr]);

  const userInfos = useSingleContractMultipleData(minichefContract, 'userInfo', userInfoInput ?? emptyArr);

  const pendingRewards = useSingleContractMultipleData(minichefContract, 'pendingReward', userInfoInput ?? emptyArr);

  const rewardsAddresses = useMemo(() => {
    if ((rewarders || []).length === 0) return emptyArr;
    if (rewarders.some(item => item.loading)) return emptyArr;
    return rewarders.map(reward => reward?.result?.[0]);
  }, [emptyArr, rewarders]);

  const rewardTokensMultipliers = useMultipleContractSingleData(
    rewardsAddresses,
    REWARDER_VIA_MULTIPLIER_INTERFACE,
    'getRewardMultipliers',
    undefined,
  );

  const rewardPerSecond = useSingleCallResult(minichefContract, 'rewardPerSecond', undefined).result;
  const totalAllocPoint = useSingleCallResult(minichefContract, 'totalAllocPoint', undefined).result;
  const rewardsExpiration = useSingleCallResult(minichefContract, 'rewardsExpiration', undefined).result;
  const usdPriceTmp = useUSDCPrice(chainId ? WAVAX[chainId] : undefined);
  const usdPrice = chainId ? (CHAINS[chainId]?.mainnet ? usdPriceTmp : undefined) : undefined;

  const extraPendingTokensRewardsState = useGetExtraPendingRewards(rewardsAddresses, pendingRewards);

  return useMemo(() => {
    if (!chainId || !PNG[chainId]) return [];

    return pairAddresses.reduce<any[]>((memo, _pairAddress, index) => {
      const pairTotalSupplyState = pairTotalSupplies[index];
      const balanceState = balances[index];
      const poolInfo = poolInfos[index];
      const rewardTokenArray = rewardTokensArray[index];
      const userPoolInfo = userInfos[index];
      const [pairState, pair] = pairs[index];
      const pendingRewardInfo = pendingRewards[index];
      const rewardTokensMultiplier = rewardTokensMultipliers[index];
      const rewardsAddress = rewardsAddresses[index];
      const extraPendingTokensRewardState = extraPendingTokensRewardsState[index];
      const extraPendingTokensRewards = extraPendingTokensRewardState?.result as
        | { amounts: BigNumber[]; tokens: string[] }
        | undefined;

      if (
        pairTotalSupplyState?.loading === false &&
        poolInfo?.loading === false &&
        balanceState?.loading === false &&
        pair &&
        avaxPngPair &&
        pairState !== PairState.LOADING &&
        avaxPngPairState !== PairState.LOADING &&
        rewardPerSecond &&
        totalAllocPoint &&
        rewardsExpiration?.[0] //&&
        // extraPendingTokensRewardState?.loading === false
      ) {
        if (
          balanceState?.error ||
          pairTotalSupplyState.error ||
          pairState === PairState.INVALID ||
          pairState === PairState.NOT_EXISTS ||
          avaxPngPairState === PairState.INVALID ||
          avaxPngPairState === PairState.NOT_EXISTS
        ) {
          console.error('Failed to load staking rewards info');
          return memo;
        }
        const pid = poolMap[pair.liquidityToken.address].toString();
        // get the LP token
        const token0 = pair?.token0;
        const token1 = pair?.token1;

        const tokens = [token0, token1].sort(tokenComparator) as [Token, Token];

        const dummyPair = new Pair(new TokenAmount(tokens[0], '0'), new TokenAmount(tokens[1], '0'), chainId);
        const lpToken = dummyPair.liquidityToken;

        const poolAllocPointAmount = new TokenAmount(lpToken, JSBI.BigInt(poolInfo?.result?.['allocPoint']));
        const totalAllocPointAmount = new TokenAmount(lpToken, JSBI.BigInt(totalAllocPoint?.[0]));
        const rewardRatePerSecAmount = new TokenAmount(PNG[chainId], JSBI.BigInt(rewardPerSecond?.[0]));
        const poolRewardRate = new TokenAmount(
          PNG[chainId],
          JSBI.divide(JSBI.multiply(poolAllocPointAmount.raw, rewardRatePerSecAmount.raw), totalAllocPointAmount.raw),
        );

        const totalRewardRatePerWeek = new TokenAmount(
          PNG[chainId],
          JSBI.multiply(poolRewardRate.raw, BIG_INT_SECONDS_IN_WEEK),
        );

        const periodFinishMs = rewardsExpiration?.[0]?.mul(1000)?.toNumber();
        // periodFinish will be 0 immediately after a reward contract is initialized
        const isPeriodFinished =
          periodFinishMs === 0 ? false : periodFinishMs < Date.now() || poolAllocPointAmount.equalTo('0');

        const totalSupplyStaked = JSBI.BigInt(balanceState?.result?.[0]);
        const totalSupplyAvailable = JSBI.BigInt(pairTotalSupplyState?.result?.[0]);
        const totalStakedAmount = new TokenAmount(lpToken, JSBI.BigInt(balanceState?.result?.[0]));
        const stakedAmount = new TokenAmount(lpToken, JSBI.BigInt(userPoolInfo?.result?.['amount'] ?? 0));
        const earnedAmount = new TokenAmount(PNG[chainId], JSBI.BigInt(pendingRewardInfo?.result?.['pending'] ?? 0));
        const multiplier = JSBI.BigInt(poolInfo?.result?.['allocPoint']);

        let totalStakedInUsd = CHAINS[(chainId as ChainId) || ChainId].mainnet
          ? new TokenAmount(DAIe[chainId], BIG_INT_ZERO)
          : undefined;
        const totalStakedInWavax = new TokenAmount(WAVAX[chainId], BIG_INT_ZERO);

        if (JSBI.equal(totalSupplyAvailable, BIG_INT_ZERO)) {
          // Default to 0 values above avoiding division by zero errors
        } else if (pair.involvesToken(DAIe[chainId])) {
          const pairValueInDAI = JSBI.multiply(pair.reserveOfToken(DAIe[chainId]).raw, BIG_INT_TWO);
          const stakedValueInDAI = JSBI.divide(JSBI.multiply(pairValueInDAI, totalSupplyStaked), totalSupplyAvailable);
          totalStakedInUsd = CHAINS[(chainId as ChainId) || ChainId].mainnet
            ? new TokenAmount(DAIe[chainId], stakedValueInDAI)
            : undefined;
        } else if (pair.involvesToken(USDCe[chainId])) {
          const pairValueInUSDC = JSBI.multiply(pair.reserveOfToken(USDCe[chainId]).raw, BIG_INT_TWO);
          const stakedValueInUSDC = JSBI.divide(
            JSBI.multiply(pairValueInUSDC, totalSupplyStaked),
            totalSupplyAvailable,
          );
          totalStakedInUsd = CHAINS[(chainId as ChainId) || ChainId].mainnet
            ? new TokenAmount(USDCe[chainId], stakedValueInUSDC)
            : undefined;
        } else if (pair.involvesToken(USDCN[chainId])) {
          const pairValueInUSDC = JSBI.multiply(pair.reserveOfToken(USDCN[chainId]).raw, BIG_INT_TWO);
          const stakedValueInUSDC = JSBI.divide(
            JSBI.multiply(pairValueInUSDC, totalSupplyStaked),
            totalSupplyAvailable,
          );
          totalStakedInUsd = CHAINS[(chainId as ChainId) || ChainId].mainnet
            ? new TokenAmount(USDCN[chainId], stakedValueInUSDC)
            : undefined;
        } else if (pair.involvesToken(USDTe[chainId])) {
          const pairValueInUSDT = JSBI.multiply(pair.reserveOfToken(USDTe[chainId]).raw, BIG_INT_TWO);
          const stakedValueInUSDT = JSBI.divide(
            JSBI.multiply(pairValueInUSDT, totalSupplyStaked),
            totalSupplyAvailable,
          );
          totalStakedInUsd = CHAINS[(chainId as ChainId) || ChainId].mainnet
            ? new TokenAmount(USDTe[chainId], stakedValueInUSDT)
            : undefined;
        } else if (pair.involvesToken(WAVAX[chainId])) {
          const _totalStakedInWavax = calculateTotalStakedAmountInAvax(
            totalSupplyStaked,
            totalSupplyAvailable,
            pair.reserveOfToken(WAVAX[chainId]).raw,
            chainId,
          );
          totalStakedInUsd = CHAINS[(chainId as ChainId) || ChainId].mainnet
            ? _totalStakedInWavax && (usdPrice?.quote(_totalStakedInWavax, chainId) as TokenAmount)
            : undefined;
        } else if (pair.involvesToken(PNG[chainId])) {
          const _totalStakedInWavax = calculateTotalStakedAmountInAvaxFromPng(
            totalSupplyStaked,
            totalSupplyAvailable,
            avaxPngPair.reserveOfToken(PNG[chainId]).raw,
            avaxPngPair.reserveOfToken(WAVAX[chainId]).raw,
            pair.reserveOfToken(PNG[chainId]).raw,
            chainId,
          );
          totalStakedInUsd = CHAINS[(chainId as ChainId) || ChainId].mainnet
            ? _totalStakedInWavax && (usdPrice?.quote(_totalStakedInWavax, chainId) as TokenAmount)
            : undefined;
        } else {
          // Contains no stablecoin, WAVAX, nor PNG
          console.info(`Could not identify total staked value for pair ${pair.liquidityToken.address}`);
        }

        const getHypotheticalWeeklyRewardRate = (
          _stakedAmount: TokenAmount,
          _totalStakedAmount: TokenAmount,
          _totalRewardRatePerSecond: TokenAmount,
        ): TokenAmount => {
          return new TokenAmount(
            PNG[chainId],
            JSBI.greaterThan(_totalStakedAmount.raw, JSBI.BigInt(0))
              ? JSBI.divide(
                  JSBI.multiply(
                    JSBI.multiply(_totalRewardRatePerSecond.raw, _stakedAmount.raw),
                    BIG_INT_SECONDS_IN_WEEK,
                  ),
                  _totalStakedAmount.raw,
                )
              : JSBI.BigInt(0),
          );
        };

        const userRewardRatePerWeek = getHypotheticalWeeklyRewardRate(stakedAmount, totalStakedAmount, poolRewardRate);

        //const farmApr = farmsAprs?.[pid] ?? dummyApr;

        const { rewardTokensAddress, extraPendingRewards } = (extraPendingTokensRewards?.amounts ?? []).reduce(
          (memo, rewardAmount: BigNumber, index) => {
            memo.rewardTokensAddress.push(extraPendingTokensRewards?.tokens?.[index] ?? '');
            memo.extraPendingRewards.push(JSBI.BigInt(rewardAmount.toString()));
            return memo;
          },
          {
            rewardTokensAddress: [] as string[],
            extraPendingRewards: [] as JSBI[],
          },
        );

        memo.push({
          pid,
          stakingRewardAddress: MINICHEF_ADDRESS[chainId] ?? '',
          tokens,
          earnedAmount,
          rewardRate: userRewardRatePerWeek,
          totalRewardRate: totalRewardRatePerWeek,
          totalRewardRatePerSecond: poolRewardRate,
          totalRewardRatePerWeek: totalRewardRatePerWeek,
          stakedAmount,
          stakedAmountInAvax: stakedAmount,
          stakedAmountInUsd: stakedAmount,
          totalStakedAmount,
          totalStakedInWavax,
          totalStakedInUsd: totalStakedInUsd ?? new TokenAmount(USDCN[chainId], '0'),
          totalForAuto: 0,
          multiplier,
          periodFinish: periodFinishMs > 0 ? new Date(periodFinishMs) : undefined,
          isPeriodFinished,
          getHypotheticalRewardRate: getHypotheticalWeeklyRewardRate,
          getHypotheticalWeeklyRewardRate,
          getExtraTokensWeeklyRewardRate,
          rewardToken: PNG[ChainId.AVALANCHE],
          rewardTokensArray: rewardTokenArray,
          rewardTokensAddress,
          rewardTokensMultiplier: [BigNumber.from(1), ...(rewardTokensMultiplier?.result?.[0] || [])],
          rewardsAddress,
          //swapFeeApr: farmApr.swapFeeApr,
          //stakingApr: farmApr.stakingApr,
          //combinedApr: farmApr.combinedApr,
          extraPendingRewards,
          rewardBonus: 1,
          isSuper: false,
          rewardCNR: new TokenAmount(PNG[chainId], JSBI.BigInt(0)),
          rewardPNG: new TokenAmount(PNG[chainId], JSBI.BigInt(0)),
        });
      }

      return memo;
    }, [] as MinichefStakingInfo[]);
  }, [
    chainId,
    pairAddresses,
    pairTotalSupplies,
    balances,
    poolInfos,
    rewardTokensArray,
    userInfos,
    pairs,
    pendingRewards,
    rewardTokensMultipliers,
    rewardsAddresses,
    extraPendingTokensRewardsState,
    avaxPngPair,
    avaxPngPairState,
    rewardPerSecond,
    totalAllocPoint,
    rewardsExpiration,
    poolMap,
    usdPrice,
  ]);
};

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
