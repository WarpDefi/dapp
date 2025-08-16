import { gql } from 'graphql-request'
import { loansClients } from 'utils/graphql'


export const LOANS_PACKAGES = gql`
  query loanPackages  {
    loanPackages {
      annualRate
      id
      maxBorrowRatio
      minBorrow
      period
      symbolTime
    }
  }
`

export interface LoansPackageItem {
  annualRate: string | number,
  id: string | number,
  maxBorrowRatio: string | number,
  minBorrow: string | number,
  period: string | number,
  symbolTime: string
}

export interface LoansResponses {
  loanPackages: LoansPackageItem[]
}

/**
 * Fetch top addresses by volume
 */
export async function fetchLoansPackages(): Promise<{
  data: LoansPackageItem[]
}> {
  try {
    const data = await loansClients.request<LoansResponses>(LOANS_PACKAGES, {
      client: loansClients,
      fetchPolicy: 'cache-first',
    })

    return {
      data: data.loanPackages
    }
  } catch (e) {
    console.error(e)
    return {
      data: [],
    }
  }
}
