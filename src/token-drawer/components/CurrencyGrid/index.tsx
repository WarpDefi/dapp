import CurrencyLogo from '@/components/CurrencyLogoV3';
import Loader from '@/components/Loader';
import { Button } from '@/components/ui/button';
import { useActiveWeb3React } from '@/hooks';
import { useChainId, usePangolinWeb3 } from '@/provider';
import { useCurrencyBalanceV3 } from '@/state/wallet/hooks';
import { cn } from '@/utils';
import { Currency } from '@pangolindex/sdk';
import { LoaderIcon } from 'lucide-react';
import React, { useCallback } from 'react';
import { useAccount } from 'wagmi';
interface Props {
  currency: Currency;
  onSelect: (currency: Currency) => void;
  isSelected: boolean;
  otherSelected: boolean;
}

const CurrencyGrid: React.FC<Props> = props => {
  const { currency, onSelect, isSelected, otherSelected } = props;
  const { account } = useActiveWeb3React();
  const { address: wagmiAccount } = useAccount();
  const finalAccount = account || wagmiAccount;
  const chainId = useChainId();

  const balance = useCurrencyBalanceV3(chainId, finalAccount ?? undefined, currency);

  const handleSelect = useCallback(() => {
    onSelect(currency);
  }, [onSelect, currency]);

  return (
    <div
      className={cn(
        'flex flex-col text-center rounded-lg p-4 justify-center items-center hover:bg-backgroundSoft transition-colors select-none gap-4 cursor-pointer',
        isSelected ? 'border-2 bg-secondary' : '',
        otherSelected ? 'border-2 bg-primary opacity-50' : '',
      )}
      onClick={handleSelect}
    >
      <CurrencyLogo currency={currency} size={32} imageSize={48} className="size-9" />
      <div className="flex flex-col items-center gap-1">
        <small>{currency?.symbol}</small>
        <span>{balance ? balance.toSignificant(4) : finalAccount ? <Loader /> : null}</span>
      </div>
    </div>
  );
};

export default CurrencyGrid;
