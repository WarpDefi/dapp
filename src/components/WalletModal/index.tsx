import { Button } from '@/components/ui/button'
import { isTransactionRecent, useAllTransactions } from '@/state/transactions/hooks'
import { TransactionDetails } from '@/state/transactions/reducer'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { CircleArrowLeft } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import ReactGA from 'react-ga'
import styled from 'styled-components'
import MetamaskIcon from '../../assets/images/metamask.png'
import OKXWalletIcon from '../../assets/images/okxwallet.png'
import { injected } from '../../connectors'
import { SUPPORTED_WALLETS } from '../../constants'
import usePrevious from '../../hooks/usePrevious'
import { ApplicationModal } from '../../state/application/actions'
import { useModalOpen, useWalletModalToggle } from '../../state/application/hooks'
import AccountDetails from '../AccountDetails'
import { Icons } from '../icons'
import Modal from '../Modal'
import Option from './Option'
import { PendingView } from './PendingView'

const WALLET_TUTORIAL = 'https://support.metamask.io/hc/en-us/articles/360015489531-Getting-started-with-MetaMask'

const CloseIcon = styled.div`
  position: absolute;
  right: 1rem;
  top: 14px;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`

const Wrapper = styled.div`
  margin: 0;
  padding: 0;
  width: 100%;
`

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
`

const OptionGrid = styled.div`
  display: grid;
  grid-gap: 10px;
