import { launchpadClients } from "utils/graphql"
import { Address } from "viem"
import { ICommittedItem, IHistoryTransaction, ILaunchpadDetail, ILaunchpadItem, IPagination } from "../types/LaunchpadType"

const BASE_LAUNCHPAD_URL = process.env.NEXT_PUBLIC_LAUNCHPAD_API
export const fetchListLaunchpad = async (page: number, search: string, status: string | null, address?: Address) : Promise<{data: ILaunchpadItem[], status: boolean, pagination: IPagination}> => {
	let url = `${BASE_LAUNCHPAD_URL}/launchpad?page=${page}&size=12`
	if(search?.length > 0) {
		url+= `&search=${search}`
	}
	if(status && status?.length > 0) {
		url += `&status=${status}`
	}
	if(address) {
		url += `&address=${address?.toLowerCase()}`
	}
	const response = await fetch(url)
	const data = await response.json()
	return data
}

export const fetchLaunchpadDetail = async (_contract: string) : Promise<{data: ILaunchpadDetail, status: boolean}> => {
	const response = await fetch(`${BASE_LAUNCHPAD_URL}/launchpad/${_contract}`)
	const data = await response.json()
	return data
}

const LIST_COMMITTED = `
query listCommitted($user: String!, $launchpad: String!)  {
	userCommits(
		where: {user: $user, launchpadAddress: $launchpad}, orderBy: processTime, orderDirection: asc
	) {
		id
		u2uAmount
		roundType
		roundAddress
		startCancel
    endCancel
		isClaimed
	}
}
`

const HISTORY_TRANSACTION = `
query listTransaction($user: String!, $launchpad: String!, $skip: Int)  {
	transactionHistories(
		where: {user: $user, launchpadAddress: $launchpad}, skip: $skip , first: 10, orderBy: processTime, orderDirection: desc
	) {
    processTime
		hash
    u2uAmount
    transactionType
    tokenAmount
    roundType
		roundAddress
	}
}
`

const LIST_PROJECT_BY_USER = `
query listProject($user: String!)  {
  users(where: {id: $user}) {
    projects
  }
}`

export async function fetchListCommitted(user: Address, launchpad: Address): Promise<{
  data: ICommittedItem[]
}> {
  try {
    const data = await launchpadClients.request(LIST_COMMITTED, {
      client: launchpadClients,
      user: user?.toLowerCase(),
      launchpad:  launchpad?.toLowerCase(),
      fetchPolicy: 'cache-first',
    })

    return {
      data: data.userCommits
    }
  } catch (e) {
    console.error(e)
    return {
      data: [],
    }
  }
}

export async function fetchListHistory(user: Address, launchpad: Address, page: number): Promise<{
  data: IHistoryTransaction[]
}> {
  try {
    const data = await launchpadClients.request(HISTORY_TRANSACTION, {
      client: launchpadClients,
      user: user?.toLowerCase(),
      launchpad:  launchpad?.toLowerCase(),
			skip: (page - 1) * 10,
      fetchPolicy: 'cache-first',
    })

    return {
      data: data.transactionHistories
    }
  } catch (e) {
    console.error(e)
    return {
      data: [],
    }
  }
}

export async function fetchListProjectByUser(user?: Address): Promise<{
  data: string[]
}> {
  try {
    const data = await launchpadClients.request(LIST_PROJECT_BY_USER, {
      client: launchpadClients,
      user: user?.toLowerCase()
    })

    return {
      data: data.users[0]?.projects || []
    }
  } catch (e) {
    console.error(e)
    return {
      data: [],
    }
  }
}