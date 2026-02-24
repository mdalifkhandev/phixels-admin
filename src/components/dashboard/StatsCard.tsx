import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  color: string;
}
export function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  color
}: StatsCardProps) {
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
      className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">

      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>

          <Icon className="w-6 h-6 text-white" />
        </div>
        {change &&
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full ${change.startsWith('+') ? 'bg-[color:var(--vibrant-green)]/20 text-[color:var(--vibrant-green)]' : 'bg-red-500/20 text-red-500'}`}>

            {change}
          </span>
        }
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400">{title}</div>
    </motion.div>);

}