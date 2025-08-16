import { DefaultTheme, css, styled } from "styled-components";
import { layout, space, variant } from "styled-system";
import { scaleVariants, styleVariants } from "./theme";
import { BaseButtonProps } from "./types";

interface ThemedButtonProps extends BaseButtonProps {
  theme: DefaultTheme;
}

interface TransientButtonProps extends ThemedButtonProps {
  $isLoading?: boolean;
}

const getDisabledStyles = ({ $isLoading, theme }: TransientButtonProps) => {
  if ($isLoading === true) {
    return `
      &:disabled,
      &.pancake-button--disabled {
        background-color: ${theme.colors.textSubtle};
        box-shadow: none;
        color: ${theme.colors.black};
        border-color: ${theme.colors.cardBorder};
        cursor: not-allowed;
        &:hover {
          background-color: ${theme.colors.textSubtle};
          box-shadow: none;
          color: ${theme.colors.black};
          border-color: ${theme.colors.cardBorder};
        }
      }
    `;
  }

  return `
    &:disabled,
    &.pancake-button--disabled {
      background-color: ${theme.colors.textSubtle};
      border-color: ${theme.colors.cardBorder};
      box-shadow: none;
      color: ${theme.colors.black};
      cursor: not-allowed;
      &:hover {
        background-color: ${theme.colors.textSubtle};
        box-shadow: none;
        color: ${theme.colors.black};
        border-color: ${theme.colors.cardBorder};
      }
    }
  `;
};

/**
 * This is to get around an issue where if you use a Link component
 * React will throw a invalid DOM attribute error
 * @see https://github.com/styled-components/styled-components/issues/135
 */

const getOpacity = ({ $isLoading = false }: TransientButtonProps) => {
  return $isLoading ? ".5" : "1";
};

const StyledButton = styled("button").withConfig({
  shouldForwardProp: (props) => !["fullWidth"].includes(props),
})<BaseButtonProps>`
  position: relative;
  align-items: center;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  font-family: inherit;
  font-size: 16px;
  font-weight: 600;
  justify-content: center;
  letter-spacing: 0.03em;
  line-height: 1;
  white-space: nowrap;
  opacity: ${getOpacity};
  outline: 0;
  transition: all 0.3s;
  &:focus-visible {
    outline: none;
  }

  ${getDisabledStyles}
  ${variant({
    prop: "scale",
    variants: scaleVariants,
  })}
  ${variant({
    variants: styleVariants,
  })}
  ${layout}
  ${space}
  ${({ decorator, theme }) =>
    decorator &&
    css`
      &::before {
        content: "${decorator.text}";
        position: absolute;
        border-bottom: 20px solid ${decorator.backgroundColor ?? theme.colors.secondary};
        border-left: 34px solid transparent;
        border-right: 12px solid transparent;
        height: 0;
        top: -1px;
        right: -12px;
        width: 75px;
        text-align: center;
        padding-right: 30px;
        line-height: 20px;
        font-size: 12px;
        font-weight: 400;
        transform: rotate(31.17deg);
        color: ${decorator.color ?? "white"};
      }
    `}

  // @media screen and (max-width: 991px) {
  //   border-radius: 6px;
  // }
  @media screen and (max-width: 575px) {
    border-radius: 6px;
    font-size: 15px;
  }
  @media screen and (max-width: 424px) {
    font-size: 14px;
  }
`;

export default StyledButton;
