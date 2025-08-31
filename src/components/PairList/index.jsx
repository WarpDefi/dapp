import React, { useState, useEffect } from 'react'
import { useMedia } from 'react-use'
import dayjs from 'dayjs'
import LocalLoader from '../LocalLoader'
import utc from 'dayjs/plugin/utc'
import { Box, Flex, Text } from 'rebass'
import styled from 'styled-components'

import { CustomLink } from '../Link'
import { withRouter } from 'react-router-dom'
import { formattedNum, formattedPercent } from '../../utils/analytics'
import DoubleTokenLogo from '../DoubleLogoAnalytics'
import FormattedName from '../FormattedName'
import QuestionHelper from '../QuestionHelper'
import { TYPE } from '../../theme'
import { useActiveWeb3React } from '../../hooks'
import { ChainId } from '@pangolindex/sdk'
;

dayjs.extend(utc)

const Divider = styled(Box)`
  height: 1px;
`

const PageButtons = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 2em;
  margin-bottom: 0.5em;
`

const Arrow = styled.div`
  opacity: ${(props) => (props.faded ? 0.3 : 1)};
  padding: 0 20px;
  user-select: none;
  :hover {
    cursor: pointer;
  }
`

const List = styled(Box)`
  border-radius: 25px;
  padding: 20px;
  width: 100%;
  background-color: white;
  -webkit-overflow-scrolling: touch;
`

const DashGrid = styled.div`
  border-radius: 25px;
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 100px 1fr 1fr;
  grid-template-areas: 'name liq vol';
  padding: 0 1.125rem;

  > * {
    justify-content: flex-end;

    :first-child {
      justify-content: flex-start;
      text-align: left;
    }
  }

  @media screen and (min-width: 740px) {
    padding: 0 1.125rem;
    grid-template-columns: 2fr 1fr 1fr};
    grid-template-areas: ' name liq vol pool ';
  }

  @media screen and (min-width: 1080px) {
    padding: 0 1.125rem;
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
    grid-template-areas: ' name liq vol volWeek fees apy';
  }

  @media screen and (min-width: 1200px) {
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
    grid-template-areas: ' name liq vol volWeek fees apy';
  }
`

const ListWrapper = styled.div`
  border-radius: 25px;
  background-color: white;
`

const ClickableText = styled(Text)`
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
  text-align: end;
  user-select: none;
`

const DataText = styled(Flex)`
  align-items: center;
  text-align: center;

  & > * {
    font-size: 14px;
  }

  @media screen and (max-width: 600px) {
    font-size: 12px;
  }
