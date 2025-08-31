import { Button } from '@/components/ui/button';
import { CheckCircle, Copy } from 'react-feather';
import styled from 'styled-components';
import useCopyClipboard from '../../hooks/useCopyClipboard';

const TransactionStatusText = styled.span`
  margin-left: 0.25rem;
  font-size: 0.825rem;
  align-items: center;
`;

export default function CopyHelper(props: { toCopy: string; children?: React.ReactNode }) {
  const [isCopied, setCopied] = useCopyClipboard();

  return (
    <Button onClick={() => setCopied(props.toCopy)}>
      {isCopied ? (
        <TransactionStatusText>
          <CheckCircle size={'16'} />
          <TransactionStatusText>Copied</TransactionStatusText>
        </TransactionStatusText>
      ) : (
        <TransactionStatusText>
          <Copy size={'16'} />
        </TransactionStatusText>
      )}
      {isCopied ? '' : props.children}
    </Button>
  );
}
