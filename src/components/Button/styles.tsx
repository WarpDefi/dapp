import get from 'lodash.get';
import { lighten } from 'polished';
import styled, { css } from 'styled-components';
import { ButtonProps } from './types';

const Primary = (props: ButtonProps) => props.variant === 'primary' && css``;

const Secondary = (props: ButtonProps) => props.variant === 'secondary' && css``;

const Outline = (props: ButtonProps) =>
  props.variant === 'outline' &&
  css`
    background-color: transparent;
  `;

const Plain = (props: ButtonProps) =>
  props.variant === 'plain' &&
  css`
    background-color: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
  `;

const Disable = (props: ButtonProps) =>
  (props.isDisabled || props.loading) &&
  css`
    border: 1px solid transparent;
    cursor: auto;
    pointer-events: none;
  `;

const Confirmed = (props: ButtonProps) =>
  props.variant === 'confirm' &&
  css`
    opacity: 50%;
    cursor: auto;
  `;

export const Root = styled.button<ButtonProps>`
  padding: ${props => (props?.padding ? props?.padding : '0px')};
  width: ${({ width }) => (width ? width : '100%')};
  height: ${({ height }) => (height ? height : '51px')};
  font-weight: 500;
  text-align: center;
  border-radius: ${props => props?.borderRadius ?? '8px'};
  outline: none;
  border: 1px solid transparent;
  color: white;
  text-decoration: none;
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  align-items: center;
  cursor: pointer;
  position: relative;
  text-decoration: none;
  box-sizing: border-box;

  ${Primary}
  ${Secondary}
  ${Outline}
  ${Plain}
  ${Disable}
  ${Confirmed}

  /* Customizable Colors */
  color: ${({ color, theme }) => color && get(theme, color, color)};
  background-color: ${({ backgroundColor, theme }) => backgroundColor && get(theme, backgroundColor, backgroundColor)};
  border: ${({ borderColor, theme }) => `1px solid ${borderColor && get(theme, borderColor, borderColor)}`};

  > * {
    user-select: none;
  }
`;

export const IconAfter = styled.div`
  color: white;
  margin-left: 10px;
`;

export const IconBefore = styled.div`
  color: white;
  margin-right: 10px;
`;
