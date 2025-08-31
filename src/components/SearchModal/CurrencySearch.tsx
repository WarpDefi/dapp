import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { CAVAX, ChainId, Currency, Token } from '@pangolindex/sdk';
import { ChangeEvent, KeyboardEvent, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactGA from 'react-ga';
import { FixedSizeList } from 'react-window';
import { useActiveWeb3React } from '../../hooks';
import { useAllTokens, useToken } from '../../hooks/Tokens';
import { useSelectedListInfo } from '../../state/lists/hooks';
import { isAddress } from '../../utils';
import ListLogo from '../ListLogo';
import CommonBases from './CommonBases';
import CurrencyList from './CurrencyList';
import { filterTokens } from './filtering';
import SortButton from './SortButton';
import { useTokenComparator } from './sorting';
import { useChainId } from '@/provider';
;

interface CurrencySearchProps {
  isOpen: boolean;
  onDismiss: () => void;
  selectedCurrency?: Currency | null;
  onCurrencySelect: (currency: Currency) => void;
  otherSelectedCurrency?: Currency | null;
  showCommonBases?: boolean;
  onChangeList: () => void;
}

export function CurrencySearch({
  selectedCurrency,
  onCurrencySelect,
  otherSelectedCurrency,
  showCommonBases,
  onDismiss,
  isOpen,
  onChangeList,
}: CurrencySearchProps) {
  const chainId = useChainId();

  const fixedList = useRef<FixedSizeList>();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [invertSearchOrder, setInvertSearchOrder] = useState<boolean>(false);
  const allTokens = useAllTokens();

  // if they input an address, use it
  const isAddressSearch = isAddress(searchQuery);
  const searchToken = useToken(searchQuery);

  useEffect(() => {
    if (isAddressSearch) {
      ReactGA.event({
        category: 'Currency Select',
        action: 'Search by address',
        label: isAddressSearch,
      });
    }
  }, [isAddressSearch]);

  const showETH: boolean = useMemo(() => {
    const s = searchQuery.toLowerCase().trim();
    return s === '' || s === 'a' || s === 'av' || s === 'ava' || s === 'AVAX' || s === 'e' || s === 'et' || s === 'ETH';
  }, [searchQuery]);

  const tokenComparator = useTokenComparator(invertSearchOrder);

  const filteredTokens: Token[] = useMemo(() => {
    if (isAddressSearch) return searchToken ? [searchToken] : [];
    return filterTokens(Object.values(allTokens), searchQuery);
  }, [isAddressSearch, searchToken, allTokens, searchQuery]);

  const filteredSortedTokens: Token[] = useMemo(() => {
    if (searchToken) {
      return [searchToken];
    }

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

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelect(currency);
      onDismiss();
    },
    [onDismiss, onCurrencySelect],
  );

  // clear the input on open
  useEffect(() => {
    if (isOpen) setSearchQuery('');
  }, [isOpen]);

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>();

  const handleInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const checksummedInput = isAddress(value);
    setSearchQuery(checksummedInput || value);
    fixedList.current?.scrollTo(0);
  }, []);

  const handleEnter = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        const s = searchQuery.toLowerCase().trim();

        if (s === 'AVAX') {
          handleCurrencySelect(CAVAX[chainId ?? ChainId.AVALANCHE]);
        } else if (filteredSortedTokens.length > 0) {
          if (
            filteredSortedTokens[0].symbol?.toLowerCase() === searchQuery.trim().toLowerCase() ||
            filteredSortedTokens.length === 1
          ) {
            handleCurrencySelect(filteredSortedTokens[0]);
          }
        }
      }
    },
    [chainId, filteredSortedTokens, handleCurrencySelect, searchQuery],
  );

  const selectedListInfo = useSelectedListInfo();

  return (
    <div className="flex flex-col gap-4">
      <Input
        type="text"
        id="token-search-input"
        placeholder="Search name or paste address"
        value={searchQuery}
        ref={inputRef as RefObject<HTMLInputElement>}
        onChange={handleInput}
        onKeyDown={handleEnter}
      />
      {showCommonBases && (
        <CommonBases chainId={chainId} onSelect={handleCurrencySelect} selectedCurrency={selectedCurrency} />
      )}
      <Separator />
      <div className="flex items-center justify-between">
        <h4>Token Name</h4>
        <SortButton ascending={invertSearchOrder} toggleSortOrder={() => setInvertSearchOrder(iso => !iso)} />
      </div>
      <CurrencyList
        showETH={showETH}
        currencies={filteredSortedTokens}
        onCurrencySelect={handleCurrencySelect}
        otherCurrency={otherSelectedCurrency}
        selectedCurrency={selectedCurrency}
        fixedListRef={fixedList}
      />
      <Separator />
      <div className="flex items-center justify-between">
        {selectedListInfo.current ? (
          <div className="flex items-center gap-2">
            {selectedListInfo.current.logoURI ? (
              <ListLogo logoURI={selectedListInfo.current.logoURI} alt={`${selectedListInfo.current.name} list logo`} />
            ) : null}
            <small id="currency-search-selected-list-name">{selectedListInfo.current.name}</small>
          </div>
        ) : null}
        <Button variant="secondary" onClick={onChangeList} id="currency-search-change-list-button">
          {selectedListInfo.current ? 'Change' : 'Select a list'}
        </Button>
      </div>
    </div>
  );
}
