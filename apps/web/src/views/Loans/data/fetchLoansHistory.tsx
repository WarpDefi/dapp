import { gql } from 'graphql-request'
import { loansClients } from 'utils/graphql'

export const LOANS_HISTORY = gql`
  query loanHistories($account: String!, $skip: Int, $sortField: String!, $sortDirection: String!)  {
    loanHistories(where: {user_: {id: $account}}, skip: $skip , first: 10, orderBy: $sortField
      orderDirection: $sortDirection) {
      borrowAmount
      borrowTime
      repayAmount
      repayTime
      rewardUser
      processTime
      txn
      stakeAmount
      stakeId
      type
      id
    }
  }
`



export interface HistoryItem {
  borrowAmount: any,
  borrowTime: string | number,
  repayAmount: string | number,
  repayTime: number,
  rewardUser: number,
  processTime: string | number,
  stakeAmount: any,
  txn: string,
  type: string,
  stakeId: string,
  id: string
}

export interface HistoryResponses {
  loanHistories: HistoryItem[]
}

/**
 * Fetch top addresses by volume
 */
export async function fetchLoansHistory(account: any, page: number, sortField: string, sortDirection: boolean): Promise<{
  data: HistoryItem[]
}> {
  try {
    const data = await loansClients.request<HistoryResponses>(LOANS_HISTORY, {
      client: loansClients,
      account,
      skip: (page - 1) * 10,
      sortField,
      sortDirection: sortDirection ? 'desc' : 'asc'
    })

    return {
      data: data.loanHistories
    }
  } catch (e) {
    console.error(e)
    return {
      data: [],
    }
  }
}
