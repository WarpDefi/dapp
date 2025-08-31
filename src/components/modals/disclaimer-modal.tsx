import { Checkbox } from '@/components/ui/checkbox';
import { Modal } from '@/components/ui/modal';
import { useCloseDisclaimerModal, useDisclaimerModal, useWalletModalToggle } from '@/state/application/hooks';
import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';

export const DisclaimerModal = () => {
  const [agree, setAgree] = useState(false);
  const isOpen = useDisclaimerModal();
  const onClose = useCloseDisclaimerModal();

  const modalClose = () => {
    onClose();
    setAgree(false);
  };

  return (
    <Modal title="Disclaimer" isOpen={isOpen} onClose={modalClose} size="lg">
      <div>
        <p>Please do your own research and consult a financial advisor before making any investment decisions.</p>
        <p>DeFi investments have seven main risk categories:</p>
        <ul>
          <li> Software Risk</li>
          <li> Counterparty Risk</li>
          <li> Token Risk</li>
          <li> Regulatory Risk</li>
          <li> Impermanent Loss</li>
          <li> Gas Fees</li>
          <li> Risk of Outsmarting Yourself</li>
        </ul>
        <h4>About stablecoins</h4>
        <p>
          The activities of stable coins listed on the Pangolin Dex are exclusive and independent. For this reason,
          Pangolin does not guarantee or make any commitments about the stability of stable coins. In case stable coins
          are depegged, all responsibility belongs to them.
        </p>
        <p>
          Before you start investing, you can access the terms of use from the link below. With your approval, you
          declare that you understand the investment risks and accept the terms
        </p>
        <Link
          target="_blank"
          className="text-primary underline font-semibold hover:text-primary/80"
          to="/legal-notices"
        >
          Legal Notices
        </Link>
        <div className="flex items-center space-x-2 py-4">
          <Checkbox id="agree" checked={agree} onCheckedChange={(checked) => setAgree(checked === true)} />
          <label
            htmlFor="agree"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I agree to all conditions
          </label>
        </div>
        <ConnectButton.Custom>
          {({ account, chain, openConnectModal, authenticationStatus, mounted }) => {
            // Note: If your app doesn't use authentication, you
            // can remove all 'authenticationStatus' checks
            const ready = mounted && authenticationStatus !== 'loading';
            const connected =
              ready && account && chain && (!authenticationStatus || authenticationStatus === 'authenticated');

            return (
              <div
                {...(!ready && {
                  'aria-hidden': true,
                  style: {
                    opacity: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  },
                })}
              >
                {(() => {
                  if (connected) return;

                  return (
                    <Button
                      disabled={!agree}
                      onClick={() => {
                        modalClose();
                        openConnectModal();
                      }}
                      type="button"
                    >
                      Connect Wallet
                    </Button>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </Modal>
  );
};
