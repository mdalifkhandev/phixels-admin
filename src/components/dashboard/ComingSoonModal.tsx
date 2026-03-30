import { motion, AnimatePresence } from "framer-motion";
import { Mail } from "lucide-react";

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export function ComingSoonModal({
  isOpen,
  onClose,
  title = "Coming Soon!",
  message = "In-app email functionality is currently under development. Stay tuned!",
}: ComingSoonModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-[#1A1A1A] border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
          >
            <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center mx-auto mb-4">
              <Mail size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-400 mb-6">{message}</p>
            <button
              onClick={onClose}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors"
            >
              Got it
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
