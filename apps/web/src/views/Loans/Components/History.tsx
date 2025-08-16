import { useTranslation } from '@pancakeswap/localization'
import { ArrowBackIcon, ArrowForwardIcon, AutoColumn, Box, Flex, ScanLink, Skeleton, SortArrowIcon, Text } from '@pancakeswap/uikit'
import { formatNumber } from '@pancakeswap/utils/formatBalance'
import dayjs from 'dayjs'
import { formatEther } from 'ethers/lib/utils'
import { useCallback, useState } from 'react'
import { multiChainId } from 'state/info/constant'
import { useChainNameByQuery } from 'state/info/hooks'
import styled from 'styled-components'
import { getBlockExploreLink } from 'utils'
import { formatDate } from 'views/CakeStaking/components/DataSet/format'
import { Arrow, Break, ClickableColumnHeader, PageButtons, TableWrapper } from 'views/Info/components/InfoTables/shared'
import { SortButton, useSortFieldClassName } from 'views/V3Info/components/SortButton'
import { useLoansHistory } from '../hooks/useLoansHistory'


const Wrapper = styled.div`
  width: 100%;
`

const LayoutScroll = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-x: auto;
`
const ResponsiveGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  align-items: center;
  grid-template-columns: 0.3fr repeat(4, 1fr);
  padding: 0 24px;
  > * {
    min-width: 140px;
    &:first-child {
      min-width: 100px;
    }
    &:last-child {
      min-width: 170px;
    }
  }

  // @media screen and (max-width: 800px) {
  //   grid-template-columns: 0.8fr repeat(4, 1fr);
  //   & > *:nth-child(5) {
  //     display: none;
  //   }
  //   & > *:nth-child(3) {
  //     display: none;
  //   }
  //   & > *:nth-child(4) {
  //     display: none;
  //   }
  // }

`

const StyledScanLink = styled(ScanLink)`
  transition: 0.3s ease;
  &:hover {
    text-decoration: none;
    opacity: 0.65;
  }
  > div {
    @media screen and (max-width: 575px) {
      font-size: 14px;
    }
  }
`

const Image = styled.img`
  margin-bottom: 12px;
`

const SORT_FIELD = {
  borrowAmount: 'borrowAmount',
  processTime: 'processTime',
  repayAmount: 'repayAmount',
  stakeAmount: 'stakeAmount'
}

