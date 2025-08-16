import { styled } from "styled-components";
import { Text } from "../Text";

export const StyledBottomNavItem = styled.button`
  display: block;
  border: 0;
  background: transparent;
  cursor: pointer;
  height: 44px;
  padding: 0 12px;
  &:hover {
    border-radius: 4px;
  }
  &:hover,
  &:hover div {
    background: ${({ theme }) => theme.colors.tertiary};
  }
  @media screen and (max-width: 575px) {
    padding: 0 10px;
  }
  @media screen and (max-width: 479px) {
    padding: 0 8px;
  }
`;

export const StyledBottomNavText = styled(Text)`
  display: -webkit-box;
  overflow: hidden;
  user-select: none;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
`;
