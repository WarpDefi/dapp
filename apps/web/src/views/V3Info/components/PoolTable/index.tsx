import { ChainDefault } from '@pancakeswap/chains'
import { useTranslation } from '@pancakeswap/localization'
import { NATIVE, WNATIVE } from '@pancakeswap/sdk'
import { ArrowBackIcon, ArrowForwardIcon, AutoColumn, Box, SortArrowIcon, Text } from '@pancakeswap/uikit'
import { useActiveChainId } from 'hooks/useActiveChainId'
import NextLink from 'next/link'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useChainIdByQuery, useChainNameByQuery, useMultiChainPath } from 'state/info/hooks'
import { styled } from 'styled-components'
import { getTokenSymbolAlias } from 'utils/getTokenAlias'
import { DoubleCurrencyLogo } from 'views/Info/components/CurrencyLogo'
import { Arrow, Break, ClickableColumnHeader, PageButtons, TableWrapper } from 'views/Info/components/InfoTables/shared'
import { POOL_HIDE, v3InfoPath } from '../../constants'
import { PoolData } from '../../types'
import { feeTierPercent } from '../../utils'
import { formatDollarAmount } from '../../utils/numbers'
import { GreyBadge } from '../Card'
import Loader, { LoadingRows } from '../Loader'
import { RowFixed } from '../Row'
import { SortButton, useSortFieldClassName } from '../SortButton'

const ResponsiveGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  align-items: center;
  grid-template-columns: 30px repeat(4, 1fr);
  padding: 0 24px;
  > * {
    &:not(:first-child) {
      min-width: 120px;
    }
    &:nth-child(2) {
      min-width: 200px;
    }
    &:nth-child(3) {
      min-width: 100px;
    }
  }
  & :nth-child(3) {
    max-width: 300px;
    word-break: break-word;
  }

  @media screen and (max-width: 575px) {
    padding: 0 20px;
  }
`

const LayoutScroll = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-x: auto;
`

const LinkWrapper = styled(NextLink)`
  text-decoration: none;
  &:hover {
    cursor: pointer;
    opacity: 0.7;
  }
`

const StyledLoadingRows = styled(LoadingRows)`
  margin: 0 16px;
`

const StyledTextHeader = styled(Text)`
  @media screen and (max-width: 575px) {
    font-size: 14px;
  }
  @media screen and (max-width: 374px) {
    font-size: 13px;
  }
`

const StyleRowFixed = styled(RowFixed)`
  @media screen and (max-width: 374px) {
    flex-wrap: wrap;
  }
`

const StyleGreyBadge = styled(GreyBadge) `
  font-size: 14px;
  @media screen and (max-width: 424px) {
    font-size: 12px;
  }
`

const SORT_FIELD = {
  feeTier: 'feeTier',
  volumeUSD: 'volumeUSD',
  tvlUSD: 'tvlUSD',
  volumeUSDWeek: 'volumeUSDWeek',
}

const DataRow = ({ poolData, index, chainPath }: { poolData: PoolData; index: number; chainPath: string }) => {
  const chainName = useChainNameByQuery()
  const chainId = useChainIdByQuery()
  const token0symbol = poolData.token0.address?.toLowerCase()  === WNATIVE[ChainDefault].address.toLowerCase() ? NATIVE[ChainDefault].symbol  : getTokenSymbolAlias(poolData.token0.address, chainId, poolData.token0.symbol)
  const token1symbol = poolData.token1.address?.toLowerCase()  === WNATIVE[ChainDefault].address.toLowerCase() ? NATIVE[ChainDefault].symbol  : getTokenSymbolAlias(poolData.token1.address, chainId, poolData.token1.symbol)

  return (
    <LinkWrapper href={`/${v3InfoPath}${chainPath}/pairs/${poolData.address}`}>
      <ResponsiveGrid>
        <StyledTextHeader fontWeight={400}>{index + 1}</StyledTextHeader>
        <StyledTextHeader fontWeight={400}>
          <StyleRowFixed>
            <DoubleCurrencyLogo
              address0={poolData.token0.address}
              address1={poolData.token1.address}
              chainName={chainName}
            />
            <Text mx="8px">
              {token0symbol}/{token1symbol}
            </Text>
            <StyleGreyBadge style={{ display: 'block', whiteSpace: 'nowrap' }}>
              {feeTierPercent(poolData.feeTier)}
            </StyleGreyBadge>
          </StyleRowFixed>
        </StyledTextHeader>
        <StyledTextHeader fontWeight={400} textAlign="right">{formatDollarAmount(poolData.tvlUSD)}</StyledTextHeader>
        <StyledTextHeader fontWeight={400} textAlign="right">{formatDollarAmount(poolData.volumeUSD)}</StyledTextHeader>
        <StyledTextHeader fontWeight={400} textAlign="right">{formatDollarAmount(poolData.volumeUSDWeek)}</StyledTextHeader>
      </ResponsiveGrid>
    </LinkWrapper>
  )
}

const MAX_ITEMS = 10

