import { Box } from '@/components/BoxV3';
import { TextInput } from '@/components/TextInput';
import styled from 'styled-components';

export const Wrapper = styled(Box)`
  text-align: center;
  display: flex;
  background-color: ${({ theme }) => theme?.color3};
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 10px;
  border-radius: 10px;
`;

export const PriceSection = styled(Box)`
  display: flex;
  gap: 20px;
  align-items: center;
`;

export const BlackBox = styled(Box)<{ disabled?: boolean }>`
  opacity: ${({ disabled }) => (disabled ? '0.2' : '1')};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'initial')};
  border-radius: 7px;
  display: flex;
  cursor: pointer;
  padding: 5px;
  flex-direction: row;
  height: 25px;
`;

export const InputText = styled(TextInput)`
  align-items: center;
  border-radius: 4px;
  text-align: center;
`;
