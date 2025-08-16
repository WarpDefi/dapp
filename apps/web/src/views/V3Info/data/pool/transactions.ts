import { gql, GraphQLClient } from 'graphql-request'
import { Transaction, TransactionType } from '../../types'

const POOL_TRANSACTIONS = gql`
  query transactions($address: String) {
    mints(first: 100, orderBy: timestamp, orderDirection: desc, where: { pool: $address }) {
      timestamp
      transaction {
        id
      }

      token0 {
        id
        symbol
      }
      token1 {
        id
        symbol
      }
      owner
      sender
      origin
      amount0
      amount1
      amountUSD
    }
    swaps(first: 100, orderBy: timestamp, orderDirection: desc, where: { pool: $address }) {
      timestamp
      transaction {
        id
      }
      token0 {
        id
        symbol
      }
      token1 {
        id
        symbol
      }
      origin
      amount0
      amount1
      amountUSD
    }
    burns(first: 100, orderBy: timestamp, orderDirection: desc, where: { pool: $address }) {
      timestamp
      transaction {
        id
      }
      token0 {
        id
        symbol
      }
      token1 {
        id
        symbol
      }
      owner
      origin
      amount0
      amount1
      amountUSD
    }
  }
`

const TRANSACTIONS_WITH_PAIR = gql`
  query transactions($token0: String, $token1: String) {
    swaps(
      first: 100
      orderBy: timestamp
      orderDirection: desc
      where: { token0_: { id: $token0 }, token1_: { id: $token1 } }
    ) {
      timestamp
      transaction {
        id
      }
      token0 {
        id
        symbol
      }
      token1 {
        id
        symbol
      }
      origin
      amount0
      amount1
      amountUSD
    }
  }
`

const TRANSACTIONS_WITH_PAIR_ORIGIN = gql`
  query transactions($token0: String, $token1: String, $origin: String) {
    swaps(
      first: 100
      orderBy: timestamp
      orderDirection: desc
      where: { token0_: { id: $token0 }, token1_: { id: $token1 }, origin: $origin }
    ) {
      timestamp
      transaction {
        id
      }
      token0 {
        id
        symbol
      }
      token1 {
        id
        symbol
      }
      origin
      amount0
      amount1
      amountUSD
    }
  }
`

interface TransactionResults {
  mints: {
    timestamp: string
    transaction: {
      id: string
    }
    token0: {
      id: string
      symbol: string
    }
    token1: {
      id: string
      symbol: string
    }
    origin: string
    amount0: string
    amount1: string
    amountUSD: string
  }[]
  swaps: {
    timestamp: string
    transaction: {
      id: string
    }
    token0: {
      id: string
      symbol: string
    }
    token1: {
      id: string
      symbol: string
    }
    origin: string
    amount0: string
    amount1: string
    amountUSD: string
  }[]
  burns: {
    timestamp: string
    transaction: {
      id: string
    }
    token0: {
      id: string
      symbol: string
    }
    token1: {
      id: string
      symbol: string
    }
    owner: string
    origin: string
    amount0: string
    amount1: string
    amountUSD: string
  }[]
}

async function getTransaction(
  client: GraphQLClient,
  query: string,
  params: any,
): Promise<{ data: Transaction[] | undefined; error: boolean }> {
  try {
    const data = await client.request<TransactionResults>(query, params)

    const mints = data?.mints
      ? data?.mints?.map((m) => {
          return {
            type: TransactionType.MINT,
            hash: m.transaction.id,
            timestamp: m.timestamp,
            sender: m.origin,
            token0Symbol: m.token0.symbol,
            token1Symbol: m.token1.symbol,
            token0Address: m.token0.id,
            token1Address: m.token1.id,
            amountUSD: parseFloat(m.amountUSD),
            amountToken0: parseFloat(m.amount0),
            amountToken1: parseFloat(m.amount1),
          }
        })
      : []
    const burns = data?.burns
      ? data?.burns?.map((m) => {
          return {
            type: TransactionType.BURN,
            hash: m.transaction.id,
            timestamp: m.timestamp,
            sender: m.origin,
            token0Symbol: m.token0.symbol,
            token1Symbol: m.token1.symbol,
            token0Address: m.token0.id,
            token1Address: m.token1.id,
            amountUSD: parseFloat(m.amountUSD),
            amountToken0: parseFloat(m.amount0),
            amountToken1: parseFloat(m.amount1),
          }
        })
      : []

    const swaps = data?.swaps
      ? data?.swaps?.map((m) => {
          return {
            type: TransactionType.SWAP,
            hash: m.transaction.id,
            timestamp: m.timestamp,
            sender: m.origin,
            token0Symbol: m.token0.symbol,
            token1Symbol: m.token1.symbol,
            token0Address: m.token0.id,
            token1Address: m.token1.id,
            amountUSD: parseFloat(m.amountUSD),
            amountToken0: parseFloat(m.amount0),
            amountToken1: parseFloat(m.amount1),
          }
        })
      : []

    return { data: [...mints, ...burns, ...swaps], error: false }
  } catch (e) {
    console.error(e)
    return { data: undefined, error: true }
  }
}

export async function fetchPoolTransactions(
  address: string,
  client: GraphQLClient,
): Promise<{ data: Transaction[] | undefined; error: boolean }> {
  return getTransaction(client, POOL_TRANSACTIONS, {
    address,
  })
}

export async function fetchPoolTransactionsWithPair(
  client: GraphQLClient,
  token0: string,
  token1: string,
  origin: string | null,
): Promise<{ data: Transaction[] | undefined; error: boolean }> {
  const query = origin ? TRANSACTIONS_WITH_PAIR_ORIGIN : TRANSACTIONS_WITH_PAIR
  const params = origin ? { token0, token1, origin } : { token0, token1 }
  return getTransaction(client, query, params)
}
