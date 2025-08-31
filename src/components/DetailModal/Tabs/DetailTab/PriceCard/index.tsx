import { FC } from 'react';
import { PriceCardProps } from './types';

const PriceCard: FC<PriceCardProps> = props => {
  const { title, price, currencyPair, description } = props;

  return (
    <div className="flex flex-col items-center justify-center gap-2 p-3 border border-muted rounded-lg bg-slate-50 dark:bg-muted dark:bg-primary/5">
      <h4>{title}</h4>
      <h3>{price}</h3>
      <small>{currencyPair}</small>
      <small className="text-center text-xs text-muted-foreground">{description}</small>
    </div>
  );
};

export default PriceCard;
