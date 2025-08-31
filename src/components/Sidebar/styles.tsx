import { darken } from 'polished';
import styled from 'styled-components';
import { Box } from '../BoxV3';
import { Text } from '../TextV3';

export const SidebarWrapper = styled(Box)`
  width: 100%;
  border-radius: 0px;
  height: auto;
  max-width: 200px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

export const Menu = styled.div`
  position: relative;
  margin-top: 100px;
  flex: 1;
`;

export const MenuName = styled(Text)`
  margin-left: 8px;
`;

export const MenuLink = styled.div<{ isActive?: boolean }>`
  outline: none;
  cursor: pointer;
  text-decoration: none;
  font-size: 1rem;
  width: fit-content;
  margin: 0 6px;
  align-items: center;
  font-weight: 500;
  width: 100%;

  :hover,
  :focus {
    width: 100%;
  }
`;
export const MenuItem = styled.div<{ isActive?: boolean }>`
  display: flex;
  align-items: center;
  cursor: pointer;
  text-decoration: none;
  width: 100%;
  font-weight: 500;
  line-height: 24px;
  padding: 8px;
  height: 30px;
  margin-bottom: 5px;
  overflow-y: hidden;
  white-space: nowrap;

  :hover,
  :focus {
    width: 100%;
  }
`;

export const Link = styled(Text)`
  text-decoration: none;
`;

export const Circle = styled.div`
  position: absolute;
  height: 10px;
  width: 10px;
  border-radius: 0px 10px 10px 0px;
  left: -5px;
  overflow: hidden;
`;
