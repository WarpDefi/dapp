import { useTranslation } from '@pancakeswap/localization';
import { Box, Dropdown, Flex, Heading, IconButton, RowFixed, Text } from '@pancakeswap/uikit';
import { formatNumber } from '@pancakeswap/utils/formatBalance';
import BigNumber from 'bignumber.js';
import Container from 'components/Layout/Container';
import dayjs from 'dayjs';
import { formatEther } from 'ethers/lib/utils';
import useAccountActiveChain from 'hooks/useAccountActiveChain';
import forEach from 'lodash/forEach';
import keyBy from 'lodash/keyBy';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { SecondaryLabel } from 'views/Voting/CreateProposal/styles';
import { DatePicker, DatePickerPortal } from 'views/Voting/components/DatePicker';
import { useBalance } from 'wagmi';
import AssetAllocation from '../Component/AssetAllocation';
import AssetGrowth from '../Component/AssetGrowth';
import DailyProfit from '../Component/DailyProfit';
import TotalProfits from '../Component/TotalProfits';
import { getPercent, GROFI_SHOW_BALANCE } from '../helper';
import { useFetchListBalance } from '../hooks/useFetchListBalance';
import { useFetchUserCurrency } from '../hooks/useFetchUserCurrency';
import { useFetchUserInfo } from '../hooks/useFetchUserInfo';
import { BorderCard, StyledTitle } from '../styles';
import { TimeType } from '../types';

const StyledHeading = styled(Heading)`
  font-size: 24px;
  font-weight: 700;
  line-height: calc(56 / 52);
  ${({ theme }) => theme.mediaQueries.sm} {
    font-size: 32px;
    font-weight: 900;
  }
  ${({ theme }) => theme.mediaQueries.lg} {
    font-size: 36px;
  }
  ${({ theme }) => theme.mediaQueries.xl} {
    font-size: 44px;
  }
  ${({ theme }) => theme.mediaQueries.xxl} {
    font-size: 52px;
  }
`
const SortText = styled.button<{ active: boolean }>`
  cursor: pointer;
  font-weight: 700;
  margin-left: 8px;
  border: 2px solid transparent;
  background-color: ${({ active, theme }) => (active ? theme.colors.secondary : theme.colors.transparent)};
  font-size: 14px;
  padding: 8px 16px;
  border-radius: ${({ theme }) => theme.radii.card};
  color: ${({ active, theme }) => (active ? theme.colors.black : theme.colors.textSubtle)};
  border-color: ${({ active, theme }) => (active ? theme.colors.cardBorder : theme.colors.textSubtle)};
  outline: none;
  transition: all 0.3s ease-out;
	@media screen and (max-width: 424px) {
		margin: 3px;
  	border-radius: ${({ theme }) => theme.radii.small};
	}
  @media screen and (max-width: 374px) {
    padding: 8px 12px;
		margin: 2px;
  }
  &:hover {
    color: ${({ active, theme }) => (active ? theme.colors.black : theme.colors.hover)};
    border-color: ${({ active, theme }) => (active ? theme.colors.cardBorder : theme.colors.hover)};
  }
`
const StyledList = styled.div`
  --item: 3;
  --space: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space);
  margin-bottom: 56px;
	@media screen and (max-width: 1439px) {
		margin-bottom: 48px;
	}
	@media screen and (max-width: 1199px) {
		margin-bottom: 40px;
	}
	@media screen and (max-width: 991px) {
		--item: 2;
		margin-bottom: 32px;
	}
	@media screen and (max-width: 767px) {
		margin-bottom: 24px;
	}
  @media screen and (max-width: 575px) {
    --item: 1;
    gap: 0;
		margin-bottom: 16px;
  }
`
const StyledItem = styled.div`
  width: calc((100% - (var(--item) - 1) * var(--space)) / var(--item));
  border-radius: ${({ theme }) => theme.radii.card};
  padding: 20px 24px;
	@media screen and (max-width: 991px) {
		padding: 20px;
	}
	@media screen and (max-width: 575px) {
		padding: 16px;
	}
	&:not(:last-child) {
		@media screen and (max-width: 575px) {
			margin-bottom: var(--space);
		}
	}
`


