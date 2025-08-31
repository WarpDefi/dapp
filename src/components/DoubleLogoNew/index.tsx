import { cn } from '@/utils';
import { Currency } from '@pangolindex/sdk';
import React from 'react';
import CurrencyLogo from '../CurrencyLogoV3';

interface DoubleCurrencyLogoProps {
  margin?: boolean;
  isDead?: boolean;
  size?: number;
  currency0?: Currency;
  currency1?: Currency;
}

export function DoubleCurrencyLogo({
  currency0,
  currency1,
  size = 16,
  margin = false,
  isDead = false,
}: DoubleCurrencyLogoProps) {
  const logoSize = size <= 24 ? 24 : size <= 32 ? 32 : 48;
  
  return (
    <div className={cn(isDead && 'grayscale')}>
      {currency0 && <CurrencyLogo currency={currency0} size={logoSize} imageSize={48} />}
      {currency1 && <CurrencyLogo currency={currency1} size={logoSize} imageSize={48} />}
    </div>
  );
}

export function DoubleCurrencyLogoV2({
  currency0,
  currency1,
  size = 16,
  margin = false,
  isDead = false,
}: DoubleCurrencyLogoProps) {
  return (
    <div className={cn('relative flex items-center', isDead && 'grayscale')}>
      <div className="relative size-6 lg:size-8 rounded-full overflow-hidden">
        {currency0 && <CurrencyLogo style={{ width: '100%', height: '100%' }} currency={currency0} size={24} imageSize={48} />}
      </div>
      <div className="relative -ml-3 size-6 lg:size-8 rounded-full">
        {currency1 && <CurrencyLogo style={{ width: '100%', height: '100%' }} currency={currency1} size={24} imageSize={48} />}
      </div>
    </div>
  );
}
