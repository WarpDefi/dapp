import { Badge } from '@/components/ui/badge';
import { PoolState } from 'src/hooks/types';
import { FeeTierPercentageBadgeProps } from './types';

export function FeeTierPercentageBadge({ feeAmount, distributions, poolState }: FeeTierPercentageBadgeProps) {
  return (
    <Badge variant="secondary" className="font-thin truncate w-full">
      {!distributions || poolState === PoolState.NOT_EXISTS || poolState === PoolState.INVALID
        ? 'Not created'
        : distributions[feeAmount] !== undefined
          ? `${distributions[feeAmount]?.toFixed(0)}% selected percentage`
          : 'No data'}
    </Badge>
  );
}
