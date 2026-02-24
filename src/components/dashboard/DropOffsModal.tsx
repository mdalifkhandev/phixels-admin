import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  AlertTriangle,
  ArrowRight,
  MousePointer,
  Clock,
  Users,
  Calendar,
  AlertCircle
} from
  'lucide-react';
import type { AnalyticsOverview } from '../../types/types';
interface DropOffsModalProps {
  isOpen: boolean;
  onClose: () => void;
  insights?: AnalyticsOverview['criticalInsights'];
  totalLeads?: number;
  pendingLeads?: number;
  bookedLeads?: number;
}
export function DropOffsModal({
  isOpen,
  onClose,
  insights,
  totalLeads = 0,
  pendingLeads = 0,
  bookedLeads = 0
}: DropOffsModalProps) {
  if (!isOpen) return null;
  const conversionRate = totalLeads > 0 ? ((bookedLeads / totalLeads) * 100).toFixed(1) : '0.0';
  const pendingRate = totalLeads > 0 ? ((pendingLeads / totalLeads) * 100).toFixed(1) : '0.0';
  const renderedInsights = insights && insights.length > 0 ? insights : [
    {
      id: 'fallback',
      title: 'No Critical Issues Detected',
      description: 'System is operating in healthy range.',
      severity: 'low'
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          exit={{
            opacity: 0
          }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm" />


        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
            y: 20
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0
          }}
          exit={{
            opacity: 0,
            scale: 0.95,
            y: 20
          }}
          className="relative w-full max-w-4xl bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-[color:var(--bright-red)]/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[color:var(--bright-red)]/20 text-[color:var(--bright-red)]">
                <AlertCircle size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Critical Drop-off Analysis
                </h2>
                <p className="text-sm text-gray-400">
                  Master Popup Funnel & Form Performance
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">

              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[80vh]">
            {/* Master Popup Funnel */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Users size={16} className="text-blue-500" />
                Master Popup Funnel (Last 30 Days)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Step 1: Viewed */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 relative overflow-hidden">
                  <div className="text-sm text-gray-400 mb-1">Popup Views</div>
                  <div className="text-2xl font-bold text-white">{Math.max(totalLeads, 1).toLocaleString()}</div>
                  <div className="mt-2 text-xs text-gray-500">
                    Total impressions
                  </div>
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-500/50" />
                </div>

                {/* Step 2: Started (Step 1) */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 relative overflow-hidden">
                  <div className="text-sm text-gray-400 mb-1">
                    Step 1 Completed
                  </div>
                  <div className="text-2xl font-bold text-white">{totalLeads.toLocaleString()}</div>
                  <div className="mt-2 text-xs flex items-center gap-1 text-[color:var(--vibrant-green)]">
                    {conversionRate}% Conversion
                  </div>
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-yellow-500/50" />
                </div>

                {/* Step 3: Booked (Step 2) */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 relative overflow-hidden">
                  <div className="text-sm text-gray-400 mb-1">
                    Meeting Booked
                  </div>
                  <div className="text-2xl font-bold text-white">{bookedLeads.toLocaleString()}</div>
                  <div className="mt-2 text-xs flex items-center gap-1 text-[color:var(--vibrant-green)]">
                    {conversionRate}% Completion Rate
                  </div>
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-[color:var(--vibrant-green)]/50" />
                </div>
              </div>

              {/* Visual Flow */}
              <div className="mt-4 flex items-center justify-between px-10 relative">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/5 -z-10" />
                <div className="bg-[#0A0A0A] px-2 text-xs text-gray-500">
                  {Math.max(totalLeads, 1).toLocaleString()} Views
                </div>
                <div className="bg-[#0A0A0A] px-2 text-xs text-[color:var(--bright-red)] font-bold flex items-center gap-1">
                  <AlertTriangle size={12} />
                  {pendingRate}% Drop-off
                </div>
                <div className="bg-[#0A0A0A] px-2 text-xs text-gray-500">
                  {totalLeads.toLocaleString()} Leads
                </div>
                <div className="bg-[#0A0A0A] px-2 text-xs text-yellow-500 font-bold flex items-center gap-1">
                  <Clock size={12} />
                  {pendingRate}% Pending
                </div>
                <div className="bg-[#0A0A0A] px-2 text-xs text-[color:var(--vibrant-green)] font-bold">
                  {bookedLeads.toLocaleString()} Booked
                </div>
              </div>
            </div>

            {/* Critical Alerts */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                <AlertTriangle
                  size={16}
                  className="text-[color:var(--bright-red)]" />

                Critical Situations Required Attention
              </h3>

              {renderedInsights.map((item, index) => {
                const severity = item.severity || 'low';
                const styles =
                  severity === 'high'
                    ? 'bg-[color:var(--bright-red)]/10 border-[color:var(--bright-red)]/20'
                    : severity === 'medium'
                      ? 'bg-yellow-500/10 border-yellow-500/20'
                      : 'bg-blue-500/10 border-blue-500/20';
                const iconStyle =
                  severity === 'high'
                    ? 'bg-[color:var(--bright-red)]/20 text-[color:var(--bright-red)]'
                    : severity === 'medium'
                      ? 'bg-yellow-500/20 text-yellow-500'
                      : 'bg-blue-500/20 text-blue-500';
                const titleStyle =
                  severity === 'high'
                    ? 'text-[color:var(--bright-red)]'
                    : severity === 'medium'
                      ? 'text-yellow-500'
                      : 'text-blue-500';
                const Icon = index % 3 === 0 ? Clock : index % 3 === 1 ? MousePointer : Calendar;

                return (
                  <div key={item.id} className={`p-4 rounded-xl border flex items-start gap-4 ${styles}`}>
                    <div className={`p-2 rounded-lg shrink-0 ${iconStyle}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-400 mt-1">
                        {item.description}
                      </p>
                      <button className={`mt-3 text-xs font-bold hover:text-white transition-colors flex items-center gap-1 ${titleStyle}`}>
                        View Details <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>);

}
