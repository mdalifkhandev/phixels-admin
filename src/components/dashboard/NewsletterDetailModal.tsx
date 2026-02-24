import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Calendar, UserMinus } from 'lucide-react';
import { Button } from '../ui/Button';
interface NewsletterDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriber: any;
}
export function NewsletterDetailModal({
  isOpen,
  onClose,
  subscriber
}: NewsletterDetailModalProps) {
  if (!isOpen || !subscriber) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
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
          className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                <Mail size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Subscriber Details
                </h2>
                <div className="text-sm text-gray-400">
                  Newsletter Subscription
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">

              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 mx-auto flex items-center justify-center text-2xl font-bold text-white mb-4">
                {subscriber.email.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-lg font-bold text-white">
                {subscriber.email}
              </h3>
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mt-2 ${subscriber.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>

                <span
                  className={`w-1.5 h-1.5 rounded-full ${subscriber.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`} />

                {subscriber.status}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-gray-400" />
                <div>
                  <div className="text-xs text-gray-400">Subscribed On</div>
                  <div className="text-sm font-bold text-white">
                    {subscriber.timestamp}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-white/10 bg-white/5 flex justify-between gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            {subscriber.status === 'Active' &&
              <Button
                variant="outline"
                className="flex-1 border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-400">

                <UserMinus size={16} className="mr-2" /> Unsubscribe
              </Button>
            }
          </div>
        </motion.div>
      </div>
    </AnimatePresence>);

}