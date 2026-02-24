import { Calendar, ChevronDown } from 'lucide-react';
export function DateRangePicker() {
  return (
    <div className="relative">
      <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
        <Calendar size={16} />
        <span>Last 30 Days</span>
        <ChevronDown size={14} className="text-gray-500" />
      </button>
      {/* Dropdown would go here in a real implementation */}
    </div>);

}