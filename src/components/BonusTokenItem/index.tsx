import React from 'react';
import { useSingleCallResult } from '@/state/multicallv3/hooks';
import { getTokenLogoURL } from '@/components/CurrencyLogoV3/getTokenLogoURL';
import { useTokenContract } from '@/hooks/useContract';

interface BonusTokenItemProps {
  address: string;
  rewardValue?: number;
  chainId: number;
}

const BonusTokenItem: React.FC<BonusTokenItemProps> = ({ address, rewardValue, chainId }) => {
  const tokenContract = useTokenContract(address);
  const tokenSymbol = useSingleCallResult(tokenContract, 'symbol').result;
  const tokenDecimals = useSingleCallResult(tokenContract, 'decimals').result;

  const userBalance = rewardValue && tokenDecimals
    ? Number(rewardValue) / (10 ** Number(tokenDecimals))
    : 0;

  const logoUrl = getTokenLogoURL(address, chainId, 24);

  return (
    <div className="flex items-center gap-2 justify-between">
      <div className="flex items-center gap-2">
        <img src={logoUrl} alt="token logo" />
        {tokenSymbol || '-'}
      </div>
      <small>{userBalance.toFixed(8)}</small>
    </div>
  );
};

export default BonusTokenItem;
