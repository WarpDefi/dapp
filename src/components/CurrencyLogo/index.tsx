import AvaxLogo from '@/assets/images/avalanche_token_round.png';
import useHttpLocations from '@/hooks/useHttpLocations';
import { useChainId } from '@/provider';
import { WrappedTokenInfo } from '@/state/lists/hooks';
import { cn } from '@/utils';
import { CAVAX, ChainId, Currency, Token } from '@pangolindex/sdk';
import { getAddress } from 'ethers/lib/utils';
import { useMemo } from 'react';
import Logo from '../Logo';
//import { AAVEe, CNR, DAIe, ELK, JOE, LINKe, QI, SUSHIe, USDCe, USDTe, WBTCe, WETHe, YAK } from '../../constants'

const getTokenLogoURL = (address: string) =>
  `https://raw.githubusercontent.com/pangolindex/tokens/main/assets/43114/${address}/logo_48.png`;

/*const getTokenLogoURLScroll = (address: string) =>
  `https://raw.githubusercontent.com/canarydeveloper/tokens/master/assets-scroll/${address}/logo.png`*/

export default function CurrencyLogo({
  currency,
  style,
  className = '',
}: {
  currency?: Currency;
  size?: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  const chainId = useChainId();
  const uriLocations = useHttpLocations(currency instanceof WrappedTokenInfo ? currency.logoURI : undefined);

  const srcs: string[] = useMemo(() => {
    if (currency === CAVAX[chainId ?? ChainId.AVALANCHE]) return [];

    if (currency instanceof Token) {
      if (currency instanceof WrappedTokenInfo) {
        return [
          ...uriLocations,
          /*chainId == ChainId.SCROLL ? getTokenLogoURLScroll(currency.address) : */ getTokenLogoURL(
            getAddress(currency.address),
          ),
        ];
      }

      return [
        ...uriLocations,
        /*chainId == ChainId.SCROLL ? getTokenLogoURLScroll(currency.address) : */ getTokenLogoURL(
          getAddress(currency.address),
        ),
      ];
    }
    return [];
  }, [chainId, currency, uriLocations]);

  if (currency === CAVAX[ChainId.AVALANCHE]) {
    return <img src={AvaxLogo} className={cn('size-6', className)} style={style} />;
  }
  /*if (currency === CAVAX[ChainId.SCROLL]) {
    return <StyledEthereumLogo src={EthLogo} size={size} style={style} />
  }*/
  //console.log(currency?.symbol)
  return (
    <Logo
      className={cn('size-6 rounded-full', className)}
      srcs={srcs}
      alt={`${currency?.symbol ?? 'token'} logo`}
      style={style}
    />
  );
}
