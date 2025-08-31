import React from 'react';
import styled from 'styled-components';
import { darken, lighten } from 'polished';

import { RowBetween } from '../Row';
import { ChevronDown } from 'react-feather';
import { Button as RebassButton, ButtonProps } from 'rebass/styled-components';

const Base = styled(RebassButton)<{
  padding?: string;
  width?: string;
  borderRadius?: string;
  altDisabledStyle?: boolean;
}>`
  padding: ${({ padding }) => (padding ? padding : '14px 8px')};
  width: ${({ width }) => (width ? width : '100%')};
  font-weight: 500;
  text-align: center;
  border-radius: 12px;
  border-radius: ${({ borderRadius }) => borderRadius && borderRadius};
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
  z-index: 1;
  &:disabled {
    cursor: auto;
  }

  > * {
    user-select: none;
  }
`;

export const ButtonPrimary = styled(Base)`
  background-color: #d3bb6a;
  color: white;
  &:disabled {
    cursor: auto;
    box-shadow: none;
    border: 1px solid transparent;
    outline: none;
    opacity: ${({ altDisabledStyle }) => (altDisabledStyle ? '0.7' : '1')};
  }
`;

export const ButtonLight = styled(Base)`
  background-color: #ffb456;
  font-size: 16px;
  font-weight: 700;
  border: none !important;
  &:focus {
    background-color: #ffb456;
  }
  &:hover {
    background-color: #ffb456;
  }
  &:active {
    background-color: #ffb456;
  }
  :disabled {
    opacity: 0.4;
    :hover {
      cursor: auto;
      box-shadow: none;
      border: 1px solid transparent;
      outline: none;
    }
  }
`;

export const ButtonGray = styled(Base)`
  font-size: 16px;
  font-weight: 500;
  &:focus {
  }
  &:hover {
  }
  &:active {
  }
`;

export const ButtonSecondary = styled(Base)`
  background-color: transparent;
  font-size: 16px;
  border-radius: 12px;
  padding: ${({ padding }) => (padding ? padding : '10px')};

  &:focus {
  }
  &:hover {
  }
  &:active {
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
  a:hover {
    text-decoration: none;
  }
`;
export const ButtonCustom = styled(Base)`
  background-color: #cc8800;
  color: white;
  &:focus {
    box-shadow: 0 0 0 1pt #cc8800;
    background-color: #cc8800;
  }
  &:hover {
    background-color: #e69900;
  }
  &:active {
    box-shadow: 0 0 0 1pt #cc8800;
    background-color: #cc8800;
  }
  &:disabled {
    background-color: #cc8800;
    cursor: auto;
    box-shadow: none;
    border: 1px solid transparent;
    outline: none;
    opacity: ${({ altDisabledStyle }) => (altDisabledStyle ? '0.7' : '1')};
  }
`;

export const ButtonNFTStake = styled(Base)`
  background-color: #6bb5bd;
  color: white;
  &:focus {
    box-shadow: 0 0 0 1pt #6bb5bd;
    background-color: #6bb5bd;
  }
  &:hover {
    background-color: #6bb5bd;
  }
  &:active {
    box-shadow: 0 0 0 1pt #6bb5bd;
    background-color: #6bb5bd;
  }
  &:disabled {
    background-color: #6bb5bd;
    cursor: auto;
    box-shadow: none;
    border: 1px solid transparent;
    outline: none;
    opacity: ${({ altDisabledStyle }) => (altDisabledStyle ? '0.7' : '1')};
  }
`;

export const ButtonFarmV2 = styled(Base)`
  background-color: #34b3c3;
  color: white;
  height: 30px;
  &:focus {
    background-color: #34b3c3;
  }
  &:hover {
    background-color: #3cc7d9;
  }
  &:active {
    background-color: #34b3c3;
  }
  &:disabled {
    background-color: #d9d9d9;
    cursor: auto;
    box-shadow: none;
    border: 1px solid transparent;
    outline: none;
    opacity: ${({ altDisabledStyle }) => (altDisabledStyle ? '0.7' : '1')};
  }
`;

export const ButtonHarvestV2 = styled(Base)`
  background-color: #ffb456;
  color: white;
  height: 30px;
  padding: 17px;
  font-size: 12px;
  &:focus {
    background-color: #ffb456;
  }
  &:hover {
    background-color: #ffb456;
  }
  &:active {
    background-color: #ffb456;
  }
  &:disabled {
    background-color: #d9d9d9;
    cursor: auto;
    box-shadow: none;
    border: 1px solid transparent;
    outline: none;
    opacity: ${({ altDisabledStyle }) => (altDisabledStyle ? '0.7' : '1')};
  }
`;

export const ButtonOKXAirdrop = styled(Base)`
  background-color: #3e3e3e;
  color: white;
  height: 30px;
  padding: 17px;
  font-size: 12px;
  &:focus {
    background-color: #3e3e3e;
  }
  &:hover {
    background-color: #3e3e3e;
  }
  &:active {
    background-color: #3e3e3e;
  }
  &:disabled {
    background-color: #d9d9d9;
    cursor: auto;
    box-shadow: none;
    border: 1px solid transparent;
    outline: none;
    opacity: ${({ altDisabledStyle }) => (altDisabledStyle ? '0.7' : '1')};
  }
`;

