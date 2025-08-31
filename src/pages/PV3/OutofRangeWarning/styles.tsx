import { Box } from '@/components/BoxV3';
import styled from 'styled-components';

export const WarningWrapper = styled(Box)`
  width: 100%;
  border-radius: 8px;
  padding: 10px;
  border: 1px solid transparent;
  display: flex;
  position: relative;
  box-sizing: border-box;
  input {
    background-color: inherit;
  }
`;
