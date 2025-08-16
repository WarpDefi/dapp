import { styled } from "styled-components";
import { StyledMenuItemProps } from "./types";

export const StyledMenuItemContainer = styled.div<StyledMenuItemProps>`
  position: relative;
  padding: ${({ $isHeaderMenu }) => ($isHeaderMenu ? "12px 0" : "0")};
  ${({ $isActive, $variant, theme }) =>
    $isActive &&
    $variant === "subMenu" &&
    `
      &:after{
        content: "";
        position: absolute;
        bottom: 0;
        height: 4px;
        width: 100%;
        background-color: ${theme.colors.primary};
        border-radius: 2px 2px 0 0;
      }
    `};
`;

const StyledMenuItem = styled.a<StyledMenuItemProps>`
  position: relative;
  display: flex;
  align-items: center;

  color: ${({ theme, $isActive }) => ($isActive ? theme.colors.secondary : theme.colors.textSubtle)};
  font-size: 16px;
  font-weight: ${({ $isActive }) => ($isActive ? "600" : "400")};
  opacity: ${({ $isDisabled }) => ($isDisabled ? 0.5 : 1)};
  pointer-events: ${({ $isDisabled }) => ($isDisabled ? "none" : "inherit")};

  ${({ $statusColor, theme }) =>
    $statusColor &&
    `
    &:after {
      content: "";
      border-radius: 100%;
      background: ${theme.colors[$statusColor]};
      height: 8px;
      width: 8px;
      margin-left: 12px;
    }
  `}

  ${({ $variant, $isHeaderMenu }) =>
    $variant === "default" && !$isHeaderMenu
      ? `
    padding: 0 16px;
    height: 48px;
  `
      : $isHeaderMenu
      ? `
    height: 36px;
    padding: 0 16px;
    `
      : `
    padding-left: 4px;
    padding-right: 4px;

    height: 42px;
  `}

  ${({ $isActive, $isHeaderMenu, theme }) =>
    $isActive && $isHeaderMenu
      ? `
      color: ${theme.colors.black};
      border: 2px solid ${theme.colors.cardBorder};
      background: ${theme.colors.secondary};
      border-radius: 8px;

    `
      : $isActive
      ? `
      color: ${theme.colors.secondary};
    `
      : `
      color: ${theme.colors.textSubtle};
    `}

  &:hover {
    // background: ${({ theme }) => theme.colors.tertiary};
    // ${({ $variant }) => $variant === "default" && "border-radius: 16px;"};
    color: ${({ $isActive, $isHeaderMenu, theme }) =>
      $isActive && $isHeaderMenu ? theme.colors.black : $isActive ? theme.colors.secondary : theme.colors.hover};

  }
`;

export default StyledMenuItem;
