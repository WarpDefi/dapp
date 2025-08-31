import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useUSDCPrice } from '@/hooks/useUSDCPrice/evm';
import { cn } from '@/utils';
import { Currency, Pair } from '@pangolindex/sdk';
import { useCallback, useState } from 'react';
import styled from 'styled-components';
import { useActiveWeb3React } from '@/hooks';
import { useCurrencyBalance } from '@/state/wallet/hooks';
import { useAccount } from 'wagmi';
import CurrencyLogo from '../CurrencyLogo';
import DoubleCurrencyLogo from '../DoubleLogo';
import { NumericalInput } from '../NumericalInput';
import { TokenSelectorModal } from './TokenSelectorModal';

const InputRow = styled.div<{ selected: boolean }>`
  align-items: center;
`;

const InputPanel = styled.div<{ hideInput?: boolean }>`
  position: relative;
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '20px')};
  z-index: 1;
`;

const Container = styled.div<{ hideInput: boolean }>`
  border-radius: ${({ hideInput }) => (hideInput ? '8px' : '20px')};
`;

const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.75rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size:  ${({ active }) => (active ? '20px' : '16px')};
`;

interface CurrencyInputPanelProps {
  value: string;
  onUserInput: (value: string) => void;
  onMax?: () => void;
  onHalf?: () => void;
  showMaxButton: boolean;
  label?: string;
  onCurrencySelect?: (currency: Currency) => void;
  currency?: Currency | null;
  disableCurrencySelect?: boolean;
  hideBalance?: boolean;
  pair?: Pair | null;
  hideInput?: boolean;
  otherCurrency?: Currency | null;
  id: string;
  showCommonBases?: boolean;
  customBalanceText?: string;
}

export function CurrencyInputPanel({
  value,
  onUserInput,
  onMax,
  onHalf,
  showMaxButton,
  label = 'Input',
  onCurrencySelect,
  currency,
  disableCurrencySelect = false,
  hideBalance = false,
  pair = null, // used for double token logo
  hideInput = false,
  otherCurrency,
  id,
  showCommonBases,
  customBalanceText,
}: CurrencyInputPanelProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { account } = useActiveWeb3React();
  const { address: wagmiAccount } = useAccount();
  const finalAccount = account || wagmiAccount;
  const selectedCurrencyBalance = useCurrencyBalance(finalAccount ?? undefined, currency ?? undefined);
  const currencyPrice = useUSDCPrice(currency ?? undefined);

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false);
  }, [setModalOpen]);

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      if (onCurrencySelect) {
        onCurrencySelect(currency);
      }
      setModalOpen(false);
    },
    [onCurrencySelect, setModalOpen],
  );

  const outputPrice = (() => {
    if (!currencyPrice?.raw || !value || isNaN(Number(value))) return 0;
    const rawPrice = Number(currencyPrice.raw.toFixed(20));
    return currency?.decimals === 18 ? rawPrice * (Number(value) * 1000000000000) : rawPrice * Number(value);
  })();

  return (
    <div id={id} className="rounded-xl p-3 flex flex-col gap-2 bg-slate-50 dark:bg-backgroundSoft">
      {!hideInput && (
        <div className="flex w-full justify-between items-center">
          <p className="font-semibold text-xs">{label}</p>
          {account && (
            <p className="font-semibold text-xs cursor-pointer !m-0" onClick={onMax}>
              {!hideBalance && !!currency && selectedCurrencyBalance
                ? (customBalanceText ?? 'Balance: ') + selectedCurrencyBalance?.toSignificant(6)
                : ' -'}
            </p>
          )}
        </div>
      )}
      <div className={cn(hideInput ? 'p-0 rounded-2' : '', 'flex items-center gap-2')}>
        {!hideInput && (
          <NumericalInput
            value={value}
            onUserInput={val => {
              onUserInput(val);
            }}
          />
        )}
        <Button
          variant={!!currency ? 'outline' : 'default'}
          className="flex gap-2"
          onClick={() => {
            if (!disableCurrencySelect) {
              setModalOpen(true);
            }
          }}
        >
          {pair ? (
            <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={24} margin={true} />
          ) : currency ? (
            <CurrencyLogo currency={currency} size={24} imageSize={48} />
          ) : null}
          {pair ? (
            <StyledTokenName className="pair-name-container">
              {pair?.token0.symbol}:{pair?.token1.symbol}
            </StyledTokenName>
          ) : (
            <span className="token-symbol-container">
              {(currency && currency.symbol && currency.symbol.length > 20
                ? currency.symbol.slice(0, 4) +
                  '...' +
                  currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                : currency?.symbol) || 'Select token'}
            </span>
          )}
          {!disableCurrencySelect && <Icons.chevronDown className="size-4" />}
        </Button>
      </div>
      {!disableCurrencySelect && onCurrencySelect && (
        <Modal
          title="Select Token"
          isOpen={modalOpen}
          onClose={handleDismissSearch}
          size="lg"
          maxWidth="575px"
          maxHeight="90vh"
        >
          <TokenSelectorModal
            onCurrencySelect={handleCurrencySelect}
            selectedCurrency={currency || undefined}
            otherSelectedCurrency={otherCurrency || undefined}
          />
        </Modal>
      )}
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-400">
          ≈ {typeof value !== 'number' && isNaN(outputPrice) ? '0.000000' : outputPrice.toFixed(6)} USD
        </span>
        {account && currency && showMaxButton && label !== 'To' && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-full px-2 text-sm h-6" onClick={onHalf}>
              50%
            </Button>
            <Button variant="outline" size="sm" className="rounded-full px-2 text-sm h-6" onClick={onMax}>
              100%
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function CurrencyInputPanelV2({
  value,
  onUserInput,
  onMax,
  showMaxButton,
  label = 'Input',
  onCurrencySelect,
  currency,
  disableCurrencySelect = false,
  hideBalance = false,
  pair = null, // used for double token logo
  hideInput = false,
  otherCurrency,
  id,
  showCommonBases,
  customBalanceText,
}: CurrencyInputPanelProps) {
  const { account } = useActiveWeb3React();
  const { address: wagmiAccount } = useAccount();
  const finalAccount = account || wagmiAccount;

  return (
    <InputPanel id={id}>
      <Container hideInput={hideInput}>
        <InputRow style={hideInput ? { padding: '0', borderRadius: '8px' } : {}} selected={disableCurrencySelect}>
          {!hideInput && (
            <div className="flex items-center gap-4">
              <NumericalInput
                className="token-amount-input"
                value={value}
                onUserInput={val => {
                  onUserInput(val);
                }}
              />
              {account && currency && showMaxButton && label !== 'To' && (
                <Button variant="outline" className="text-primary hover:text-primary" onClick={onMax}>
                  MAX
                </Button>
              )}
            </div>
          )}
        </InputRow>
      </Container>
    </InputPanel>
  );
}
