import { Loader } from '@/components/ui/loader';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import { darken, lighten } from 'polished';
import { useMemo } from 'react';
import { Activity } from 'react-feather';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { injected } from '../../connectors';
import { NetworkContextName } from '../../constants';
import { useOpenDisclaimerModal, useWalletModalToggle } from '../../state/application/hooks';
import { isTransactionRecent, useAllTransactions } from '../../state/transactions/hooks';
import { TransactionDetails } from '../../state/transactions/reducer';
import { shortenAddress } from '../../utils';
import { ButtonSecondary } from '../Button';
import Identicon from '../Identicon';
import { RowBetween } from '../Row';
import WalletModal from '../WalletModal';

const Web3StatusGeneric = styled(ButtonSecondary)`
  width: 100%;
  align-items: center;
  padding: 0.5rem;
  border-radius: 12px;
  cursor: pointer;
  user-select: none;
  :focus {
    outline: none;
  }
`;
const Web3StatusError = styled(Web3StatusGeneric)`
  font-weight: 500;
`;

const Web3StatusConnect = styled(Web3StatusGeneric)<{ faded?: boolean }>`
  background-color: #ffb456 !important;
  border: none !important;
  color: #fff !important;
  font-weight: 700 !important;
`;

const Web3StatusConnected = styled(Web3StatusGeneric)<{ pending?: boolean }>`
  font-weight: 700;
`;

const Text = styled.p`
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 0.5rem 0 0.25rem;
  font-size: 1rem;
  width: fit-content;
  font-weight: 500;
`;

const NetworkIcon = styled(Activity)`
  margin-left: 0.25rem;
  margin-right: 0.5rem;
  width: 16px;
  height: 16px;
`;

// we want the latest one to come first, so return negative if a is after b
function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
  return b.addedTime - a.addedTime;
}

function StatusIcon({ connector }: { connector: AbstractConnector }) {
  if (connector === injected) {
    return <Identicon />;
  }
  return null;
}

function Web3StatusInner() {
  const { t } = useTranslation();
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
    return (
      <Web3StatusConnected id="web3-status-connected" onClick={toggleWalletModal} pending={hasPendingTransactions}>
        {hasPendingTransactions ? (
          <RowBetween>
            <Text>{pending?.length} Pending</Text> <Loader stroke="white" />
          </RowBetween>
        ) : (
          <>
            <Text>{shortenAddress(account)}</Text>
          </>
        )}
        {!hasPendingTransactions && connector && <StatusIcon connector={connector} />}
      </Web3StatusConnected>
    );
  } else if (error) {
    return (
      <Web3StatusError onClick={toggleWalletModal}>
        <NetworkIcon />
        <Text>{error instanceof UnsupportedChainIdError ? 'Wrong Network' : 'Error'}</Text>
      </Web3StatusError>
    );
  } else {
    return (
      <Web3StatusConnect id="connect-wallet" onClick={onOpenDisclaimerModal} faded={!account}>
        <Text style={{ fontWeight: 700 }}>{t('Connect Wallet')}</Text>
      </Web3StatusConnect>
    );
  }
}

export default function Web3Status() {
  const { active } = useWeb3React();
  const contextNetwork = useWeb3React(NetworkContextName);

  // const allTransactions = useAllTransactions()

  // const sortedRecentTransactions = useMemo(() => {
  //   const txs = Object.values(allTransactions)
  //   return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  // }, [allTransactions])

  // const pending = sortedRecentTransactions.filter(tx => !tx.receipt).map(tx => tx.hash)
  // const confirmed = sortedRecentTransactions.filter(tx => tx.receipt).map(tx => tx.hash)

  if (!contextNetwork.active && !active) {
    return null;
  }

  return (
    <>
      <Web3StatusInner />
      {/* <WalletModal ENSName={undefined} pendingTransactions={pending} confirmedTransactions={confirmed} /> */}
      <WalletModal ENSName={undefined} />
    </>
  );
}
