import { useAllTokenData } from '@/state/tokens/hooks';
import { TokenData } from '@/state/tokens/reducer';
import { formatDollarAmount } from '@/utils/numbers';
import { getAddress } from 'ethers/lib/utils';
import { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { AutoColumn } from '../Column';
import CurrencyLogo from '../CurrencyLogoInfo';
import Percent from '../Percent';

const FixedContainer = styled(AutoColumn)``;

export const ScrollableRow = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  overflow-x: auto;
  white-space: nowrap;

  ::-webkit-scrollbar {
    display: none;
  }
`;

const DataCard = ({ tokenData, onClick }: { tokenData: TokenData; onClick: () => void }) => {
  return (
    <Link
      to={'?&outputCurrency=' + tokenData.address}
      className="text-decoration-none gap-2 min-w-[190px]"
      onClick={e => {
        e.preventDefault();
        onClick();
      }}
    >
      <div className="px-2">
        <div className="flex items-center bg-background p-4 gap-3 rounded-xl cursor-pointer hover:bg-muted/80 transition-colors">
          <CurrencyLogo address={tokenData.address} size={24} imageSize={48} />
          <div className="flex flex-col w-full">
            <div className="flex justify-between items-center w-full gap-2">
              <p className="font-semibold">{tokenData.symbol}</p>
              <Percent value={tokenData.priceUSDChange} />
            </div>
            <div className="flex justify-between items-center w-full gap-2">
              <small>{formatDollarAmount(tokenData.priceUSD)}</small>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default function TopTokenMovers({ handleOutputSelect }: { handleOutputSelect: (tokenAddress: string) => void }) {
  const allTokens = useAllTokenData();

  const topPriceIncrease = useMemo(() => {
    return Object.values(allTokens)
      /*.sort(({ data: a }, { data: b }) => {
        return a && b ? (Math.abs(a.priceUSDChange) > Math.abs(b.priceUSDChange) ? -1 : 1) : -1;
      })
      .slice(0, Math.min(20, Object.values(allTokens).length));*/
  }, [allTokens]);

  const increaseRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);

  const startScrolling = () => {
    const scrollContainer = increaseRef.current;
    if (!scrollContainer) return;

    intervalRef.current = window.setInterval(() => {
      scrollContainer.scrollLeft += 1;
      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
        scrollContainer.scrollLeft = 0;
      }
    }, 20);
  };

  const stopScrolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    startScrolling();
    return stopScrolling;
  }, []);

  return (
    <FixedContainer gap="md">
      <ScrollableRow ref={increaseRef} onMouseEnter={stopScrolling} onMouseLeave={startScrolling}>
        {[...topPriceIncrease, ...topPriceIncrease].map((entry, index) => {
          if (!entry.data) return null;
          const address = getAddress(entry.data.address);

          return (
            <DataCard
              key={`top-card-token-${address}-${index}`}
              tokenData={{ ...entry.data, address }}
              onClick={() => handleOutputSelect(address)} // ✅ Artık sadece adres gönderiyoruz
            />
          );
        })}
      </ScrollableRow>
    </FixedContainer>
  );
}
