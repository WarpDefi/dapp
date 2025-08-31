import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'

export const client = new ApolloClient({
  link: new HttpLink({
    uri: 'http://95.179.183.92:8000/subgraphs/name/avalanche/pangolin-v2',
    //https://thegraph.com/hosted-service/subgraph/canarydeveloper/canarydex-scroll
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const clientScroll = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/canarydeveloper/canarydex-scroll',
    //https://thegraph.com/hosted-service/subgraph/canarydeveloper/canarydex-scroll
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const governanceClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.studio.thegraph.com/query/59684/avalan-pangolin-governor-alpha/version/latest'
  }),
  cache: new InMemoryCache(),
  shouldBatch: true
})

export const healthClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/index-node/graphql',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const stakingClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/way2rach/talisman',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const blockClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://gateway.thegraph.com/api/75b4f1fede4d0682187dd6a95a6212eb/subgraphs/id/9xYx6KDtoPk2jHi763nY4eayiCN2No81dudJBnMQDN2L',
  }),
  cache: new InMemoryCache(),
})

export const blockClientScroll = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/canarydeveloper/scroll-blocks',
  }),
  cache: new InMemoryCache(),
})


export const clientNFT = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/canarydeveloper/erc721',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const clientW = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/canarydeveloper/nftstake',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const clientJoePair = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/traderjoe-xyz/exchange',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const clientPngPair = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/pangolindex/exchange',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})