export const ButtonGetLPV2 = styled(Base)`
  background-color: transparent;
  color: #ffb456;
  font-weight: bold;
  height: 30px;
  padding: 17px;
  font-size: 12px;
  border: 1px solid #ffb456;
  &:focus {
    //background-color: #216f78;
  }
  &:hover {
    //background-color: #319ca9;
  }
  &:active {
    //background-color: #216f78;
  }
  &:disabled {
    background-color: #d9d9d9;
    cursor: auto;
    box-shadow: none;
    border: 1px solid transparent;
    outline: none;
    opacity: ${({ altDisabledStyle }) => (altDisabledStyle ? '0.7' : '1')};
  }
`;

export const ButtonGetLPV2Joe = styled(Base)`
  background-color: rgb(242 113 106);
  color: white;
  height: 30px;
  padding: 18px;
  font-size: 12px;
  &:focus {
    background-color: rgb(242 113 106);
  }
  &:hover {
    background-color: rgb(247 169 164);
  }
  &:active {
    background-color: rgb(242 113 106);
  }
  &:disabled {
    background-color: #d9d9d9;
    cursor: auto;
    box-shadow: none;
    border: 1px solid transparent;
    outline: none;
    opacity: ${({ altDisabledStyle }) => (altDisabledStyle ? '0.7' : '1')};
  }
`;

export const ButtonPink = styled(Base)`
  color: white;
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`;

export const ButtonOutlined = styled(Base)`
  background-color: transparent;
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`;

export const ButtonEmpty = styled(Base)`
  background-color: transparent;
  display: flex;
  justify-content: center;
  align-items: center;

  &:focus {
    text-decoration: underline;
  }
  &:hover {
    text-decoration: underline;
  }
  &:active {
    text-decoration: underline;
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`;

export const ButtonWhite = styled(Base)`
  border: 1px solid #edeef2;
  color: black;

  &:focus {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    box-shadow: 0 0 0 1pt ${darken(0.05, '#edeef2')};
  }
  &:hover {
    box-shadow: 0 0 0 1pt ${darken(0.1, '#edeef2')};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${darken(0.1, '#edeef2')};
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`;

const ButtonConfirmedStyle = styled(Base)`
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`;

const ButtonConfirmedStyleV2 = styled.button`
  width: 100%;
  border-radius: 12px;

  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`;

const ButtonErrorStyle = styled(Base)`
  &:disabled {
    opacity: 50%;
    cursor: auto;
    box-shadow: none;
  }
`;

export function ButtonConfirmed({
  confirmed,
  altDisabledStyle,
  ...rest
}: { confirmed?: boolean; altDisabledStyle?: boolean } & ButtonProps) {
  if (confirmed) {
    return <ButtonConfirmedStyle {...rest} />;
  } else {
    return <ButtonPrimary {...rest} altDisabledStyle={altDisabledStyle} />;
  }
}

export function ButtonConfirmedV2({
  confirmed,
  altDisabledStyle,
  ...rest
}: { confirmed?: boolean; altDisabledStyle?: boolean } & ButtonProps) {
  if (confirmed) {
    return <ButtonConfirmedStyleV2 {...rest} />;
  } else {
    return <ButtonPrimary {...rest} altDisabledStyle={altDisabledStyle} />;
  }
}

export function ButtonError({ error, ...rest }: { error?: boolean } & ButtonProps) {
  if (error) {
    return <ButtonErrorStyle {...rest} />;
  } else {
    return <ButtonHarvestV2 {...rest} />;
  }
}

export function ButtonOkxError({ error, ...rest }: { error?: boolean } & ButtonProps) {
  if (error) {
    return <ButtonErrorStyle {...rest} />;
  } else {
    return <ButtonOKXAirdrop {...rest} />;
  }
}

export function ButtonDropdown({ disabled = false, children, ...rest }: { disabled?: boolean } & ButtonProps) {
  return (
    <ButtonPrimary {...rest} disabled={disabled}>
      <RowBetween>
        <div style={{ display: 'flex', alignItems: 'center' }}>{children}</div>
        <ChevronDown size={24} />
      </RowBetween>
    </ButtonPrimary>
  );
}

export function ButtonDropdownLight({ disabled = false, children, ...rest }: { disabled?: boolean } & ButtonProps) {
  return (
    <ButtonOutlined {...rest} disabled={disabled}>
      <RowBetween>
        <div style={{ display: 'flex', alignItems: 'center' }}>{children}</div>
        <ChevronDown size={24} />
      </RowBetween>
    </ButtonOutlined>
  );
}

export function ButtonRadio({ active, ...rest }: { active?: boolean } & ButtonProps) {
  if (!active) {
    return <ButtonWhite {...rest} />;
  } else {
    return <ButtonPrimary {...rest} />;
  }
}