export default function PoolTable({ poolDatas, maxItems = MAX_ITEMS }: { poolDatas: PoolData[]; maxItems?: number }) {
  const { chainId } = useActiveChainId()

  const { t } = useTranslation()

  // for sorting
  const [sortField, setSortField] = useState(SORT_FIELD.tvlUSD)
  const [sortDirection, setSortDirection] = useState<boolean>(true)
  const chainPath = useMultiChainPath()

  // pagination
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)
  useEffect(() => {
    let extraPages = 1
    if (poolDatas.length % maxItems === 0) {
      extraPages = 0
    }
    setMaxPage(Math.floor(poolDatas.length / maxItems) + extraPages)
  }, [maxItems, poolDatas])

  const sortedPools = useMemo(() => {
    return poolDatas
      ? poolDatas
          .filter((x) => !!x && chainId && !POOL_HIDE?.[chainId]?.includes(x.address))
          .sort((a, b) => {
            if (a && b) {
              return a[sortField as keyof PoolData] > b[sortField as keyof PoolData]
                ? (sortDirection ? -1 : 1) * 1
                : (sortDirection ? -1 : 1) * -1
            }
            return -1
          })
          .slice(maxItems * (page - 1), page * maxItems)
      : []
  }, [chainId, maxItems, page, poolDatas, sortDirection, sortField])

  const handleSort = useCallback(
    (newField: string) => {
      setSortField(newField)
      setSortDirection(sortField !== newField ? true : !sortDirection)
      setPage(1)
    },
    [sortDirection, sortField],
  )

  const getSortFieldClassName = useSortFieldClassName(sortField, sortDirection)

  if (!poolDatas) {
    return <Loader />
  }

  return (
    <Box mt="24px">
      <TableWrapper>
        {sortedPools.length > 0 ? (
          <>
            <LayoutScroll>
              <ResponsiveGrid>
                <Text color="textSubtle">{t('NO.')}</Text>
                <ClickableColumnHeader color="textSubtle">
                  {t('Pair')}
                  <SortButton
                    scale="sm"
                    variant="subtle"
                    onClick={() => handleSort(SORT_FIELD.feeTier)}
                    className={getSortFieldClassName(SORT_FIELD.feeTier)}
                  >
                    <SortArrowIcon />
                  </SortButton>
                </ClickableColumnHeader>
                <ClickableColumnHeader color="textSubtle" style={{ justifyContent: 'flex-end' }}>
                  {t('TVL')}
                  <SortButton
                    scale="sm"
                    variant="subtle"
                    onClick={() => handleSort(SORT_FIELD.tvlUSD)}
                    className={getSortFieldClassName(SORT_FIELD.tvlUSD)}
                  >
                    <SortArrowIcon />
                  </SortButton>
                </ClickableColumnHeader>
                <ClickableColumnHeader color="textSubtle" style={{ justifyContent: 'flex-end' }}>
                  {t('Volume 24H')}
                  <SortButton
                    scale="sm"
                    variant="subtle"
                    onClick={() => handleSort(SORT_FIELD.volumeUSD)}
                    className={getSortFieldClassName(SORT_FIELD.volumeUSD)}
                  >
                    <SortArrowIcon />
                  </SortButton>
                </ClickableColumnHeader>
                <ClickableColumnHeader color="textSubtle" style={{ justifyContent: 'flex-end' }}>
                  {t('Volume 7D')}
                  <SortButton
                    scale="sm"
                    variant="subtle"
                    onClick={() => handleSort(SORT_FIELD.volumeUSDWeek)}
                    className={getSortFieldClassName(SORT_FIELD.volumeUSDWeek)}
                  >
                    <SortArrowIcon />
                  </SortButton>
                </ClickableColumnHeader>
              </ResponsiveGrid>
              <AutoColumn gap="16px">
                <Break />
                {sortedPools.map((poolData, i) => {
                  if (poolData) {
                    return (
                      <React.Fragment key={`${poolData?.address}_Row`}>
                        <DataRow index={(page - 1) * MAX_ITEMS + i} poolData={poolData} chainPath={chainPath} />
                        <Break />
                      </React.Fragment>
                    )
                  }
                  return null
                })}
              </AutoColumn>

            </LayoutScroll>
            <PageButtons>
              <Box
                onClick={() => {
                  setPage(page === 1 ? page : page - 1)
                }}
              >
                <Arrow>
                  <ArrowBackIcon color={page === 1 ? 'textDisabled' : 'primary'} />
                </Arrow>
              </Box>
              <Text>{`Page ${page} of ${maxPage}`}</Text>
              <Box
                onClick={() => {
                  setPage(page === maxPage ? page : page + 1)
                }}
              >
                <Arrow>
                  <ArrowForwardIcon color={page === maxPage ? 'textDisabled' : 'primary'} />
                </Arrow>
              </Box>
            </PageButtons>
          </>

        ) : (
          <StyledLoadingRows>
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
          </StyledLoadingRows>
        )}
      </TableWrapper>
    </Box>
  )
}