`

const SORT_FIELD = {
  LIQ: 0,
  VOL: 1,
  VOL_7DAYS: 3,
  FEES: 4,
  APY: 5,
}

const FIELD_TO_VALUE = {
  [SORT_FIELD.LIQ]: 'trackedReserveUSD', // sort with tracked volume only
  [SORT_FIELD.VOL]: 'oneDayVolumeUSD',
  [SORT_FIELD.VOL_7DAYS]: 'oneWeekVolumeUSD',
  [SORT_FIELD.FEES]: 'oneDayVolumeUSD',
}

function PairList({ pairs, color, disbaleLinks, maxItems = 10 }) {
  const below600 = useMedia('(max-width: 600px)')
  const below740 = useMedia('(max-width: 740px)')
  const below1080 = useMedia('(max-width: 1080px)')

  // pagination
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)
  const ITEMS_PER_PAGE = maxItems

  // sorting
  const [sortDirection, setSortDirection] = useState(true)
  const [sortedColumn, setSortedColumn] = useState(SORT_FIELD.LIQ)

  useEffect(() => {
    setMaxPage(1) // edit this to do modular
    setPage(1)
  }, [pairs])

  useEffect(() => {
    if (pairs) {
      let extraPages = 1
      if (Object.keys(pairs).length % ITEMS_PER_PAGE === 0) {
        extraPages = 0
      }
      setMaxPage(Math.floor(Object.keys(pairs).length / ITEMS_PER_PAGE) + extraPages)
    }
  }, [ITEMS_PER_PAGE, pairs])

  const ListItem = ({ pairAddress, index }) => {
    const pairData = pairs[pairAddress]

    if (pairData && pairData.token0 && pairData.token1) {
      const liquidity = formattedNum(pairData.trackedReserveUSD, true)
      const volume = formattedNum(pairData.oneDayVolumeUSD, true)
      const apy = pairData.oneWeekVolumeUSD / 7 > pairData.oneDayVolumeUSD ? formattedPercent((pairData.oneWeekVolumeUSD / 7 * 0.003 * 365 * 100) / pairData.trackedReserveUSD) : formattedPercent((pairData.oneDayVolumeUSD * 0.003 * 365 * 100) / pairData.trackedReserveUSD)

      //console.log(pairData.oneWeekVolumeUSD/7)

      const tSymbol0 = pairData.token0.symbol == 'WAVAX' ? 'AVAX' : pairData.token0.symbol
      const tSymbol1 = pairData.token1.symbol == 'WAVAX' ? 'AVAX' : pairData.token1.symbol
      const tAddress0 = pairData.token0.id == '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7' ? 'AVAX' : pairData.token0.id
      const tAddress1 = pairData.token1.id == '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7' ? 'AVAX' : pairData.token1.id

      return (
        <DashGrid style={{ height: '48px' }} disbaleLinks={disbaleLinks} focus={true}>
          <DataText area="name" fontWeight="500">
            <DoubleTokenLogo
              a0={pairData.token0.id}
              a1={pairData.token1.id}
              size={below600 ? 20 : 30}
              margin={!below740}
            />
            <CustomLink style={{ marginLeft: '20px', whiteSpace: 'nowrap' }} to={'add/' + tAddress0+ '/' + tAddress1} color={color}>
              <FormattedName
                text={tSymbol0+ '-' + tSymbol1}
                maxCharacters={16}
                adjustSize={true}
                link={true}
              />
            </CustomLink>
          </DataText>
          <DataText area="liq">{liquidity}</DataText>
          {!below1080 && <DataText area="vol">{volume}</DataText>}
          {!below1080 && <DataText area="fees">{formattedNum(pairData.oneDayVolumeUSD * 0.003, true)}</DataText>}
          <DataText area="apy">{apy}</DataText>
        </DashGrid>
      )
    } else {
      return ''
    }
  }

  const chainId = useChainId();

  const pairList =
    pairs &&
    Object.keys(pairs)
      .sort((addressA, addressB) => {
        const pairA = pairs[addressA]
        const pairB = pairs[addressB]
        if (sortedColumn === SORT_FIELD.APY) {
          const apy0 = parseFloat(pairA.oneDayVolumeUSD * 0.003 * 356 * 100) / parseFloat(pairA.trackedReserveUSD)
          const apy1 = parseFloat(pairB.oneDayVolumeUSD * 0.003 * 356 * 100) / parseFloat(pairB.trackedReserveUSD)
          return apy0 > apy1 ? (sortDirection ? -1 : 1) * 1 : (sortDirection ? -1 : 1) * -1
        }
        return parseFloat(pairA[FIELD_TO_VALUE[sortedColumn]]) > parseFloat(pairB[FIELD_TO_VALUE[sortedColumn]])
          ? (sortDirection ? -1 : 1) * 1
          : (sortDirection ? -1 : 1) * -1
      })
      .slice(ITEMS_PER_PAGE * (page - 1), page * ITEMS_PER_PAGE)
      .map((pairAddress, index) => {
        return (
          pairAddress && (
            <div key={index}>
             <ListItem key={index} index={(page - 1) * ITEMS_PER_PAGE + index + 1} pairAddress={pairAddress} />
              <Divider />
            </div>
          )
        )
      })

  return (
    <ListWrapper>
      <DashGrid
        center={true}
        disbaleLinks={disbaleLinks}
        style={{ height: 'fit-content', padding: '1.250rem 1.125rem 1rem 1.125rem', borderBottom: '1px solid lightgray' }}
      >
        <Flex alignItems="center" justifyContent="flexStart">
          <p area="name">Pool Name</p>
        </Flex>
        <Flex alignItems="center" justifyContent="flexEnd">
          <ClickableText
            area="liq"
            onClick={(e) => {
              setSortedColumn(SORT_FIELD.LIQ)
              setSortDirection(sortedColumn !== SORT_FIELD.LIQ ? true : !sortDirection)
            }}
          >
            Liquidity {sortedColumn === SORT_FIELD.LIQ ? (!sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </Flex>
        {!below1080 && (
        <Flex alignItems="center">
          <ClickableText
            area="vol"
            onClick={(e) => {
              setSortedColumn(SORT_FIELD.VOL)
              setSortDirection(sortedColumn !== SORT_FIELD.VOL ? true : !sortDirection)
            }}
          >
            Volume (24hrs)
            {sortedColumn === SORT_FIELD.VOL ? (!sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </Flex>
        )}
        {!below1080 && (
          <Flex alignItems="center" justifyContent="flexEnd">
            <ClickableText
              area="fees"
              onClick={(e) => {
                setSortedColumn(SORT_FIELD.FEES)
                setSortDirection(sortedColumn !== SORT_FIELD.FEES ? true : !sortDirection)
              }}
            >
              Fees (24hr) {sortedColumn === SORT_FIELD.FEES ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
          )}
          <Flex alignItems="center" justifyContent="flexEnd">
            <ClickableText
              area="apy"
              onClick={(e) => {
                setSortedColumn(SORT_FIELD.APY)
                setSortDirection(sortedColumn !== SORT_FIELD.APY ? true : !sortDirection)
              }}
            >
              APR {sortedColumn === SORT_FIELD.APY ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
            <QuestionHelper text={'Based on 24hr volume annualized'} />
          </Flex>
      </DashGrid>
      <Divider />
      <List p={0}>{!pairList ? <LocalLoader /> : pairList}</List><PageButtons>
          <div
            onClick={(e) => {
              setPage(page === 1 ? page : page - 1)
            } }
          >
            <Arrow faded={page === 1 ? true : false}>←</Arrow>
          </div>
          <TYPE.body>{'Page ' + page + ' of ' + maxPage}</TYPE.body>
          <div
            onClick={(e) => {
              setPage(page === maxPage ? page : page + 1)
            } }
          >
            <Arrow faded={page === maxPage ? true : false}>→</Arrow>
          </div>
        </PageButtons>
    </ListWrapper>
  )
}

export default PairList
