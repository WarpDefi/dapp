import { Box, Flex, Text } from '@pancakeswap/uikit';
import { formatNumber } from '@pancakeswap/utils/formatBalance';
import dayjs from 'dayjs';
import forEach from 'lodash/forEach';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import styled from 'styled-components';
import { getRandomColor, LIST_COLOR } from '../helper';
import { Circle, CustomTooltipContainer, StyledNoData, TooltipContent, TooltipLabel } from "../styles";

const Wrapper = styled.div`
  position: relative;
  width: 100%;
`
const StyledResponsiveContainer = styled(ResponsiveContainer)`
	height: 360px !important;
	width: 100%;
	font-size: 14px;
	@media screen and (max-width: 1199px) {
		height: 300px !important;
	}
	@media screen and (max-width: 575px) {
		height: 250px !important;
	}
`
const FlexInfo = styled(Flex)`
	margin-bottom: 16px;
	flex-wrap: wrap;
	justify-content: center;
`

const CustomTooltip = ({ active, payload, label, isShowBalance }: any) => {
  if (active && payload && payload.length) {
    return (
      <CustomTooltipContainer>
        <TooltipLabel className="label">{`${label}`}</TooltipLabel>
				<TooltipContent>
				{
					payload.map((item) => {
						return (
							<Flex alignItems="center" mb="1">
								<Circle color={item.color}/>
								<p className="intro">{item.name} : <span style={{fontWeight: 'bold'}}> { isShowBalance ? `${formatNumber(item.value)} USDT` : '****'}</span></p>
							</Flex>
						)
					})
				}
				</TooltipContent>
      </CustomTooltipContainer>
    );
  }

  return null;
};

export default function AssetGrowth({info, currentAsset, isShowBalance, isLoading}: any) {
	let listLine: any = []
	const dataChart = info?.data && [...info?.data?.dailyAssets, ...currentAsset].map((item) => {
		listLine = []
		let newItem = {
			name: dayjs.unix(item.timestamp).format('YYYY-MM-DD'),
		}
		forEach(item.assets, (asset) => {
			newItem = {
				...newItem,
				[asset.name]: Number(asset.balanceUsd)
			}
			listLine.push({key: asset.name, value: LIST_COLOR[asset.name] || getRandomColor() })
		})
		return newItem
	})

	return (
		<Wrapper>
			<FlexInfo>
				{listLine.map((item) => {
					return (
						<Box margin="0 5px">
							<Flex alignItems="center">
									<Circle color={item.value} />
									<Text fontSize={13}>{item.key}</Text>
							</Flex>
						</Box>
					)
				})}
			</FlexInfo>
			<StyledResponsiveContainer>
				{dataChart?.length > 0 ? (
					<LineChart
						width={500}
						height={300}
						data={dataChart}
						margin={{
							top: 8,
							right: 8,
							left: 0,
							bottom: 0,
						}}
					>
						<CartesianGrid  vertical={false} strokeDasharray="1 0" opacity={0.1} />
						<XAxis stroke="#c3c3c3" tick={ isShowBalance ? {  fontSize: 12} : false} dataKey="name" axisLine={false} tickLine={false}  />
						<YAxis stroke="#c3c3c3" tick={ isShowBalance ? {fontSize: 12} : false } axisLine={false} tickLine={false}/>
						<Tooltip
							cursor={false}
							wrapperStyle={{outline: 'none'}}
							content={ <CustomTooltip isShowBalance={isShowBalance}/>}
							// formatter={function(value, name) { return `<div>${value}dasdas${name}</div>` }}
						/>
						{/* <Legend /> */}
						{listLine.map((item) => {
							return (
							<Line type="monotone" dataKey={item.key} stroke={item.value} dot={{ r:0 }} activeDot={{ stroke: item.value, strokeWidth: 8, strokeOpacity: 0.5, r: 4 }} />
							)
						})}
						{/* <Line type="monotone" dataKey="USDT" stroke="#82ca9d" /> */}
					</LineChart>
				) :  (
					<>
					{!isLoading && (
						<StyledNoData>
							<img src="/images/no-data.svg" alt="" />
							<span>No Data</span>
						</StyledNoData>
					)}
					</>
				)}
			</StyledResponsiveContainer>
		</Wrapper>
	)
}