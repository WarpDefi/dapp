import { styled } from "styled-components";

import { ButtonMenu } from "@pancakeswap/uikit";

export const FullWidthButtonMenu = styled(ButtonMenu)<{ disabled?: boolean }>`
  width: 100%;

  & > button {
    width: 100%;
    &:disabled {
      color: ${({ theme }) => theme.colors.textDisabled};
      background: transparent;
      border: none;
      &:hover {
        background: transparent;
      }
    }
  }

  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`;
