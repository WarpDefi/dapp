import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useActiveNetworkVersion } from '@/state/applicationInfo/hooks';
import { formatDollarAmount } from '@/utils/numbers';
import { getAddress } from 'ethers/lib/utils';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { TOKEN_HIDE } from '../../constants/index';
import { TokenData } from '../../state/tokens/reducer';
import { AutoColumn } from '../Column';
import CurrencyLogo from '../CurrencyLogoInfo';
import CurrencyLogoV3 from '../CurrencyLogoV3';
import Loader from '../Loader';
import { LoadingRows } from '../LoaderInfo';
import Percent from '../Percent';
import { Arrow, Break, PageButtons } from '../shared';
import { Label } from '../Text/Text';
import { Wrapper } from '../swap/styleds';
import { Token } from '@pangolindex/sdk';
import { useChainId } from '@/provider';

const ResponsiveGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  align-items: center;

  grid-template-columns: 20px 3fr repeat(4, 1fr);

  @media screen and (max-width: 900px) {
    grid-template-columns: 20px 1.5fr repeat(3, 1fr);
    & :nth-child(4) {
      display: none;
    }
  }

  @media screen and (max-width: 800px) {
    grid-template-columns: 20px 1.5fr repeat(2, 1fr);
    & :nth-child(6) {
      display: none;
    }
  }

  @media screen and (max-width: 670px) {
    grid-template-columns: repeat(2, 1fr);
    > *:first-child {
      display: none;
    }
    > *:nth-child(3) {
      display: none;
    }
  }
`;

const LinkWrapper = styled(Link)`
  text-decoration: none;
  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`;

const ResponsiveLogo = styled(CurrencyLogo)`
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  image-rendering: auto;
  
  img {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
    image-rendering: auto;
  }
  
  @media screen and (max-width: 670px) {
    width: 16px;
    height: 16px;
  }
