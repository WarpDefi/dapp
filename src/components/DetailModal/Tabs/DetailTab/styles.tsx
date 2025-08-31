import { Box } from '@/components/BoxV3';
import styled from 'styled-components';

export const NFT = styled.img`
  max-width: 210px;
`;

export const PriceCards = styled(Box)`
  gap: 30px;
  display: flex;
  margin-bottom: 30px;
`;

export const PriceDetailAndNft = styled.div`
  display: flex;
  flex-direction: row;
  gap: 30px;
`;

export const Information = styled(Box)`
  margin-top: 30px;
  display: flex;
  flex-direction: column;
`;

export const StateContainer = styled.div<{ colNumber: number }>`
  grid-template-columns: repeat(${({ colNumber }) => colNumber}, auto);
  gap: 12px;
  display: grid;
  width: 100%;
  align-items: start;
  margin-top: 12px;

  @media screen and (max-width: 1024px) {
    grid-template-columns: 1fr;
    align-items: stretch;
  }
`;
