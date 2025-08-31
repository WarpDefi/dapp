import { ChainId } from '@pangolindex/sdk';
import { AlertCircle, CheckCircle } from 'react-feather';
import { useActiveWeb3React } from '../../hooks';
import { getEtherscanLink } from '../../utils';
import { AutoColumn } from '../Column';
import { useChainId } from '@/provider';
;

export default function TransactionPopup({
  hash,
  success,
  summary,
}: {
  hash: string;
  success?: boolean;
  summary?: string;
}) {
  const chainId = useChainId();

  return (
    <div className="flex-nowrap">
      <div style={{ paddingRight: 16 }}>{success ? <CheckCircle size={24} /> : <AlertCircle size={24} />}</div>
      <AutoColumn gap="8px">
        <p className="font-semibold">{summary ?? 'Hash: ' + hash.slice(0, 8) + '...' + hash.slice(58, 65)}</p>
        {chainId && (
          <a href={getEtherscanLink(chainId, hash, 'transaction')}>
            View on the {chainId === ChainId.AVALANCHE ? 'Snowtrace' : 'Scrollscan'} Explorer
          </a>
        )}
      </AutoColumn>
    </div>
  );
}
