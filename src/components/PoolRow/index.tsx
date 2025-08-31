import { Icons } from '@/components/icons';
import { getBonusRewardEndTime, getBonusRewardTokens, getRewardMultipliers } from '@/hooks/evm';
import { calcAPR } from '@/hooks/usePoolMetrics';
import { Button } from '@/components/ui/button';
import { ConnectWalletButtonRainbow } from '@/components/ui/connect-wallet-button-rainbow';
import { useActiveWeb3React } from '@/hooks';
import { useChainId } from '@/provider';
import { useAllTokenData } from '@/state/tokens/hooks';
import { unwrappedTokenV3 } from '@/utils/wrappedCurrency';
import { Currency, FeeAmount } from '@pangolindex/sdk';
import { FC } from 'react';
import ReactTooltip from 'react-tooltip';
import { getTokenLogoURL } from '../CurrencyLogoV3/getTokenLogoURL';
import { DoubleCurrencyLogoV2 } from '../DoubleLogoNew';
import './NeonBonusRewards.css';
import { useAccount } from 'wagmi';

interface PoolRowProps {
  pool: any;
  onOpenAddLiquidityModal: (currency0: Currency, currency1: Currency, fee: FeeAmount) => void;
}

export const PoolRow: FC<PoolRowProps> = ({ pool, onOpenAddLiquidityModal }) => {
  const { account } = useActiveWeb3React();
  const { address: wagmiAccount } = useAccount(); // RainbowKit/wagmi account
  const finalAccount = account || wagmiAccount;
  const chainId = useChainId();

  const rewardDay = { '0x11476e10eB79ddfFa6F2585BE526d2bd840C3E20': 10 };

  const currency0 = pool?.token0 && unwrappedTokenV3(pool?.token0, chainId);
  const currency1 = pool?.token1 && unwrappedTokenV3(pool?.token1, chainId);

  const apr = calcAPR(pool?.volumeUSD, pool?.volumeUSDWeek, pool?.tvlUSD, pool?.feeTier);

  const bonusEndTime = getBonusRewardEndTime(pool?.token0, pool?.token1, pool?.initialFee);
  const bonusTokens = getBonusRewardTokens(pool?.token0, pool?.token1, pool?.initialFee);
  const rewardMultipliers = getRewardMultipliers(pool?.token0, pool?.token1, pool?.initialFee);

  const allTokenData = useAllTokenData();

  const listItems = bonusTokens?.[0]?.map((address: string) => {
    const logoUrl = bonusTokens[0].length > 0 ? getTokenLogoURL(address, chainId, 24) : undefined;
    return <img key={address} className="token-logo" src={logoUrl} alt="token logo" />;
  });

  const listItems2 = bonusTokens?.[0]?.map((address: string, index: number) => {
    const data = allTokenData[address.toLocaleLowerCase()];
    const priceUSD = data?.data?.priceUSD;
    const decimals = data?.data?.decimals;
    const rewardPerSecondUSD =
      rewardMultipliers &&
      decimals &&
      priceUSD &&
      (Number(rewardMultipliers?.[0]?.[index]) / 10 ** decimals) * priceUSD;
    const rewardPerYearUSD = rewardPerSecondUSD && rewardPerSecondUSD * 31536000;
    const rewardAPR = rewardPerYearUSD && (rewardPerYearUSD / pool.tvlUSD) * 100;
    return rewardAPR;
  });

  const aprList =
    Number(bonusEndTime) > Date.now() / 1000 && Number(bonusEndTime) !== 0
      ? listItems2.filter((apr: any): apr is number => apr !== undefined)
      : [];

  const totalBonusAPR = aprList.reduce((acc: number, curr: number) => acc + curr, 0);

  const displayedAPR = aprList.length > 0 ? apr + totalBonusAPR : apr;

  const formattedTVL = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(pool.tvlUSD);

  const formattedVLM = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(pool.volumeUSD);

  return (
    <div className="mb-4 border p-4 rounded-md flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
      <div className="flex items-center gap-2 lg:w-1/4 justify-between">
        <div className='flex items-center gap-2'>
          <DoubleCurrencyLogoV2 currency0={currency0} currency1={currency1} size={32} />
          <h5>
            {currency0?.symbol}-{currency1?.symbol}
          </h5>
        </div>
        {Number(bonusEndTime) > Date.now() / 1000 && Number(bonusEndTime) !== 0 && (
          <div className="neon-wrapper small">
            <div className="neon-title">Bonus Rewards</div>
            <div className="neon-container">{listItems}</div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-3 lg:grid-cols-5 lg:w-3/4">
        <div>
          <span className="text-slate-400 lg:hidden">Fee</span>
          <h5 className="lg:text-center">{Number(pool.feeTier) / 10 ** 4}%</h5>
        </div>
        <div>
          <span className="text-slate-400 lg:hidden">APR</span>
          {aprList.length > 0 ? (
            <>
              <h5
                data-tip={`Base APR: ${apr.toFixed(2)}%<br/>Bonus APR: ${totalBonusAPR.toFixed(2)}%`}
                className="lg:text-center"
                data-html={true}
              >
                <span className="border-b border-dotted border-gray-400">{displayedAPR.toFixed(2)}%</span>
              </h5>
              <ReactTooltip place="top" effect="solid" html={true} backgroundColor="#4E4E4E" />
            </>
          ) : (
            <h5 className="lg:text-center">{displayedAPR.toFixed(2)}%</h5>
          )}
        </div>
        <div>
          <span className="text-slate-400 lg:hidden">TVL</span>
          <h5 className="lg:text-center">{formattedTVL}</h5>
        </div>
        <div>
          <span className="text-slate-400 lg:hidden">Volume 24H</span>
          <h5 className="lg:text-center">{formattedVLM}</h5>
        </div>
        <div>
          <span className="text-slate-400 lg:hidden">Pool Type</span>
          <h5 className="lg:text-center">v3</h5>
        </div>
      </div>
      <div className="lg:w-[160px]">
        {!finalAccount ? (
          <ConnectWalletButtonRainbow />
        ) : (
          <Button onClick={() => onOpenAddLiquidityModal(currency0!, currency1!, pool?.initialFee)}>
            <Icons.plus className="mr-2 size-4" />
            Add Liquidity
          </Button>
        )}
      </div>
    </div>
  );
};
