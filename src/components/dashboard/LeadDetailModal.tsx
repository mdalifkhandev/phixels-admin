import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Mail,
  Phone,
  Globe,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Folder,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from
  'lucide-react';
import { Button } from '../ui/Button';
interface LeadDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: any;
}
export function LeadDetailModal({
  isOpen,
  onClose,
  lead
}: LeadDetailModalProps) {
  if (!isOpen || !lead) return null;
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
          className="relative w-full max-w-3xl bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl ${lead.status === 'Confirmed' ? 'bg-[color:var(--vibrant-green)]/10 text-[color:var(--vibrant-green)]' : 'bg-yellow-500/10 text-yellow-500'}`}>

                {lead.status === 'Confirmed' ?
                  <CheckCircle size={24} /> :

                  <AlertCircle size={24} />
                }
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Project Request Details
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>ID: {lead.id}</span>
                  <span>•</span>
                  <span>{lead.timestamp}</span>
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
          <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
            {/* Client Info */}
            <section>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <User size={14} /> Client Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-xs text-gray-400 mb-1">Full Name</div>
                  <div className="text-white font-medium">{lead.name}</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-xs text-gray-400 mb-1">
                    Email Address
                  </div>
                  <div className="text-white font-medium flex items-center gap-2">
                    <Mail size={14} className="text-gray-500" />
                    {lead.email}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-xs text-gray-400 mb-1">Phone Number</div>
                  <div className="text-white font-medium flex items-center gap-2">
                    <Phone size={14} className="text-gray-500" />
                    {lead.phone}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-xs text-gray-400 mb-1">Country</div>
                  <div className="text-white font-medium flex items-center gap-2">
                    <Globe size={14} className="text-gray-500" />
                    {lead.country}
                  </div>
                </div>
              </div>
            </section>

            {/* Project Details */}
            <section>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileText size={14} /> Project Scope
              </h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-xs text-gray-400 mb-1">
                    Estimated Budget
                  </div>
                  <div className="text-white font-bold text-lg flex items-center gap-2 text-[color:var(--vibrant-green)]">
                    <DollarSign size={18} />
                    {lead.budget}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-xs text-gray-400 mb-2">
                    Project Description
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {lead.description || 'No description provided.'}
                  </p>
                </div>
              </div>
            </section>

            {/* Meeting Info */}
            {lead.status === 'Confirmed' &&
              <section>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Calendar size={14} /> Consultation Details
                </h3>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="p-3 rounded-lg bg-blue-500/20 text-blue-500">
                    <Clock size={24} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">
                      Scheduled Meeting
                    </div>
                    <div className="text-lg font-bold text-white">
                      {lead.meetingDate} at {lead.meetingTime}
                    </div>
                    <div className="text-xs text-blue-400 mt-1">
                      Google Meet link sent to client
                    </div>
                  </div>
                </div>
              </section>
            }

            {/* Files */}
            <section>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Folder size={14} /> Project Files
              </h3>
              <a
                href={lead.folderUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group">

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/10 text-white group-hover:bg-[color:var(--bright-red)] group-hover:text-white transition-colors">
                    <Folder size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-white">
                      Google Drive Folder
                    </div>
                    <div className="text-xs text-gray-400">
                      Contains all uploaded assets
                    </div>
                  </div>
                </div>
                <ExternalLink
                  size={16}
                  className="text-gray-500 group-hover:text-white transition-colors" />

              </a>
            </section>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(`mailto:${lead.email}`)}
              className="flex items-center gap-2">

              <Mail size={16} /> Send Email
            </Button>
            <Button
              variant="primary"
              onClick={() => window.open(lead.folderUrl, '_blank')}
              className="flex items-center gap-2">

              <Folder size={16} /> Open Project Folder
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>);

}