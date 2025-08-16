import { useTranslation } from '@pancakeswap/localization'
import { ArrowBackIcon, ArrowForwardIcon, AutoColumn, Box, Flex, ScanLink, Skeleton, Text } from '@pancakeswap/uikit'
import truncateHash from '@pancakeswap/utils/truncateHash'
import dayjs from 'dayjs'
import { useActiveChainId } from 'hooks/useActiveChainId'
import keyBy from 'lodash/keyBy'
import React, { useState } from 'react'
import styled, { useTheme } from 'styled-components'
import { getBlockExploreLink } from 'utils'
import { formatEther } from 'viem'
import { formatDate } from 'views/CakeStaking/components/DataSet/format'
import { Arrow, Break, PageButtons, TableWrapper } from 'views/Info/components/InfoTables/shared'
import { useFetchTransactionHistory } from '../hooks/useFetchTransactionHistory'


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
  grid-template-columns: repeat(5, 1fr);
  padding: 0 24px;
  > * {
    min-width: 140px;
    &:last-child {
      min-width: 180px;
    }
    &:first-child {
      min-width: 200px;
    }
  }

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
const StyledTitle = styled(Text)`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSubtle};
  text-transform: uppercase;
  @media screen and (max-width: 1559px) {
    font-size: 12px;
  }
`
const StyledText = styled(Text)`
  font-size: 15px;
  font-weight: 500;
  @media screen and (max-width: 1559px) {
    font-size: 14px;
  }
`
const TRANSACTION_STATUS = {
	"CLAIM_TOKEN": 'Claim Token', 
	"COMMIT": "Commit", 
	"REFUND": "Refund", 
	"GIVE_BACK": "Give Back",
	"CANCEL": "Cancelled"
}
const TableLoader: React.FC<React.PropsWithChildren> = () => {
  const loadingRow = (
    <ResponsiveGrid>
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

export default function Transactions({info, account, phases}) {
  const { t } = useTranslation()
  const theme = useTheme();
  const [page, setPage] = useState(1)
	const {data, isLoading} = useFetchTransactionHistory(account, info?.contractAddress, page)
	const { chainId } = useActiveChainId()
	const listData = data || []
  const disableNext = listData ? listData?.length === 0 || listData?.length < 10 : false
	const _phaseByContract = keyBy(phases, (o) => o.contractAddress.toLowerCase() )
  const getColorLaunchpadByStatus = (_status: string) => {
    return  _status === 'Give Back' ? theme.colors.yellow
    : _status === 'Cancelled' ? theme.colors.orange
    : _status === 'Refund' ? theme.colors.orange
    : _status ===  'Claim Token'  ? theme.colors.cyan
    : _status === 'Commit' ? theme.colors.primary
    : theme.colors.textSubtle
  }
  
  return (
    <Box mt="30px">
      <Wrapper>
        <TableWrapper>
          <LayoutScroll>
            <ResponsiveGrid>
              <StyledTitle color="textSubtle">
                {t('HASH')}
              </StyledTitle>
              <StyledTitle color="textSubtle" textAlign="center">
                {t('TYPE')}
              </StyledTitle>
              <StyledTitle color="textSubtle" textAlign="center">
                {t('AMOUNT')}
              </StyledTitle>
							<StyledTitle color="textSubtle" textAlign="center">
                {t('ROUND')}
              </StyledTitle>
              <StyledTitle color="textSubtle" textAlign="right">
                {t('TIME')}
              </StyledTitle>
            </ResponsiveGrid>
            <AutoColumn gap="16px">
              <Break/>
							{isLoading ? <TableLoader/> : <>
								{listData?.map(item => (
									<React.Fragment key={item.hash}>
										<ResponsiveGrid >
											<Flex>
												<StyledScanLink href={getBlockExploreLink(item.hash, 'transaction', chainId)}>
													<StyledText color='primary'>
														{item.hash && truncateHash(item.hash, 20, 8)}
													</StyledText>
												</StyledScanLink>
											</Flex>
											<StyledText style={{ color: getColorLaunchpadByStatus(TRANSACTION_STATUS[item.transactionType]) }} textAlign="center">{TRANSACTION_STATUS[item.transactionType]}</StyledText>
											<StyledText color="text" textAlign="center">{item.transactionType === 'CLAIM_TOKEN' ? `${formatEther(item.tokenAmount)} ${info?.tokenName}` : `${formatEther(item.u2uAmount)} U2U` }</StyledText>
											<StyledText color="text" textAlign="center" >{_phaseByContract[item.roundAddress]?.name}</StyledText>
											<StyledText color="text" textAlign="right">{formatDate(dayjs.unix(Math.floor(item.processTime)).utc())}</StyledText>
										</ResponsiveGrid>
									<Break/>
									</React.Fragment>
								))}
							{listData?.length === 0 && (
								<Flex my="16px" flexDirection="column" alignItems="center" justifyContent="center">
									<img src='/images/no-data.svg' alt='' />
									<StyledText color='textSubtle' mt="12px">{t('No Transaction')}</StyledText>
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

					<StyledText>Page {page}</StyledText>
					<Arrow
						onClick={() => {
							if(!disableNext) {
								setPage(listData?.length === 0 ? page : page + 1)
							}
						}}
					>
						<ArrowForwardIcon color={disableNext ? 'textDisabled' : 'primary'} />
					</Arrow>
				</PageButtons>
        </TableWrapper>
      </Wrapper>
    </Box>
  )
}
