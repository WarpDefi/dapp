import { DefaultTheme, styled } from "styled-components";
import { InputProps, scales } from "./types";

interface StyledInputProps extends InputProps {
  theme: DefaultTheme;
}

/**
 * Priority: Warning --> Success
 */
const getColor = ({ isSuccess = false, isWarning = false, theme }: StyledInputProps) => {
  if (isWarning) {
    return theme.colors.warning;
  }

  if (isSuccess) {
    return theme.colors.success;
  }

  return theme.colors.cardBorder;
};

const getHeight = ({ scale = scales.MD }: StyledInputProps) => {
  switch (scale) {
    case scales.SM:
      return "32px";
    case scales.LG:
      return "48px";
    case scales.MD:
    default:
      return "40px";
  }
};

const Input = styled("input").withConfig({
  shouldForwardProp: (props) => !["scale", "isSuccess", "isWarning"].includes(props),
})<InputProps>`
  background-color: ${({ theme }) => theme.colors.input};
  border-radius: 4px;
  box-shadow: 2px 2px 0 0 ${getColor};
  color: ${({ theme }) => theme.colors.text};
  display: block;
  font-size: 16px;
  height: ${getHeight};
  outline: 0;
  padding: 0 14px;
  width: 100%;
  border: 2px solid ${getColor};

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSubtle};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.backgroundDisabled};
    box-shadow: none;
    color: ${({ theme }) => theme.colors.textDisabled};
    cursor: not-allowed;
  }

  &:focus:not(:disabled) {
    border-color: ${({ theme, isWarning, isSuccess }) => {
      if (isWarning) {
        return theme.colors.warning;
      }

      if (isSuccess) {
        return theme.colors.success;
      }
      return theme.colors.cardBorder;
    }};
  }
`;

Input.defaultProps = {
  scale: scales.MD,
  isSuccess: false,
  isWarning: false,
};

export default Input;
