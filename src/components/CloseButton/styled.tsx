import React from 'react';
import { X } from 'react-feather';
import styled from 'styled-components';
import { ButtonPrimary } from '../Button';

export const StyledButton = styled(props => (
  <ButtonPrimary variant="plain" {...props}>
    {props.children}
  </ButtonPrimary>
))<{
  backgroundColor?: string;
  borderRadius?: string | number;
  padding?: string | number;
}>`
  border-radius: ${({ borderRadius }) => (borderRadius ? borderRadius : '50%')};
  padding: ${({ padding }) => (padding ? padding : '5px')};
`;

export const CloseIcon = styled(X)<{ color?: string }>``;
