import { LucideIcon } from 'lucide-react';
interface ManagementStatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
}
export function ManagementStatsCard({
  title,
  value,
  icon: Icon,
  color
}: ManagementStatsCardProps) {
  // Extract gradient colors from the color prop string (e.g., "from-blue-500 to-cyan-500")
  // We'll use a subtle version for background and the full version for the icon
  return (
    <div className="relative overflow-hidden rounded-xl bg-[#0A0A0A] border border-white/10 p-4 h-20 flex items-center group hover:border-white/20 transition-all">
      {/* Subtle Background Gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${color} opacity-5 group-hover:opacity-10 transition-opacity`} />


      <div className="flex items-center gap-4 w-full relative z-10">
        {/* Icon Box */}
        <div
          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} p-0.5 shrink-0`}>

          <div className="w-full h-full bg-black/40 backdrop-blur-sm rounded-[7px] flex items-center justify-center">
            <Icon size={18} className="text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-white leading-none mb-1">
            {value}
          </span>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {title}
          </span>
        </div>
      </div>
    </div>);

}