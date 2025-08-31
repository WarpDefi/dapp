import CurrencyLogo from '@/components/CurrencyLogoV3';
import { Currency } from '@pangolindex/sdk';
import { FC } from 'react';

type DetailStatsProps = {
  item: {
    currency: Currency | undefined;
    stat: string;
  };
};

export const DetailStats: FC<DetailStatsProps> = ({ item: { currency, stat } }) => {
  return (
    <div className="flex items-center gap-2 justify-between">
      <div className="flex items-center gap-2">
        <CurrencyLogo currency={currency} />
        {currency?.symbol}
      </div>
      <small>{stat}</small>
    </div>
  );
};
