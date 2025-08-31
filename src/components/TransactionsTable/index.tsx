import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Transaction, TransactionType } from '@/types';
import { cn, ExplorerDataType, getExplorerLink, shortenAddress } from '@/utils';
import { formatTime } from '@/utils/date';
import { formatAmount, formatDollarAmount } from '@/utils/numbers';
import { ChainId } from '@pangolindex/sdk';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { AutoColumn } from '../Column';
import HoverInlineText from '../HoverInlineText';
import Loader from '../Loader';
import { Arrow, Break, PageButtons } from '../shared';

const ResponsiveGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  align-items: center;

  grid-template-columns: 1.5fr repeat(5, 1fr);

  @media screen and (max-width: 940px) {
    grid-template-columns: 1.5fr repeat(4, 1fr);
    & > *:nth-child(5) {
      display: none;
    }
  }

  @media screen and (max-width: 800px) {
    grid-template-columns: 1.5fr repeat(2, 1fr);
    & > *:nth-child(5) {
      display: none;
    }
    & > *:nth-child(3) {
      display: none;
    }
    & > *:nth-child(4) {
      display: none;
    }
  }

  @media screen and (max-width: 500px) {
    grid-template-columns: 1.5fr repeat(1, 1fr);
    & > *:nth-child(5) {
      display: none;
    }
    & > *:nth-child(3) {
      display: none;
    }
    & > *:nth-child(4) {
      display: none;
    }
    & > *:nth-child(2) {
      display: none;
    }
  }
