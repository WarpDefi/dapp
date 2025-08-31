import { Currency } from '@pangolindex/sdk';
import React from 'react';
import { LogoSize } from 'src/constants';
import { Box } from '../Box';
import CurrencyLogo from '../CurrencyLogoV3';
import { Wrapper } from './styles';

export interface DoubleCurrencyLogoProps {
  margin?: boolean;
  size?: LogoSize;
  currency0?: Currency;
  currency1?: Currency;
}

const DoubleCurrencyLogo = ({ currency0, currency1, size = 24, margin = false }: DoubleCurrencyLogoProps) => {
  const imageSize = size === 24 ? 48 : size === 32 ? 48 : 48; // Her zaman 48px'de yükle, küçült
  
  return (
    <Wrapper sizeraw={size} margin={margin}>
      {currency0 && <CurrencyLogo currency={currency0} size={size} imageSize={imageSize} />}
      {currency1 && (
        <Box ml={'-5px'} display={'flex'}>
          <CurrencyLogo currency={currency1} size={size} imageSize={imageSize} />
        </Box>
      )}
    </Wrapper>
  );
};

export default DoubleCurrencyLogo;
