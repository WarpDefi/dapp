import { Currency, Token } from '@pangolindex/sdk';
import React, { useMemo } from 'react';
import { LogoSize } from 'src/constants';
import { getTokenLogoURL } from './getTokenLogoURL';
import { StyledLogo } from './styles';
//import { useChainId } from '@/provider';
;
import { useActiveWeb3React } from '@/hooks';
import { useChainId } from '@/provider';

export default function CurrencyLogo({
  address,
  size = 24,
  style,
  className,
  imageSize = size,
}: {
  address: string;
  size?: LogoSize;
  style?: React.CSSProperties;
  imageSize?: LogoSize;
  className?: string;
}) {
  const chainId = useChainId();

  const srcs: string[] = useMemo(() => {
    const primarySrc = getTokenLogoURL(address, chainId, imageSize);

    return [primarySrc];
  }, [address]);

  return (
    <StyledLogo
      className={className}
      size={`${size}px`}
      srcs={srcs}
      style={style}
    />
  );
}
