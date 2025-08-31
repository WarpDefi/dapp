import { abi as ICanaryRouterABI } from '@canarydex/exchange-contracts/artifacts/contracts/canary-periphery/interfaces/ICanaryRouter.sol/ICanaryRouter.json'
import { getAddress } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'
import { AddressZero } from '@ethersproject/constants'
import { Contract } from '@ethersproject/contracts'
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import { CAVAX, ChainId, Currency, CurrencyAmount, JSBI, Percent, Token } from '@pangolindex/sdk'
import { clsx, type ClassValue } from "clsx"
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { twMerge } from "tailwind-merge"
import { blockClient } from '../apollo/client'
import { GET_BLOCK_AFTER, GET_BLOCK_BEFORE } from '../apollo/queries'
import { ROUTER_ADDRESS } from '../constants'
import { TokenAddressMap } from '../state/lists/hooks'

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
  try {
    return getAddress(value)
  } catch {
    return false
  }
}

export const currentTimestamp = () => new Date().getTime()

export function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined
}

/*const ETHERSCAN_PREFIXES: { [chainId in ChainId]: string } = {
  43113: 'fuji',
  43114: 'avlaanche',
  534351: 'sepolia.',
  534352: '',
  421613: ''
}*/

dayjs.extend(utc)

export function getTimestampsForChanges() {
  const utcCurrentTime = dayjs()
  const t1 = utcCurrentTime
    .subtract(1, 'day')
    .startOf('minute')
    .unix()
  const t2 = utcCurrentTime
    .subtract(2, 'day')
    .startOf('minute')
    .unix()
  const tWeek = utcCurrentTime
    .subtract(1, 'week')
    .startOf('minute')
    .unix()
  return [t1, t2, tWeek]
}

export async function getMostRecentBlockSinceTimestamp(timestamp: any, skipCount = 500) {
  let result = await blockClient.query({
    query: GET_BLOCK_AFTER,
    variables: {
      timestampFrom: timestamp
    },
    fetchPolicy: 'cache-first'
  })

  let block = result?.data?.blocks?.[0]?.number

  if (block === undefined) {
    result = await blockClient.query({
      query: GET_BLOCK_BEFORE,
      variables: {
        timestampTo: timestamp
      },
      fetchPolicy: 'cache-first'
    })
    block = result?.data?.blocks?.[0]?.number
  }

  return block
}

export function getEtherscanLink(
  chainId: ChainId,
  data: string,
  type: 'transaction' | 'token' | 'address' | 'block'
): string {
  const prefix = chainId === ChainId.AVALANCHE ? `https://snowtrace.io` : `https://snowtrace.io`

  switch (type) {
    case 'transaction': {
      return `${prefix}/tx/${data}`
    }
    case 'token': {
      return `${prefix}/token/${data}`
    }
    case 'block': {
      return `${prefix}/block/${data}`
    }
    case 'address':
    default: {
      return `${prefix}/address/${data}`
    }
  }
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address)
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
}

// add 10%
export function calculateGasMargin(value: BigNumber): BigNumber {
  return value.mul(BigNumber.from(10000).add(BigNumber.from(1000))).div(BigNumber.from(10000))
}

// converts a basis points value to a sdk percent
export function basisPointsToPercent(num: number): Percent {
  return new Percent(JSBI.BigInt(num), JSBI.BigInt(10000))
}

export function calculateSlippageAmount(value: CurrencyAmount, slippage: number): [JSBI, JSBI] {
  if (slippage < 0 || slippage > 10000) {
    throw Error(`Unexpected slippage value: ${slippage}`)
  }
  return [
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 - slippage)), JSBI.BigInt(10000)),
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 + slippage)), JSBI.BigInt(10000))
  ]
}

// account is not optional
export function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked()
}

// account is optional
export function getProviderOrSigner(library: Web3Provider, account?: string): Web3Provider | JsonRpcSigner {
  return account ? getSigner(library, account) : library
}

// account is optional
export function getContract(address: string, ABI: any, library: Web3Provider, account?: string): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return new Contract(address, ABI, getProviderOrSigner(library, account) as any)
}

// account is optional
export function getRouterContract(chainId: ChainId, library: Web3Provider, account?: string): Contract {
  return getContract(
    chainId ? ROUTER_ADDRESS[chainId] : ROUTER_ADDRESS[ChainId.AVALANCHE],
    ICanaryRouterABI,
    library,
    account
  )
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

export function isTokenOnList(defaultTokens: TokenAddressMap, currency?: Currency, chainId?: ChainId): boolean {
  if (currency === CAVAX[chainId ?? ChainId.AVALANCHE]) return true
  return Boolean(currency instanceof Token && defaultTokens[currency.chainId]?.[currency.address])
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function feeTierPercent(fee: number): string {
  return (fee / 10000).toPrecision(1) + '%'
}

const BLOCK_EXPLORER_PREFIXES: { [chainId: number]: string } = {
  [ChainId.AVALANCHE]: 'https://snowtrace.io',
}


export enum ExplorerDataType {
  TRANSACTION = 'transaction',
  TOKEN = 'token',
  ADDRESS = 'address',
  BLOCK = 'block',
  NATIVE = 'native',
}

export function getExplorerLink(chainId: number, data: string, type: ExplorerDataType): string {
  const prefix = BLOCK_EXPLORER_PREFIXES[chainId] ?? 'https://etherscan.io'

  switch (type) {
    case ExplorerDataType.TRANSACTION:
      return `${prefix}/tx/${data}`

    case ExplorerDataType.TOKEN:
      return `${prefix}/token/${data}`

    case ExplorerDataType.BLOCK:
      return `${prefix}/block/${data}`

    case ExplorerDataType.ADDRESS:
      return `${prefix}/address/${data}`
    default:
      return `${prefix}`
  }
}