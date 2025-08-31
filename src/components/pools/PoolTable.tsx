import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useActiveNetworkVersion } from '@/state/applicationInfo/hooks';
import { PoolData } from '@/state/pools/reducer';
import { feeTierPercent } from '@/utils';
import { networkPrefix } from '@/utils/networkPrefix';
import { formatDollarAmount } from '@/utils/numbers';
import { getAddress } from 'ethers/lib/utils';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { POOL_HIDE } from '../../constants/index';
import { AutoColumn } from '../Column';
import DoubleCurrencyLogo from '../DoubleLogoInfo';
import Loader from '../Loader';
import { LoadingRows } from '../LoaderInfo';
import { Label } from '../Text/Text';
import { Arrow, Break, PageButtons } from '../shared';
import { Wrapper } from '../swap/styleds';

const ResponsiveGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  align-items: center;

  grid-template-columns: 20px 3.5fr repeat(3, 1fr);

  @media screen and (max-width: 900px) {
    grid-template-columns: 20px 1.5fr repeat(2, 1fr);
    & :nth-child(3) {
      display: none;
    }
  }

  @media screen and (max-width: 500px) {
    grid-template-columns: 20px 1.5fr repeat(1, 1fr);
    & :nth-child(5) {
      display: none;
    }
  }

  @media screen and (max-width: 480px) {
    grid-template-columns: 2.5fr repeat(1, 1fr);
    > *:nth-child(1) {
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

const SORT_FIELD = {
  feeTier: 'feeTier',
  volumeUSD: 'volumeUSD',
  tvlUSD: 'tvlUSD',
  volumeUSDWeek: 'volumeUSDWeek',
};

const DataRow = ({ poolData, index }: { poolData: PoolData; index: number }) => {
  const [activeNetwork] = useActiveNetworkVersion();

  return (
    <Wrapper>
      <ResponsiveGrid>
        <Label>{index + 1}</Label>
        <div>
          <div className="flex items-center gap-2">
            <DoubleCurrencyLogo
              address0={getAddress(poolData.token0.address)}
              address1={getAddress(poolData.token1.address)}
            />
            <small>
              {poolData.token0.symbol}/{poolData.token1.symbol}
            </small>
            <Badge variant="secondary">{feeTierPercent(poolData.feeTier)}</Badge>
          </div>
        </div>
        <small className="text-right">{formatDollarAmount(poolData.tvlUSD)}</small>
        <small className="text-right">{formatDollarAmount(poolData.volumeUSD)}</small>
        <small className="text-right">{formatDollarAmount(poolData.volumeUSDWeek)}</small>
      </ResponsiveGrid>
    </Wrapper>
  );
};

const MAX_ITEMS = 10;

export default function PoolTable({ poolDatas, maxItems = MAX_ITEMS }: { poolDatas: PoolData[]; maxItems?: number }) {
  const [currentNetwork] = useActiveNetworkVersion();

  // for sorting
  const [sortField, setSortField] = useState(SORT_FIELD.tvlUSD);
  const [sortDirection, setSortDirection] = useState<boolean>(true);

  // pagination
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);
  useEffect(() => {
    let extraPages = 1;
    if (poolDatas.length % maxItems === 0) {
      extraPages = 0;
    }
    setMaxPage(Math.floor(poolDatas.length / maxItems) + extraPages);
  }, [maxItems, poolDatas]);

  const sortedPools = useMemo(() => {
    return poolDatas
      ? poolDatas
          .filter(x => !!x && !POOL_HIDE[currentNetwork.id].includes(x.address))
          .sort((a, b) => {
            if (a && b) {
              return a[sortField as keyof PoolData] > b[sortField as keyof PoolData]
                ? (sortDirection ? -1 : 1) * 1
                : (sortDirection ? -1 : 1) * -1;
            } else {
              return -1;
            }
          })
          .slice(maxItems * (page - 1), page * maxItems)
      : [];
  }, [currentNetwork.id, maxItems, page, poolDatas, sortDirection, sortField]);

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

  if (!poolDatas) {
    return <Loader />;
  }

  return (
    <div className="bg-background p-4 md:py-4 md:px-8 rounded-lg">
      {sortedPools.length > 0 ? (
        <AutoColumn gap="16px">
          <ResponsiveGrid>
            <Label></Label>
            <div>
              <Button variant="ghost" className="-ml-4 gap-2" onClick={() => handleSort(SORT_FIELD.feeTier)}>
                Pool {arrow(SORT_FIELD.feeTier)}
              </Button>
            </div>
            <div className="flex justify-end">
              <Button variant="ghost" className="-mr-4 gap-2" onClick={() => handleSort(SORT_FIELD.tvlUSD)}>
                TVL {arrow(SORT_FIELD.tvlUSD)}
              </Button>
            </div>
            <div className="flex justify-end">
              <Button variant="ghost" className="-mr-4 gap-2" onClick={() => handleSort(SORT_FIELD.volumeUSD)}>
                Volume 24H {arrow(SORT_FIELD.volumeUSD)}
              </Button>
            </div>
            <div className="flex justify-end">
              <Button variant="ghost" className="-mr-4 gap-2" onClick={() => handleSort(SORT_FIELD.volumeUSDWeek)}>
                Volume 7D {arrow(SORT_FIELD.volumeUSDWeek)}
              </Button>
            </div>
          </ResponsiveGrid>
          <Break />
          {sortedPools.map((poolData, i) => {
            if (poolData) {
              return (
                <React.Fragment key={i}>
                  <DataRow index={(page - 1) * MAX_ITEMS + i} poolData={poolData} />
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