`;

const DataRow = ({ tokenData, index }: { tokenData: TokenData; index: number }) => {
  const chainId = useChainId();
  
  // TokenData'dan Token objesi oluştur
  const token = useMemo(() => {
    try {
      return new Token(
        chainId,
        getAddress(tokenData.address),
        18, // decimals - genelde 18 kullanılır
        tokenData.symbol,
        tokenData.name
      );
    } catch {
      return undefined;
    }
  }, [chainId, tokenData.address, tokenData.symbol, tokenData.name]);

  return (
    <Wrapper>
      <ResponsiveGrid>
        <small>{index + 1}</small>
        <div className="flex items-center gap-2">
          {token ? (
            <CurrencyLogoV3 currency={token} size={24} imageSize={48} />
          ) : (
            <ResponsiveLogo address={getAddress(tokenData.address)} size={24} imageSize={48} />
          )}
          {/* <small>{tokenData.symbol}</small> */}
          <small style={{ marginLeft: '10px' }}>
            <div className="flex items-center gap-1">
              <small>{tokenData.name}</small>
              <small className="text-muted-foreground">({tokenData.symbol})</small>
            </div>
          </small>
        </div>
        <small className="text-right">{formatDollarAmount(tokenData.priceUSD)}</small>
        <small className="text-right">
          <Percent value={tokenData.priceUSDChange} />
        </small>
        <small className="text-right">{formatDollarAmount(tokenData.volumeUSD)}</small>
        <small className="text-right">{formatDollarAmount(tokenData.tvlUSD)}</small>
      </ResponsiveGrid>
    </Wrapper>
  );
};

const SORT_FIELD = {
  name: 'name',
  volumeUSD: 'volumeUSD',
  tvlUSD: 'tvlUSD',
  priceUSD: 'priceUSD',
  priceUSDChange: 'priceUSDChange',
  priceUSDChangeWeek: 'priceUSDChangeWeek',
};

const MAX_ITEMS = 10;

export default function TokenTable({
  tokenDatas,
  maxItems = MAX_ITEMS,
}: {
  tokenDatas: TokenData[] | undefined;
  maxItems?: number;
}) {
  const [currentNetwork] = useActiveNetworkVersion();

  // for sorting
  const [sortField, setSortField] = useState(SORT_FIELD.volumeUSD);
  const [sortDirection, setSortDirection] = useState<boolean>(true);

  // pagination
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);
  useEffect(() => {
    let extraPages = 1;
    if (tokenDatas) {
      if (tokenDatas.length % maxItems === 0) {
        extraPages = 0;
      }
      setMaxPage(Math.floor(tokenDatas.length / maxItems) + extraPages);
    }
  }, [maxItems, tokenDatas]);

  const sortedTokens = useMemo(() => {
    return tokenDatas
      ? tokenDatas
          .filter(x => !!x && !TOKEN_HIDE[currentNetwork.id].includes(x.address))
          .sort((a, b) => {
            if (a && b) {
              return a[sortField as keyof TokenData] > b[sortField as keyof TokenData]
                ? (sortDirection ? -1 : 1) * 1
                : (sortDirection ? -1 : 1) * -1;
            } else {
              return -1;
            }
          })
          .slice(maxItems * (page - 1), page * maxItems)
      : [];
  }, [tokenDatas, maxItems, page, currentNetwork.id, sortField, sortDirection]);

  const handleSort = useCallback(
    (newField: string) => {
      setSortField(newField);
      setSortDirection(sortField !== newField ? true : !sortDirection);
    },
    [sortDirection, sortField],
  );

  const arrow = useCallback(
    (field: string) => {
      return sortField === field ? (
        !sortDirection ? (
          <Icons.chevronUp className="size-5" />
        ) : (
          <Icons.chevronDown className="size-5" />
        )
      ) : (
        ''
      );
    },
    [sortDirection, sortField],
  );

  if (!tokenDatas) {
    return <Loader />;
  }

  return (
    <div className="bg-background p-4 md:py-4 md:px-8 rounded-xl">
      {sortedTokens.length > 0 ? (
        <AutoColumn gap="16px">
          <ResponsiveGrid>
            <Label></Label>
            <div>
              <Button variant="ghost" className="-ml-4 gap-2" onClick={() => handleSort(SORT_FIELD.name)}>
                Name {arrow(SORT_FIELD.name)}
              </Button>
            </div>
            <div className="flex justify-end">
              <Button variant="ghost" className="-mr-4 gap-2" onClick={() => handleSort(SORT_FIELD.priceUSD)}>
                Price {arrow(SORT_FIELD.priceUSD)}
              </Button>
            </div>
            <div className="flex justify-end">
              <Button variant="ghost" className="-mr-4 gap-2" onClick={() => handleSort(SORT_FIELD.priceUSDChange)}>
                Price Change {arrow(SORT_FIELD.priceUSDChange)}
              </Button>
            </div>
            {/* <ClickableText end={1} onClick={() => handleSort(SORT_FIELD.priceUSDChangeWeek)}>
            7d {arrow(SORT_FIELD.priceUSDChangeWeek)}
          </ClickableText> */}
            <div className="flex justify-end">
              <Button variant="ghost" className="-mr-4 gap-2" onClick={() => handleSort(SORT_FIELD.volumeUSD)}>
                Volume 24H {arrow(SORT_FIELD.volumeUSD)}
              </Button>
            </div>
            <div className="flex justify-end">
              <Button variant="ghost" className="-mr-4 gap-2" onClick={() => handleSort(SORT_FIELD.tvlUSD)}>
                TVL {arrow(SORT_FIELD.tvlUSD)}
              </Button>
            </div>
          </ResponsiveGrid>

          <Break />
          {sortedTokens.map((data, i) => {
            if (data) {
              return (
                <React.Fragment key={i}>
                  <DataRow index={(page - 1) * MAX_ITEMS + i} tokenData={data} />
                  <Break />
                </React.Fragment>
              );
            }
            return null;
          })}
          <PageButtons>
            <div
              onClick={() => {
                setPage(page === 1 ? page : page - 1);
              }}
            >
              <Arrow $faded={page === 1 ? true : false}>←</Arrow>
            </div>
            <p>{'Page ' + page + ' of ' + maxPage}</p>
            <div
              onClick={() => {
                setPage(page === maxPage ? page : page + 1);
              }}
            >
              <Arrow $faded={page === maxPage ? true : false}>→</Arrow>
            </div>
          </PageButtons>
        </AutoColumn>
      ) : (
        <LoadingRows>
          <div />
          <div />
          <div />
        </LoadingRows>
      )}
    </div>
  );
}
