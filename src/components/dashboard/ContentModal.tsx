import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSave?: () => void;
  saveLabel?: string;
  isLoading?: boolean;
}
export function ContentModal({
  isOpen,
  onClose,
  title,
  children,
  onSave,
  saveLabel = 'Save',
  isLoading = false
}: ContentModalProps) {
  return (
    <AnimatePresence>
      {isOpen &&
      <>
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
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
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
            className="w-full max-w-4xl max-h-[90vh] bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden pointer-events-auto">

              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white">{title}</h2>
                <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">

                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                {children}
              </div>

              {/* Footer */}
              {onSave &&
            <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
                  <button
                onClick={onClose}
                className="px-6 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors">

                    Cancel
                  </button>
                  <button
                onClick={onSave}
                disabled={isLoading}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-[color:var(--bright-red)] to-[color:var(--deep-red)] text-white font-bold hover:shadow-[0_0_20px_rgba(237,31,36,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed">

                    {isLoading ? 'Saving...' : saveLabel}
                  </button>
                </div>
            }
            </motion.div>
          </div>
        </>
      }
    </AnimatePresence>);

}