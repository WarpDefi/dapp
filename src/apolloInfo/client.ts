import { ApolloClient, InMemoryCache } from '@apollo/client'

export const healthClient = new ApolloClient({
  uri: '/graphql', // Use Vite proxy instead of direct URL
  cache: new InMemoryCache(),
})

export const blockClient = new ApolloClient({
  uri: 'https://gateway.thegraph.com/api/75b4f1fede4d0682187dd6a95a6212eb/subgraphs/id/9xYx6KDtoPk2jHi763nY4eayiCN2No81dudJBnMQDN2L',
  cache: new InMemoryCache(),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  },
})

export const client = new ApolloClient({
  uri: 'https://gateway.thegraph.com/api/75b4f1fede4d0682187dd6a95a6212eb/subgraphs/id/Fz7s5upsgHoM1mv3bxHMZkiAT6xtFXUyp5YXmHX5tq35',//'https://graph-pangolin-avalanche.canary.exchange/subgraphs/name/pangolinv3',//
  cache: new InMemoryCache({
    typePolicies: {
      Token: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false, 
      },
      Pool: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
    },
  }),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  },
})

export const avalancheClient = new ApolloClient({
  uri: 'https://gateway.thegraph.com/api/75b4f1fede4d0682187dd6a95a6212eb/subgraphs/id/Fz7s5upsgHoM1mv3bxHMZkiAT6xtFXUyp5YXmHX5tq35',//'https://graph-pangolin-avalanche.canary.exchange/subgraphs/name/pangolinv3',//
  cache: new InMemoryCache({
    typePolicies: {
      Token: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
      Pool: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
    },
  }),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  },
})

export const avalancheClient_test = new ApolloClient({
  uri: 'https://gateway.thegraph.com/api/75b4f1fede4d0682187dd6a95a6212eb/subgraphs/id/Fz7s5upsgHoM1mv3bxHMZkiAT6xtFXUyp5YXmHX5tq35',//'https://graph-pangolin-avalanche.canary.exchange/subgraphs/name/pangolinv3'
  cache: new InMemoryCache({
    typePolicies: {
      Token: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
      Pool: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
    },
  }),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  },
})

export const avalancheBlockClient = new ApolloClient({
  uri: 'https://gateway.thegraph.com/api/75b4f1fede4d0682187dd6a95a6212eb/subgraphs/id/9xYx6KDtoPk2jHi763nY4eayiCN2No81dudJBnMQDN2L',
  cache: new InMemoryCache(),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-first',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
  },
})

export const arbitrumClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-arbitrum-one?source=uniswap',
  cache: new InMemoryCache({
    typePolicies: {
      Token: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
      Pool: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
    },
  }),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-first',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
  },
})

export const arbitrumBlockClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-one-blocks',
  cache: new InMemoryCache(),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-first',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
  },
})

export const optimismClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/optimism-post-regenesis?source=uniswap',
  cache: new InMemoryCache({
    typePolicies: {
      Token: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
      Pool: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
    },
  }),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  },
})

export const baseClient = new ApolloClient({
  uri: 'https://api.studio.thegraph.com/query/48211/uniswap-v3-base/version/latest?source=uniswap',
  cache: new InMemoryCache({
    typePolicies: {
      Token: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
      Pool: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
    },
  }),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  },
})

export const baseBlockClient = new ApolloClient({
  uri: 'https://api.studio.thegraph.com/query/48211/base-blocks/version/latest',
  cache: new InMemoryCache(),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-first',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
  },
})

export const bscClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-bsc?source=uniswap',
  cache: new InMemoryCache({
    typePolicies: {
      Token: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
      Pool: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
    },
  }),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  },
})

export const bscBlockClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/wombat-exchange/bnb-chain-block',
  cache: new InMemoryCache(),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-first',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
  },
})

export const optimismBlockClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/uni-testing-subgraph',
  cache: new InMemoryCache(),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-first',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
  },
})

export const polygonClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon?source=uniswap',
  cache: new InMemoryCache({
    typePolicies: {
      Token: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
      Pool: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
    },
  }),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  },
})

export const polygonBlockClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/polygon-blocks',
  cache: new InMemoryCache(),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-first',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
  },
})

export const celoClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/jesse-sawa/uniswap-celo?source=uniswap',
  cache: new InMemoryCache({
    typePolicies: {
      Token: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
      Pool: {
        // Singleton types that have no identifying field can use an empty
        // array for their keyFields.
        keyFields: false,
      },
    },
  }),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  },
})

export const celoBlockClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/jesse-sawa/celo-blocks',
  cache: new InMemoryCache(),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-first',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
  },
})
