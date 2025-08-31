import styled from 'styled-components';
import { TextInputProps } from './types';

export const StyledInput = styled.input<TextInputProps>`
  cursor: ${props => (props?.disabled ? 'not-allowed' : 'default')};
  -moz-appearance: textfield;
  ::-webkit-inner-spin-button,
  ::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  ::placeholder {
  }
`;
