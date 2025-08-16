import { useTranslation } from '@pancakeswap/localization'
import { Box, Button, Dots, Flex, Select, Slider, Text, useModal, useToast } from '@pancakeswap/uikit'
import { formatNumber } from '@pancakeswap/utils/formatBalance'
import { NumericalInput } from '@pancakeswap/widgets-internal'
import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { ToastDescriptionWithTx } from 'components/Toast'
import dayjs from 'dayjs'
import { formatEther, parseEther } from 'ethers/lib/utils'
import useCatchTxError from 'hooks/useCatchTxError'
import { useBorrowContract } from 'hooks/useContract'
import { useCallback, useContext, useEffect, useState } from 'react'
import styled from 'styled-components'
import { formatDate } from 'views/CakeStaking/components/DataSet/format'
import { StakedInfo } from 'views/Staking/Hooks/useStakingList'
import LoanContext from '../LoanContext'
import { BorrowItem } from '../data/fetchListBorrowing'
import { LoansPackageItem } from '../data/listLoansPackage'
import LoansModal, { LoansView } from './LoansModal'

const CardLayout = styled(Box)`
  border-radius: 8px;
  border: 2px solid ${({ theme }) => theme.colors.cardBorder};
  box-shadow: ${({ theme }) => theme.shadows.card};
  background: ${({ theme }) => theme.colors.backgroundAlt};
`
const CardHeader = styled(Flex)`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  background: ${({ theme }) => theme.colors.backgroundPage};
  border-bottom: 1px dashed ${({ theme }) => theme.colors.cardBorder};
  border-radius: 8px 8px 0 0;
  padding: 20px;
`
const CardBody = styled.div`
  padding: 24px 20px;
`
const Span = styled.span`
  font-size: 16px;
  font-weight: 500;
  line-height: 1;
  margin-left: 6px;
`
const StyledButton = styled(Button)`
  margin-top: 24px;
  height: 44px;
`
const StyledText = styled(Text)`
  line-height: 18px;
  font-size: 15px;
  font-weight: 400;
  &:nth-child(1) {
    min-width: 130px;
  }
  &:nth-child(2) {
    text-align: right;
  }
  @media screen and (max-width: 1559px) {
    font-size: 14px;
  }
`

const MaxButton = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  text-decoration: underline;
`

const StyledInput = styled(NumericalInput)`
  background-color: rgba(191, 252, 251, 0.2);
  border-radius: 4px;
  box-shadow: 2px 2px 0 0 ${({ theme }) => theme.colors.cardBorder};
  color: rgba(159, 159, 159, 1);
  display: block;
  font-size: 16px;
  height: 40px;
  outline: 0;
  padding: 0 14px;
  width: 100%;
  border: 2px solid ${({ theme }) => theme.colors.cardBorder};
  text-align: right;
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSubtle};
  }
  max-width: 180px;
  @media screen and (max-width: 1199px) {
    max-width: 100%;
  }
`
const StyledSlider = styled(Slider)`
  width: 66%;
  height: 22px;
`
const FlexInput = styled(Flex)`
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
  @media screen and (max-width: 1199px) {
    flex-direction: column;
    align-items: flex-start;
  }
  @media screen and (max-width: 575px) {
    margin-bottom: 20px;
  }
  div {
    @media screen and (max-width: 1199px) {
      margin-bottom: 10px;
    }
    @media screen and (max-width: 991px) {
      margin-bottom: 8px;
    }
    @media screen and (max-width: 575px) {
      margin-bottom: 6px;
    }
  }
