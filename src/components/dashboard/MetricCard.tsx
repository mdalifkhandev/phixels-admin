import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  LucideIcon
} from 'lucide-react';
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
  data?: number[]; // For sparkline in future
}
export function MetricCard({
  title,
  value,
  change,
  changeLabel = 'vs last period',
  icon: Icon,
  color = 'text-blue-500',
  trend = 'neutral'
}: MetricCardProps) {
  const isPositive = trend === 'up';
  const isNegative = trend === 'down';
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group relative overflow-hidden">

      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-white/5 ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <button className="text-gray-500 hover:text-white transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <div className="text-3xl font-bold text-white tracking-tight">
          {value}
        </div>
      </div>

      {change !== undefined &&
        <div className="mt-4 flex items-center gap-2">
          <div
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${isPositive ? 'bg-green-500/10 text-green-500' : isNegative ? 'bg-red-500/10 text-red-500' : 'bg-gray-500/10 text-gray-400'}`}>

            {isPositive ?
              <ArrowUpRight size={14} /> :
              isNegative ?
                <ArrowDownRight size={14} /> :
                null}
            <span>{Math.abs(change)}%</span>
          </div>
          <span className="text-xs text-gray-500">{changeLabel}</span>
        </div>
      }

      {/* Decorative gradient glow */}
      <div
        className={`absolute -right-10 -bottom-10 w-32 h-32 bg-gradient-to-br ${color.replace('text-', 'from-')} to-transparent opacity-5 blur-2xl rounded-full group-hover:opacity-10 transition-opacity`} />

    </motion.div>);

}