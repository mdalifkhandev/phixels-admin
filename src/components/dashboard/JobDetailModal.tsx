import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Briefcase,
  User,
  Mail,
  Link as LinkIcon,
  FileText,
  ChevronDown
} from
  'lucide-react';
import { Button } from '../ui/Button';
interface JobDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: any;
}
export function JobDetailModal({
  isOpen,
  onClose,
  application
}: JobDetailModalProps) {
  if (!isOpen || !application) return null;
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
              <div className="p-3 rounded-xl bg-pink-500/10 text-pink-500">
                <Briefcase size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Job Application
                </h2>
                <div className="text-sm text-gray-400">
                  {application.jobTitle}
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
            {/* Applicant Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                  <User size={12} /> Applicant Name
                </div>
                <div className="text-white font-medium">{application.name}</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                  <Mail size={12} /> Email Address
                </div>
                <div className="text-white font-medium">
                  {application.email}
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between group hover:border-white/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/10 text-white">
                    <LinkIcon size={18} />
                  </div>
                  <div>
                    <div className="font-bold text-white">Portfolio URL</div>
                    <div className="text-xs text-gray-400 truncate max-w-[200px]">
                      {application.portfolio}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="text-xs"
                  onClick={() => window.open(application.portfolio, '_blank')}>

                  Visit
                </Button>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between group hover:border-white/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/10 text-white">
                    <FileText size={18} />
                  </div>
                  <div>
                    <div className="font-bold text-white">Resume / CV</div>
                    <div className="text-xs text-gray-400">PDF Document</div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="text-xs"
                  onClick={() => window.open(application.resumeUrl, '_blank')}>

                  Download
                </Button>
              </div>
            </div>

            {/* Status Selector */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider font-bold">
                Application Status
              </div>
              <div className="relative">
                <select
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-3 text-white appearance-none focus:outline-none focus:border-[color:var(--bright-red)]"
                  defaultValue={application.status}>

                  <option value="New">New Application</option>
                  <option value="Reviewing">Under Review</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <ChevronDown
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                  size={16} />

              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => window.open(`mailto:${application.email}`)}
              className="flex items-center gap-2">

              <Mail size={16} /> Contact Applicant
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>);

}