import { gql } from 'graphql-request'
import { loansClients } from 'utils/graphql'


export const LIST_BORROWING = gql`
  query listBorrowing($account: String!, $time: Int!)  {
    loans(where: {user_: {id: $account}, repayTime_gte: $time}, orderBy: repayTime, orderDirection: asc) {
      borrowAmount
      borrowTime
      id
      stakeAmount
      repayTime
      stakeId
      loanPackage {
        id
        maxBorrowRatio
        minBorrow
        period
        annualRate
        symbolTime
      }
    }
  }
`



export interface BorrowItem {
  borrowAmount: any,
  borrowTime: string | number,
  id: string | number,
  stakeAmount: any,
  repayAmount: string | number,
  repayTime: number ,
  stakeId: number | string,
  loanPackage: {
    id: string,
    maxBorrowRatio: string,
    minBorrow: string,
    period: number,
    annualRate: string,
    symbolTime: string
  }
  user: {
    id: string
  }
}

export interface BorrowResponses {
  loans: BorrowItem[]
}

/**
 * Fetch top addresses by volume
 */
export async function fetchListBorrowing(account: any): Promise<{
  data: BorrowItem[]
}> {
  try {
    const data = await loansClients.request<BorrowResponses>(LIST_BORROWING, {
      client: loansClients,
      account: account?.toLowerCase(),
      time:  Math.ceil(Date.now() / 1000),
      fetchPolicy: 'cache-first',
    })

    return {
      data: data.loans
    }
  } catch (e) {
    console.error(e)
    return {
      data: [],
    }
  }
}
