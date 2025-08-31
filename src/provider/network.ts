import { CHAINS, ChainId } from '@pangolindex/sdk';
import { NetworkConnector } from './NetworkConnector';

const urls = Object.entries(CHAINS).reduce((acc, [key, chain]) => {
    acc[key] = chain.rpc_uri;
    return acc;
  }, {} as { [x in string]: string });

export const network = new NetworkConnector({
    urls: urls,
    defaultChainId: ChainId.AVALANCHE,
  });