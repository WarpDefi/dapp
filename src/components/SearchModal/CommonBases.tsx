import React from 'react';
import { Text } from 'rebass';
import { ChainId, Currency, currencyEquals, CAVAX, Token } from '@pangolindex/sdk';
import styled from 'styled-components';

import { SUGGESTED_BASES } from '../../constants';
import { AutoColumn } from '../Column';
import QuestionHelper from '../QuestionHelper';
import { AutoRow } from '../Row';
import CurrencyLogo from '../CurrencyLogoV3';
import { Button } from '../ui/button';

const BaseWrapper = styled.div<{ disable?: boolean }>`
  border-radius: 10px;
  display: flex;
  padding: 6px;

  align-items: center;
  :hover {
    cursor: ${({ disable }) => !disable && 'pointer'};
  }
  opacity: ${({ disable }) => disable && '0.4'};
`;

export default function CommonBases({
  chainId,
  onSelect,
  selectedCurrency,
}: {
  chainId?: ChainId;
  selectedCurrency?: Currency | null;
  onSelect: (currency: Currency) => void;
}) {
  return (
    <div className='flex flex-col gap-2'>
      <div className="flex items-center">
        <h4>Common bases</h4>
        <QuestionHelper text="These tokens are commonly paired with other tokens." />
      </div>
      <div className="flex gap-2">
        <Button className='flex items-center gap-2' variant="outline"
          onClick={() => {
            if (!selectedCurrency || !currencyEquals(selectedCurrency, CAVAX[chainId ?? ChainId.AVALANCHE])) {
              onSelect(CAVAX[chainId ?? ChainId.AVALANCHE]);
            }
          }}
          disabled={selectedCurrency === CAVAX[chainId ?? ChainId.AVALANCHE]}
        >
          <CurrencyLogo currency={CAVAX[chainId ?? ChainId.AVALANCHE]} size={24} imageSize={48} />
          <small>
            {/*chainId == ChainId.SCROLL ? 'ETH' : */ 'AVAX'}
          </small>
        </Button>
        {(chainId ? SUGGESTED_BASES[chainId] : []).map((token: Token) => {
          const selected = selectedCurrency instanceof Token && selectedCurrency.address === token.address;
          return (
            <Button className='flex items-center gap-2' variant="outline" onClick={() => !selected && onSelect(token)} disabled={selected} key={token.address}>
              <CurrencyLogo currency={token} size={24} imageSize={48} />
              <small>
                {token.symbol}
              </small>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
