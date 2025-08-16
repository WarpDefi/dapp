import { ChainDefault } from '@pancakeswap/chains'
import { gql } from 'graphql-request'
import { Block } from 'state/info/types'
import { SUBGRAPH_START_BLOCK } from 'views/V3Info/constants'

export const getTVL = (tokenAddress: string, isV3?: boolean) => gql`
  query DerivedTokenPriceTVL {
    token(id: "${tokenAddress}") {
      totalValueLocked: ${isV3 ? 'totalValueLocked' : 'totalLiquidity'}
      }
    }
`

export const getDerivedPrices = (tokenAddress: string, blocks: Block[]) => {
  const data: Array<string> = []
  blocks.forEach((block) => {
    if(block.number >= SUBGRAPH_START_BLOCK[ChainDefault]) {
      const _sub = `
      t${block.timestamp}:token(id:"${tokenAddress}", block: { number: ${block.number}}) {
          derivedUSD
        }
      `
      data.push(_sub)
    }
  })

  return data
  // blocks.map(
  //   (block) => `
  //   t${block.timestamp}:token(id:"${tokenAddress}", block: { number: ${block.number}}) {
  //       derivedUSD
  //     }
  //   `,
  // )
}

export const getDerivedPricesQueryConstructor = (subqueries: string[]) => {
  return gql`
      query derivedTokenPriceData {
        ${subqueries}
      }
    `
}
