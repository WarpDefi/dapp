import { Flex } from "@pancakeswap/uikit"
import { formatNumber } from "@pancakeswap/utils/formatBalance"
import BigNumber from "bignumber.js"
import dayjs from "dayjs"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import styled from "styled-components"
import { Circle, CustomTooltipContainer, StyledNoData, TooltipContent, TooltipLabel } from "../styles"

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  height: 300px;
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
									<p>Total Asset: <span> {isShowBalance ? `${formatNumber(Number(item.value), 0, 4)} USDT` : '****'} </span></p>
								</Flex>
								<Flex alignItems="center" mb="1">
									<Circle color="#E1FABB" size="6px" />
									<p>Total PnL: <span>{ isShowBalance ? `${item.payload?.pnl && formatNumber(Number(item.payload?.pnl), 0, 6)}%` : '****'} </span></p>
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

export default function TotalProfits({info, currentAsset, isShowBalance, isLoading}) {
	const listData = info?.data ? [...info?.data?.dailyAssets, ...currentAsset] : []
	const data = listData.map((item, index) => {
		return {
			name: dayjs.unix(item.timestamp).format('YYYY-MM-DD'),
			Total: Number(item?.totalAssets),
			pnl: !listData[index-1]?.totalAssets ? 0 : item.totalAssets && Number(listData[index-1]?.totalAssets) ? BigNumber(item.totalAssets).minus(listData[index-1]?.totalAssets).div(listData[index-1]?.totalAssets).multipliedBy(100).toNumber() : 0
		}
	})
	return (
		<Wrapper>
			<ResponsiveContainer width="100%" height="100%">
				{data?.length > 0 ? (
					<AreaChart width={500} height={250} data={data}
						margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
						<defs>
							{/* <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#E1FABB" stopOpacity={0.8}/>
								<stop offset="100%" stopColor="#E1FABB" stopOpacity={0}/>
							</linearGradient> */}
							<linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stopColor="#E1FABB" stopOpacity={0.25}/>
							<stop offset="90%" stopColor="#FFFFFF" stopOpacity={0}/>
							</linearGradient>
						</defs>
						<XAxis stroke="#c3c3c3" tick={isShowBalance ? {fontSize: 12} : false} dataKey="name" axisLine={false} tickLine={false} />
						<YAxis stroke="#c3c3c3" tick={ isShowBalance ? {fontSize: 12} : false } axisLine={false} tickLine={false}/>
						<CartesianGrid  vertical={false} strokeDasharray="1 0" opacity={0.1}/>
						<Tooltip
							cursor={false}
							wrapperStyle={{outline: 'none'}}
							content={<CustomTooltip isShowBalance={isShowBalance}/>}
						/>
						{/* <Area type="monotone" dataKey="uv" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" /> */}
						<Area type="monotone" dataKey="Total" stroke="#69CF00" fillOpacity={1} fill="url(#colorPv)" strokeWidth={2} activeDot={{ stroke: '#E1FABB', strokeWidth: 8, strokeOpacity: 0.5, r: 4 }}/>
					</AreaChart>
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
			</ResponsiveContainer>
		</Wrapper>
	)
}