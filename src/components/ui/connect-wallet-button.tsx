import { useOpenDisclaimerModal, useWalletModalToggle } from '@/state/application/hooks';
import { isTransactionRecent, useAllTransactions } from '@/state/transactions/hooks';
import { TransactionDetails } from '@/state/transactions/reducer';
import { shortenAddress } from '@/utils';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import React, { useMemo } from 'react';
import { Button } from './button';
import { Activity } from 'lucide-react';

const newTransactionsFirst = (a: TransactionDetails, b: TransactionDetails) => {
  return b.addedTime - a.addedTime;
};

export const ConnectWalletButton = () => {
  const { account, connector, error } = useWeb3React();

  const allTransactions = useAllTransactions();

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions);
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst);
  }, [allTransactions]);

  const pending = sortedRecentTransactions.filter(tx => !tx.receipt).map(tx => tx.hash);

  const hasPendingTransactions = !!pending.length;
  const onOpenDisclaimerModal = useOpenDisclaimerModal();
  const toggleWalletModal = useWalletModalToggle();

  if (account) {
    return hasPendingTransactions ? (
      <Button disabled>
        <span>{pending.length} Pending</span>
      </Button>
    ) : (
      <Button variant="outline" onClick={toggleWalletModal}>
        <span>{shortenAddress(account)}</span>
      </Button>
    );
  } else if (error) {
    return (
      <Button variant="destructive" className="space-x-2" onClick={toggleWalletModal}>
        <Activity size={14} />
        <span>{error instanceof UnsupportedChainIdError ? 'Wrong Network' : 'Error'}</span>
      </Button>
    );
  } else {
    return <Button onClick={onOpenDisclaimerModal}>Connect Wallet</Button>;
  }
};
