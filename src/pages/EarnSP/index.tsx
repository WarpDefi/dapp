import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader } from '@/components/ui/loader';
import { PageHeader } from '@/components/ui/page-header';
import { Separator } from '@/components/ui/separator';
import { JSBI } from '@pangolindex/sdk';
import { useCallback, useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'react-feather';
import farmImage from '../../assets/images/Farm22.webp';
import PoolCardV2Super from '../../components/earn/PoolCardV2Super';
import { useActiveWeb3React } from '../../hooks';
import useDebounce from '../../hooks/useDebounce';
import { STAKING_REWARDS_SP_INFO, useMinichefSPStakingInfos } from '../../state/stake/hooks';
;

enum SortingType {
  totalStakedInUsd = 'totalStakedInUsd',
  totalApr = 'totalApr',
}

export default function SuperFarms() {
  const chainId = useChainId();
  const stakingInfos = useMinichefSPStakingInfos();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<any>({ field: '', desc: true });
  const [stakingInfoData, setStakingInfoData] = useState<any[]>(stakingInfos);
  const [poolCardsLoading, setPoolCardsLoading] = useState(false);
  const [filteredPoolCards, setFilteredPoolCards] = useState<any[]>();
  const [poolCards, setPoolCards] = useState<any[]>();
  const debouncedSearchQuery = useDebounce(searchQuery, 250);
  const handleSearch = useCallback(event => {
    setSearchQuery(event.target.value.trim().toUpperCase());
  }, []);

  const deadList = [
    '0x7B8625A01936eD99FFaF02628Aa2A4E722f2d2B9',
    '0x2c63061e484ef21bDE9AC4a059aa1DD0Cf0dd08f',
    '0x2a300bcbe81B1406827D99090a11E8f487a9D036',
    '0xa7D7bcF974Ab5c71fdDF321afca2E44E75Eb6a10',
    '0xF1759ec33DB1b3d13e1E4Fa512Cad98Ee3e5fA83',
    '0xdf9e290E6b8C046fef97b48AB861442e543d145F',
    '0xE9eAbA344219922758f08aFB9ffaC15E9f981b33',
    '0xA1fB7219f2De81da27183D82587873A5b1be5979',
  ];

  const stakingRewardsExist = Boolean(
    typeof chainId === 'number' && (STAKING_REWARDS_SP_INFO[chainId]?.length ?? 0) > 0,
  );

  const getSortField = (label: string, field: string, sortBy: any, setSortBy: Function) => {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center space-x-2"
        onClick={() => {
          const desc = sortBy?.field === field ? !sortBy?.desc : true;
          setSortBy({ field, desc });
        }}
      >
        <span>{label}</span>
        {sortBy?.field === field && (sortBy?.desc ? <ChevronDown size="16" /> : <ChevronUp size="16" />)}
      </Button>
    );
  };

  useEffect(() => {
    const filtered = poolCards?.filter(
      card =>
        card.props.MinichefStakingInfo.tokens[0].symbol.toUpperCase().includes(debouncedSearchQuery) ||
        card.props.MinichefStakingInfo.tokens[1].symbol.toUpperCase().includes(debouncedSearchQuery),
    );
    setFilteredPoolCards(filtered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolCards, debouncedSearchQuery]);

  useEffect(() => {
    Promise.all(
      stakingInfoData.sort(function (info_a, info_b) {
        if (deadList.includes(info_a.stakingRewardAddress) || deadList.includes(info_b.stakingRewardAddress)) {
          return 0;
        }
        if (sortBy.field === SortingType.totalStakedInUsd) {
          if (sortBy.desc) {
            return info_a.totalStakedInUsd?.greaterThan(info_b.totalStakedInUsd ?? JSBI.BigInt(0)) ? -1 : 1;
          } else {
            return info_a.totalStakedInUsd?.lessThan(info_b.totalStakedInUsd ?? JSBI.BigInt(0)) ? -1 : 1;
          }
        }

        if (sortBy.field === SortingType.totalApr) {
          if (sortBy.desc) {
            return info_a.combinedApr > info_b.combinedApr ? -1 : 1;
          } else {
            return info_a.combinedApr < info_b.combinedApr ? -1 : 1;
          }
        }
        return 0;
      }),
    ).then(stakingInfoData => {
      const poolCards = stakingInfoData.map(stakingInfo => (
        <PoolCardV2Super key={stakingInfo.pid} MinichefStakingInfo={stakingInfo} />
      ));
      setPoolCards(poolCards);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy?.field, sortBy?.desc]);

  useEffect(() => {
    setPoolCardsLoading(true);
    if (stakingInfos?.length > 0) {
      Promise.all(
        stakingInfos
          /*.filter(function(info) {
            // Only include pools that are live or require a migration
            return !info.isPeriodFinished
          })*/
          .sort(function (info_a, info_b) {
            // only the first is being staked, so we should bring the first up
            if (info_a.stakedAmount.greaterThan(JSBI.BigInt(0)) && !info_b.stakedAmount.greaterThan(JSBI.BigInt(0)))
              return -1;
            // only the second is being staked, so we should bring the first down
            if (!info_a.stakedAmount.greaterThan(JSBI.BigInt(0)) && info_b.stakedAmount.greaterThan(JSBI.BigInt(0)))
              return 1;
            return 0;
          }),
        /*.map(stakingInfo => {
            return fetch(`https://api.pangolin.exchange/v2/43114/pangolin/aprs/${stakingInfo.pid}`)
              .then(res => res.json())
              .then(res => ({
                combinedApr: res[0].combinedApr,
                ...stakingInfo
              }))
          })*/
      ).then(updatedStakingInfos => {
        const poolCards = updatedStakingInfos.map(stakingInfo => (
          <PoolCardV2Super key={stakingInfo.pid} MinichefStakingInfo={stakingInfo} />
        ));
        setStakingInfoData(updatedStakingInfos);
        setPoolCards(poolCards);
        setPoolCardsLoading(false);
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stakingInfos?.length]);

  return (
    <>
      <PageHeader
        variant="farm"
        title="Pangolin Super Farms"
        description="Stake Pangolin Liquidity Provider (PGL) token to earn PNG & Bonus tokens"
        image={farmImage}
      />
      {stakingRewardsExist && stakingInfos?.length > 0 && (
        <>
          <Input id="token-search-input" placeholder="Token Name" value={searchQuery} onChange={handleSearch} />
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-sm">Sort by:</span>
            {getSortField('Liquidity', SortingType.totalStakedInUsd, sortBy, setSortBy)}
            <Separator orientation="vertical" />
            {getSortField('APR', SortingType.totalApr, sortBy, setSortBy)}
          </div>
        </>
      )}

      {!stakingRewardsExist ? 'No active rewards' : <>{filteredPoolCards}</>}

      {stakingRewardsExist && stakingInfos?.length === 0 && poolCardsLoading && <Loader style={{ margin: 'auto' }} />}
    </>
  );
}
