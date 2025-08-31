import { Button } from '@/components/ui/button';
import { ChainId } from '@pangolindex/sdk';
import React, { useCallback } from 'react';
import { ExternalLink as LinkIcon } from 'react-feather';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { injected } from '../../connectors';
import { SUPPORTED_WALLETS } from '../../constants';
import { useActiveWeb3React } from '../../hooks';
import { AppDispatch } from '../../state';
import { clearAllTransactions } from '../../state/transactions/actions';
import { getEtherscanLink, shortenAddress } from '../../utils';
import { Icons } from '../icons';
import Identicon from '../Identicon';
import { AutoRow } from '../Row';
import Copy from './Copy';
import Transaction from './Transaction';

const UpperSection = styled.div`
  position: relative;

  h5 {
    margin: 0;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: 400;
  }

  h5:last-child {
    margin-bottom: 0px;
  }

  h4 {
    margin-top: 0;
    font-weight: 500;
  }
`;

const AccountGroupingRow = styled.div`
  justify-content: space-between;
  align-items: center;
  font-weight: 400;

  div {
    align-items: center;
  }
`;

const LowerSection = styled.div`
  padding: 1.5rem;
  flex-grow: 1;
  overflow: auto;
  border-bottom-left-radius: 25px;
  border-bottom-right-radius: 20px;

  h5 {
    margin: 0;
    font-weight: 400;
  }
`;

const AccountControl = styled.div`
  display: flex;
  justify-content: space-between;
  min-width: 0;
  width: 100%;

  font-weight: 500;
  font-size: 1.25rem;

  a:hover {
    text-decoration: underline;
  }

  p {
    min-width: 0;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const CloseIcon = styled.div`
  position: absolute;
  right: 1rem;
  top: 14px;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`;

const WalletName = styled.div`
  width: initial;
  font-size: 0.825rem;
  font-weight: 500;
`;

const IconWrapper = styled.div<{ size?: number }>`
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  & > img,
  span {
    height: ${({ size }) => (size ? size + 'px' : '32px')};
    width: ${({ size }) => (size ? size + 'px' : '32px')};
  }
`;

function renderTransactions(transactions: string[]) {
  return transactions.map((hash, i) => {
    return <Transaction key={i} hash={hash} />;
  });
}

interface AccountDetailsProps {
  toggleWalletModal: () => void;
  pendingTransactions: string[];
  confirmedTransactions: string[];
  ENSName?: string;
  openOptions: () => void;
}

export default function AccountDetails({
  toggleWalletModal,
  pendingTransactions,
  confirmedTransactions,
  ENSName,
  openOptions,
}: AccountDetailsProps) {
  const { chainId, account, connector } = useActiveWeb3React();
  const dispatch = useDispatch<AppDispatch>();

  function formatConnectorName() {
    const { ethereum } = window;
    const isMetaMask = !!(ethereum && ethereum.isMetaMask);
    const name = Object.keys(SUPPORTED_WALLETS)
      .filter(
        k =>
          SUPPORTED_WALLETS[k].connector === connector && (connector !== injected || isMetaMask === (k === 'METAMASK')),
      )
      .map(k => SUPPORTED_WALLETS[k].name)[0];
    return <WalletName>Connected with {name}</WalletName>;
  }

  function getStatusIcon() {
    if (connector === injected) {
      return (
        <IconWrapper size={16}>
          <Identicon />
        </IconWrapper>
      );
    }
    return null;
  }

  const clearAllTransactionsCallback = useCallback(() => {
    if (chainId) dispatch(clearAllTransactions({ chainId }));
  }, [dispatch, chainId]);

  return (
    <>
      <UpperSection>
        <CloseIcon onClick={toggleWalletModal}>
          <Icons.x />
        </CloseIcon>
        <div className="px-6 py-4 bg-slate-200">Account</div>
        <div className="p-6 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            {formatConnectorName()}
            <div>
              {connector !== injected && (
                <Button size="sm" variant="destructive" onClick={() => (connector as any).close()}>
                  Disconnect
                </Button>
              )}
              <Button size="sm" onClick={() => openOptions()}>
                Change
              </Button>
            </div>
          </div>
          <AccountGroupingRow id="web3-account-identifier-row">
            <AccountControl>
              {ENSName ? (
                <>
                  <div>
                    {getStatusIcon()}
                    <p> {ENSName}</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    {getStatusIcon()}
                    <p> {account && shortenAddress(account)}</p>
                  </div>
                </>
              )}
            </AccountControl>
          </AccountGroupingRow>
          <AccountGroupingRow>
            {ENSName ? (
              <>
                <AccountControl>
                  <div>
                    {account && (
                      <Copy toCopy={account}>
                        <span style={{ marginLeft: '4px' }}>Copy Address</span>
                      </Copy>
                    )}
                    {chainId && account && (
                      <AddressLink
                        hasENS={!!ENSName}
                        isENS={true}
                        href={chainId && getEtherscanLink(chainId, ENSName, 'address')}
                      >
                        <LinkIcon size={16} />
                        <span style={{ marginLeft: '4px' }}>
                          View on the {chainId === ChainId.AVALANCHE ? 'Snowtrace' : 'Scrollscan'} Explorer
                        </span>
                      </AddressLink>
                    )}
                  </div>
                </AccountControl>
              </>
            ) : (
              <>
                <AccountControl>
                  <div>
                    {account && (
                      <Copy toCopy={account}>
                        <span style={{ marginLeft: '4px' }}>Copy Address</span>
                      </Copy>
                    )}
                    {chainId && account && (
                      <AddressLink
                        hasENS={!!ENSName}
                        isENS={false}
                        href={getEtherscanLink(chainId, account, 'address')}
                      >
                        <LinkIcon size={16} />
                        <span style={{ marginLeft: '4px' }}>
                          View on the {chainId === ChainId.AVALANCHE ? 'Snowtrace' : 'Scrollscan'} Explorer
                        </span>
                      </AddressLink>
                    )}
                  </div>
                </AccountControl>
              </>
            )}
          </AccountGroupingRow>
        </div>
      </UpperSection>
      {!!pendingTransactions.length || !!confirmedTransactions.length ? (
        <LowerSection>
          <AutoRow mb={'1rem'} style={{ justifyContent: 'space-between' }}>
            <p>Recent Transactions</p>
            <Button variant="ghost" onClick={clearAllTransactionsCallback}>
              (clear all)
            </Button>
          </AutoRow>
          {renderTransactions(pendingTransactions)}
          {renderTransactions(confirmedTransactions)}
        </LowerSection>
      ) : (
        <div className="px-6 py-4 bg-slate-100">
          <span>Your transactions will appear here...</span>
        </div>
      )}
    </>
  );
}
