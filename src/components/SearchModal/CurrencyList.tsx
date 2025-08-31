import { Loader } from '@/components/ui/loader';
import { CAVAX, ChainId, Currency, CurrencyAmount, Token, currencyEquals } from '@pangolindex/sdk';
import { CSSProperties, MutableRefObject, useCallback, useMemo } from 'react';
import { FixedSizeList } from 'react-window';
import { Text } from 'rebass';
import styled from 'styled-components';
import { useActiveWeb3React } from '../../hooks';
import { useIsUserAddedToken } from '../../hooks/Tokens';
import { WrappedTokenInfo, useSelectedTokenList } from '../../state/lists/hooks';
import { useAddUserToken, useRemoveUserAddedToken } from '../../state/user/hooks';
import { useCurrencyBalance } from '../../state/wallet/hooks';
import { isTokenOnList } from '../../utils';
import Column from '../Column';
import CurrencyLogo from '../CurrencyLogoV3';
import { RowFixed } from '../Row';
import { MouseoverTooltip } from '../Tooltip';
import { FadedSpan, MenuItem } from './styleds';
import { Icons } from '../icons';
import { Button } from '../ui/button';
import { useChainId } from '@/provider';
;

function currencyKey(currency: Currency, chainId: ChainId): string {
  return currency instanceof Token
    ? currency.address
    : currency === CAVAX[chainId]
      ? (CAVAX[chainId].symbol ?? 'AVAX')
      : '';
}

const StyledBalanceText = styled(Text)`
  white-space: nowrap;
  overflow: hidden;
  max-width: 5rem;
  text-overflow: ellipsis;
`;

const Tag = styled.div`
  font-size: 14px;
  border-radius: 4px;
  padding: 0.25rem 0.3rem 0.25rem 0.3rem;
  max-width: 6rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  justify-self: flex-end;
  margin-right: 4px;
`;

function Balance({ balance }: { balance: CurrencyAmount }) {
  return <StyledBalanceText title={balance.toExact()}>{balance.toSignificant(4)}</StyledBalanceText>;
}

const TagContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

function TokenTags({ currency }: { currency: Currency }) {
  if (!(currency instanceof WrappedTokenInfo)) {
    return <span />;
  }

  const tags = currency.tags;
  if (!tags || tags.length === 0) return <span />;

  const tag = tags[0];

  return (
    <TagContainer>
      <MouseoverTooltip text={tag.description}>
        <Tag key={tag.id}>{tag.name}</Tag>
      </MouseoverTooltip>
      {tags.length > 1 ? (
        <MouseoverTooltip
          text={tags
            .slice(1)
            .map(({ name, description }) => `${name}: ${description}`)
            .join('; \n')}
        >
          <Tag>...</Tag>
        </MouseoverTooltip>
      ) : null}
    </TagContainer>
  );
}

function CurrencyRow({
  currency,
  onSelect,
  isSelected,
  otherSelected,
  style,
}: {
  currency: Currency;
  onSelect: () => void;
  isSelected: boolean;
  otherSelected: boolean;
  style: CSSProperties;
}) {
  const { account, chainId } = useActiveWeb3React();
  const key = currencyKey(currency, chainId ?? ChainId.AVALANCHE);
  const selectedTokenList = useSelectedTokenList();
  const isOnSelectedList = isTokenOnList(selectedTokenList, currency, chainId ?? ChainId.AVALANCHE);
  const customAdded = useIsUserAddedToken(currency);
  const balance = useCurrencyBalance(account ?? undefined, currency);

  //console.log(balance?.raw.toString())

  const removeToken = useRemoveUserAddedToken();
  const addToken = useAddUserToken();

  // only show add or remove buttons if not on selected list
  return (
    <MenuItem
      style={style}
      className={`token-item-${key}`}
      onClick={() => (isSelected ? null : onSelect())}
      disabled={isSelected}
      selected={otherSelected}
    >
      <CurrencyLogo currency={currency} size={24} imageSize={48} />
      <Column>
        <Text title={currency.name} fontWeight={500}>
          {currency.symbol}
        </Text>
        <FadedSpan>
          {!isOnSelectedList && customAdded ? (
            <p className="font-semibold">
              Added by user
              <Button
                variant="ghost"
                onClick={event => {
                  event.stopPropagation();
                  if (chainId && currency instanceof Token) removeToken(chainId, currency.address);
                }}
              >
                (Remove)
              </Button>
            </p>
          ) : null}
          {!isOnSelectedList && !customAdded ? (
            <p className="font-semibold">
              Found by address
              <Button
                variant="ghost"
                onClick={event => {
                  event.stopPropagation();
                  if (currency instanceof Token) addToken(currency);
                }}
              >
                (Add)
              </Button>
            </p>
          ) : null}
        </FadedSpan>
      </Column>
      <TokenTags currency={currency} />
      <RowFixed style={{ justifySelf: 'flex-end' }}>
        {balance ? <Balance balance={balance} /> : account ? <Icons.loader className="size-4 animate-spin" /> : null}
      </RowFixed>
    </MenuItem>
  );
}

export default function CurrencyList({
  currencies,
  selectedCurrency,
  onCurrencySelect,
  otherCurrency,
  fixedListRef,
  showETH,
}: {
  currencies: Currency[];
  selectedCurrency?: Currency | null;
  onCurrencySelect: (currency: Currency) => void;
  otherCurrency?: Currency | null;
  fixedListRef?: MutableRefObject<FixedSizeList | undefined>;
  showETH: boolean;
}) {
  const chainId = useChainId();
  const desiredSymbols = ['PNG', 'USDC', 'USDt', 'BTC.b', 'WETH.e', 'DAI.e'];

  const filteredItem = currencies
    .filter(item => item.symbol && desiredSymbols.includes(item.symbol))
    .sort((a, b) => desiredSymbols.indexOf(a.symbol!) - desiredSymbols.indexOf(b.symbol!));

  const sortedItem = [...currencies]
    .filter(item => !filteredItem.includes(item))
    .sort((a, b) => (a.symbol || '').localeCompare(b.symbol || ''));

  const itemData = useMemo(
    () => (showETH ? [Currency.CURRENCY[chainId ?? ChainId.AVALANCHE], ...filteredItem, ...sortedItem] : currencies),
    [chainId, currencies, filteredItem, showETH, sortedItem],
  );

  const Row = useCallback(
    ({ data, index, style }: { data: Currency[]; index: number; style: any }) => {
      const currency: Currency = data[index];
      const isSelected = Boolean(selectedCurrency && currencyEquals(selectedCurrency, currency));
      const otherSelected = Boolean(otherCurrency && currencyEquals(otherCurrency, currency));
      const handleSelect = () => onCurrencySelect(currency);
      return (
        <CurrencyRow
          style={style}
          currency={currency}
          isSelected={isSelected}
          onSelect={handleSelect}
          otherSelected={otherSelected}
        />
      );
    },
    [onCurrencySelect, otherCurrency, selectedCurrency],
  );

  const itemKey = useCallback(
    (index: number, data: any) => currencyKey(data[index], chainId ?? ChainId.AVALANCHE),
    [chainId],
  );

  return (
    <FixedSizeList
      height={400}
      width="100%"
      ref={fixedListRef as any}
      itemData={itemData}
      itemCount={itemData.length}
      itemSize={56}
      itemKey={itemKey}
    >
      {Row}
    </FixedSizeList>
  );
}
