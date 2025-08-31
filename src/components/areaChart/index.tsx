import usePrevious from '@/hooks/usePrevious';
import moment from 'moment';
import { useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export const PNGAreaChart = ({ data, currency1 }) => {
  const [activePoint, setActivePoint] = useState(null);
  const prevActivePoint = usePrevious(activePoint);

  if (!data.length) {
    return 'No historical data yet.';
  }
  const formattedData = data.map(({ timestamp, close }) => {
    return {
      timestamp: parseFloat(timestamp + '000'),
      close: parseFloat(close),
    };
  });

  const value = (formattedData[formattedData.length - 1].close - formattedData[0].close).toFixed(6);
  const percentage = ((formattedData[formattedData.length - 1].close / formattedData[0].close - 1) * 100).toFixed(2);
  const valueColor = Math.sign(value) === 1 ? '#58bd95' : '#d06969';

  return (
    <>
      <div className="flex flex-col">
        <div className="flex flex-col">
          <div className="flex gap-1">
            <div className="font-semibold text-4xl">
              {!activePoint
                ? formattedData[formattedData.length - 1].close.toFixed(6)
                : activePoint.payload.close.toFixed(6)}
            </div>
            <div className="mt-3">{currency1.symbol}</div>
          </div>
          <div className="text-xl font-semibold" style={{ color: valueColor }}>
            {value} ({percentage}%)
          </div>
        </div>
        <div className="text-sm text-black/40 dark:text-muted-foreground">
          {!activePoint
            ? moment(parseFloat(formattedData[formattedData.length - 1].timestamp)).format('MMM DD, YYYY, hh:mm A')
            : moment(activePoint.payload.timestamp).format('MMM DD, YYYY, hh:mm A')}
        </div>
      </div>
      <div className="w-full h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            margin={{ top: 0, left: 0, right: 0, bottom: 0 }}
            data={formattedData}
            onMouseMove={e => {
              if (e.activePayload && e.activePayload.length) {
                if (prevActivePoint && prevActivePoint.payload.timestamp === e.activePayload[0].payload.timestamp) {
                  return;
                }
                setActivePoint(e.activePayload[0]);
              } else {
                setActivePoint(null);
              }
            }}
            onMouseLeave={() => setActivePoint(null)}
          >
            <defs>
              <linearGradient id="chartBg" x1={0} y1={0} x2={0} y2={1}>
                <stop offset="5%" stopColor="#ffa739" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ffa739" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="timestamp"
              axisLine={false}
              tickLine={false}
              tickFormatter={value => moment(value).format('MMM DD')}
            />
            <YAxis hide domain={['dataMin', 'dataMax']} />
            <Area dataKey="close" strokeWidth="2" stroke="#ffa739" fill="url(#chartBg)" />
            <Tooltip content={() => null} cursor={{ stroke: '#eee', strokeWidth: 1 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};
