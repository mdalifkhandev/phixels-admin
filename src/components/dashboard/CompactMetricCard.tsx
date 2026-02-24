import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
interface CompactMetricCardProps {
  title: string;
  value: string | number;
  change?: string | number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ElementType;
  color?: string; // Tailwind text color class
  delay?: number;
}
export function CompactMetricCard({
  title,
  value,
  change,
  trend = 'neutral',
  icon: Icon,
  color = 'text-[color:var(--bright-red)]',
  delay = 0
}: CompactMetricCardProps) {
  const isPositive = trend === 'up';
  const isNegative = trend === 'down';
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      transition={{
        delay,
        duration: 0.3
      }}
      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[color:var(--bright-red)]/30 transition-all group relative overflow-hidden">

      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          {title}
        </h3>
        {Icon &&
        <div
          className={`p-1.5 rounded-lg bg-white/5 ${color} bg-opacity-10 group-hover:bg-opacity-20 transition-colors`}>

            <Icon size={14} className={color} />
          </div>
        }
      </div>

      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-bold text-white tracking-tight">
          {value}
        </div>
        {change &&
        <div
          className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${isPositive ? 'text-[color:var(--vibrant-green)] bg-[color:var(--vibrant-green)]/10' : isNegative ? 'text-[color:var(--bright-red)] bg-[color:var(--bright-red)]/10' : 'text-gray-400 bg-gray-500/10'}`}>

            {isPositive ?
          <ArrowUpRight size={10} className="mr-0.5" /> :
          isNegative ?
          <ArrowDownRight size={10} className="mr-0.5" /> :

          <Minus size={10} className="mr-0.5" />
          }
            {change}
          </div>
        }
      </div>

      {/* Subtle glow effect on hover */}
      <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-gradient-to-br from-[color:var(--bright-red)] to-transparent opacity-0 group-hover:opacity-10 blur-xl rounded-full transition-opacity duration-500" />
    </motion.div>);

}