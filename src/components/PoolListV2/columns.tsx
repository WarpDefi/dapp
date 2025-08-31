import AddLiquidity from '@/components/AddLiquidity';
import { DoubleCurrencyLogoV2 } from '@/components/DoubleLogoNew';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { usePoolDatasN } from '@/data/pools/poolDataN';
import { useActiveWeb3React, useUnderlyingTokensHook } from '@/hooks';
import { useUSDCPriceHook } from '@/hooks/useUSDCPrice';
import { useChainId } from '@/provider';
//import { useChainId } from '@/provider';
import { Field } from '@/state/mint/atom';
import { useMintActionHandlers } from '@/state/mint/hooksElixir';
import { unwrappedTokenV3 } from '@/utils/wrappedCurrency';
import { Currency, CurrencyAmount, ElixirPool, Fraction } from '@pangolindex/sdk';
import { ColumnDef } from '@tanstack/react-table';
import numeral from 'numeral';
import { useCallback, useMemo, useState } from 'react';
;

export const columns: ColumnDef<ElixirPool>[] = [
  {
    accessorKey: 'name',
    header: 'All Pools',
    cell: ({ row }) => {
      const { token0, token1 } = row.original;
      const chainId = useChainId();
      const currency0 = token0 && unwrappedTokenV3(token0, chainId);
      const currency1 = token1 && unwrappedTokenV3(token1, chainId);

      return (
        <div className="lg:min-w-60 flex gap-4 items-center">
          <DoubleCurrencyLogoV2 currency0={currency0} currency1={currency1} size={32} />
          <div className="shrink-0 md:px-4">
            {currency0.symbol}-{currency1.symbol}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'fee',
    header: 'Fee',
    cell: ({ row }) => {
      return <div>{Number(row.original.fee) / 10 ** 4}%</div>;
    },
  },
  {
    accessorKey: 'apr',
    header: ({ column }) => {
      return (
        <div className="text-center">
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            APR
            {column.getIsSorted() === 'asc' ? (
              <Icons.chevronUp className="ml-2 size-4 shrink-0" />
            ) : column.getIsSorted() === 'desc' ? (
              <Icons.chevronDown className="ml-2 size-4 shrink-0" />
            ) : (
              <Icons.arrowUpDown className="ml-2 size-4 shrink-0" />
            )}
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      return <div className="text-center">{numeral(row.original.apr).format('$ 0,0')}</div>;
    },
  },
  {
    accessorKey: 'tvl',
    header: ({ column }) => {
      return (
        <div className="text-center">
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            TVL
            {column.getIsSorted() === 'asc' ? (
              <Icons.chevronUp className="ml-2 size-4 shrink-0" />
            ) : column.getIsSorted() === 'desc' ? (
              <Icons.chevronDown className="ml-2 size-4 shrink-0" />
            ) : (
              <Icons.arrowUpDown className="ml-2 size-4 shrink-0" />
            )}
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      //console.log(row.original.tvl);
      return <div className="text-center">{numeral(row.original.tvl).format('$ 0,0')}</div>;
    },
  },
  {
    accessorKey: 'volume',
    header: ({ column }) => {
      return (
        <div className="text-center">
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Volume 24H
            {column.getIsSorted() === 'asc' ? (
              <Icons.chevronUp className="ml-2 size-4 shrink-0" />
            ) : column.getIsSorted() === 'desc' ? (
              <Icons.chevronDown className="ml-2 size-4 shrink-0" />
            ) : (
              <Icons.arrowUpDown className="ml-2 size-4 shrink-0" />
            )}
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      return <div className="text-center">{row.original.volume}</div>;
    },
  },
  {
    accessorKey: 'poolType',
    header: 'Pool Type',
    cell: ({ row }) => {
      return (
        <div className="text-center">
          <span>V3</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'actions',
    header: '',
    cell: ({ row }) => {
      const { token0, token1 } = row.original;
      const chainId = useChainId();
      const currency0 = token0 && unwrappedTokenV3(token0, chainId);
      const currency1 = token1 && unwrappedTokenV3(token1, chainId);
      const [addLiquidityIsOpen, setAddLiquidityIsOpen] = useState<boolean>(false);
      const { onCurrencySelection } = useMintActionHandlers(true);

      const onCloseAddLiquidityModal = useCallback(() => {
        setAddLiquidityIsOpen(!addLiquidityIsOpen);
      }, [addLiquidityIsOpen]);

      const onOpenAddLiquidityModal = useCallback(
        (currency0: Currency, currency1: Currency) => {
          onCurrencySelection(Field.CURRENCY_A, currency0);
          onCurrencySelection(Field.CURRENCY_B, currency1);
          setAddLiquidityIsOpen(!addLiquidityIsOpen);
        },
        [addLiquidityIsOpen],
      );

      return (
        <div className="text-center">
          <Button onClick={open => open && onOpenAddLiquidityModal(currency0, currency1)}>
            <Icons.plus className="mr-2 size-4" />
            Add Liquidity
          </Button>
          {addLiquidityIsOpen && <AddLiquidity isOpen={addLiquidityIsOpen} onClose={onCloseAddLiquidityModal} />}
        </div>
      );
    },
  },
];
