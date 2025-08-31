import { darken, transparentize } from 'polished';
import { ChevronDown, ChevronUp, Plus } from 'react-feather';
import { Button as RebassButton } from 'rebass/styled-components';
import styled from 'styled-components';
import { RowBetween } from '../Row';

const Base = styled(RebassButton)`
  padding: 8px 12px;
  font-size: 0.825rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  outline: none;
  border: 1px solid transparent;
  outline: none;
  border-bottom-right-radius: ${({ open }) => open && '0'};
  border-bottom-left-radius: ${({ open }) => open && '0'};
`;

const BaseCustom = styled(RebassButton)`
  padding: 16px 12px;
  font-size: 0.825rem;
  font-weight: 400;
  border-radius: 12px;
  cursor: pointer;
  outline: none;
`;

const Dull = styled(Base)`
  background-color: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: black;
  height: 100%;
  font-weight: 400;
  &:hover,
  :focus {
    background-color: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.25);
  }
  &:focus {
    box-shadow: 0 0 0 1pt rgba(255, 255, 255, 0.25);
  }
  &:active {
    background-color: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.25);
  }
`;

export default function ButtonStyled({ children, ...rest }) {
  return <Base {...rest}>{children}</Base>;
}

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const ButtonLight = styled(Base)`
  min-width: fit-content;
  border-radius: 12px;
  white-space: nowrap;

  a {
  }

  :hover {
  }
`;

export function ButtonDropdown({ disabled = false, children, open, ...rest }) {
  return (
    <ButtonFaded {...rest} disabled={disabled} ope={open}>
      <RowBetween>
        <div style={{ display: 'flex', alignItems: 'center' }}>{children}</div>
        {open ? (
          <StyledIcon>
            <ChevronUp size={24} />
          </StyledIcon>
        ) : (
          <StyledIcon>
            <ChevronDown size={24} />
          </StyledIcon>
        )}
      </RowBetween>
    </ButtonFaded>
  );
}

export const ButtonDark = styled(Base)`
  color: white;
  width: fit-content;
  border-radius: 12px;
  white-space: nowrap;

  :hover {
  }
`;

export const ButtonFaded = styled(Base)`
  color: (255, 255, 255, 0.5);
  white-space: nowrap;

  :hover {
    opacity: 0.5;
  }
`;

export function ButtonPlusDull({ disabled, children, ...rest }) {
  return (
    <Dull {...rest}>
      <ContentWrapper>
        <Plus size={16} />
        <div style={{ display: 'flex', alignItems: 'center' }}>{children}</div>
      </ContentWrapper>
    </Dull>
  );
}

export function ButtonCustom({ children, bgColor, color, ...rest }) {
  return (
    <BaseCustom bg={bgColor} color={color} {...rest}>
      {children}
    </BaseCustom>
  );
}

export const OptionButton = styled.div`
  font-weight: 500;
  width: fit-content;
  white-space: nowrap;
  padding: 6px;
  border-radius: 6px;

  :hover {
    cursor: ${({ disabled }) => !disabled && 'pointer'};
  }
`;

export const OptionButtonChart = styled.div`
  width: fit-content;
  white-space: nowrap;
  padding: 6px;
  border-radius: 6px;

  :hover {
    cursor: ${({ disabled }) => !disabled && 'pointer'};
  }
`;
