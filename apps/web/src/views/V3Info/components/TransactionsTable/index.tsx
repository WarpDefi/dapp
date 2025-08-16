import { ChainDefault } from '@pancakeswap/chains'
import { useTranslation } from '@pancakeswap/localization'
import { NATIVE, WNATIVE } from '@pancakeswap/sdk'
import {
	ArrowBackIcon,
	ArrowForwardIcon,
	AutoColumn,
	Box,
	Flex,
	ScanLink,
	SortArrowIcon,
	Text,
	Toggle,
} from '@pancakeswap/uikit'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ChainLinkSupportChains, multiChainId } from 'state/info/constant'
import { useChainIdByQuery, useChainNameByQuery } from 'state/info/hooks'
import { styled, useTheme } from 'styled-components'
import { getBlockExploreLink } from 'utils'
import { formatAmount } from 'utils/formatInfoNumbers'
import { getTokenSymbolAlias } from 'utils/getTokenAlias'
import { Arrow, Break, ClickableColumnHeader, PageButtons, TableWrapper } from 'views/Info/components/InfoTables/shared'
import { Transaction, TransactionType } from '../../types'
import { shortenAddress } from '../../utils'
import { formatDollarAmount } from '../../utils/numbers'
import HoverInlineText from '../HoverInlineText'
import Loader from '../Loader'
import { RowFixed } from '../Row'
import { SortButton, useSortFieldClassName } from '../SortButton'

const ResponsiveGrid = styled.div<{ widthfirstcol?: number }>`
  display: grid;
  grid-gap: 1em;
  align-items: center;
  grid-template-columns: ${({ widthfirstcol }) =>
    widthfirstcol ? `${widthfirstcol}fr 0.5fr repeat(5, 1fr)` : '0.5fr 0.5fr repeat(5, 1fr)'};
  padding: 0 24px;
  > * {
    min-width: 140px;
    &:nth-child(2) {
      min-width: 120px;
    }
    &:nth-child(7) {
      min-width: 160px;
    }
    ${({ widthfirstcol }) =>
      widthfirstcol === 1.5 ? `

      ` : `
        &:nth-child(1) {
          min-width: 65px;
        }
      `
    }
  }

  @media screen and (max-width: 575px) {
    padding: 0 20px;
  }
`

const SortText = styled.button<{ active: boolean }>`
  cursor: pointer;
  font-weight: ${({ active }) => (active ? 700 : 400)};
  margin-right: 16px !important;
  border: 2px solid transparent;
  background-color: ${({ active, theme }) => (active ? theme.colors.secondary : theme.colors.transparent)};
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 8px;
  color: ${({ active, theme }) => (active ? theme.colors.black : theme.colors.textSubtle)};
  border-color: ${({ active, theme }) => (active ? theme.colors.cardBorder : theme.colors.transparent)};
  outline: none;
  @media screen and (max-width: 991px) {
    margin-right: 12px !important;
  }
  @media screen and (max-width: 767px) {
    margin-right: 8px !important;
  }
  @media screen and (max-width: 575px) {
    font-size: 14px;
    margin-right: 4px !important;
  }
  @media screen and (max-width: 374px) {
    margin-right: 0 !important;
    padding: 8px 12px;
  }
  &:hover {
    color: ${({ active, theme }) => (active ? theme.colors.black : theme.colors.hover)};
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

const LayoutScroll = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-x: auto;
`

const Image = styled.img`
  margin-bottom: 12px;
`

const SORT_FIELD = {
  amountUSD: 'amountUSD',
  timestamp: 'timestamp',
  sender: 'sender',
  amountToken0: 'amountToken0',
  amountToken1: 'amountToken1',
}

