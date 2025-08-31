import React, { HTMLAttributes } from 'react';
import styled from 'styled-components';
import { darken, lighten } from 'polished';

import { RowBetween } from '../RowInfo';
import { ChevronDown, Check, Star } from 'react-feather';
import { Button as RebassButton, ButtonProps } from 'rebass/styled-components';

const Base = styled(RebassButton)<{
  padding?: string;
  width?: string;
  borderRadius?: string;
  altDisabledStyle?: boolean;
}>`
  padding: ${({ padding }) => (padding ? padding : '8px 16px')};
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

export const ButtonPrimary = styled(Base)<{ bgColor?: string; altDisabledStyle?: boolean }>`
  color: white;
  &:focus {
  }
  &:hover {
  }
  &:active {
  }
  &:disabled {
    cursor: auto;
    box-shadow: none;
    border: 1px solid transparent;
    outline: none;
    opacity: ${({ altDisabledStyle }) => (altDisabledStyle ? '0.5' : '1')};
  }
`;

export const ButtonLight = styled(Base)`
  font-size: 16px;
  font-weight: 500;
  &:focus {
  }
  &:hover {
  }
  &:active {
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
  outline: none;
  &:focus {
    outline: none;
  }
  &:hover {
    outline: none;
  }
  &:active {
    outline: none;
  }
`;

export const ButtonSecondary = styled(Base)<{ padding?: string }>`
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

export const ButtonPink = styled(Base)`
  color: white;

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
`;

export const ButtonUNIGradient = styled(ButtonPrimary)`
  color: white;
  padding: 4px 8px;
  height: 36px;
  font-weight: 500;
  background: radial-gradient(174.47% 188.91% at 1.84% 0%, #ff007a 0%, #2172e5 100%), #edeef2;
  width: fit-content;
  position: relative;
  cursor: pointer;
  border: none;
  white-space: no-wrap;
  :hover {
    opacity: 0.8;
  }
  :active {
    opacity: 0.9;
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
    text-decoration: none;
  }
  &:active {
    text-decoration: none;
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

export function ButtonError({ error, ...rest }: { error?: boolean } & ButtonProps) {
  if (error) {
    return <ButtonErrorStyle {...rest} />;
  } else {
    return <ButtonPrimary {...rest} />;
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

export function ButtonDropdownGrey({ disabled = false, children, ...rest }: { disabled?: boolean } & ButtonProps) {
  return (
    <ButtonGray {...rest} disabled={disabled} style={{ borderRadius: '20px' }}>
      <RowBetween>
        <div style={{ display: 'flex', alignItems: 'center' }}>{children}</div>
        <ChevronDown size={24} />
      </RowBetween>
    </ButtonGray>
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

const ActiveOutlined = styled(ButtonOutlined)`
  border: 1px solid;
`;

const Circle = styled.div`
  height: 20px;
  width: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CheckboxWrapper = styled.div`
  width: 30px;
  padding: 0 10px;
`;

export function ButtonRadioChecked({ active = false, children, ...rest }: { active?: boolean } & ButtonProps) {
  if (!active) {
    return (
      <ButtonOutlined borderRadius="12px" padding="12px 8px" {...rest}>
        {<RowBetween>{children}</RowBetween>}
      </ButtonOutlined>
    );
  } else {
    return (
      <ActiveOutlined {...rest} padding="12px 8px" borderRadius="12px">
        {
          <RowBetween>
            {children}
            <CheckboxWrapper>
              <Circle>
                <Check size={13} />
              </Circle>
            </CheckboxWrapper>
          </RowBetween>
        }
      </ActiveOutlined>
    );
  }
}

const HoverIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  :hover {
    cursor: pointer;
    opacity: 0.6;
  }
`;

export const SavedIcon = ({
  fill = false,
  size = '20px',
  ...rest
}: { fill: boolean; size?: string } & HTMLAttributes<HTMLDivElement>) => {
  return (
    <HoverIcon {...rest}>
      <Star size={size} />
    </HoverIcon>
  );
};

export const SmallOptionButton = styled(Base)<{ $active?: boolean }>`
  padding: 4px;
  width: fit-content;
  font-size: 12px;
  border-radius: 4px;
  min-width: 36px;

  :hover {
    opacity: 0.6;
  }
`;

export const SmallOption = styled(ButtonOutlined)`
  padding: 4px;
`;
