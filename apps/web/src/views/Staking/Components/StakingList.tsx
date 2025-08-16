import { useTranslation } from '@pancakeswap/localization'
import { Box, Flex, Skeleton, Text } from '@pancakeswap/uikit'
import NoData from 'components/NoData'
import { useStakingList } from '../Hooks/useStakingList'
import { BorderLayout, StyledIcon, StyledIconImage, StyledTextTitle } from '../style'
import StakingItem from './StakingItem'
import StakingLoading from './StakingLoading'

function StakingList() {
  const { t } = useTranslation()
  const { data, periodTime, loading } = useStakingList()
  
  const renderHeaderItem = ({image, title, value}: {
    image: string, 
    title: string,
    value: string | null | undefined,
  }) => {
    return (
      <Flex alignItems="center" flexDirection={["column", "column", "row"]} mb={["10px", "0px"]}>
        <StyledIcon>
          <StyledIconImage src={image} />
        </StyledIcon>
        <Box ml={["0", "0", "12px", "12px", "12px", "16px"]} mt={["6px", "8px", "0px"]}>
          <StyledTextTitle fontSize={["10px", "10px", "10px", "10px", "10px", "10px", "12px", "12px"]}>{t(title)}</StyledTextTitle>
          {loading ? <Skeleton m={["auto", "auto", "unset"]} height={12} width={60}/> : <Text style={{ textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '120px' }} textAlign={["center", "center", "left"]} fontSize={["16px", "16px", "16px", "16px", "16px", "16px", "17px", "17px"]} fontWeight="600">
            {value ?? '0'}
          </Text>}
        </Box>
      </Flex>
    )
  }
  
  const renderHeader = () => {
    return (
      <BorderLayout p="16px">
        <Flex justifyContent={["center", "space-between", "space-around"]} flexDirection={["column", "row"]}>
          {renderHeaderItem({
            image: "/images/staking/icon-package.svg", 
            title: 'Total Package', 
            value: data?.totalPackage?.toString()
          })}
          {renderHeaderItem({
            image: "/images/staking/icon-amount.svg", 
            title: 'Total Staked Amount', 
            value: data?.totalStakedDisplay
          })}
          {renderHeaderItem({
            image: "/images/staking/icon-reward.svg", 
            title: 'Total U2U Reward', 
            value: data?.totalRewardDisplay
          })}
        </Flex>
      </BorderLayout>
    )
  }

  const renderList = () => {
    if(!loading && (data?.staked.length === 0 && data?.unStake.length === 0 || !data)) {
      return (
        <NoData/>
      )
    }
    return (
      <>
        {data?.staked.map((e) => {
          return <StakingItem stakedInfo={e} periodTime={periodTime ?? Number.NaN} isUnStake={false} key={`amm-staked-${e.id}`}/>
        })}
        {data?.unStake.map((e) => {
          return <StakingItem stakedInfo={e} periodTime={periodTime ?? Number.NaN} isUnStake key={`amm-un-staked-${e.id}`}/>
        })}
      </>
    )
  }

  return (
    <>
      {renderHeader()}
      {loading ? <StakingLoading/> : renderList()}
    </>
  )
}

export default StakingList
