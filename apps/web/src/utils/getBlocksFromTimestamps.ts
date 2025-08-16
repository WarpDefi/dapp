import { gql } from 'graphql-request'
import orderBy from 'lodash/orderBy'
import { multiChainBlocksClient, MultiChainNameExtend } from 'state/info/constant'
import { Block } from 'state/info/types'
import { multiQuery } from 'views/Info/utils/infoQueryHelpers'

const getBlockSubqueries = (timestamps: number[]) =>
  timestamps.map((timestamp) => {
    return `t${timestamp}:blocks(first: 1, orderBy: timestamp, orderDirection: desc, where: { timestamp_gt: ${timestamp}, timestamp_lt: ${
      timestamp + 600
    } }) {
      number
    }`
  })

const blocksQueryConstructor = (subqueries: string[]) => {
  return gql`query blocks {
    ${subqueries}
  }`
}

/**
 * @notice Fetches block objects for an array of timestamps.
 * @param {Array} timestamps
 * @param sortDirection The direction to sort the retrieved blocks. Defaults to 'desc'
 * @param skipCount How many subqueries to fire at a time
 * @param chainName The name of the blockchain to retrieve blocks from. Defaults to 'BSC'
 */
export const getBlocksFromTimestamps = async (
  timestamps: number[],
  sortDirection: 'asc' | 'desc' | undefined = 'desc',
  skipCount: number | undefined = 500,
  chainName: MultiChainNameExtend | undefined = 'U2U_NEBULAS',
): Promise<Block[]> => {
  if (timestamps?.length === 0) {
    return []
  }
  const fetchedData: any = await multiQuery(
    blocksQueryConstructor,
    getBlockSubqueries(timestamps),
    multiChainBlocksClient[chainName || 'U2U_NEBULAS'],
    skipCount,
  )

  const blocks: Block[] = []
  if (fetchedData) {
    // eslint-disable-next-line no-restricted-syntax
    for (const key of Object.keys(fetchedData)) {
      if (fetchedData[key].length > 0) {
        blocks.push({
          timestamp: key.split('t')[1],
          number: parseInt(fetchedData[key][0].number, 10),
        })
      }
    }
    // graphql-request does not guarantee same ordering of batched requests subqueries, hence manual sorting
    return orderBy(blocks, (block) => block.number, sortDirection)
  }
  return blocks
}
