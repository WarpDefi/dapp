//import { opacify } from 'polished';
import { Box } from '@/components/BoxV3';
import { Text } from '@/components/TextV3';
import styled from 'styled-components';

export const CurrencyRoot = styled(Box)<{ disabled: boolean; selected: boolean }>`
  cursor: ${({ disabled }) => !disabled && 'pointer'};
  pointer-events: ${({ disabled }) => disabled && 'none'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;

  opacity: ${({ disabled, selected }) => (disabled || selected ? 0.5 : 1)};
`;

export const Balance = styled(Text)`
  justify-self: flex-end;
  text-align: center;
  word-break: break-all;
  width: 100%;
  hyphens: manual;
`;
