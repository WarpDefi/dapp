import { useTranslation } from '@pancakeswap/localization'
import { ArrowBackIcon, ArrowForwardIcon, AutoColumn, Box, Button, Flex, Skeleton, Text } from '@pancakeswap/uikit'
import React, { useState } from 'react'
import styled, { useTheme } from 'styled-components'
import { Arrow, Break, PageButtons } from 'views/Info/components/InfoTables/shared'
import { BorderCard, StyledTitle } from '../styles'

const Wrapper = styled.div`
  width: 100%;
`
const TableWrapper = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
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
  grid-template-columns: repeat(6, 1fr);
  padding: 0 24px;
  > * {
    min-width: 140px;
    &:last-child {
      min-width: 200px;
    }
  }

`
const StyledTitleTable = styled(Text)`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSubtle};
  text-transform: uppercase;
  @media screen and (max-width: 1559px) {
    font-size: 12px;
  }
`
const StyledTextTable = styled(Text)`
  font-size: 12px;
  font-weight: 600;
  line-height: 14px;
  span {
    font-size: 10px;
    font-weight: 400;
    color: ${({ theme }) => theme.colors.textExtra};
    margin-right: 4px;
  }
`
const StyledButton = styled(Button)`
  font-size: 14px;
  font-weight: 700;
  padding: 0 12px;
  + button {
    margin-left: 8px;
  }
`
const StyledTextPagination = styled(Text)`
  font-size: 15px;
  font-weight: 500;
  @media screen and (max-width: 1559px) {
    font-size: 14px;
  }
`
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

const listData = [
  { id: 1, token: 'btc', currentBalance: '0.01', buySell: '0.005', buyOrders: {avg: '67,035.33', orders: '7', tvl: '2,367.03'}, sellOrders: {avg: '67,035.33', orders: '7', tvl: '2,367.03'} },
  { id: 2, token: 'eth', currentBalance: '0.01', buySell: '0.005', buyOrders: {avg: '67,035.33', orders: '7', tvl: '2,367.03'}, sellOrders: {avg: '67,035.33', orders: '7', tvl: '2,367.03'} },
]

export default function OrdersAnalysis() {
  const { t } = useTranslation()
  const theme = useTheme()
  const [page, setPage] = useState(1)
  const disableNext = listData ? listData?.length === 0 || listData?.length < 10 : false

  return (
    <BorderCard mt="56px">
    <StyledTitle>{t('Orders Analysis')}</StyledTitle>
    <Wrapper>
      <TableWrapper>
        <LayoutScroll>
          <ResponsiveGrid>
            <StyledTitleTable color="textSubtle">
              {t('TOKEN')}
            </StyledTitleTable>
            <StyledTitleTable color="textSubtle" textAlign="center">
              {t('cURRENT BALANCE')}
            </StyledTitleTable>
            <StyledTitleTable color="textSubtle" textAlign="center">
              {t('BUY - SELL')}
            </StyledTitleTable>
            <StyledTitleTable color="textSubtle" textAlign="center">
              {t('BUY ORDERS')}
            </StyledTitleTable>
            <StyledTitleTable color="textSubtle" textAlign="center">
              {t('SELL ORDERS')}
            </StyledTitleTable>
            <StyledTitleTable color="textSubtle" textAlign="center">
              {t('ACTION')}
            </StyledTitleTable>
          </ResponsiveGrid>
          <AutoColumn gap="16px">
            <Break/>
            {listData?.map(item => (
              <React.Fragment key={item.id}>
                <ResponsiveGrid >
                  <Flex alignItems="center">
                    <img src={`/images/dashboard/${item.token}.png`} width="24px" height="24px" alt="" />
                    <StyledTextTable color="text" textTransform="uppercase" ml="8px">{item.token}</StyledTextTable>
                  </Flex>
                  <Box maxWidth="100%" mx="auto">
                    <StyledTextTable color="text" textAlign="center" style={{ fontSize: '14px' }}>
                      {item.currentBalance}
                      <span style={{ textTransform: 'uppercase', fontSize: '14px', fontWeight: '600', color: theme.colors.text, marginLeft: '2px' }}>{item.token}</span>
                    </StyledTextTable>
                    <Text textAlign="center" color="textHighlight" fontSize="11px" mt="4px">~ 7000 USD</Text>
                  </Box>
                  <Box maxWidth="100%" mx="auto">
                    <StyledTextTable color="text" textAlign="center" style={{ fontSize: '14px' }}>
                      {item.buySell}
                      <span style={{ textTransform: 'uppercase', fontSize: '14px', fontWeight: '600', color: theme.colors.text, marginLeft: '2px' }}>{item.token}</span>
                    </StyledTextTable>
                    <Text textAlign="center" color="textHighlight" fontSize="11px" mt="4px">~ 7000 USD</Text>
                  </Box>
                  <Box maxWidth="100%" mx="auto">
                    <StyledTextTable color="text">
                      <span>Avg Price:</span>
                      {item.buyOrders.avg}
                    </StyledTextTable>
                    <StyledTextTable mt="4px" color="text">
                      <span>Number orders:</span>
                      {item.buyOrders.orders}
                    </StyledTextTable>
                    <StyledTextTable mt="4px" color="text">
                      <span>TVL:</span>
                      {item.buyOrders.tvl}
                    </StyledTextTable>
                  </Box>
                  <Box maxWidth="100%" mx="auto">
                    <StyledTextTable color="text">
                      <span>Avg Price:</span>
                      {item.sellOrders.avg}
                    </StyledTextTable>
                    <StyledTextTable mt="4px" color="text">
                      <span>Number orders:</span>
                      {item.sellOrders.orders}
                    </StyledTextTable>
                    <StyledTextTable mt="4px" color="text">
                      <span>TVL:</span>
                      {item.sellOrders.tvl}
                    </StyledTextTable>
                  </Box>
                  <Flex>
                    <StyledButton scale="sm" className="button-hover" variant="primary">{t('View Detail')}</StyledButton>
                    <StyledButton scale="sm" className="button-hover" variant="primary">
                      {t('Trade')}
                      <img src="/images/dashboard/icon-angle.svg" width={16} height={16} alt="" />
                    </StyledButton>
                  </Flex>
                </ResponsiveGrid>
              <Break/>
              </React.Fragment>
            ))}
            {listData?.length === 0 && (
              <Flex my="16px" flexDirection="column" alignItems="center" justifyContent="center">
                <img src='/images/no-data.svg' alt='' />
                <StyledTextPagination color='textSubtle' mt="12px">{t('No Transaction')}</StyledTextPagination>
              </Flex>
            )}
          </AutoColumn>
        </LayoutScroll>
        <PageButtons style={{ marginBottom: 0 }}>
          <Arrow
            onClick={() => {
              setPage(page === 1 ? page : page - 1)
            }}
          >
            <ArrowBackIcon color={page === 1 ? 'textDisabled' : 'primary'} />
          </Arrow>
          <StyledTextPagination>Page {page}</StyledTextPagination>
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
  </BorderCard>
  )
}