`

const ErrorMessage = styled.div`
  color: red;
  position: absolute;
  right: 0;
  bottom: -20px;
  font-size: 14px;
  font-style: italic;
}
`

type LoansProps = {
  type?: boolean,
  stakeInfo: StakedInfo,
  borrowing?: BorrowItem,
  nativeBalance?: any,
  refreshListLoans?: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<{ data: BorrowItem[]; }, Error>>;
}

const LoansCard = ({ type, stakeInfo, borrowing, nativeBalance, refreshListLoans }: LoansProps) => {
  const { t } = useTranslation()
  const { toastSuccess, toastError } = useToast()
  const [period, setPeriod] = useState<LoansPackageItem | undefined>(undefined)
  const borrowContract = useBorrowContract()
  const { isApproved, isLoading, loansPackages, balanceVault, approveForAll, getVaultLoansBalance } = useContext(LoanContext)
  const [ currentBalanceValue, setCurrentBalanceValue ] = useState(balanceVault)
  const { fetchWithCatchTxError } = useCatchTxError()
  const listPeriod: any = []

  loansPackages.forEach((item: LoansPackageItem) => {
    if(item.period) {
      listPeriod.push({
        label: item.symbolTime,
        value: item.id,
        item
      })
    }
  })
  // const [amountStake, setAmountStake] = useState('0') 
  const [borrowValue, setBorrowValue] = useState('')
  const [percentForSlider, onPercentSelectForSlider] = useState(0)
  const [isCallContract, setIsCallContract] = useState(false)
  const [isFocusInput, setIsFocusInput] = useState(false)
  const [errorMinBorrow, setErrorMinBorrow] = useState(false)
  const onMax = () => {
    const _borrowValue = (Number(formatEther(stakeInfo.amount)) * (Number(period?.maxBorrowRatio) / 100))
    setBorrowValue(_borrowValue.toFixed(7) || '0')
    onPercentSelectForSlider(Number(period?.maxBorrowRatio))
  }

  let  totalInterest = 0
  let repaymentAmount = 0
  let maxBorrowU2U: string | number = 0

  if(borrowing?.id) {
    totalInterest = Number(formatEther(borrowing?.borrowAmount)) * (Number(borrowing?.loanPackage.annualRate)/100)
    repaymentAmount = Number(totalInterest) + Number(formatEther(borrowing?.borrowAmount))

  } else {
    maxBorrowU2U = period?.maxBorrowRatio && stakeInfo?.amountDisplay ? Number(stakeInfo?.amountDisplay) * (Number(period.maxBorrowRatio) / 100) : 0
    totalInterest = period?.annualRate && borrowValue?.toString().length > 0 ? Number(borrowValue) * (Number(period.annualRate) / 100) : 0
    repaymentAmount = Number(totalInterest) + Number(borrowValue)
  }
  const disableRepay = borrowing?.repayTime && borrowing.repayTime * 1000 < Date.now();
  const handleChangePeriod = (option: any): void => {
    setBorrowValue('')
    onPercentSelectForSlider(0)
    setPeriod(option.item)
  }
  const handleChangePercent = useCallback(
    (value: any) => {
      if(period?.maxBorrowRatio) {
        const percent = (value * Number(period?.maxBorrowRatio)) / 100
        const _borrowValue: number = (Number(formatEther(stakeInfo.amount)) * (percent / 100))
        setBorrowValue(_borrowValue.toFixed(7) || '0')
        onPercentSelectForSlider(percent || Math.ceil(value))
      }
    },
    [period?.maxBorrowRatio, stakeInfo.amount],
  )

  const callSmartContract = async (action: any, message: string) => {
    if(!borrowContract.account) return
    setIsCallContract(true)
    try {
    const receipt = await fetchWithCatchTxError(() => action)
      if (receipt?.status) {
        setBorrowValue('')
        onPercentSelectForSlider(0)
        toastSuccess(
          t('Success!'),
          <ToastDescriptionWithTx txHash={receipt.transactionHash}>
            {t(message)}
          </ToastDescriptionWithTx>,
        )
      }
    }catch(error: any) {
      const errorDescription = `${error.message} - ${error.data?.message}`
      toastError(t('Failed'), errorDescription)
    }
    setIsCallContract(false)
  }

  const handleBorrow = async (value?: string) => {
    const _value: any = value || borrowValue
    if(period?.minBorrow && new BigNumber(_value).isLessThan(new BigNumber(formatEther(period?.minBorrow)))) {
      setErrorMinBorrow(true)
      toastError(t('Failed'), `Minimum borrow is ${period?.minBorrow ? Number(formatNumber(Number(formatEther(period?.minBorrow)), 2, 6)) : 0 }`)
      return
    }
    await callSmartContract(borrowContract.write.borrow([parseEther(new BigNumber(_value).toFixed(18)), stakeInfo.id, period?.id]), 'You have successfully borrow.')
    if(refreshListLoans){ 
     refreshListLoans()
    }
    if(_fetchBalanceVault) {
      _fetchBalanceVault()
    }
  }
  

  const handleRepay =  async () => {
    const _repaymentAmount = ((borrowing?.borrowAmount * 1) * (Number(borrowing?.loanPackage.annualRate)/100)) + (borrowing?.borrowAmount * 1)
    if(new BigNumber(_repaymentAmount).isGreaterThan(new BigNumber(nativeBalance?.data?.value))) {
      toastError(t('Failed'), 'Account balance is not enough')
      return 
    }
    const mustReturn: any = await borrowContract.read.mustReturn([borrowing?.id])
    await callSmartContract(borrowContract.write.returnStakingNFT([ borrowing?.id], {value: mustReturn}), 'You have successfully repay.')
   
    if(refreshListLoans){ 
      refreshListLoans()
    }
    if(_fetchBalanceVault) {
      _fetchBalanceVault()
    }
  }

  const handleBorrowWithVault = () => {
    handleBorrow(balanceVault.toString())
  }


  const [onShowLoansModal] = useModal(
    <LoansModal
      initialView={new BigNumber(currentBalanceValue).isZero() ? LoansView.BORROWING : LoansView.AVAILABLE}
      borrowValue={borrowValue}
      balanceVault={formatNumber(Number(currentBalanceValue), 2, 6)}
      onConfirm={handleBorrowWithVault}
    />,
  )

  const _fetchBalanceVault = async () => {
    let _balanceValue: any = balanceVault
    if(getVaultLoansBalance) {
      const vault = await getVaultLoansBalance()
      if(vault) {
        _balanceValue = vault
      }
      setCurrentBalanceValue(_balanceValue)
    }
    return _balanceValue
  }

  const handleAction = async () => {
    if(errorMinBorrow) return
    if(isApproved) {
      const _balanceValue = await _fetchBalanceVault()
      if(new BigNumber(borrowValue).isGreaterThan(new BigNumber(_balanceValue))) {
        setTimeout(() => {
          onShowLoansModal()
        }, 500)
        return
      }
      handleBorrow()
    } else if(approveForAll) {
        approveForAll()
      }
  }
  

  const onBorrowInput = (_value) => {
    let value = _value
    if(Number(value) > Number(maxBorrowU2U)) {
      value = maxBorrowU2U
    }
    setBorrowValue(value)
    const percent = ((Number(value) / Number(maxBorrowU2U)) * Number(period?.maxBorrowRatio))
    onPercentSelectForSlider(percent)
  }





  useEffect(() => {
    if(loansPackages?.length > 0) {
      setPeriod(loansPackages[0])
    }
  }, [loansPackages])



  useEffect(() => {
    if(period?.minBorrow && new BigNumber(borrowValue).isLessThan(new BigNumber(formatEther(period?.minBorrow)))) {
      setErrorMinBorrow(true)
    } else {
      setErrorMinBorrow(false)
    }
  }, [borrowValue, period?.minBorrow])



  return (
    <CardLayout>
      <CardHeader alignItems={!type ? 'center' : ''} flexDirection={type ? 'column' : 'row'}>
        <Text fontFamily="'Metuo', sans-serif" fontSize="20px" fontWeight="900" lineHeight="24px" color='textSubtle' mr="10px">{t('Staked Amount')}</Text>
        <Flex mt={type ? ['4px', '4px', '8px', '8px','12px'] : '0'} alignItems="flex-end" justifyContent="space-between" style={{ flexWrap: 'wrap' }}>
          <Text fontSize={["20px", "20px", "22px", "22px", "24px"]} fontWeight="700" lineHeight="24px" color='text'>
            {formatNumber(Number(stakeInfo?.amountDisplay || formatEther(borrowing?.stakeAmount)), 2, 6)}
            <Span>U2U</Span>
          </Text>
          {type && (
            <Text color='#c4c4c4' fontSize={["10px", "10px", "10px", "10px", "10px", "10px", "10px", "12px"]} fontStyle="italic">{`Maximum borrow: ${formatNumber(Number(formatEther(borrowing?.stakeAmount)) * (Number(borrowing?.loanPackage.maxBorrowRatio) / 100), 2, 6)} U2U (LTV ${borrowing?.loanPackage.maxBorrowRatio}%)`}</Text>
          )}
        </Flex>
      </CardHeader>
      <CardBody>
        {!type && (
          <>
            <Box mb={["20px", "20px", "24px", "24px", "28px"]}>
              <StyledText color='textSubtle' mb={["6px", "6px", "8px", "8px", "10px", "12px"]}>{t('Interest Period')}</StyledText>
              <Select
                options={listPeriod}
                onOptionChange={handleChangePeriod}
              />
              <Text fontSize={["12px", "12px", "12px", "12px", "12px", "12px", "12px", "13px"]} fontStyle="italic" lineHeight="14px" color='textExtra' mt="12px">{t(`Maximum borrow: ${formatNumber(maxBorrowU2U, 2,6)} U2U (LTV ${period?.maxBorrowRatio || '_'}%)`)}</Text>
            </Box>
            <div style={{'position': 'relative'}}>
            <FlexInput>
              <StyledText color='textSubtle'>{t('Borrow amount') } (<MaxButton onClick={onMax}>Max</MaxButton>)</StyledText>
              <StyledInput     
                value={isFocusInput ? borrowValue :  formatNumber(Number(borrowValue), 2, 6)}
                placeholder="0"
                onFocus={() => {setIsFocusInput(true)}}
                onBlur={() => {setIsFocusInput(false)}}
                fontSize="20px"
                align="center"
                onUserInput={onBorrowInput}
              />
            </FlexInput>
            {errorMinBorrow && <ErrorMessage>Minimum borrow is {period?.minBorrow ? Number(formatNumber(Number(formatEther(period?.minBorrow)), 2, 6)) : 0 }</ErrorMessage>} 
            </div>
            <Flex alignItems="center" justifyContent="space-between" mb={["20px", "20px", "22px"]}>
              <StyledSlider
                name="lp-amount"
                min={0}
                max={100}
                value={percentForSlider}
                onValueChanged={handleChangePercent}
                mb="16px"
              />
              <Text fontSize={["14px", "14px", "14px", "14px", "14px", "14px", "14px", "15px"]} fontWeight="500" fontStyle="italic" color='text' mt="10px">LTV {formatNumber(percentForSlider, 2, 2) || '_'}%</Text>
            </Flex>
            <Flex justifyContent="space-between" alignItems="center" mb="12px">
              <StyledText color='textSubtle'>{t('Annual Interest Rate')}</StyledText>
              <StyledText color='text'>{period?.annualRate || '_'}%</StyledText>
            </Flex>
            <Flex justifyContent="space-between" alignItems="center" mb="12px">
              <StyledText color='textSubtle'>{t('Total Interest')}</StyledText>
              <StyledText color='text'>{formatNumber(totalInterest, 2,6)} U2U</StyledText>
            </Flex>
            <Flex justifyContent="space-between" alignItems="center">
              <StyledText color='textSubtle'>{t('Repayment Amount')}</StyledText>
              <StyledText color='text'>{formatNumber(repaymentAmount, 2, 6)} U2U</StyledText>
            </Flex>
            <StyledButton
              width="100%"
              className="button-hover btn-loading"
              isLoading={isLoading || isCallContract}
              disabled={(isApproved && borrowValue.length === 0) || Number(borrowValue) === 0 || errorMinBorrow}
              onClick={handleAction}
            >
            {isLoading || isCallContract ? 
            <Dots>{isApproved ? 'Borrowing' : 'Approving' }</Dots> : 
              isApproved ? t('Borrow Now') : 'Approve' 
            }
            </StyledButton>
          </>
        )}
        {type && (
          <>
            <Flex justifyContent="space-between" mb="12px">
              <StyledText color='textSubtle'>{t('Interest Period')}</StyledText>
              <StyledText color='text'>{ borrowing?.loanPackage?.symbolTime}</StyledText>
            </Flex>
            <Flex justifyContent="space-between" mb="12px">
              <StyledText color='textSubtle'>{t('Borrow amount')}</StyledText>
              <StyledText color='text'>{formatNumber(Number(formatEther(borrowing?.borrowAmount)), 2, 6)} U2U</StyledText>
            </Flex>
            <Flex justifyContent="space-between" mb="12px">
              <StyledText color='textSubtle'>{t('LTV')}</StyledText>
              <StyledText color='text'>{(formatNumber((Number(formatEther(borrowing?.borrowAmount)) / Number(formatEther(borrowing?.stakeAmount))) * 100))}%</StyledText>
            </Flex>
            <Flex justifyContent="space-between" mb="12px">
              <StyledText color='textSubtle'>{t('Annual Interest Rate')}</StyledText>
              <StyledText color='text'>{borrowing?.loanPackage.annualRate}%</StyledText>
            </Flex>
            <Flex justifyContent="space-between" mb="12px">
              <StyledText color='textSubtle'>{t('Total Interest')}</StyledText>
              <StyledText color='text'>{formatNumber(totalInterest, 2, 6)} U2U</StyledText>
            </Flex>
            <Flex justifyContent="space-between" mb="12px">
              <StyledText color='textSubtle'>{t('Repayment Amount')}</StyledText>
              <StyledText color='text'>{formatNumber(repaymentAmount, 2, 6)} U2U</StyledText>
            </Flex>
            <Flex justifyContent="space-between" mb="12px">
              <StyledText color='textSubtle'>{t('Loan Time')}</StyledText>
              <StyledText color='text'>{borrowing?.borrowTime ? formatDate(dayjs.unix(Number(borrowing.borrowTime)).utc()): '_'} UTC</StyledText>
            </Flex>
            <Flex justifyContent="space-between">
              <StyledText color='textSubtle'>{t('Repayable Time')}</StyledText>
              <StyledText color='text'>{borrowing?.repayTime ? formatDate(dayjs.unix(Number(borrowing.repayTime)).utc()): '_'} UTC</StyledText>
            </Flex>
            <StyledButton
              width="100%"
              className="button-hover"
              disabled={disableRepay || isLoading || isCallContract}
              onClick={handleRepay}
            >
              {isCallContract ? <Dots>Repaying</Dots> : (
                disableRepay ? t('It has been foreclosed') : t('Repay Now')
              )}
            </StyledButton>
          </>
        )}
      </CardBody>
    </CardLayout>
  )
}

export default LoansCard