import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Mail,
  Phone,
  Globe,
  MessageSquare,
  Reply,
  Check
} from
  'lucide-react';
import { Button } from '../ui/Button';
interface ContactDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: any;
}
export function ContactDetailModal({
  isOpen,
  onClose,
  message
}: ContactDetailModalProps) {
  if (!isOpen || !message) return null;
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
          className="relative w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                <MessageSquare size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Contact Message
                </h2>
                <div className="text-sm text-gray-400">{message.timestamp}</div>
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
            {/* Sender Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                  <User size={12} /> Name
                </div>
                <div className="text-white font-medium">{message.name}</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                  <Globe size={12} /> Country
                </div>
                <div className="text-white font-medium">{message.country}</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                  <Mail size={12} /> Email
                </div>
                <div
                  className="text-white font-medium truncate"
                  title={message.email}>

                  {message.email}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                  <Phone size={12} /> Phone
                </div>
                <div className="text-white font-medium">{message.phone}</div>
              </div>
            </div>

            {/* Message Body */}
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-bold">
                Message Content
              </div>
              <p className="text-gray-200 text-base leading-relaxed whitespace-pre-wrap">
                {message.message}
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 text-green-500 border-green-500/20 hover:bg-green-500/10">

              <Check size={16} /> Mark as Read
            </Button>
            <Button
              variant="primary"
              onClick={() => window.open(`mailto:${message.email}`)}
              className="flex items-center gap-2">

              <Reply size={16} /> Reply via Email
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>);

}