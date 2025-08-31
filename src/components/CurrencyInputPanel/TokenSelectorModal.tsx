import { useTokenComparator } from '@/components/SearchModal/sorting';
import { TextInput } from '@/components/TextInput';
import { Button } from '@/components/ui/button';
import { useTokenHook } from '@/hooks/tokens/index';
import { useAllTokens } from '@/hooks/useAllTokens';
import { useChainId } from '@/provider';
import { useSelectedListInfo } from '@/state/listsV3';
import { useAddUserToken } from '@/state/userv3';
import CurrencyGrid from '@/token-drawer/components/CurrencyGrid';
import TokenListDrawer from '@/token-drawer/components/TokenListDrawer';
import { isAddress } from '@/utils';
import { filterTokenOrChain } from '@/utils/common';
import { CAVAX, ChainId, Currency, currencyEquals, Token } from '@pangolindex/sdk';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { useTranslation } from 'react-i18next';
import AutoSizer from 'react-virtualized-auto-sizer';

interface TokenSelectorModalProps {
  onCurrencySelect: (currency: Currency) => void;
  selectedCurrency?: Currency;
  otherSelectedCurrency?: Currency;
}

const currencyKey = (columnIndex: number, rowIndex: number, data: Currency[], chainId: ChainId): string => {
  const index = rowIndex * 4 + columnIndex;
  const currency = data[index];

  return currency instanceof Token
    ? currency.address
    : currency === CAVAX[chainId] && CAVAX[chainId]?.symbol
      ? (CAVAX[chainId]?.symbol as string)
      : `${rowIndex}-${columnIndex}`;
};

export const TokenSelectorModal: React.FC<TokenSelectorModalProps> = ({
  onCurrencySelect,
  selectedCurrency,
  otherSelectedCurrency,
}) => {
  const chainId = useChainId() as ChainId;
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isTokenListOpen, setIsTokenListOpen] = useState<boolean>(false);
  const [invertSearchOrder] = useState<boolean>(false);
  const { t } = useTranslation();
  const useToken = useTokenHook[chainId];
  const inputRef = useRef<HTMLInputElement>(null);

  const addToken = useAddUserToken();

  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, []);

  const allTokens = useAllTokens();
  const selectedListInfo = useSelectedListInfo();

  const isAddressSearch = isAddress(searchQuery);
  const searchToken = useToken(searchQuery);

  const tokenComparator = useTokenComparator(invertSearchOrder);

  const filteredTokens: Token[] = useMemo(() => {
    if (isAddressSearch) return searchToken ? [searchToken] : [];
    const tokens = Object.values(allTokens);
    tokens.unshift(CAVAX[chainId] as Token);
    return filterTokenOrChain(tokens, searchQuery) as Token[];
  }, [isAddressSearch, searchToken, allTokens, searchQuery, chainId]);

  const filteredSortedTokens: Token[] = useMemo(() => {
    if (searchToken) return [searchToken];
    const sorted = filteredTokens.sort(tokenComparator);
    const symbolMatch = searchQuery
      .toLowerCase()
      .split(/\s+/)
      .filter(s => s.length > 0);
    if (symbolMatch.length > 1) return sorted;

    return [
      ...(searchToken ? [searchToken] : []),
      // sort any exact symbol matches first
      ...sorted.filter(token => token.symbol?.toLowerCase() === symbolMatch[0]),
      ...sorted.filter(token => token.symbol?.toLowerCase() !== symbolMatch[0]),
    ];
  }, [filteredTokens, searchQuery, searchToken, tokenComparator]);

  const currencies = useMemo(() => {
    const currency = CAVAX[chainId];

    if (searchQuery === '') {
      // remove Currency from array and add in first position
      const _tokens = filteredSortedTokens.filter(token => token !== CAVAX[chainId]);
      return [currency, ..._tokens];
    }
    return filteredSortedTokens;
  }, [filteredSortedTokens, chainId, searchQuery]);

  const onSelect = useCallback(
    (currency: Currency) => {
      onCurrencySelect(currency);
      // workaround for now, if it's a custom token we will force add it
      if (currency instanceof Token && !allTokens[currency?.address || '']) {
        addToken(currency);
      }
    },
    [onCurrencySelect, allTokens, addToken],
  );

  const Item = useCallback(
    ({ data, columnIndex, rowIndex }: any) => {
      const index = rowIndex * 4 + columnIndex;
      const currency: Currency = data?.[index];
      const isSelected = Boolean(selectedCurrency && currencyEquals(selectedCurrency, currency));
      const otherSelected = Boolean(otherSelectedCurrency && currencyEquals(otherSelectedCurrency, currency));

      return currency ? (
        <CurrencyGrid currency={currency} isSelected={isSelected} onSelect={onSelect} otherSelected={otherSelected} />
      ) : null;
    },
    [selectedCurrency, otherSelectedCurrency, onSelect],
  );

  return (
    <div className="flex flex-col gap-4 min-h-96 max-h-full">
      {/* Search Input */}
      <div>
        <TextInput
          placeholder={t('common.search')}
          onChange={(value: any) => {
            setSearchQuery(value as string);
          }}
          value={searchQuery}
          getRef={(ref: HTMLInputElement) => ((inputRef as any).current = ref)}
          onClick={() => {
            if (isMobile) {
              inputRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        />
      </div>

      {/* Currency List */}
      <div className="flex flex-1 flex-col overflow-y-auto px-2.5 scrollbar-hide">
        {currencies.length > 0 ? (
          <AutoSizer>
            {({ height, width }) => (
              <div style={{ height, width, overflowY: 'auto', overflowX: 'hidden' }} className="grid grid-cols-4 gap-2">
                {currencies.map((currency, index) => {
                  const rowIndex = Math.floor(index / 4);
                  const columnIndex = index % 4;
                  const isSelected = Boolean(selectedCurrency && currencyEquals(selectedCurrency, currency));
                  const otherSelected = Boolean(
                    otherSelectedCurrency && currencyEquals(otherSelectedCurrency, currency),
                  );

                  return (
                    <div key={currencyKey(columnIndex, rowIndex, currencies, chainId)} style={{ height: 110 }}>
                      <CurrencyGrid
                        currency={currency}
                        isSelected={isSelected}
                        onSelect={onSelect}
                        otherSelected={otherSelected}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </AutoSizer>
        ) : (
          <div className="mt-2.5 h-full">
            <div className="text-center text-gray-600">{t('common.notFound')}</div>
          </div>
        )}
      </div>

      {/* Token List Info */}
      <div className="mt-2.5 cursor-pointer" onClick={() => setIsTokenListOpen(true)}>
        {selectedListInfo.multipleSelected ? (
          <div className="flex justify-between items-center w-full">
            <span className="text-sm text-primary">
              {selectedListInfo.selectedCount} {t('searchModal.listsSelected')}
            </span>
            <Button variant="outline">{t('searchModal.change')}</Button>
          </div>
        ) : (
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center w-full">
              <img
                className="w-6 h-6 mr-2.5"
                src={selectedListInfo?.current?.logoURI}
                alt={`${selectedListInfo?.current?.name} list logo`}
              />
              <span className="text-sm text-primary">{selectedListInfo?.current?.name}</span>
            </div>
            <Button variant="outline">{t('searchModal.change')}</Button>
          </div>
        )}
      </div>

      {/* Token List Drawer */}
      <TokenListDrawer isOpen={isTokenListOpen} onClose={() => setIsTokenListOpen(false)} />
    </div>
  );
};
