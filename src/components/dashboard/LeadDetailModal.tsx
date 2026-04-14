import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Mail,
  Phone,
  Globe,
  DollarSign,
  FileText,
  Folder,
  ExternalLink,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { ComingSoonModal } from "./ComingSoonModal";
import { FilePreviewModal } from "./FilePreviewModal";

interface LeadDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhaseChange?: (leadId: string, phase: string, dbId?: string) => void;
  lead: any;
}
export function LeadDetailModal({
  isOpen,
  onClose,
  onPhaseChange,
  lead,
}: LeadDetailModalProps) {
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [previewData, setPreviewData] = useState<{ url: string; name: string; format: string } | null>(null);

  if (!isOpen || !lead) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
            y: 20,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.95,
            y: 20,
          }}
          className="relative w-full max-w-3xl bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-red-600/10 text-red-600">
                <User size={24} />
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
              className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="text-xs text-gray-400 mb-1">
                      Assigned To
                    </div>
                    <div className="text-white font-bold text-lg flex items-center gap-2 text-[color:var(--bright-red)]">
                      <User size={18} />
                      {lead.assignedTo || "Unassigned"}
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-xs text-gray-400 mb-2">
                    Project Description
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {lead.description || "No description provided."}
                  </p>
                </div>
              </div>
            </section>

            {/* Project Timeline (Only if Working) */}
            {lead.projectProgress === "Working" && (
              <section className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Clock size={14} /> Project Timeline & Milestones
                </h3>
                
                <div className="relative flex flex-col md:flex-row justify-between gap-4">
                  {/* Progress Line Background */}
                  <div className="absolute top-5 left-8 right-8 h-0.5 bg-white/5 hidden md:block" />
                  
                  {["UI/UX", "Frontend", "Backend", "Deploy"].map((phase, index) => {
                    const phases = ["UI/UX", "Frontend", "Backend", "Deploy"];
                    const currentIndex = phases.indexOf(lead.workingPhase || "");
                    const isCompleted = index <= currentIndex;
                    const isActive = index === currentIndex;

                    return (
                      <button
                        key={phase}
                        onClick={() => onPhaseChange?.(lead.id, phase, lead.dbId)}
                        className="relative z-10 flex flex-col items-center group flex-1"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isActive 
                            ? "bg-[color:var(--bright-red)] text-white shadow-[0_0_15px_rgba(237,31,36,0.5)] scale-110" 
                            : isCompleted 
                              ? "bg-green-500/20 text-green-500 border border-green-500/30" 
                              : "bg-white/5 text-gray-500 border border-white/10 hover:border-white/30"
                        }`}>
                          {isCompleted && !isActive ? (
                            <CheckCircle2 size={20} />
                          ) : (
                            <span className="text-xs font-bold">{index + 1}</span>
                          )}
                        </div>
                        
                        <div className="mt-3 text-center">
                          <div className={`text-xs font-bold transition-colors ${
                            isActive ? "text-white" : isCompleted ? "text-green-500/80" : "text-gray-500"
                          }`}>
                            Phase {index + 1}: {phase}
                          </div>
                          <div className="text-[10px] text-gray-600 mt-0.5 whitespace-nowrap">
                            {isActive ? "Executing" : isCompleted ? "Done" : "Pending"}
                          </div>
                        </div>
                        
                        {index < 3 && (
                          <ArrowRight className="md:hidden text-gray-800 my-2" size={14} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Files */}
            <section>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Folder size={14} /> Project Files
              </h3>
              <div className="space-y-3">
                {lead.folderUrl && lead.folderUrl !== "#" && (
                  <a
                    href={lead.folderUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/10 text-white group-hover:bg-red-600 group-hover:text-white transition-colors">
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
                      className="text-gray-500 group-hover:text-white transition-colors"
                    />
                  </a>
                )}

                {/* Individual Attachments */}
                {lead.files && lead.files.length > 0
                  ? lead.files.map((file: any, index: number) => {
                      const url = file.url || file.secure_url || "#";
                      const format = file.format?.toLowerCase() || url?.split('.').pop()?.toLowerCase();
                      const name = file.original_filename || file.name || `Attachment ${index + 1}`;
                      let finalUrl = url;
                      if (format === 'pdf' && url?.includes('/upload/')) {
                        finalUrl = url.replace('/upload/', '/upload/fl_attachment/');
                      }

                      return (
                      <a
                        key={index}
                        href={finalUrl}
                        onClick={(e) => { e.preventDefault(); setPreviewData({ url: finalUrl, name, format: format || 'unknown' }); }}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-white/10 text-white group-hover:bg-red-600 group-hover:text-white transition-colors">
                            <FileText size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-white truncate">
                              {name}
                            </div>
                            <div className="text-xs text-gray-400">
                              Uploaded Attachment
                            </div>
                          </div>
                        </div>
                        <ExternalLink
                          size={16}
                          className="text-gray-500 group-hover:text-white transition-colors"
                        />
                      </a>
                    )})
                  : (!lead.folderUrl || lead.folderUrl === "#") && (
                      <div className="text-center py-6 bg-white/5 rounded-xl border border-dashed border-white/10">
                        <p className="text-sm text-gray-500 italic">
                          No files attached to this request.
                        </p>
                      </div>
                    )}
              </div>
            </section>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-white/10 bg-white/5 flex flex-wrap justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-all font-bold text-sm"
            >
              Close
            </button>
            <button
              onClick={() => setShowComingSoon(true)}
              className="px-6 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-all font-bold text-sm flex items-center gap-2"
            >
              <Mail size={16} /> Send Email
            </button>
            {lead.folderUrl && lead.folderUrl !== "#" && (
              <a
                href={lead.folderUrl}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all font-bold text-sm flex items-center gap-2"
              >
                <Folder size={16} /> Open Project Folder
              </a>
            )}
          </div>
        </motion.div>

        {/* Coming Soon Modal */}
        <ComingSoonModal 
          isOpen={showComingSoon} 
          onClose={() => setShowComingSoon(false)} 
        />

        {/* File Preview Modal */}
        <FilePreviewModal
          isOpen={!!previewData}
          onClose={() => setPreviewData(null)}
          fileUrl={previewData?.url || null}
          fileName={previewData?.name || null}
          fileFormat={previewData?.format || null}
        />
      </div>
    </AnimatePresence>
  );
}