const TableLoader: React.FC<React.PropsWithChildren> = () => {
  const loadingRow = (
    <ResponsiveGrid>
      <Skeleton />
      <Skeleton />
      <Skeleton />
      <Skeleton />
      <Skeleton />
      <Skeleton />
    </ResponsiveGrid>
  )
  return (
    <>
      {loadingRow}
      {loadingRow}
      {loadingRow}
      {loadingRow}
      {loadingRow}
      {loadingRow}
      {loadingRow}
      {loadingRow}
      {loadingRow}
      {loadingRow}
    </>
  )
}
export function LoansHistory() {
  // for sorting
  const [sortField, setSortField] = useState(SORT_FIELD.processTime)
  const [sortDirection, setSortDirection] = useState<boolean>(true)
  const { t } = useTranslation()
  const chainName = useChainNameByQuery()
  const handleSort = useCallback(
    (newField: string) => {
      setSortField(newField)
      setSortDirection(sortField !== newField ? true : !sortDirection)
    },
    [sortDirection, sortField],
  )
  const [page, setPage] = useState(1)
  const { data, isLoading } = useLoansHistory(page, sortField, sortDirection)
  const disableNext = data ? data?.length === 0 || data?.length < 10 : false

  const getSortFieldClassName = useSortFieldClassName(sortField, sortDirection)

  return (
    <div>
    <Wrapper>
      <TableWrapper>
      <LayoutScroll>
        <ResponsiveGrid>
          <Text color="textSubtle" >
            {t('Type')}
          </Text>
          <ClickableColumnHeader color="textSubtle" style={{ justifyContent: 'flex-end' }}>
            {t('Loan Amount')}
            <SortButton
              scale="sm"
              variant="subtle"
              onClick={() => handleSort(SORT_FIELD.borrowAmount)}
              className={getSortFieldClassName(SORT_FIELD.borrowAmount)}
            >
              <SortArrowIcon />
            </SortButton>
          </ClickableColumnHeader>
          <ClickableColumnHeader color="textSubtle" style={{ justifyContent: 'flex-end' }}>
            {t('Repay Amount')}
            <SortButton
              scale="sm"
              variant="subtle"
              onClick={() => handleSort(SORT_FIELD.repayAmount)}
              className={getSortFieldClassName(SORT_FIELD.repayAmount)}
            >
              <SortArrowIcon />
            </SortButton>
          </ClickableColumnHeader>
          <ClickableColumnHeader color="textSubtle" style={{ justifyContent: 'flex-end' }}>
            {t('Stake Amount')}
            <SortButton
              scale="sm"
              variant="subtle"
              onClick={() => handleSort(SORT_FIELD.stakeAmount)}
              className={getSortFieldClassName(SORT_FIELD.stakeAmount)}
            >
              <SortArrowIcon />
            </SortButton>
          </ClickableColumnHeader>
          <ClickableColumnHeader color="textSubtle" style={{ justifyContent: 'flex-end' }}>
            {t('Time')}
            <SortButton
              scale="sm"
              variant="subtle"
              onClick={() => handleSort(SORT_FIELD.processTime)}
              className={getSortFieldClassName(SORT_FIELD.processTime)}
            >
              <SortArrowIcon />
            </SortButton>
          </ClickableColumnHeader>
        </ResponsiveGrid>
        <AutoColumn gap="16px">
        <Break />
            {isLoading ? <TableLoader/> : <>
            {data?.map((item) => {
              if (item) {
                const refund: any = Number(item.stakeAmount) - Number(item.repayAmount) + Number(item.rewardUser)
                return (
                  <>
                    <ResponsiveGrid key={item.id}>
                      <Flex>
                      <StyledScanLink
                        href={getBlockExploreLink(item.txn, 'transaction', multiChainId[chainName])}
                      >
                      <Text
                        textTransform="uppercase"
                        fontWeight={400}
                        color={
                          item.type === 'BORROW'
                            ? '#fff'
                            : item.type === 'REPAY'
                            ? '#00B58D' 
                            : '#FE5300'
                      }>
                        {item.type}
                      </Text>
                      </StyledScanLink>
                      </Flex>
                      <Text textAlign="right">{formatNumber(Number(formatEther(item.borrowAmount)), 2, 6)} U2U</Text>
                      <Text textAlign="right">
                        <Flex flexDirection="column">
                          {formatNumber(Number(formatEther(item.repayAmount)), 2, 6)} U2U
                          <Text color='gray' fontSize={12}>{item.type === 'LIQUIDATION' ? `Refund ${formatNumber(Number(formatEther(refund.toString())), 2, 6)} U2U` : ''}</Text>
                        </Flex>
                      </Text>
                      <Text textAlign="right">{formatNumber(Number(formatEther(item.stakeAmount)), 2, 6)} U2U (#{item.stakeId})</Text>
                      <Text textAlign="right">{ item?.processTime ? formatDate(dayjs.unix(Number(item.processTime)).utc()): '_'} UTC</Text>
                    </ResponsiveGrid>
                    <Break />
                  </>
                  // eslint-disable-next-line react/no-array-index-key
                  // <Fragment key={index}>
                  //   <DataRow transaction={transaction} />
                  //   <Break />
                  // </Fragment>
                )
              }
              return null
            })}
            {data?.length === 0 && (
              <Flex my="16px" flexDirection="column" alignItems="center" justifyContent="center">
                <Image src='/images/no-data.svg' />
                <Text color='textSubtle'>{t('No History')}</Text>
              </Flex>
            )}
            </>}
    
          </AutoColumn>
        </LayoutScroll>
            <PageButtons>
              <Arrow
                onClick={() => {
                  setPage(page === 1 ? page : page - 1)
                }}
              >
                <ArrowBackIcon color={page === 1 ? 'textDisabled' : 'primary'} />
              </Arrow>

              <Text>Page {page}</Text>
              <Arrow
                onClick={() => {
                  if(!disableNext) {
                    setPage(data.length === 0 ? page : page + 1)
                  }
                }}
              >
                <ArrowForwardIcon color={disableNext ? 'textDisabled' : 'primary'} />
              </Arrow>
            </PageButtons>
 

      </TableWrapper>
    </Wrapper>
    </div>
  )
}