`;

const SORT_FIELD = {
  amountUSD: 'amountUSD',
  timestamp: 'timestamp',
  sender: 'sender',
  amountToken0: 'amountToken0',
  amountToken1: 'amountToken1',
};

const DataRow = ({ transaction, color }: { transaction: Transaction; color?: string }) => {
  const abs0 = Math.abs(transaction.amountToken0);
  const abs1 = Math.abs(transaction.amountToken1);
  const outputTokenSymbol = transaction.amountToken0 < 0 ? transaction.token0Symbol : transaction.token1Symbol;
  const inputTokenSymbol = transaction.amountToken1 < 0 ? transaction.token0Symbol : transaction.token1Symbol;

  return (
    <ResponsiveGrid>
      <a href={getExplorerLink(ChainId.AVALANCHE, transaction.hash, ExplorerDataType.TRANSACTION)}>
        <small>
          {transaction.type === TransactionType.MINT
            ? `Add ${transaction.token0Symbol} and ${transaction.token1Symbol}`
            : transaction.type === TransactionType.SWAP
              ? `Swap ${inputTokenSymbol} for ${outputTokenSymbol}`
              : `Remove ${transaction.token0Symbol} and ${transaction.token1Symbol}`}
        </small>
      </a>
      <small className="text-right">{formatDollarAmount(transaction.amountUSD)}</small>
      <small className="text-right">
        <HoverInlineText text={`${formatAmount(abs0)}  ${transaction.token0Symbol}`} maxCharacters={16} />
      </small>
      <small className="text-right">
        <HoverInlineText text={`${formatAmount(abs1)}  ${transaction.token1Symbol}`} maxCharacters={16} />
      </small>
      <small className="text-right">
        <a
          href={getExplorerLink(ChainId.AVALANCHE, transaction.sender, ExplorerDataType.ADDRESS)}
          style={{ color: color }}
        >
          {shortenAddress(transaction.sender)}
        </a>
      </small>
      <small className="text-right">{formatTime(transaction.timestamp, 0)}</small>
    </ResponsiveGrid>
  );
};

export default function TransactionTable({
  transactions,
  maxItems = 10,
  color,
}: {
  transactions: Transaction[];
  maxItems?: number;
  color?: string;
}) {
  // for sorting
  const [sortField, setSortField] = useState(SORT_FIELD.timestamp);
  const [sortDirection, setSortDirection] = useState<boolean>(true);

  // pagination
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);

  useEffect(() => {
    let extraPages = 1;
    if (transactions.length % maxItems === 0) {
      extraPages = 0;
    }
    setMaxPage(Math.floor(transactions.length / maxItems) + extraPages);
  }, [maxItems, transactions]);

  // filter on txn type
  const [txFilter, setTxFilter] = useState<TransactionType | undefined>(undefined);

  const sortedTransactions = useMemo(() => {
    return transactions
      ? transactions
          .slice()
          .sort((a, b) => {
            if (a && b) {
              return a[sortField as keyof Transaction] > b[sortField as keyof Transaction]
                ? (sortDirection ? -1 : 1) * 1
                : (sortDirection ? -1 : 1) * -1;
            } else {
              return -1;
            }
          })
          .filter(x => {
            return txFilter === undefined || x.type === txFilter;
          })
          .slice(maxItems * (page - 1), page * maxItems)
      : [];
  }, [transactions, maxItems, page, sortField, sortDirection, txFilter]);

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

  if (!transactions) {
    return <Loader />;
  }

  return (
    <div className="bg-background p-4 md:py-4 md:px-8 rounded-lg">
      <AutoColumn gap="16px">
        <ResponsiveGrid>
          <div>
            <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
              <div
                className={cn(
                  'cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  txFilter === undefined ? 'bg-background text-primary font-semibold shadow-sm' : '',
                )}
                onClick={() => {
                  setTxFilter(undefined);
                }}
              >
                All
              </div>
              <div
                className={cn(
                  'cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  txFilter === TransactionType.SWAP ? 'bg-background text-primary font-semibold shadow-sm' : '',
                )}
                onClick={() => {
                  setTxFilter(TransactionType.SWAP);
                }}
              >
                Swaps
              </div>
              <div
                className={cn(
                  'cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  txFilter === TransactionType.MINT ? 'bg-background text-primary font-semibold shadow-sm' : '',
                )}
                onClick={() => {
                  setTxFilter(TransactionType.MINT);
                }}
              >
                Adds
              </div>
              <div
                className={cn(
                  'cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  txFilter === TransactionType.BURN ? 'bg-background text-primary font-semibold shadow-sm' : '',
                )}
                onClick={() => {
                  setTxFilter(TransactionType.BURN);
                }}
              >
                Removes
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="ghost" className="-mr-4 gap-2" onClick={() => handleSort(SORT_FIELD.amountUSD)}>
              Total Value {arrow(SORT_FIELD.amountUSD)}
            </Button>
          </div>
          <div className="flex justify-end">
            <Button variant="ghost" className="-mr-4 gap-2" onClick={() => handleSort(SORT_FIELD.amountToken0)}>
              Token Amount {arrow(SORT_FIELD.amountToken0)}
            </Button>
          </div>
          <div className="flex justify-end">
            <Button variant="ghost" className="-mr-4 gap-2" onClick={() => handleSort(SORT_FIELD.amountToken1)}>
              Token Amount {arrow(SORT_FIELD.amountToken1)}
            </Button>
          </div>
          <div className="flex justify-end">
            <Button variant="ghost" className="-mr-4 gap-2" onClick={() => handleSort(SORT_FIELD.sender)}>
              Account {arrow(SORT_FIELD.sender)}
            </Button>
          </div>
          <div className="flex justify-end">
            <Button variant="ghost" className="-mr-4 gap-2" onClick={() => handleSort(SORT_FIELD.timestamp)}>
              Time {arrow(SORT_FIELD.timestamp)}
            </Button>
          </div>
        </ResponsiveGrid>
        <Break />

        {sortedTransactions.map((t, i) => {
          if (t) {
            return (
              <React.Fragment key={i}>
                <DataRow transaction={t} color={color} />
                <Break />
              </React.Fragment>
            );
          }
          return null;
        })}
        {sortedTransactions.length === 0 ? <p>No Transactions</p> : undefined}
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
    </div>
  );
}
