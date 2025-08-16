import { useTranslation } from '@pancakeswap/localization';
import { Currency } from '@pancakeswap/sdk';
import { FC, useCallback } from 'react';

import CurrencyInputHeader from '../../components/CurrencyInputHeader';

export const FormHeader: FC<{
  refreshDisabled: boolean
  onRefresh: () => void
  inputCurrency?: Currency
  outputCurrency?: Currency
  onCurrencySelectClick?: () => void
}> = ({ refreshDisabled, onRefresh, inputCurrency, outputCurrency, onCurrencySelectClick }) => {
  const { t } = useTranslation()

  const handleRefresh = useCallback(() => {
    if (refreshDisabled) {
      return
    }
    onRefresh()
  }, [onRefresh, refreshDisabled])

  return (
    <CurrencyInputHeader
      title={t('Trade')}
      subtitle={t('Trade tokens in an instant')}
      hasAmount={!refreshDisabled}
      onRefreshPrice={handleRefresh}
      inputCurrency={inputCurrency}
      outputCurrency={outputCurrency}
      onCurrencySelectClick={onCurrencySelectClick}
    />
  )
}
