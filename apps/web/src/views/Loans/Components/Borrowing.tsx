import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import NoData from 'components/NoData'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useBalance } from 'wagmi'
import { BorrowItem } from '../data/fetchListBorrowing'
import { CardLayout } from '../styles'
import LoanLoading from './LoanLoading'
import LoansCard from "./LoansCard"


export default function Borrowing(props: {  
    data: BorrowItem[] | undefined;
    isLoading: boolean;
    refetch: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<{ data: BorrowItem[]; }, Error>>;
  }) {
  const {data, isLoading } = props
  const { account } = useAccountActiveChain()
  const nativeBalance = useBalance({ address: account ?? undefined, watch: true })
  // const {totalRepayableU2U, totalInterestForBorrowingU2U, lastDueDate, setTotalRepayable, setTotalCollateral} = useContext(LoanContext)
  const stakeInfo = {
    id: '',
    amount: '',
    amountDisplay: '',
    timestamp: 0,
    reward: BigNumber(0),
    rewardDisplay: '',
  }


  if(!isLoading && data?.length === 0) {
    return (
      <NoData/>
    )
  }
  return (
    <>
      <CardLayout>
      {
        isLoading ? <LoanLoading/> : (
          data && data?.map((item) => (
            <LoansCard type stakeInfo={stakeInfo}  borrowing={item} key={item.id} refreshListLoans={props.refetch} nativeBalance={nativeBalance}/>
          ))
        )
      }
      </CardLayout>
    </>
  )
}