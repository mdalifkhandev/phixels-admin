import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { TrafficDataPoint } from '../../types/types';

const defaultTrafficData: TrafficDataPoint[] = [
  { name: 'Mon', visitors: 0, conversions: 0 },
  { name: 'Tue', visitors: 0, conversions: 0 },
  { name: 'Wed', visitors: 0, conversions: 0 },
  { name: 'Thu', visitors: 0, conversions: 0 },
  { name: 'Fri', visitors: 0, conversions: 0 },
  { name: 'Sat', visitors: 0, conversions: 0 },
  { name: 'Sun', visitors: 0, conversions: 0 }
];

interface BrandedTrafficChartProps {
  data?: TrafficDataPoint[];
}

export function BrandedTrafficChart({ data: propData }: BrandedTrafficChartProps) {
  const chartData = propData && propData.length > 0 ? propData : defaultTrafficData;
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{
            top: 10,
            right: 0,
            left: -20,
            bottom: 0
          }}>

          <defs>
            <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#013A63" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#013A63" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ED1F24" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ED1F24" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
            vertical={false} />

          <XAxis
            dataKey="name"
            stroke="#666"
            tick={{
              fill: '#666',
              fontSize: 10
            }}
            tickLine={false}
            axisLine={false}
            dy={10} />

          <YAxis
            stroke="#666"
            tick={{
              fill: '#666',
              fontSize: 10
            }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`} />

          <Tooltip
            contentStyle={{
              backgroundColor: '#050505',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
            }}
            itemStyle={{
              padding: 0
            }}
            cursor={{
              stroke: 'rgba(255,255,255,0.1)',
              strokeWidth: 1
            }} />

          <Area
            type="monotone"
            dataKey="visitors"
            stroke="#013A63"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorVisitors)"
            activeDot={{
              r: 4,
              fill: '#fff',
              stroke: '#013A63'
            }} />

          <Area
            type="monotone"
            dataKey="conversions"
            stroke="#ED1F24"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorConversions)"
            activeDot={{
              r: 4,
              fill: '#fff',
              stroke: '#ED1F24'
            }} />

        </AreaChart>
      </ResponsiveContainer>
    </div>);
}