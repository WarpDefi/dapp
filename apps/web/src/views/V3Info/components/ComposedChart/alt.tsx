import { RowBetween } from '@pancakeswap/uikit'
import Card from 'components/Card'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import React, { Dispatch, ReactNode, SetStateAction } from 'react'
import { Area, Bar, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { styled } from 'styled-components'
import { formatDollarAmount } from 'views/V3Info/utils/numbers'
import { VolumeWindow } from '../../types'
import { LoadingRows } from '../Loader'

dayjs.extend(utc)

const DEFAULT_HEIGHT = 300

const Wrapper = styled(Card)`
  width: 100%;
  height: ${DEFAULT_HEIGHT}px;
  display: flex;
  background-color: transparent;
  flex-direction: column;
  padding: 1rem;
  > * {
    font-size: 16px;
    @media screen and (max-width: 991px) {
      font-size: 15px;
    }
    @media screen and (max-width: 575px) {
      font-size: 14px;
    }
  }
`

export type LineChartProps = {
  data: any[]
  color?: string | undefined
  height?: number | undefined
  minHeight?: number
  setValue?: Dispatch<SetStateAction<{value: number | undefined, feesUSD: number | undefined}>> // used for value on hover
  setLabel?: Dispatch<SetStateAction<string | undefined>> // used for label of value
  value?: {value: number | undefined, feesUSD: number | undefined}
  label?: string
  activeWindow?: VolumeWindow
  topLeft?: ReactNode | undefined
  topRight?: ReactNode | undefined
  bottomLeft?: ReactNode | undefined
  bottomRight?: ReactNode | undefined
} & React.HTMLAttributes<HTMLDivElement>

const CustomBar = ({
  x,
  y,
  width,
  height,
  fill,
}: {
  x: number
  y: number
  width: number
  height: number
  fill: string
}) => {
  return (
    <g>
      <rect x={x} y={y} fill={fill} width={width} height={height} rx="2" />
    </g>
  )
}

const Chart = ({
  data,
  color = '#1FC7D4',
  setValue,
  setLabel,
  value,
  label,
  activeWindow,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  minHeight = DEFAULT_HEIGHT,
  ...rest
}: LineChartProps) => {
  const parsedValue = value

  const now = dayjs()

  return (
    <Wrapper minHeight={minHeight} {...rest}>
      <RowBetween style={{ alignItems: 'flex-start', marginBottom: '16px' }}>
        {topLeft ?? null}
        {topRight ?? null}
      </RowBetween>
      {data?.length === 0 ? (
        <LoadingRows>
          <div />
          <div />
          <div />
        </LoadingRows>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            width={500}
            height={300}
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
            onMouseLeave={() => {
              if (setLabel) setLabel(undefined)
              if (setValue) setValue({value: undefined, feesUSD: undefined})
            }}
          >

            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tickFormatter={(time) => dayjs(time).format(activeWindow === VolumeWindow.monthly ? 'MMM' : 'DD')}
              minTickGap={10}
            />
            <YAxis dataKey="feesUSD" yAxisId="left"  tickLine={false} axisLine={false}  /> 
            <YAxis dataKey="value" yAxisId="right" orientation='right'  tickLine={false} axisLine={false} tickFormatter={(item) => formatDollarAmount(item)} /> 
            {/* label={{value: 'Volume', angle: -90, position: "right", fill: 'white', dy: "5" }} */}
            <Tooltip
              cursor={false}
              contentStyle={{ display: 'none' }}
              formatter={(toolTipValue: number, name: string, props) => {
                if (setValue && parsedValue?.value !== props.payload.value ) {
                  setValue(props.payload)
                }
                const formattedTime = dayjs(props.payload.time).format('MMM D')
                const formattedTimeDaily = dayjs(props.payload.time).format('MMM D, YYYY')
                const formattedTimePlusWeek = dayjs(props.payload.time).add(1, 'week')
                const formattedTimePlusMonth = dayjs(props.payload.time).add(1, 'month')

                if (setLabel && label !== formattedTime) {
                  if (activeWindow === VolumeWindow.weekly) {
                    const isCurrent = formattedTimePlusWeek.isAfter(now)
                    setLabel(
                      `${formattedTime}-${
                        isCurrent ? now.format('MMM D, YYYY') : formattedTimePlusWeek.format('MMM D, YYYY')
                      }`,
                    )
                  } else if (activeWindow === VolumeWindow.monthly) {
                    const isCurrent = formattedTimePlusMonth.isAfter(now)
                    setLabel(
                      `${formattedTime}-${
                        isCurrent ? now.format('MMM D, YYYY') : formattedTimePlusMonth.format('MMM D, YYYY')
                      }`,
                    )
                  } else {
                    setLabel(formattedTimeDaily)
                  }
                }
                return null
              }}
            />
            <Bar
              dataKey="value"
              yAxisId="right"
              fill={color}
              shape={(props) => {
                return <CustomBar height={props.height} width={props.width} x={props.x} y={props.y} fill={color} />
              }}
            />
            <Area yAxisId="left" dataKey="feesUSD" type="monotone" stroke="#1FC7D4" fill="transparent" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      )}
      <RowBetween>
        {bottomLeft ?? null}
        {bottomRight ?? null}
      </RowBetween>
    </Wrapper>
  )
}

export default Chart
