import CurrencyLogo from '@/components/CurrencyLogoV3';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Currency } from '@pangolindex/sdk';
import { Field } from 'src/state/mint/atom';
import { SelectPairProps } from './types';

const SelectPair = ({ currency0, currency1, onTokenClick, handleToggle }: SelectPairProps) => {
  const renderCurrency = (currency: Currency | undefined) => {
    if (!currency) {
      return 'Select token';
    }

    return (
      <div className="flex items-center">
        <CurrencyLogo size={24} currency={currency} imageSize={48} />
        <p className="!my-0 ml-2">{currency?.symbol}</p>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-2 border border-muted rounded-lg p-3 bg-slate-50 dark:bg-muted">
      <div className="flex items-center justify-between">
        <h4>Select pair</h4>
      </div>

      <div className="flex gap-4">
        <Button
          block
          className="flex items-center justify-between"
          variant="outline"
          onClick={() => {
            onTokenClick(Field.CURRENCY_A);
          }}
        >
          <div className="flex items-center">{renderCurrency(currency0)}</div>
          <Icons.chevronDown className="size-4" />
        </Button>

        {currency0 && currency1 && (
          <Button variant="outline" size="icon" className="shrink-0" onClick={handleToggle}>
            <Icons.switch className="size-4 text-primary" />
          </Button>
        )}

        <Button
          block
          className="flex items-center justify-between"
          variant="outline"
          onClick={() => {
            onTokenClick(Field.CURRENCY_B);
          }}
        >
          <div className="flex items-center">{renderCurrency(currency1)}</div>
          <Icons.chevronDown className="size-4" />
        </Button>
      </div>
    </div>
  );
};

export default SelectPair;
