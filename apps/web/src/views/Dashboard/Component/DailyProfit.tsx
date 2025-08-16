import { Flex } from "@pancakeswap/uikit";
import { formatNumber } from "@pancakeswap/utils/formatBalance";
import BigNumber from "bignumber.js";
import dayjs from "dayjs";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import styled from "styled-components";
import { Circle, CustomTooltipContainer, StyledNoData, TooltipContent, TooltipLabel } from "../styles";

const StyledResponsiveContainer = styled(ResponsiveContainer)`
	height: 300px !important;
	width: 100%;
	font-size: 14px;
	// @media screen and (max-width: 1199px) {
	// 	height: 300px !important;
	// }
	// @media screen and (max-width: 575px) {
	// 	height: 250px !important;
	// }
`
const CustomTooltip = ({ active, payload, label, isShowBalance } : any) => {
	if(active && payload && payload.length) {
		return (
			<CustomTooltipContainer>
				<TooltipLabel>{`${label}`}</TooltipLabel>
				<TooltipContent>
					{payload.map((item) => {
						return (
							<>
								<Flex alignItems="center" mb="1">
									<Circle color="#E1FABB" size="6px" />
									<p>Total Profit: <span>{isShowBalance ? `${formatNumber(Number(item.value), 0, 4)} USDT` : '****'} </span></p>
								</Flex>
								<Flex alignItems="center" mb="1">
									<Circle color="#E1FABB" size="6px" />
									<p>Total PnL: <span>{isShowBalance ? `${item.payload?.pnl && formatNumber(Number(item.payload?.pnl), 0, 6)}%` : '****'} </span></p>
								</Flex>
							</>

						)
					})}
				</TooltipContent>
			</CustomTooltipContainer>
		)
	}
	return null
}

export default function DailyProfit({info, currentAsset, isShowBalance, isLoading}) {
	const getKey = (value: string) => {
		if(Number(value) > 0) {
			return 'pv'
		}
		return 'uv'
	}
	const listData = info?.data ? [...info?.data?.dailyAssets, ...currentAsset] : []
	const data = listData.map((item, index) => {
		const _asset = index === 0 ? item.totalAssets : listData[index] && (Number(listData[index].totalAssets) - Number(listData[index - 1].totalAssets)).toFixed(4)
		const pnl = !listData[index-1]?.totalAssets ? 0 : item.totalAssets && Number(listData[index-1]?.totalAssets) ? BigNumber(item.totalAssets).minus(listData[index-1]?.totalAssets).div(listData[index-1]?.totalAssets).multipliedBy(100).toNumber() : 0
		return {
			name: dayjs.unix(item.timestamp).format('YYYY-MM-DD'),
			[getKey(_asset)]: Number(_asset),
			pnl
		}
	})
	return (
		<StyledResponsiveContainer>
			{data?.length > 0 ? (
				<BarChart width={600} height={300} data={data} margin={{top: 0, right: 0, left: 0, bottom: 0}}>
					<CartesianGrid  vertical={false} strokeDasharray="1 0" opacity={0.1} />
					<XAxis tick={isShowBalance ? {fontSize: 12} : false} dataKey="name" stroke="#c3c3c3" axisLine={false} tickLine={false} />
					<YAxis tick={isShowBalance ?  {fontSize: 12}: false} stroke="#c3c3c3" axisLine={false} tickLine={false}/>
					<Tooltip
						cursor={false}
						wrapperStyle={{outline: 'none'}}
						content={<CustomTooltip isShowBalance={isShowBalance}/>}
					/>
					{/* <Legend /> */}
					<Bar dataKey="pv" name="Profit" stackId="a" fill="#00B58D" />
					<Bar dataKey="uv" name="Profit" stackId="a" fill="#FE5300" />
				</BarChart>
			) : (
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

	)
}