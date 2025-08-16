import { formatEther } from 'ethers/lib/utils';
import useAccountActiveChain from 'hooks/useAccountActiveChain';
import useCatchTxError from 'hooks/useCatchTxError';
import { useStakingContract } from 'hooks/useContract';
import { MutableRefObject, createContext, useEffect, useRef, useState } from 'react';
import { getBorrowAddress, getVaultLoansAddress } from 'utils/addressHelpers';
import { publicClient } from 'utils/client';
import { LoansPackageItem, fetchLoansPackages } from './data/listLoansPackage';
// Initiate Context
export interface ContextApi {
  isApproved: boolean,
  isLoading: boolean,
  loansPackages: LoansPackageItem[],
  totalCollateral: number,
  totalRepayable: number,
  balanceVault: string,
  totalRepayableU2U: MutableRefObject<number>,
  totalInterestForBorrowingU2U: MutableRefObject<number>,
  lastDueDate: MutableRefObject<number>
  checkApproved?: () => void,
  approveForAll?: () => void,
  setTotalCollateral?: (value: number) => void,
  setTotalRepayable?: (value: number) => void,
  getVaultLoansBalance?: () => Promise<string | undefined>
}
const LoanContext = createContext<ContextApi>({isApproved: false, isLoading: false, loansPackages: [], totalCollateral: 0, totalRepayable: 0, totalRepayableU2U: {current: 0}, totalInterestForBorrowingU2U: {current: 0}, lastDueDate: { current: 0 }, balanceVault: '0'});
// Provide Context
export const LoanProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [isApproved, setApprove] = useState<boolean>(false)
  const [isLoading, setLoading] = useState<boolean>(false)
  const totalRepayableU2U = useRef(0)
  const totalInterestForBorrowingU2U = useRef(0)
  const lastDueDate = useRef(0)
  const [totalCollateral, setTotalCollateral] = useState<number>(0)
  const [balanceVault, setBalanceVault] = useState<string>('0')
  const [totalRepayable, setTotalRepayable] = useState<number>(0)
  const [loansPackages, setLoansPackages] = useState<LoansPackageItem[]>([])
  const { fetchWithCatchTxError } = useCatchTxError()
  const { account, chainId } = useAccountActiveChain()
  const stakingContract = useStakingContract()

  const getVaultLoansBalance = async (): Promise<string | undefined> => {
    const client = publicClient({ chainId})
    if(client) {
      const balance = await client.getBalance({address: getVaultLoansAddress(chainId)})
      setBalanceVault(formatEther(balance))
      return formatEther(balance)
    }
    return undefined
  }


  const initData = async () => {
    const listPackage = await fetchLoansPackages()
    if(listPackage.data?.length > 0) {
      setLoansPackages(listPackage.data)
    }
  }

  const checkApproved = async () => {
    if(!stakingContract.account) return
    const status: any = await stakingContract.read.isApprovedForAll([account, getBorrowAddress(chainId)])
    setApprove(status)
  }



  const approveForAll = async () => {
    if(!stakingContract.account) return
    setLoading(true)
    const receipt = await fetchWithCatchTxError(() => stakingContract.write.setApprovalForAll([getBorrowAddress(chainId), true]))
    if (receipt?.status) {
      checkApproved()
    }
    setLoading(false)
  }
  useEffect(() => {
    if(stakingContract.account) {
      initData()
      checkApproved()
    }
  }, [stakingContract?.account])

  useEffect(() => {
    getVaultLoansBalance()
  }, [])



  return (
    <LoanContext.Provider value={{isApproved, isLoading, loansPackages, totalCollateral, totalRepayable, totalRepayableU2U, totalInterestForBorrowingU2U, lastDueDate, balanceVault, checkApproved, approveForAll, setTotalCollateral, setTotalRepayable, getVaultLoansBalance}}>
      {children}
    </LoanContext.Provider>
  )
}

export default LoanContext;