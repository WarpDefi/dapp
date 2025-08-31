import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { getEtherscanLink } from '@/utils';
import { ChainId } from '@pangolindex/sdk';
import { AlertTriangle, ArrowUpCircle } from 'react-feather';
import { Text } from 'rebass';
import styled from 'styled-components';
;
import { CloseIcon } from '../CloseIcon';
import { AutoColumn } from '../Column';
import Modal from '../Modal';
import { RowBetween } from '../Row';
import { useActiveWeb3React } from '@/hooks';
import { useChainId } from '@/provider';

const Wrapper = styled.div`
  width: 100%;
`;
const Section = styled(AutoColumn)`
  padding: 24px;
`;

const BottomSection = styled(Section)`
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
`;

function ConfirmationPendingContent({ onDismiss, pendingText }: { onDismiss: () => void; pendingText: string }) {
  return (
    <div className="w-full flex flex-col items-center p-6 gap-6">
      <Icons.loader className="animate-spin size-32 text-primary" />
      <div className="flex flex-col items-center gap-3">
        <h4>Waiting For Confirmation</h4>
        <h4 className="text-center">{pendingText}</h4>
        <small className="text-muted-foreground">Confirm this transaction in your wallet</small>
      </div>
    </div>
  );
}

function TransactionSubmittedContent({
  onDismiss,
  chainId,
  hash,
}: {
  onDismiss: () => void;
  hash: string | undefined;
  chainId: ChainId;
}) {
  return (
    <div className="w-full flex flex-col items-center p-6 gap-6">
      <ArrowUpCircle className="size-32 text-primary" />
      <div className="flex flex-col items-center gap-3 w-full">
        <h4>Transaction Submitted</h4>
        {chainId && hash && (
          <a href={getEtherscanLink(chainId, hash, 'transaction')}>
            <small className="underline">
              View on the {chainId === ChainId.AVALANCHE ? 'Snowtrace' : 'Scrollscan'} Explorer
            </small>
          </a>
        )}
        <Button block onClick={onDismiss}>
          Close
        </Button>
      </div>
    </div>
  );
}

export function ConfirmationModalContent({
  title,
  bottomContent,
  onDismiss,
  topContent,
}: {
  title: string;
  onDismiss: () => void;
  topContent: () => React.ReactNode;
  bottomContent: () => React.ReactNode;
}) {
  return (
    <Wrapper>
      <Section>
        <RowBetween>
          <Text fontWeight={500} fontSize={20}>
            {title}
          </Text>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        {topContent()}
      </Section>
      <BottomSection gap="12px">{bottomContent()}</BottomSection>
    </Wrapper>
  );
}

export function TransactionErrorContent({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="w-full flex flex-col items-center p-6 gap-6">
      <div className="flex items-center justify-between w-full">
        <h4>Error</h4>
        <CloseIcon onClick={onDismiss} />
      </div>
      <AlertTriangle className="size-32 text-destructive" />
      <p className="text-destructive text-center">{message}</p>
      <Button block onClick={onDismiss}>
        Dismiss
      </Button>
    </div>
  );
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  hash: string | undefined;
  content: () => React.ReactNode;
  attemptingTxn: boolean;
  pendingText: string;
}

export default function TransactionConfirmationModal({
  isOpen,
  onDismiss,
  attemptingTxn,
  hash,
  pendingText,
  content,
}: ConfirmationModalProps) {
  const chainId = useChainId();

  if (!chainId) return null;

  // confirmation screen
  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss}>
      {attemptingTxn ? (
        <ConfirmationPendingContent onDismiss={onDismiss} pendingText={pendingText} />
      ) : hash ? (
        <TransactionSubmittedContent chainId={chainId} hash={hash} onDismiss={onDismiss} />
      ) : (
        content()
      )}
    </Modal>
  );
}
