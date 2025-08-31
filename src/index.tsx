import { darkTheme, getDefaultConfig, lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import {
  coinbaseWallet,
  coreWallet,
  metaMaskWallet,
  okxWallet,
  rainbowWallet,
  trustWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core';
import { isMobile } from 'react-device-detect';
import { createRoot } from 'react-dom/client';
import ReactGA from 'react-ga';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import 'src/main.css';
import { WagmiProvider } from 'wagmi';
import { TooltipProvider } from './components/ui/tooltip';
import { NetworkContextName } from './constants';
import ApplicationContextProvider from './contexts/Application';
import GlobalDataContextProvider from './contexts/GlobalData';
import LocalStorageContextProvider, { Updater as LocalStorageContextUpdater } from './contexts/LocalStorage';
import PairDataContextProvider, { Updater as PairDataContextUpdater } from './contexts/PairData';
import { ButtonProvider } from "./contexts/ButtonContext";
import App from './pages/App';
import { ModalProvider } from './provider';
import { ThemeProvider } from './provider/theme-provider';
import store from './state';
import ApplicationUpdater from './state/application/updater';
import ApplicationUpdaterV3 from './state/applicationv3/updater';
import ListsUpdater from './state/lists/updater';
import ListsUpdaterV3 from './state/listsV3/updater';
import MulticallUpdater from './state/multicall/updater';
import MulticallUpdaterV3 from './state/multicallv3/updater';
import TransactionUpdater from './state/transactions/updater';
import TransactionUpdaterV3 from './state/transactionsv3/updater';
import UserUpdater from './state/user/updater';
import getLibrary from './utils/getLibrary';
import { client } from '@/apolloInfo/client';
import { ApolloProvider } from '@apollo/client/react';
import { ThemeOptions } from 'node_modules/@rainbow-me/rainbowkit/dist/themes/baseTheme';
import ApplicationUpdaterInfo from './state/applicationInfo/updater';
import PoolUpdater from './state/pools/updater';
import ProtocolUpdater from './state/protocol/updater';
import TokenUpdater from './state/tokens/updater';
import { defineChain } from 'viem';

// Custom Avalanche chain
const avalancheCustom = defineChain({
  id: 43114,
  name: 'Avalanche',
  nativeCurrency: {
    name: 'Avalanche',
    symbol: 'AVAX',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://api.avax.network/ext/bc/C/rpc'],
    },
    public: {
      http: ['https://api.avax.network/ext/bc/C/rpc'],
    },
  },
  blockExplorers: {
    default: { name: 'SnowTrace', url: 'https://snowtrace.io' },
  },
});

const wagmiConfig = getDefaultConfig({
  appName: 'pangolin',
  projectId: import.meta.env.VITE_APP_RAINBOW_PROJECT_ID,
  chains: [avalancheCustom],
  wallets: [
    {
      groupName: 'Recommended',
      wallets: [metaMaskWallet, coreWallet, okxWallet, trustWallet, coinbaseWallet, rainbowWallet, walletConnectWallet],
    },
  ],
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 1000 * 60,
      refetchOnWindowFocus: false,
    },
  },
});

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName);

/*if ('ethereum' in window) {
  ;(window.ethereum as any).autoRefreshOnNetworkChange = false
}*/

const GOOGLE_ANALYTICS_ID: string | undefined = 'GTM-TBL3C8JF'; //process.env.REACT_APP_GOOGLE_ANALYTICS_ID;
if (typeof GOOGLE_ANALYTICS_ID === 'string') {
  ReactGA.initialize(GOOGLE_ANALYTICS_ID);
  ReactGA.set({
    customBrowserType: !isMobile
      ? 'desktop'
      : 'web3' in window || 'ethereum' in window
        ? 'mobileWeb3'
        : 'mobileRegular',
  });
} else {
  ReactGA.initialize('test', { testMode: true, debug: true });
}

window.addEventListener('error', error => {
  ReactGA.exception({
    description: `${error.message} @ ${error.filename}:${error.lineno}:${error.colno}`,
    fatal: true,
  });
});

function Updaters() {
  return (
    <>
      <LocalStorageContextUpdater />
      <PairDataContextUpdater />
      <ListsUpdater />
      <ListsUpdaterV3 />
      <UserUpdater />
      <ApplicationUpdater />
      <ApplicationUpdaterV3 />
      <TransactionUpdater />
      <TransactionUpdaterV3 />
      <MulticallUpdater />
      <MulticallUpdaterV3 />
      <ProtocolUpdater />
      <TokenUpdater />
      <PoolUpdater />
      <ApplicationUpdaterInfo />
    </>
  );
}

const rainbowCustomTheme: ThemeOptions = {
  overlayBlur: 'small',
  accentColor: '#ffb357',
  accentColorForeground: '#422006',
};

const root = document.getElementById('root') as HTMLElement;

createRoot(root).render(
  <ButtonProvider>
  <BrowserRouter>
    <ThemeProvider defaultTheme="system" storageKey="pangolin-theme">
      <LocalStorageContextProvider>
        <GlobalDataContextProvider>
          <PairDataContextProvider>
            <ApplicationContextProvider>
              <Web3ReactProvider getLibrary={getLibrary}>
                <Web3ProviderNetwork getLibrary={getLibrary}>
                  <ApolloProvider client={client}>
                    <Provider store={store}>
                      <WagmiProvider config={wagmiConfig}>
                        <QueryClientProvider client={queryClient}>
                          <RainbowKitProvider
                            theme={
                              localStorage.getItem('pangolin-theme') === 'dark'
                                ? darkTheme(rainbowCustomTheme)
                                : lightTheme(rainbowCustomTheme)
                            }
                          >
                            <Updaters />
                            <ModalProvider />
                            <TooltipProvider delayDuration={300}>
                              <App />
                            </TooltipProvider>
                          </RainbowKitProvider>
                        </QueryClientProvider>
                      </WagmiProvider>
                    </Provider>
                  </ApolloProvider>
                </Web3ProviderNetwork>
              </Web3ReactProvider>
            </ApplicationContextProvider>
          </PairDataContextProvider>
        </GlobalDataContextProvider>
      </LocalStorageContextProvider>
    </ThemeProvider>
  </BrowserRouter>
  </ButtonProvider>,
);
