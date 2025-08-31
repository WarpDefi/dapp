import { Box } from '@/components/BoxV3';
import { Icons } from '@/components/icons';
import { Text } from '@/components/TextV3';
import { cn } from '@/utils';
import { FC } from 'react';
import { FeeTierPercentageBadge } from './FeeTierPercentageBadge';
import { FEE_AMOUNT_DETAIL } from './shared';
import { FeeOptionProps } from './types';

const FeeOption: FC<FeeOptionProps> = ({ feeAmount, active, poolState, distributions, onClick }) => {
  return (
    <div
      className={cn(
        'relative flex bg-background flex-col p-3 rounded-md cursor-pointer border border-transparent hover:border-primary transition-all',
        active && 'bg-primary',
      )}
      onClick={onClick}
    >
      {active && (
        <div className="absolute top-2 right-2">
          <Icons.check className="size-4" />
        </div>
      )}
      <div className="flex">
        <Text color={'color11'} fontSize={'14px'}>
          {FEE_AMOUNT_DETAIL[feeAmount].label}%
        </Text>
      </div>
      <Text color={'color11'} fontSize={11} mt={'5px'}>
        {FEE_AMOUNT_DETAIL[feeAmount].description}
      </Text>

      {distributions && (
        <FeeTierPercentageBadge distributions={distributions} feeAmount={feeAmount} poolState={poolState} />
      )}
    </div>
  );
};

export default FeeOption;
