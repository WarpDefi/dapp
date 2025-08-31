import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { RotateCw } from 'lucide-react';
import { injected } from '../../connectors';
import { SUPPORTED_WALLETS } from '../../constants';
import Option from './Option';

export const PendingView = ({
  connector,
  error = false,
  setPendingError,
  tryActivation,
}: {
  connector?: AbstractConnector;
  error?: boolean;
  setPendingError: (error: boolean) => void;
  tryActivation: (connector: AbstractConnector) => void;
}) => {
  const isMetamask = window?.ethereum?.isMetaMask;

  return (
    <div className="flex flex-col space-y-4">
      {error ? (
        <div className="flex flex-col space-y-2 border border-destructive p-4 rounded-md">
          <span className="font-semibold text-destructive">Error connecting!</span>
          <Button
            variant="destructive"
            className="space-x-2"
            onClick={() => {
              setPendingError(false);
              connector && tryActivation(connector);
            }}
          >
            <RotateCw size={14} />
            <span>Try Again</span>
          </Button>
        </div>
      ) : (
        <div className="flex items-center space-x-2 border rounded-md p-4">
          <Loader />
          <span>Initializing...</span>
        </div>
      )}
      {Object.keys(SUPPORTED_WALLETS).map(key => {
        const option = SUPPORTED_WALLETS[key];
        if (option.connector === connector) {
          if (option.connector === injected) {
            if (isMetamask && option.name !== 'MetaMask') {
              return null;
            }
            if (!isMetamask && option.name === 'MetaMask') {
              return null;
            }
          }
          return (
            <Option
              id={`connect-${key}`}
              key={key}
              clickable={false}
              color={option.color}
              header={option.name}
              subheader={option.description}
              icon={`/images/${option.iconName}`}
            />
          );
        }
        return null;
      })}
    </div>
  );
};
