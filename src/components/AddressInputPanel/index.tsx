import { useContext, useCallback, ChangeEvent } from 'react';
import styled, { ThemeContext } from 'styled-components';
import useENS from '../../hooks/useENS';
import { useActiveWeb3React } from '../../hooks';
import { AutoColumn } from '../Column';
import { RowBetween } from '../Row';
import { getEtherscanLink } from '../../utils';
import { ChainId } from '@pangolindex/sdk';
;

const InputPanel = styled.div`
  position: relative;
  border-radius: 1.25rem;
  z-index: 1;
  width: 100%;
`;

const ContainerRow = styled.div<{ error: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 1.25rem;
  transition:
    border-color 300ms ${({ error }) => (error ? 'step-end' : 'step-start')},
    color 500ms ${({ error }) => (error ? 'step-end' : 'step-start')};
`;

const InputContainer = styled.div`
  flex: 1;
  padding: 1rem;
`;

const Input = styled.input<{ error?: boolean }>`
  font-size: 1.25rem;
  outline: none;
  border: none;
  flex: 1 1 auto;
  width: 0;
  transition: color 300ms ${({ error }) => (error ? 'step-end' : 'step-start')};
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  width: 100%;
  padding: 0px;
  -webkit-appearance: textfield;

  ::-webkit-search-decoration {
    -webkit-appearance: none;
  }

  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
`;

export default function AddressInputPanel({
  id,
  value,
  onChange,
}: {
  id?: string;
  // the typed string value
  value: string;
  // triggers whenever the typed value changes
  onChange: (value: string) => void;
}) {
  const chainId = useChainId();

  const { address, loading, name } = useENS(value);

  const handleInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.target.value;
      const withoutSpaces = input.replace(/\s+/g, '');
      onChange(withoutSpaces);
    },
    [onChange],
  );

  const error = Boolean(value.length > 0 && !loading && !address);

  return (
    <InputPanel id={id}>
      <ContainerRow error={error}>
        <InputContainer>
          <AutoColumn gap="md">
            <RowBetween>
              <small>Recipient</small>
              {address && chainId && (
                <a href={getEtherscanLink(chainId, name ?? address, 'address')} style={{ fontSize: '14px' }}>
                  (View on {chainId === ChainId.AVALANCHE ? 'Snowtrace' : 'Scrollscan'} Explorer)
                </a>
              )}
            </RowBetween>
            <Input
              className="recipient-address-input"
              type="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              placeholder="Wallet Address"
              error={error}
              pattern="^(0x[a-fA-F0-9]{40})$"
              onChange={handleInput}
              value={value}
            />
          </AutoColumn>
        </InputContainer>
      </ContainerRow>
    </InputPanel>
  );
}