const DataRow = ({
  transaction,
}: {
  transaction: Transaction
  color?: string
  type?: string
  filterFn?: () => void
}) => {
  const theme = useTheme()
  const abs0 = Math.abs(transaction.amountToken0)
  const abs1 = Math.abs(transaction.amountToken1)
  const chainName = useChainNameByQuery()
  const chainId = useChainIdByQuery()
  const {
    currentLanguage: { locale },
  } = useTranslation()
  const token0Symbol = transaction.token0Address?.toLowerCase()  === WNATIVE[ChainDefault].address.toLowerCase() ? NATIVE[ChainDefault].symbol : getTokenSymbolAlias(transaction.token0Address, chainId, transaction.token0Symbol)
  const token1Symbol = transaction.token1Address?.toLowerCase()  === WNATIVE[ChainDefault].address.toLowerCase() ? NATIVE[ChainDefault].symbol : getTokenSymbolAlias(transaction.token1Address, chainId, transaction.token1Symbol)

  // const outputTokenSymbol = transaction.amountToken0 < 0 ? token0Symbol : token1Symbol
  // const inputTokenSymbol = transaction.amountToken1 < 0 ? token0Symbol : token1Symbol
  // let typeSwap = `Swap ${inputTokenSymbol} for ${outputTokenSymbol}`
  // let typeMint = `Add ${token0Symbol} and ${token1Symbol}`
  // let typeRemove = `Remove ${token0Symbol} and ${token1Symbol}`
  // if (type === 'SWAP_TRANSACTION') {
    const typeSwap = transaction.amountToken0 > 0 ? 'Sell' : 'Buy'
    const typeMint = 'Add'
    const typeRemove = 'Remove'
  // }

  const convertDate = (date: number) => {
    const now = new Date(date * 1000)
    return now.toLocaleString(locale, {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <ResponsiveGrid widthfirstcol={0.5}>
      <Flex>
        <StyledScanLink
          useBscCoinFallback={ChainLinkSupportChains.includes(multiChainId[chainName])}
          href={getBlockExploreLink(transaction.hash, 'transaction', multiChainId[chainName])}
        >
          <Text
            textTransform="uppercase"
            fontWeight={400}
            color={
              transaction.type === TransactionType.MINT
                ? theme.colors.cyan
                : transaction.type === TransactionType.SWAP
                ? transaction.amountToken0 > 0
                  ? theme.colors.orange
                  : theme.colors.green
                : theme.colors.yellow
            }
          >
            {transaction.type === TransactionType.MINT
              ? typeMint
              : transaction.type === TransactionType.SWAP
              ? typeSwap
              : typeRemove}
          </Text>
        </StyledScanLink>
      </Flex>
      <Text textAlign="right" fontWeight={200}>{`${token0Symbol}/${token1Symbol}`}</Text>
      <Text textAlign="right" fontWeight={400}>{formatDollarAmount(transaction.amountUSD)}</Text>
      <Text textAlign="right" fontWeight={400}>
        <HoverInlineText text={`${formatAmount(abs0)}  ${token0Symbol}`} maxCharacters={16} />
      </Text>
      <Text textAlign="right" fontWeight={400}>
        <HoverInlineText text={`${formatAmount(abs1)}  ${token1Symbol}`} maxCharacters={16} />
      </Text>
      <Text fontWeight={400}>
        <ScanLink
          style={{ marginLeft: 'auto' }}
          useBscCoinFallback={ChainLinkSupportChains.includes(multiChainId[chainName])}
          href={getBlockExploreLink(transaction.sender, 'address', multiChainId[chainName])}
        >
          {shortenAddress(transaction.sender)}
        </ScanLink>
      </Text>
      <Text textAlign="right" fontWeight={400}>{convertDate(Number(transaction.timestamp))}</Text>
    </ResponsiveGrid>
  )
}

export default function TransactionTable({
  transactions,
  maxItems = 10,
  type,
  filterFn,
  toggleFilter,
  account
}: {
  transactions: Transaction[]
  maxItems?: number
  type?: string
  filterFn?: () => void
  toggleFilter?: boolean
  account?: string | undefined
}) {
  const { t } = useTranslation()

  // for sorting
  const [sortField, setSortField] = useState(SORT_FIELD.timestamp)
  const [sortDirection, setSortDirection] = useState<boolean>(true)

  // pagination
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)

  const [txFilter, setTxFilter] = useState<TransactionType | undefined>(TransactionType.SWAP)
  const getSortFieldClassName = useSortFieldClassName(sortField, sortDirection)

  useEffect(() => {
    const _filter = txFilter === TransactionType.LIQUIDITY ? [TransactionType.MINT, TransactionType.BURN] : [TransactionType.SWAP]
    let extraPages = 1
    if (
      transactions.filter((x) => {
        return txFilter === undefined || _filter.indexOf(x.type) !== -1
      }).length %
        maxItems ===
      0
    ) {
      extraPages = 0
    }
    const maxPageResult =
      Math.floor(
        transactions.filter((x) => {
          return txFilter === undefined || _filter.indexOf(x.type) !== -1
        }).length / maxItems,
      ) + extraPages
    setMaxPage(maxPageResult)
    if (maxPageResult === 0) setPage(0)
    else setPage(1)
  }, [maxItems, transactions, txFilter])

  const sortedTransactions = useMemo(() => {
    const _filter = txFilter === TransactionType.LIQUIDITY ? [TransactionType.MINT, TransactionType.BURN] : [TransactionType.SWAP]
    return transactions
      ? [...transactions]
          .sort((a, b) => {
            if (a && b) {
              return a[sortField as keyof Transaction] > b[sortField as keyof Transaction]
                ? (sortDirection ? -1 : 1) * 1
                : (sortDirection ? -1 : 1) * -1
            }
            return -1
          })
          .filter((x) => {
            return txFilter === undefined || _filter.indexOf(x.type) !== -1
          })
          .slice(maxItems * (page - 1), page * maxItems)
      : []
  }, [transactions, maxItems, page, sortField, sortDirection, txFilter])

  const handleSort = useCallback(
    (newField: string) => {
      setSortField(newField)
      setSortDirection(sortField !== newField ? true : !sortDirection)
    },
    [sortDirection, sortField],
  )

  if (!transactions) {
    return <Loader />
  }

  return (
    <>
      <Flex justifyContent={type === 'SWAP_TRANSACTION' ? 'flex-end' : 'space-between'} alignItems="center" my="16px">
        {type !== 'SWAP_TRANSACTION' && (
          <RowFixed>
            {/* <SortText
              onClick={() => {
                setTxFilter(undefined)
              }}
              active={txFilter === undefined}
            >
              {t('All')}
            </SortText> */}
            <SortText
              onClick={() => {
                setTxFilter(TransactionType.SWAP)
              }}
              active={txFilter === TransactionType.SWAP}
            >
              {t('Trades')}
            </SortText>
            <SortText
              onClick={() => {
                setTxFilter(TransactionType.LIQUIDITY)
              }}
              active={txFilter === TransactionType.LIQUIDITY}
            >
              {t('Liquidity')}
            </SortText>
            {/* <SortText
              onClick={() => {
                setTxFilter(TransactionType.BURN)
              }}
              active={txFilter === TransactionType.BURN}
            >
              {t('Removes')}
            </SortText> */}
          </RowFixed>
        )}
        {filterFn && account && (
          <Flex alignItems="center">
            <Toggle scale="sm" checked={toggleFilter} onChange={filterFn} />
            <Text ml="16px" small color="textSubtle">
              {t('Only my transactions')}
            </Text>
          </Flex>
        )}
      </Flex>
      <TableWrapper>
        <LayoutScroll>
          <ResponsiveGrid widthfirstcol={0.5}>
            <Text color="textSubtle">
              {t('Type')}
            </Text>
            <Text color="textSubtle" style={{ textAlign: 'right' }}>
              {t('Pair')}
            </Text>
            <ClickableColumnHeader color="textSubtle" style={{ justifyContent: 'flex-end' }}>
              {t('Total Value')}
              <SortButton
                scale="sm"
                variant="subtle"
                onClick={() => handleSort(SORT_FIELD.amountUSD)}
                className={getSortFieldClassName(SORT_FIELD.amountUSD)}
              >
                <SortArrowIcon />
              </SortButton>
            </ClickableColumnHeader>
            <ClickableColumnHeader color="textSubtle" style={{ justifyContent: 'flex-end' }}>
              {t('Token%index% Amount', { index: '0' })}
              <SortButton
                scale="sm"
                variant="subtle"
                onClick={() => handleSort(SORT_FIELD.amountToken0)}
                className={getSortFieldClassName(SORT_FIELD.amountToken0)}
              >
                <SortArrowIcon />
              </SortButton>
            </ClickableColumnHeader>
            <ClickableColumnHeader color="textSubtle" style={{ justifyContent: 'flex-end' }}>
              {t('Token%index% Amount', { index: '1' })}
              <SortButton
                scale="sm"
                variant="subtle"
                onClick={() => handleSort(SORT_FIELD.amountToken1)}
                className={getSortFieldClassName(SORT_FIELD.amountToken1)}
              >
                <SortArrowIcon />
              </SortButton>
            </ClickableColumnHeader>
            <ClickableColumnHeader color="textSubtle" style={{ justifyContent: 'flex-end' }}>
              {t('Account')}
              <SortButton
                scale="sm"
                variant="subtle"
                onClick={() => handleSort(SORT_FIELD.sender)}
                className={getSortFieldClassName(SORT_FIELD.sender)}
              >
                <SortArrowIcon />
              </SortButton>
            </ClickableColumnHeader>
            <ClickableColumnHeader color="textSubtle" style={{ justifyContent: 'flex-end' }}>
              {`${t('Time')} `}
              <SortButton
                scale="sm"
                variant="subtle"
                onClick={() => handleSort(SORT_FIELD.timestamp)}
                className={getSortFieldClassName(SORT_FIELD.timestamp)}
              >
                <SortArrowIcon />
              </SortButton>
            </ClickableColumnHeader>
          </ResponsiveGrid>
          <AutoColumn gap="16px">
            <Break />

            {sortedTransactions.map((d, index) => {
              if (d) {
                return (
                  // eslint-disable-next-line react/no-array-index-key
                  <React.Fragment key={`${d.hash}/${d.timestamp}/${index}/transactionRecord`}>
                    <DataRow transaction={d} type={type} filterFn={filterFn} />
                    <Break />
                  </React.Fragment>
                )
              }
              return null
            })}
            {sortedTransactions.length === 0 && (
              <Flex mt="16px" mb="20px" flexDirection="column" alignItems="center" justifyContent="center">
                <Image src='/images/no-data.svg' />
                <Text>{t('No Transactions')}</Text>
              </Flex>
            )}

          </AutoColumn>
        </LayoutScroll>
        <PageButtons>
          <Box
            onClick={() => {
              if (page > 1) setPage(page - 1)
            }}
          >
            <Arrow>
              <ArrowBackIcon color={page <= 1 ? 'textDisabled' : 'primary'} />
            </Arrow>
          </Box>
          <Text>{`Page ${page} of ${maxPage}`}</Text>
          <Box
            onClick={() => {
              if (page !== maxPage) setPage(page + 1)
            }}
          >
            <Arrow>
              <ArrowForwardIcon color={page === maxPage ? 'textDisabled' : 'primary'} />
            </Arrow>
          </Box>
        </PageButtons>
      </TableWrapper>
    </>
  )
}
