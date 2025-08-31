import { DoubleCurrencyLogo } from '@/components/DoubleCurrencyLogo';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePool } from '@/hooks/common';
//import { useChainId } from '@/provider';
import { Field } from '@/state/mint/atom';
import { useMintActionHandlers } from '@/state/mint/hooksElixir';
import { unwrappedTokenV3 } from '@/utils/wrappedCurrency';
import { Currency, CurrencyAmount } from '@pangolindex/sdk';
import { useCallback, useMemo, useState } from 'react';
import RemoveDrawer from '../EarnWidget/RemoveDrawer';
import IncreasePosition from '../IncreasePosition';
import { HeaderProps } from './types';
import { useConcLiqNFTPositionManagerContract } from '@/utils/contracts';
import { useSingleCallResult } from '@/state/multicallv3';
import { getBonusRewardTokens, getPendingRewards } from '@/hooks/evm';
import ReactTooltip from 'react-tooltip';
;
import { useUSDCPrice } from '@/hooks/useUSDCPrice/evm';
import { useToken } from '@/hooks/tokens/evm';
import { useCurrency } from '@/hooks/Tokens';
import { useComponentButton } from '@/contexts/ButtonContext';
import { useActiveWeb3React } from '@/hooks';
import { useChainId } from '@/provider';

const Header = ({ position, statItems, token0, token1, addModal }: HeaderProps) => {
  const chainId = useChainId();
  const { onCurrencySelection } = useMintActionHandlers(true);
  const [isRemoveDrawerVisible, setShowRemoveDrawer] = useState(false);
  const [isIncreasePositionVisible, setShowIncreasePosition] = useState(false);

  //const { enabled } = useButton();

  const currency0 = token0 && unwrappedTokenV3(token0, chainId);
  const currency1 = token1 && unwrappedTokenV3(token1, chainId);
  const [, pool] = usePool(currency0 ?? undefined, currency1 ?? undefined, position?.fee);
  const { enabled } = useComponentButton(position?.tokenId);

  const isClosedPosition = position?.liquidity.isZero();
  const isOutOfRange: boolean =
    position && pool ? pool.tickCurrent < position.tickLower || pool.tickCurrent >= position.tickUpper : false;

  const onOpenAddLiquidityModal = useCallback((currency0: Currency, currency1: Currency) => {
    onCurrencySelection(Field.CURRENCY_A, currency0);
    onCurrencySelection(Field.CURRENCY_B, currency1);
    addModal();
  }, []);

  const tokenId = isNaN(Number(position?.tokenId)) ? 0 : Number(position?.tokenId);

  const positionManager = useConcLiqNFTPositionManagerContract(false);

  const shouldFetchReward = Boolean(
    positionManager
    && !isNaN(tokenId) && tokenId > 0
    && position?.liquidity?.gt?.('0')
  );

  const rewardAmountCall = useSingleCallResult(
    shouldFetchReward ? positionManager : undefined,
    'positionReward',
    shouldFetchReward ? [tokenId] : undefined
  );

  const rewardAmount = useMemo(() => {
    if (rewardAmountCall.loading || rewardAmountCall.error || !rewardAmountCall.result) {
      return { totalReward: 0 };
    }
    return rewardAmountCall.result;
  }, [rewardAmountCall]);

  const pendingRewards = getPendingRewards(position?.token0, position?.token1, Number(position?.tokenId), rewardAmount?.totalReward.toString(), position?.fee);

  return (
    <div className="flex items-center justify-between gap-4 flex-col lg:flex-row">
      <div className="flex items-start gap-3 lg:items-center lg:w-2/3">
        <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={48} />
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-3">
            <h3>
              {currency0?.symbol}-{currency1?.symbol}
            </h3>
            <div className="flex gap-3">
              {!isClosedPosition ? <Badge variant="success">Open</Badge> : <Badge variant="destructive">Closed</Badge>}
              {!isOutOfRange ? <Badge>In Range</Badge> : <Badge variant="destructive">Out of Range</Badge>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="muted">(#{position?.tokenId.toNumber()})</span>
            {statItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="muted">/</span>
                <span className="muted">
                  {item.title}: {item.stat}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 w-full lg:w-1/3">
        <Button block onClick={() => setShowIncreasePosition(true)} className="flex items-center">
          <Icons.plus className="size-4 mr-2" />
          Add
        </Button>

        <div>
          <span className="text-slate-400 lg:hidden">APR</span>
          {!enabled ? (
            <>
              <h5 data-tip={`Please claim your bonus rewards before removing the position.`} className="lg:text-center" data-html={true} >
                <Button
                  block
                  variant="destructive"
                  onClick={() => setShowRemoveDrawer(true)}
                  className="flex items-center"
                  disabled={pendingRewards?.amounts?.[0] > 0}
                >
                  <Icons.x className="size-4 mr-2" />
                  Remove
                </Button>
              </h5>
              <ReactTooltip place="top" effect="solid" html={true} backgroundColor="#4E4E4E" />
            </>
          ) : (
            <Button
              block
              variant="destructive"
              onClick={() => setShowRemoveDrawer(true)}
              className="flex items-center"
            >
              <Icons.x className="size-4 mr-2" />
              Remove
            </Button>
          )}
        </div>

        <RemoveDrawer
          isOpen={isRemoveDrawerVisible}
          position={position}
          onClose={() => {
            setShowRemoveDrawer(false);
          }}
        />
        <IncreasePosition
          isOpen={isIncreasePositionVisible}
          position={position}
          onClose={() => {
            setShowIncreasePosition(false);
          }}
        />
      </div>
    </div>
  );
};

export default Header;
