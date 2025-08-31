import { ChainId } from '@pangolindex/sdk';
import { ArrowUpCircle } from 'react-feather';
import styled from 'styled-components';
import Circle from '../../assets/images/blue-loader.svg';
import { useActiveWeb3React } from '../../hooks';
import { getEtherscanLink } from '../../utils';
import { AutoColumn, ColumnCenter } from '../Column';
import { Icons } from '../icons';
import { RowBetween } from '../Row';
import { useChainId } from '@/provider';
;

const ConfirmOrLoadingWrapper = styled.div`
  width: 100%;
  padding: 24px;
`;

const ConfirmedIcon = styled(ColumnCenter)`
  padding: 60px 0;
`;

export function LoadingView({ children, onDismiss }: { children: any; onDismiss: () => void }) {
  return (
    <ConfirmOrLoadingWrapper>
      <RowBetween>
        <div />
        <Icons.x onClick={onDismiss} />
      </RowBetween>
      <ConfirmedIcon>
      </ConfirmedIcon>
      <AutoColumn gap="100px" justify={'center'}>
        {children}
        <h5>Confirm this transaction in your wallet</h5>
      </AutoColumn>
    </ConfirmOrLoadingWrapper>
  );
}

export function SubmittedView({
  children,
  onDismiss,
  hash,
}: {
  children: any;
  onDismiss: () => void;
  hash: string | undefined;
}) {
  const chainId = useChainId();

  return (
    <ConfirmOrLoadingWrapper>
      <RowBetween>
        <div />
        <Icons.x onClick={onDismiss} />
      </RowBetween>
      <ConfirmedIcon>
        <ArrowUpCircle strokeWidth={0.5} size={90} />
      </ConfirmedIcon>
      <AutoColumn gap="100px" justify={'center'}>
        {children}
        {chainId && hash && (
          <a href={getEtherscanLink(chainId, hash, 'transaction')} style={{ marginLeft: '4px' }}>
            <h5>View transaction on the {chainId === ChainId.AVALANCHE ? 'Snowtrace' : 'Scrollscan'} Explorer</h5>
          </a>
        )}
      </AutoColumn>
    </ConfirmOrLoadingWrapper>
  );
}
