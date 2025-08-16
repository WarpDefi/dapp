import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query'
import NoData from 'components/NoData'
import { useStakingList } from 'views/Staking/Hooks/useStakingList'
import { BorrowItem } from '../data/fetchListBorrowing'
import { CardLayout } from '../styles'
import LoanLoading from './LoanLoading'
import LoansCard from './LoansCard'


export default function Available(props: {refreshListBorrowing: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<{ data: BorrowItem[]; }, Error>>}) {
  const { data, refresh, loading } = useStakingList()
  const handleRefresh: any = () => {
    refresh();
    props?.refreshListBorrowing()
  }
  if(!loading && (data?.staked.length === 0 || !data)) {
    return (
      <NoData/>
    )
  }
  return (
    <>
      <CardLayout>
        {loading ? <LoanLoading/> : (
          data?.staked.map((item) => (
            <LoansCard stakeInfo={item} key={item.id} refreshListLoans={handleRefresh}/>
          ))
        )}
      </CardLayout>
    </>
  )
}