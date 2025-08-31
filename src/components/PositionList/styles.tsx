import styled from 'styled-components';
import { Box } from '../BoxV3';

export const ErrorContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  margin: auto;
  padding: 0px 10px;
`;

export const LoaderWrapper = styled(Box)`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  padding-right: 200px; // sidebar width
  pointer-events: all;
  position: absolute;
  width: 100%;
  z-index: 999;
`;

export const MobileGridContainer = styled(Box)`
  display: none;
`;

export const PanelWrapper = styled.div`
  align-items: start;
  display: inline-grid;
  gap: 15px;
  grid-template-columns: 1fr;
  grid-template-rows: max-content;
  padding-bottom: 65px;
  width: 100%;
`;

export const PoolsWrapper = styled(Box)`
  border-radius: 0px;
  overflow: hidden;
  padding: 10px;
  width: 100%;
`;
