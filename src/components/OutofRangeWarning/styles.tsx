import styled from 'styled-components';
import { Box } from '../BoxV3';

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
