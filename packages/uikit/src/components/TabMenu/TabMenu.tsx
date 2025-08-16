import React, { Children, ReactElement, cloneElement } from "react";
import { styled } from "styled-components";
import Flex from "../Box/Flex";
import { TabMenuProps } from "./types";

const Wrapper = styled(Flex)<{ fullWidth?: boolean; customWidth?: boolean; isShowBorderBottom?: boolean }>`
--rounded: 8px;  
border-bottom: ${({ isShowBorderBottom, theme }) =>
    isShowBorderBottom ? `2px solid ${theme.colors.input}` : "none"};
  overflow-x: ${({ fullWidth }) => (fullWidth ? '' : 'auto')};
  border: ${({ customWidth, theme }) => (customWidth ? "0" : `2px solid ${theme.colors.cardBorder}`)};
  background: ${({ customWidth, theme }) => (customWidth ? theme.colors.transparent : theme.colors.backgroundItem)};
  padding: ${({ fullWidth, customWidth }) => (fullWidth || customWidth ? 0 : "16px 16px 0 16px")};
  border-radius: var(--rounded);

  ::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */

  @media screen and (max-width: 575px) {
    --rounded: 6px;
  }
`;

const Inner = styled(Flex)<{ fullWidth?: boolean; customWidth?: boolean; gap?: string }>`
  justify-content: space-between;

  & > button + button {
    margin-left: ${({ gap }) => gap || "4px"};
  }

  & > button {
    flex-grow: ${({ fullWidth }) => (fullWidth ? 1 : 0)};
  }

  ${({ theme }) => theme.mediaQueries.md} {
    flex-grow: ${({ fullWidth }) => (fullWidth ? 1 : 0)};
  }

  flex-grow: ${({ fullWidth }) => (fullWidth ? 1 : 0)};
`;

const TabMenu: React.FC<React.PropsWithChildren<TabMenuProps>> = ({
  activeIndex = 0,
  onItemClick,
  children,
  fullWidth,
  customWidth,
  gap,
  isColorInverse = false,
  isShowBorderBottom = true,
}) => {
  return (
    <Wrapper fullWidth={fullWidth} customWidth={customWidth} isShowBorderBottom={isShowBorderBottom}>
      <Inner fullWidth={fullWidth} customWidth={customWidth} gap={gap}>
        {Children.map(children, (child: ReactElement, index) => {
          const isActive = activeIndex === index;
          const isCustom = customWidth;
          const color = isActive ? (isCustom ? "secondary" : "text") : "textSubtle";
          const inverseColor = isActive ? "textSubtle" : isCustom ? "secondary" : "text";
          const backgroundColor = isActive
            ? isCustom
              ? "transparent"
              : index === 0
              ? "success"
              : "failure"
            : "transparent";
          const inverseBackgroundColor = isActive
            ? "transparent"
            : isCustom
            ? "transparent"
            : index === 0
            ? "success"
            : "failure";
          const borderColor = isActive ? (isCustom ? "secondary" : "cardBorder") : "transparent";
          const inverseBorderColor = isActive ? "transparent" : isCustom ? "secondary" : "cardBorder";

          return cloneElement(child, {
            isActive,
            isCustom,
            onClick: onItemClick ? () => onItemClick(index) : undefined,
            color: isColorInverse ? inverseColor : color,
            backgroundColor: isColorInverse ? inverseBackgroundColor : backgroundColor,
            borderColor: isColorInverse ? inverseBorderColor : borderColor,
          });
        })}
      </Inner>
    </Wrapper>
  );
};

export default TabMenu;
