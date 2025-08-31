import { useWeb3React } from '@web3-react/core';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';

// WalletConnect bağlantı durumunu kontrol eder
export function useWalletConnectStatus() {
  const { connector, account, active } = useWeb3React();
  
  const isWalletConnect = connector instanceof WalletConnectConnector;
  
  // WalletConnect ile bağlıyken account bilgisi doğru şekilde alınıyor mu?
  const walletConnectAccount = isWalletConnect && active ? account : null;
  
  console.log('[WalletConnect Debug]', {
    isWalletConnect,
    account,
    active,
    connector: connector?.constructor?.name,
    walletConnectAccount
  });
  
  return {
    isWalletConnect,
    account: isWalletConnect ? walletConnectAccount : account,
    active
  };
}

// Account değerini güvenilir şekilde alır
export function useReliableAccount() {
  const { connector, account, active } = useWeb3React();
  
  // WalletConnect için özel handling
  if (connector instanceof WalletConnectConnector && active) {
    const wcAccount = connector.walletConnectProvider?.accounts?.[0];
    console.log('[Reliable Account] WalletConnect account:', wcAccount || account);
    return wcAccount || account;
  }
  
  console.log('[Reliable Account] Regular account:', account);
  return account;
}