`

const WALLET_VIEWS = {
  OPTIONS: 'options',
  OPTIONS_SECONDARY: 'options_secondary',
  ACCOUNT: 'account',
  PENDING: 'pending'
}

function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
  return b.addedTime - a.addedTime
}

export default function WalletModal({ ENSName }: { ENSName?: string }) {
  // important that these are destructed from the account-specific web3-react context
  const { active, account, connector, activate, error, chainId } = useWeb3React()

  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT)

  const [pendingWallet, setPendingWallet] = useState<AbstractConnector | undefined>()

  const [pendingError, setPendingError] = useState<boolean>()

  const walletModalOpen = useModalOpen(ApplicationModal.WALLET)
  const toggleWalletModal = useWalletModalToggle()

  const previousAccount = usePrevious(account)

  const allTransactions = useAllTransactions()

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  }, [allTransactions])

  const pending = sortedRecentTransactions.filter(tx => !tx.receipt).map(tx => tx.hash)
  const confirmed = sortedRecentTransactions.filter(tx => tx.receipt).map(tx => tx.hash)

  // close on connection, when logged out before
  useEffect(() => {
    if (account && !previousAccount && walletModalOpen) {
      toggleWalletModal()
    }
  }, [account, previousAccount, toggleWalletModal, walletModalOpen])

  // always reset to account view
  useEffect(() => {
    if (walletModalOpen) {
      setPendingError(false)
      setWalletView(WALLET_VIEWS.ACCOUNT)
    }
  }, [walletModalOpen])

  // close modal when a connection is successful
  const activePrevious = usePrevious(active)
  const connectorPrevious = usePrevious(connector)

  useEffect(() => {
    if (walletModalOpen && ((active && !activePrevious) || (connector && connector !== connectorPrevious && !error))) {
      setWalletView(WALLET_VIEWS.ACCOUNT)
    }
  }, [setWalletView, active, error, connector, walletModalOpen, activePrevious, connectorPrevious])

  const tryActivation = async (connector: AbstractConnector | undefined) => {
    let name = ''
    Object.keys(SUPPORTED_WALLETS).map(key => {
      if (connector === SUPPORTED_WALLETS[key].connector) {
        return (name = SUPPORTED_WALLETS[key].name)
      }
      return true
    })
    // log selected wallet
    ReactGA.event({
      category: 'Wallet',
      action: 'Change Wallet',
      label: name
    })
    setPendingWallet(connector) // set wallet for pending view
    setWalletView(WALLET_VIEWS.PENDING)

    // if the connector is walletconnect and the user has already tried to connect, manually reset the connector
    if (connector instanceof WalletConnectConnector && connector.walletConnectProvider?.wc?.uri) {
      connector.walletConnectProvider = undefined
    }

    connector &&
      activate(connector, undefined, true).catch(error => {
        if (error instanceof UnsupportedChainIdError) {
          activate(connector) // a little janky...can't use setError because the connector isn't set
        } else {
          setPendingError(true)
        }
      })
  }

  // get wallets user can switch too, depending on device/browser
  function getOptions() {
    const isMetamask = window.ethereum && window.ethereum.isMetaMask
    const isOKXWallet = window.okxwallet && window.okxwallet.isOkxWallet
    return Object.keys(SUPPORTED_WALLETS).map(key => {
      const option = SUPPORTED_WALLETS[key]
      // check for mobile options
      if (isMobile) {
        if (!window.web3 && !window.ethereum && option.mobile) {
          return (
            <Option
              onClick={() => {
                option.connector !== connector && !option.href && tryActivation(option.connector)
              }}
              id={`connect-${key}`}
              key={key}
              active={option.connector && option.connector === connector}
              color={option.color}
              link={option.href}
              header={option.name}
              subheader={null}
              icon={`/images/${option.iconName}`}
            />
          )
        }
        return null
      }

      // overwrite injected when needed
      if (option.connector === injected) {
        // don't show injected if there's no injected provider
        if (!(window.web3 || window.ethereum)) {
          if (option.name === 'MetaMask') {
            return (
              <Option
                id={`connect-${key}`}
                key={key}
                color={'#E8831D'}
                header={'Install Metamask'}
                subheader={null}
                link={'https://metamask.io/'}
                icon={MetamaskIcon}
              />
            )
          } else if (option.name === 'OKX Wallet') {
            return (
              <Option
                id={`connect-${key}`}
                key={key}
                color={'#E8831D'}
                header={'Install OKX Wallet'}
                subheader={null}
                link={'https://www.okx.com/web3'}
                icon={OKXWalletIcon}
              />
            )
          } else {
            return null //dont want to return install twice
          }
        }
        // don't return metamask if injected provider isn't metamask
        else if (option.name === 'MetaMask' && !isMetamask) {
          return null
        } else if (option.name === 'OKX Wallet' && !isOKXWallet) {
          return null
        }
        // likewise for generic
        else if (option.name === 'Injected' && isMetamask) {
          return null
        } else if (option.name === 'Injected' && isOKXWallet) {
          return null
        }
      }

      // return rest of options
      return (
        !isMobile &&
        !option.mobileOnly && (
          <Option
            id={`connect-${key}`}
            onClick={() => {
              option.connector === connector
                ? setWalletView(WALLET_VIEWS.ACCOUNT)
                : !option.href && tryActivation(option.connector)
            }}
            key={key}
            active={option.connector === connector}
            color={option.color}
            link={option.href}
            header={option.name}
            subheader={null} //use option.descriptio to bring back multi-line
            icon={`/images/${option.iconName}`}
          />
        )
      )
    })
  }

  function switchToAvalanche() {
    const AVALANCHE_MAINNET_PARAMS = {
      chainId: '0xA86A',
      chainName: 'Avalanche Mainnet',
      nativeCurrency: {
        name: 'AVALANCHE',
        symbol: 'AVAX',
        decimals: 18
      },
      rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
      blockExplorerUrls: ['https://snowtrace.io/']
    }

    injected.getProvider().then(provider => {
      provider
        .request({
          method: 'wallet_addEthereumChain',
          params: [AVALANCHE_MAINNET_PARAMS]
        })
        .catch((error: any) => {
          console.log(error)
        })
    })
  }

  function getModalContent() {
    if (error) {
      return (
        <UpperSection>
          <CloseIcon onClick={toggleWalletModal}>
            <Icons.x />
          </CloseIcon>
          <div className="px-6 py-4 bg-slate-200">
            {error instanceof UnsupportedChainIdError ? 'Wrong Network' : 'Error connecting'}
          </div>
          <div className="p-6">
            {error instanceof UnsupportedChainIdError ? (
              <div className="flex flex-col space-y-2">
                <h5>Please connect to the appropriate {chainId} network.</h5>
                <Button block onClick={switchToAvalanche}>
                  Switch to {chainId} Chain
                </Button>
              </div>
            ) : (
              'Error connecting. Try refreshing the page.'
            )}
          </div>
        </UpperSection>
      )
    }
    if (account && walletView === WALLET_VIEWS.ACCOUNT) {
      return (
        <AccountDetails
          toggleWalletModal={toggleWalletModal}
          pendingTransactions={pending}
          confirmedTransactions={confirmed}
          ENSName={ENSName}
          openOptions={() => setWalletView(WALLET_VIEWS.OPTIONS)}
        />
      )
    }
    return (
      <UpperSection>
        <CloseIcon onClick={toggleWalletModal}>
          <Icons.x />
        </CloseIcon>
        {walletView !== WALLET_VIEWS.ACCOUNT ? (
          <div className="px-6 py-4 bg-slate-200">
            <div
              className="inline-flex items-center space-x-2 cursor-pointer"
              onClick={() => {
                setPendingError(false)
                setWalletView(WALLET_VIEWS.ACCOUNT)
              }}
            >
              <CircleArrowLeft size={18} />
              <span>Back</span>
            </div>
          </div>
        ) : (
          <div className="px-6 py-4 bg-slate-200">
            <div className="inline-flex items-center space-x-2">Connect Wallet</div>
          </div>
        )}
        <div className="p-6 flex flex-col space-y-6">
          {walletView === WALLET_VIEWS.PENDING ? (
            <PendingView
              connector={pendingWallet}
              error={pendingError}
              setPendingError={setPendingError}
              tryActivation={tryActivation}
            />
          ) : (
            <OptionGrid>{getOptions()}</OptionGrid>
          )}
          {walletView !== WALLET_VIEWS.PENDING && (
            <div className="flex flex-col space-y-1">
              <span>New to DeFi?</span>
              <a href={WALLET_TUTORIAL}>Learn more about setting up a wallet</a>
            </div>
          )}
        </div>
      </UpperSection>
    )
  }

  return (
    <Modal isOpen={walletModalOpen} onDismiss={toggleWalletModal} minHeight={false} maxHeight={90}>
      <Wrapper>{getModalContent()}</Wrapper>
    </Modal>
  )
}
