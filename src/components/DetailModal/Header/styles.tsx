import { Box } from '@/components/BoxV3';
import styled from 'styled-components';

export const HeaderRoot = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
`;

export const StatsWrapper = styled(Box)<{ colNumber: number }>`
  display: grid;
  grid-template-columns: repeat(${({ colNumber }) => colNumber}, auto);
  grid-gap: 20px;
`;

export const HeaderWrapper = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
