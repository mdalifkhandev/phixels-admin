import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from
  'recharts';
const data = [
  {
    name: 'Mon',
    visitors: 4000,
    conversions: 240
  },
  {
    name: 'Tue',
    visitors: 3000,
    conversions: 139
  },
  {
    name: 'Wed',
    visitors: 2000,
    conversions: 980
  },
  {
    name: 'Thu',
    visitors: 2780,
    conversions: 390
  },
  {
    name: 'Fri',
    visitors: 1890,
    conversions: 480
  },
  {
    name: 'Sat',
    visitors: 2390,
    conversions: 380
  },
  {
    name: 'Sun',
    visitors: 3490,
    conversions: 430
  }];

export function TrafficChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0
          }}>

          <defs>
            <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#666"
            tick={{
              fill: '#666',
              fontSize: 12
            }}
            tickLine={false}
            axisLine={false} />

          <YAxis
            stroke="#666"
            tick={{
              fill: '#666',
              fontSize: 12
            }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`} />

          <Tooltip
            contentStyle={{
              backgroundColor: '#111',
              border: '1px solid #333',
              borderRadius: '8px',
              color: '#fff'
            }}
            itemStyle={{
              color: '#fff'
            }} />

          <Area
            type="monotone"
            dataKey="visitors"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorVisitors)" />

          <Area
            type="monotone"
            dataKey="conversions"
            stroke="#ef4444"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorConversions)" />

        </AreaChart>
      </ResponsiveContainer>
    </div>);

}