export const Overview: React.FC<React.PropsWithChildren> = () => {
  const { t } = useTranslation()
  const [startDate, setStartDate] = useState<any>(null);
	const [endDate, setEndDate] = useState<any>(null);
  const [txFilter, setTxFilter] = useState<number | undefined>(TimeType.WEEK)
	const { account } = useAccountActiveChain()
	const listToken: any = []
	const { data: balanceU2U } = useBalance({ address: account })
	const { data: currencies } = useFetchUserCurrency()
	const [isShowBalance, setIsShowBalance] = useState<boolean>(true)

	let U2U_CONTRACT = ''
	if(currencies) {
		forEach(currencies, (item: any) => {
			if(item.id === 'U2U') {
				U2U_CONTRACT = item.contractAddress
			}
			listToken.push({contractAddress: item.contractAddress, symbol: item.id})
		})
	}
	const  currencyByContract= keyBy(currencies, 'contractAddress')

	const {data: listBalance} = useFetchListBalance(listToken)
	const balances = listBalance || {} 
	let totalValue: any = 0
	const listAssetAllocation = {}
	forEach(Object.keys(balances), (id: any) => { 
		let value: any = 0
		if(id === U2U_CONTRACT) {
			value =  balanceU2U?.formatted ? (BigNumber(balanceU2U?.formatted).multipliedBy(Number(currencyByContract[U2U_CONTRACT].currentPrice))).toNumber() : 0
		} else {
			value = balances[id]?.result ? BigNumber(formatEther(balances[id]?.result)).multipliedBy(currencyByContract[id].currentPrice).toNumber() : 0
		}

		totalValue += value
		listAssetAllocation[id] = value
	})
	totalValue = Number(totalValue).toFixed(4)

  const handleDateChange = (key: string) => (value: Date) => {
		if(key === 'startDate') {
			setStartDate(value)
		} else {
			setEndDate(value)
		}
		if((startDate && key === 'endDate') || (endDate && key === 'startDate' )) {
			setTxFilter(TimeType.CUSTOM)
		}
  }
	const resetCustomTime = () => {
		setStartDate(null)
		setEndDate(null)
	}

	const { data, isLoading } = useFetchUserInfo(account, txFilter, {
		startDate: startDate ? Math.floor(dayjs(Date.UTC(startDate.getUTCFullYear(), startDate.getMonth(),
		startDate.getDate(), 0, 0, 0)).valueOf()/ 1000) : null,
		endDate: endDate ? Math.floor(dayjs(Date.UTC(endDate.getUTCFullYear(), endDate.getMonth(),
		endDate.getDate(), 0, 0, 0)).valueOf()/ 1000) : null
	})
	let currentAsset: any = []
	if((txFilter === TimeType.WEEK || txFilter === TimeType.MONTH) && listBalance && data?.data) {
		currentAsset = [{
			assets: Object.keys(listBalance).map((item) => {
				return {
					balance: listBalance[item].result,
					balanceUsd: Number(listAssetAllocation[item].toFixed(4)),
					symbol: listBalance[item].symbol,
					name: listBalance[item].symbol
				}
			}),
			timestamp: Math.floor(dayjs().utc().set('hour', 0).set('minute', 0).set('second', 0).valueOf()/1000),
			totalAssets: totalValue
		}]
}

	const { data: dataPrev } = useFetchUserInfo(account, TimeType.PREV)
  const percentPrev: number = getPercent(totalValue, dataPrev?.data?.dailyAssets[0]?.totalAssets) // totalValue && Number(dataPrev?.data?.dailyAssets[0]?.totalAssets) ? (BigNumber(totalValue).minus(dataPrev?.data?.dailyAssets[0].totalAssets).div(dataPrev?.data?.dailyAssets[0].totalAssets).multipliedBy(100).toNumber()) :  Number(dataPrev?.data?.dailyAssets[0]?.totalAssets) ? 0 : 100
	let totalProfitFromData = 0
	const dailyAssets = data?.data ? [...data?.data?.dailyAssets, ...currentAsset] : []
	forEach(dailyAssets, (item, index: number)=> {
		const _asset = index === 0 ? Number(item.totalAssets) : dailyAssets[index] && Number(dailyAssets[index].totalAssets) - Number(dailyAssets[index - 1].totalAssets)
		totalProfitFromData += _asset
	})

	const percentTotal: number = getPercent(totalProfitFromData, dailyAssets[0]?.totalAssets) // ? (BigNumber(totalProfitFromData).minus(dailyAssets[0].totalAssets).div(dailyAssets[0].totalAssets).multipliedBy(100).toNumber()) : 0
	const maxDate = dayjs().utc().subtract(1, 'days').set('hour', 0).set('minute', 0).set('second', 0)

	const handleShowHideBalance = () => {
		const status = !isShowBalance
		localStorage?.setItem(GROFI_SHOW_BALANCE, status.toString())
		setIsShowBalance(Boolean(status))
	}
	useEffect(() => {
		const status = localStorage.getItem(GROFI_SHOW_BALANCE)
		if(status) {
			setIsShowBalance(status !== 'false')
		}
	},[])
  return (
    <Box mt={["24px", "24px", "32px", "32px", "48px", "48px", "60px"]}>
      <Container>
        <Flex flexDirection={["column", "column", "column", "row"]} alignItems={["", "", "", "center"]} justifyContent="space-between" mb={["20px", "20px", "24px", "24px", "28px", "28px", "32px"]}>
          <StyledHeading as="h1" scale="xxl" color="text">{t('Assets Analysis')}</StyledHeading>
          <RowFixed mt={["12px", "12px", "12px", "0px"]} ml="auto">
            <SortText
              onClick={() => {
                setTxFilter(TimeType.WEEK)
								resetCustomTime()
              }}
              active={txFilter === TimeType.WEEK}
            >
              {t('Past 7 days')}
            </SortText>
            <SortText
              onClick={() => {
                setTxFilter(TimeType.MONTH)
								resetCustomTime()
              }}
              active={txFilter === TimeType.MONTH}
            >
              {t('Past 30 days')}
            </SortText>
				    <Dropdown position="bottom-right" target={ 
							<SortText
								active={txFilter === TimeType.CUSTOM}
								>
								{t('+ Custom time')}
							</SortText>
						}>
							<Flex>
								<Box marginRight={2} maxWidth={140}>
									<SecondaryLabel>{t('Start Date')}</SecondaryLabel>
									<DatePicker
										name="date"
										onChange={handleDateChange('startDate')}
										selected={startDate}
										dateFormat="yyyy/MM/dd"
										maxDate={new Date(maxDate.valueOf())}
										placeholderText="YYYY/MM/DD"
									/>
								</Box>
								<Box maxWidth={140}>
									<SecondaryLabel>{t('End Date')}</SecondaryLabel>
									<DatePicker
										name="endDate"
										onChange={handleDateChange('endDate')}
										selected={endDate}
										dateFormat="yyyy/MM/dd"
										maxDate={new Date(maxDate.valueOf())}
										placeholderText="YYYY/MM/DD"
									/>
								</Box>
							</Flex>
      			</Dropdown>
          </RowFixed>
        </Flex>
        <StyledList>
				<StyledItem className="border-neubrutal" >
					<Flex alignItems="center" mb={["8px", "8px", "12px", "12px", "16px"]}>
						<Text color="textHighlight" fontSize="14px" mr={["8px", "8px", "8px", "8px", "12px", "12px", "16px"]}>Estimated Total Value</Text>
						<IconButton scale="xs" variant="text" onClick={handleShowHideBalance}>
							<img src={`/images/dashboard/${isShowBalance ? 'icon-eye' : 'icon-eye-close'}.svg`} width="16px" height="16px" alt="" />
						</IconButton>
					</Flex>
					<Box>
						<Text color="text" fontSize={["20px", "20px", "24px", "24px", "28px", "28px", "32px"]} fontWeight="700" lineHeight="1.2">
							{isShowBalance ? `${Number(totalValue) ? formatNumber(Number(totalValue), 0, 4) : 0} USDT` : '*****'} 
						</Text>
						<Flex alignItems="center" mt="8px">
							{isShowBalance && <Text color="textSubtle" fontSize="16px" fontWeight="500" >≈</Text>}
							<Text color='textSubtle' fontSize="16px" fontWeight="500" ml="6px">
								{isShowBalance ? `${Number(totalValue) ? formatNumber(Number(totalValue), 0, 4) : 0} USD` : '*****'}
							</Text>
						</Flex>
					</Box>
				</StyledItem>
				<StyledItem className="border-neubrutal" >
					<Flex alignItems="center" mb={["8px", "8px", "12px", "12px", "16px"]}>
						<Text color="textHighlight" fontSize="14px" mr="16px">{`Today's Profit`}</Text>
					</Flex>
					<Box>
						<Text color="text" fontSize={["20px", "20px", "24px", "24px", "28px", "28px", "32px"]} fontWeight="700" lineHeight="1.2">
							{isShowBalance ? ` ${` ${percentPrev > 0 ? '+' : ''}${formatNumber(BigNumber(totalValue).minus(dataPrev?.data?.dailyAssets[0]?.totalAssets || 0).toNumber(), 0, 4)}`} USDT` : '*****'}
						</Text>
						<Flex alignItems="center" mt="8px">
						{isShowBalance ? (
							<>
								{Number(percentPrev) ? <img src={`/images/dashboard/${percentPrev >= 0 ? 'icon-arrow-up' : 'icon-arrow-down'}.svg`} width="16px" height="16px" alt="" /> : null}
								<Text color={percentPrev > 0 ? 'success' : percentPrev < 0 ? 'failure' : 'textSubtle'} fontSize="16px" fontWeight="500" ml="6px">
									{percentPrev ? `${Number(percentPrev.toFixed(2))}%` : '--'}
								</Text>
							</>
						): 
						<Text color='textSubtle' fontSize="16px" fontWeight="500" ml="6px">*****</Text>
						}
					
						</Flex>
					</Box>
				</StyledItem>
				<StyledItem className="border-neubrutal" >
					<Flex alignItems="center" mb={["8px", "8px", "12px", "12px", "16px"]}>
						<Text color="textHighlight" fontSize="14px" mr="16px">{`Total profit of past ${ txFilter === TimeType.WEEK ? '7 days' : txFilter ===  TimeType.MONTH ? '30 days' : 'custom time'}`}</Text>
					</Flex>
					<Box>
						<Text color="text" fontSize={["20px", "20px", "24px", "24px", "28px", "28px", "32px"]} fontWeight="700" lineHeight="1.2">
							{isShowBalance ? `${totalProfitFromData ? `${percentTotal > 0 ? '+' : ''}${formatNumber(BigNumber(totalProfitFromData).minus(dailyAssets[0].totalAssets).toNumber(), 0, 4)}` : 0} USDT`: '*****'}
						</Text>
						<Flex alignItems="center" mt="8px">
							{isShowBalance ? (
								<>
									{Number(percentTotal) ? <img src={`/images/dashboard/${percentTotal >= 0 ? 'icon-arrow-up' : 'icon-arrow-down'}.svg`} width="16px" height="16px" alt="" /> : null}
									<Text color={percentTotal > 0 ? 'success' : percentTotal < 0 ? 'failure' : 'textSubtle'} fontSize="16px" fontWeight="500" ml="6px">
										{percentTotal ? `${Number(percentTotal.toFixed(2))}%` : '--'}
									</Text>
								</>
							) : (
								<Text color='textSubtle' fontSize="16px" fontWeight="500" ml="6px">*****</Text>
							)}
			
						</Flex>
					</Box>
				</StyledItem>
        </StyledList>
        <Flex flexDirection={["column", "column", "column", "column", "row"]}>
          <BorderCard style={{ flex: 1 }}>
            <StyledTitle>Asset Allocation</StyledTitle>
						<AssetAllocation balances={balances} listAssetAllocation={listAssetAllocation} totalValue={totalValue} isShowBalance={isShowBalance} isLoading={isLoading}/>
          </BorderCard>
          <BorderCard style={{ flex: 1.5 }} ml={["0", "0", "0", "0", "16px"]} mt={["16px", "16px", "16px", "16px", "0"]}>
            <StyledTitle>Asset Growth</StyledTitle>
            <AssetGrowth info={data} currentAsset={currentAsset} isShowBalance={isShowBalance} isLoading={isLoading}/>
          </BorderCard>
        </Flex>
        <Flex flexDirection={["column", "column", "column", "column", "row"]} mt="16px">
          <BorderCard style={{ flex: 1 }}>
            <StyledTitle>Total Asset</StyledTitle>
						<TotalProfits info={data} currentAsset={currentAsset} isShowBalance={isShowBalance} isLoading={isLoading}/>
          </BorderCard>
          <BorderCard style={{ flex: 1 }} ml={["0", "0", "0", "0", "16px"]} mt={["16px", "16px", "16px", "16px", "0"]}>
            <StyledTitle>Daily Profit</StyledTitle>
						<DailyProfit info={data} currentAsset={currentAsset} isShowBalance={isShowBalance} isLoading={isLoading}/>
          </BorderCard>
        </Flex>
        {/* <OrdersAnalysis/> */}
      </Container>
      <DatePickerPortal />
    </Box>
  )
}
