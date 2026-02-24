import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from
  'recharts';
const data = [
  {
    name: 'Visitors',
    value: 12500,
    rate: '100%'
  },
  {
    name: 'Engaged',
    value: 8400,
    rate: '67%'
  },
  {
    name: 'Contact',
    value: 3200,
    rate: '25%'
  },
  {
    name: 'Converted',
    value: 1100,
    rate: '8.8%'
  }];

const colors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];
export function ConversionFunnelChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{
            top: 5,
            right: 30,
            left: 40,
            bottom: 5
          }}>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#333"
            horizontal={false} />

          <XAxis type="number" hide />
          <YAxis
            dataKey="name"
            type="category"
            stroke="#999"
            tick={{
              fill: '#999',
              fontSize: 12
            }}
            tickLine={false}
            axisLine={false}
            width={80} />

          <Tooltip
            cursor={{
              fill: 'rgba(255,255,255,0.05)'
            }}
            contentStyle={{
              backgroundColor: '#111',
              border: '1px solid #333',
              borderRadius: '8px',
              color: '#fff'
            }} />

          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
            {data.map((_entry, index) =>
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]} />

            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>);

}