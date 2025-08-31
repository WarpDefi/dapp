import { Currency } from '@pangolindex/sdk';
import React, { useContext } from 'react';
import { ChevronDown, RefreshCcw } from 'react-feather';
import { ThemeContext } from 'styled-components';
import { Field } from 'src/state/mint/atom';
import { ArrowWrapper, Currencies, CurrencySelectWrapper } from './styles';
import { SelectPairProps } from './types';
import CurrencyLogo from '@/components/CurrencyLogoV3';
import { useTranslation } from 'react-i18next';

const SelectPair: React.FC<SelectPairProps> = props => {
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);
  const { currency0, currency1, onTokenClick, handleToggle } = props;

  function renderCurrency(currency: Currency | undefined) {
    if (!currency) {
      return <div>{t('swapPage.selectToken')}</div>;
    }

    return (
      <>
        <CurrencyLogo size={24} currency={currency} imageSize={48} />
        <div>{currency?.symbol}</div>
      </>
    );
  }
  return (
    <div>
      <div className="flex justify-between">
        <div>{t('elixir.selectPair.title')}</div>

        {currency0 && currency1 && (
          <div className="flex justify-center items-center text-center">
            <ArrowWrapper onClick={handleToggle}>
              <RefreshCcw size="16" />
            </ArrowWrapper>
          </div>
        )}
      </div>

      <Currencies>
        <CurrencySelectWrapper
          onClick={() => {
            onTokenClick(Field.CURRENCY_A);
          }}
        >
          <div className="flex items-center">{renderCurrency(currency0)}</div>
          <ChevronDown size="16" />
        </CurrencySelectWrapper>

        <CurrencySelectWrapper
          onClick={() => {
            onTokenClick(Field.CURRENCY_B);
          }}
        >
          <div className="flex items-center">{renderCurrency(currency1)}</div>
          <ChevronDown size="16" />
        </CurrencySelectWrapper>
      </Currencies>
    </div>
  );
};

export default SelectPair;
