import styled from 'styled-components';
import { Box } from '../BoxV3';
import { Text } from '../TextV3';

export const Cards = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  overflow-y: auto;
  padding-bottom: 24px;
  padding-top: 24px;
  white-space: nowrap;
  width: 100%;
`;

export const Link = styled(Text)`
  border: none;
  text-decoration: none;
  background: none;

  cursor: pointer;
  font-weight: 500;

  :hover {
    text-decoration: underline;
  }
`;

export const Content = styled(Box)`
  display: grid;
  width: 100%;
`;

export const GridContainer = styled(Box)`
  display: grid;
  grid-gap: 12px;
  grid-template-columns: 100%;
  height: 100%;
  padding: 50px 0px 0px;
`;

export const MobileHeader = styled(Box)`
  align-items: center;
  display: grid;
  flex-direction: row;
  grid-template-columns: max-content max-content;
  justify-content: space-between;
  padding: 10px;
`;

export const PageWrapper = styled(Box)`
  height: calc(100vh - 76px);
  padding-bottom: 10px;
  width: 100%;
`;
