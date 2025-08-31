import { ChainId, Token } from '@pangolindex/sdk';
import { useCallback, useMemo, useState } from 'react';
import { AlertTriangle } from 'react-feather';
import styled from 'styled-components';
import { useActiveWeb3React } from '../../hooks';
import { useAllTokens } from '../../hooks/Tokens';
import { getEtherscanLink, shortenAddress } from '../../utils';
import { ButtonError } from '../Button';
import { AutoColumn } from '../Column';
import CurrencyLogo from '../CurrencyLogoV3';
import Modal from '../Modal';
import { AutoRow, RowBetween } from '../Row';
import { useChainId } from '@/provider';
;

const Wrapper = styled.div<{ error: boolean }>`
  padding: 0.75rem;
  border-radius: 20px;
`;

const WarningContainer = styled.div`
  max-width: 420px;
  width: 100%;
  padding: 1rem;
  background: rgba(242, 150, 2, 0.05);
  border: 1px solid #f3841e;
  border-radius: 20px;
  overflow: auto;
`;

const StyledWarningIcon = styled(AlertTriangle)``;

interface TokenWarningCardProps {
  token?: Token;
}

function TokenWarningCard({ token }: TokenWarningCardProps) {
  const chainId = useChainId();

  const tokenSymbol = token?.symbol?.toLowerCase() ?? '';
  const tokenName = token?.name?.toLowerCase() ?? '';

  const allTokens = useAllTokens();

  const duplicateNameOrSymbol = useMemo(() => {
    if (!token || !chainId) return false;

    return Object.keys(allTokens).some(tokenAddress => {
      const userToken = allTokens[tokenAddress];
      if (userToken.equals(token)) {
        return false;
      }
      return userToken.symbol?.toLowerCase() === tokenSymbol || userToken.name?.toLowerCase() === tokenName;
    });
  }, [token, chainId, allTokens, tokenSymbol, tokenName]);

  if (!token) return null;

  return (
    <Wrapper error={duplicateNameOrSymbol}>
      <AutoRow gap="6px">
        <AutoColumn gap="24px">
          <CurrencyLogo currency={token} size={24} imageSize={48} />
          <div> </div>
        </AutoColumn>
        <AutoColumn gap="10px" justify="flex-start">
          <p>
            {token && token.name && token.symbol && token.name !== token.symbol
              ? `${token.name} (${token.symbol})`
              : token.name || token.symbol}{' '}
          </p>
          {chainId && (
            <a style={{ fontWeight: 400 }} href={getEtherscanLink(chainId, token.address, 'token')}>
              <small className="text-information" title={token.address}>
                {shortenAddress(token.address)} (View on the{' '}
                {chainId === ChainId.AVALANCHE ? 'Snowtrace' : 'Scrollscan'} Explorer)
              </small>
            </a>
          )}
        </AutoColumn>
      </AutoRow>
    </Wrapper>
  );
}

export default function TokenWarningModal({
  isOpen,
  tokens,
  onConfirm,
}: {
  isOpen: boolean;
  tokens: Token[];
  onConfirm: () => void;
}) {
  const [understandChecked, setUnderstandChecked] = useState(false);
  const toggleUnderstand = useCallback(() => setUnderstandChecked(uc => !uc), []);

  const handleDismiss = useCallback(() => null, []);
  return (
    <Modal isOpen={isOpen} onDismiss={handleDismiss} maxHeight={90}>
      <WarningContainer className="token-warning-container">
        <AutoColumn gap="lg">
          <AutoRow gap="6px">
            <StyledWarningIcon />
            <p color={'red2'}>Token imported</p>
          </AutoRow>
          <p color={'red2'}>
            Anyone can create an ERC-20 token on Avalanche with <em>any</em> name, including creating fake versions of
            existing tokens and tokens that claim to represent projects that do not have a token.
          </p>
          <p color={'red2'}>
            This interface can load arbitrary tokens by token addresses. Please take extra caution and do your research
            when interacting with arbitrary ERC-20 tokens.
          </p>
          <p color={'red2'}>
            If you purchase an arbitrary token, <strong>you may be unable to sell it back.</strong>
          </p>
          {tokens.map(token => {
            return <TokenWarningCard key={token.address} token={token} />;
          })}
          <RowBetween>
            <div>
              <label style={{ cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  className="understand-checkbox"
                  checked={understandChecked}
                  onChange={toggleUnderstand}
                />{' '}
                I understand
              </label>
            </div>
            <ButtonError
              disabled={!understandChecked}
              error={true}
              width={'140px'}
              padding="0.5rem 1rem"
              className="token-dismiss-button"
              style={{
                borderRadius: '10px',
              }}
              onClick={() => {
                onConfirm();
              }}
            >
              <p color="white">Continue</p>
            </ButtonError>
          </RowBetween>
        </AutoColumn>
      </WarningContainer>
    </Modal>
  );
}
