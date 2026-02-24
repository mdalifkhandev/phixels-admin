import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Copy,
  Check,
  TrendingUp,
  Calendar,
  MapPin,
  Activity,
  ExternalLink
} from
  'lucide-react';
interface DataDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Record<string, any> | null;
  title: string;
}
export function DataDetailModal({
  isOpen,
  onClose,
  data,
  title
}: DataDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const handleCopy = (key: string, value: string) => {
    navigator.clipboard.writeText(String(value));
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 2000);
  };
  // Format key for display (camelCase to Title Case)
  const formatKey = (key: string) => {
    return key.
      replace(/([A-Z])/g, ' $1').
      replace(/^./, (str) => str.toUpperCase());
  };
  // Get icon for specific fields
  const getFieldIcon = (key: string) => {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes('date') ||
      lowerKey.includes('time') ||
      lowerKey.includes('timestamp'))

      return Calendar;
    if (
      lowerKey.includes('location') ||
      lowerKey.includes('city') ||
      lowerKey.includes('country'))

      return MapPin;
    if (
      lowerKey.includes('trend') ||
      lowerKey.includes('rate') ||
      lowerKey.includes('conversion'))

      return TrendingUp;
    if (
      lowerKey.includes('activity') ||
      lowerKey.includes('event') ||
      lowerKey.includes('action'))

      return Activity;
    return null;
  };
  return (
    <AnimatePresence>
      {isOpen && data &&
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={onClose}>

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
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl bg-gradient-to-br from-[#0A0A0A] to-[#050505] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(237,31,36,0.15)] overflow-hidden flex flex-col max-h-[85vh]">

            {/* Header */}
            <div className="relative p-6 border-b border-white/10 bg-gradient-to-r from-[color:var(--bright-red)]/5 to-transparent overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[color:var(--bright-red)] via-[color:var(--neon-yellow)] to-[color:var(--vibrant-green)]" />

              <div className="flex items-start justify-between relative z-10">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {title}
                  </h2>
                  <p className="text-sm text-gray-400">
                    Detailed information view
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">

                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(data).map(([key, value]) => {
                  // Skip internal keys or complex objects
                  if (
                    key === 'id' ||
                    typeof value === 'object' &&
                    value !== null &&
                    !Array.isArray(value))

                    return null;
                  const displayValue = Array.isArray(value) ?
                    value.join(', ') :
                    String(value);
                  const Icon = getFieldIcon(key);
                  const isHighlight =
                    key.toLowerCase().includes('name') ||
                    key.toLowerCase().includes('email') ||
                    key.toLowerCase().includes('status');
                  return (
                    <motion.div
                      key={key}
                      initial={{
                        opacity: 0,
                        y: 10
                      }}
                      animate={{
                        opacity: 1,
                        y: 0
                      }}
                      className={`group relative ${isHighlight ? 'md:col-span-2' : ''}`}>

                      <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[color:var(--bright-red)]/30 hover:bg-white/10 transition-all duration-300 h-full">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {Icon &&
                              <div className="p-1.5 rounded-lg bg-[color:var(--bright-red)]/10">
                                <Icon
                                  size={14}
                                  className="text-[color:var(--bright-red)]" />

                              </div>
                            }
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                              {formatKey(key)}
                            </label>
                          </div>
                          <button
                            onClick={() => handleCopy(key, displayValue)}
                            className={`p-1.5 rounded-lg transition-all duration-200 ${copiedField === key ? 'bg-[color:var(--vibrant-green)]/20 text-[color:var(--vibrant-green)]' : 'text-gray-500 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100'}`}
                            title="Copy value">

                            {copiedField === key ?
                              <Check size={14} /> :

                              <Copy size={14} />
                            }
                          </button>
                        </div>

                        <div
                          className={`text-white font-medium break-words ${isHighlight ? 'text-lg' : 'text-sm'}`}>

                          {displayValue}
                        </div>
                      </div>
                    </motion.div>);

                })}
              </div>

              {/* Additional Info Section if available */}
              {(data.url || data.link || data.folderUrl || data.portfolio) &&
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ExternalLink size={16} className="text-blue-400" />
                      <span className="text-sm font-bold text-white">
                        External Resource
                      </span>
                    </div>
                    <a
                      href={
                        data.url ||
                        data.link ||
                        data.folderUrl ||
                        data.portfolio
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors text-sm font-medium">

                      Open Link
                    </a>
                  </div>
                </div>
              }
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 bg-[#050505] flex justify-end shrink-0">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[color:var(--bright-red)] to-[color:var(--deep-red)] text-white text-sm font-bold hover:shadow-[0_0_20px_rgba(237,31,36,0.4)] transition-all">

                Close
              </button>
            </div>
          </motion.div>
        </div>
      }
    </AnimatePresence>);

}