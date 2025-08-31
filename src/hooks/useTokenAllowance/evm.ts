import { useSingleCallResult } from '@/state/multicallv3';
import { Token, TokenAmount } from '@pangolindex/sdk';
import { useMemo } from 'react';
import { useTokenContract } from '../useContract';

export function useTokenAllowance(token?: Token, owner?: string, spender?: string): TokenAmount | undefined {
  const contract = useTokenContract(token?.address, false);

  const inputs = useMemo(() => [owner, spender], [owner, spender]);

  const allowance = useSingleCallResult(contract, 'allowance', inputs).result;

  return useMemo(
    () => (token && allowance ? new TokenAmount(token, allowance.toString()) : undefined),
    [token, allowance],
  );
}
