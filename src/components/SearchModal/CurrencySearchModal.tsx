import { Modal } from '@/components/ui/modal';
import { Currency } from '@pangolindex/sdk';
import { useCallback, useEffect, useState } from 'react';
import ReactGA from 'react-ga';
import useLast from '../../hooks/useLast';
import { CurrencySearch } from './CurrencySearch';
import { ListSelect } from './ListSelect';
import QuestionHelper from '../QuestionHelper';

interface CurrencySearchModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  selectedCurrency?: Currency | null;
  onCurrencySelect: (currency: Currency) => void;
  otherSelectedCurrency?: Currency | null;
  showCommonBases?: boolean;
}

export default function CurrencySearchModal({
  isOpen,
  onDismiss,
  onCurrencySelect,
  selectedCurrency,
  otherSelectedCurrency,
  showCommonBases = false,
}: CurrencySearchModalProps) {
  const [listView, setListView] = useState<boolean>(false);
  const lastOpen = useLast(isOpen);

  useEffect(() => {
    if (isOpen && !lastOpen) {
      setListView(false);
    }
  }, [isOpen, lastOpen]);

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelect(currency);
      onDismiss();
    },
    [onDismiss, onCurrencySelect],
  );

  const handleClickChangeList = useCallback(() => {
    ReactGA.event({
      category: 'Lists',
      action: 'Change Lists',
    });
    setListView(true);
  }, []);

  const handleClickBack = useCallback(() => {
    ReactGA.event({
      category: 'Lists',
      action: 'Back',
    });
    setListView(false);
  }, []);

  //console.log(selectedCurrency)

  return (
    <Modal
      title={
        <div className="flex items-center">
          <h3>Select a token</h3>
          <QuestionHelper text="Find a token by searching for its name or symbol or by pasting its address below." />
        </div>
      }
      isOpen={isOpen}
      onClose={onDismiss}
    >
      {listView ? (
        <ListSelect onDismiss={onDismiss} onBack={handleClickBack} />
      ) : (
        <CurrencySearch
          isOpen={isOpen}
          onDismiss={onDismiss}
          onCurrencySelect={handleCurrencySelect}
          onChangeList={handleClickChangeList}
          selectedCurrency={selectedCurrency}
          otherSelectedCurrency={otherSelectedCurrency}
          showCommonBases={showCommonBases}
        />
      )}
    </Modal>
  );
}
