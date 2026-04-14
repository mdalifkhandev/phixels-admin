import { useMemo, useState } from "react";
import { Search, Mail, MessageSquare, Users, Briefcase, Download } from "lucide-react";

// Components
import { StatsGrid } from "../../components/dashboard/lead-management/StatsGrid";
import { LeadsTable } from "../../components/dashboard/lead-management/LeadsTable";
import { MessagesTable } from "../../components/dashboard/lead-management/MessagesTable";
import { NewsletterTable } from "../../components/dashboard/lead-management/NewsletterTable";
import { JobsTable } from "../../components/dashboard/lead-management/JobsTable";

import { LeadDetailModal } from "../../components/dashboard/LeadDetailModal";
import { ContactDetailModal } from "../../components/dashboard/ContactDetailModal";
import { NewsletterDetailModal } from "../../components/dashboard/NewsletterDetailModal";
import { JobDetailModal } from "../../components/dashboard/JobDetailModal";

// State & Hooks
import { useDashboardStore } from "../../store/useDashboardStore";
import { useLeads, useUpdateLead } from "../../hooks/queries/useLeads";
import { useMessages, useUpdateMessage } from "../../hooks/queries/useMessages";
import { useNewsletter } from "../../hooks/queries/useNewsletter";
import { useJobs, useUpdateJob } from "../../hooks/queries/useJobs";

export function LeadManagement() {
  const { 
    activeTab, setActiveTab, 
    searchTerm, setSearchTerm, 
    progressFilter, setProgressFilter 
  } = useDashboardStore();

  // Selected Item States (Local UI only)
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [selectedSubscriber, setSelectedSubscriber] = useState<any>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  // Queries
  const { data: leads = [], isLoading: loadingLeads } = useLeads(progressFilter);
  const { data: messages = [], isLoading: loadingMessages } = useMessages();
  const { data: newsletter = [], isLoading: loadingNewsletter } = useNewsletter();
  const { data: jobs = [], isLoading: loadingJobs } = useJobs();

  // Mutations
  const updateLead = useUpdateLead();
  const updateMessage = useUpdateMessage();
  const updateJob = useUpdateJob();

  // Stats calculation
  const stats = useMemo(() => {
    return {
      total: leads.length,
      working: leads.filter((l: any) => l.projectProgress === "Working").length,
      inProgress: leads.filter((l: any) => l.projectProgress === "In-Progress").length,
      completed: leads.filter((l: any) => l.projectProgress === "Completed").length,
    };
  }, [leads]);

  // Handlers
  const handleProgressChange = async (id: string, newProgress: string, dbId?: string) => {
    if (newProgress === "Working" && (!selectedLead?.assignedTo || selectedLead.assignedTo === "Unassigned")) {
      // Small check for the current selected if available, but usually the hook will handle DB
    }
    await updateLead.mutateAsync({ id: dbId || id, data: { projectProgress: newProgress } });
  };

  const handlePhaseChange = async (leadId: string, newPhase: string, dbId?: string) => {
    await updateLead.mutateAsync({ id: dbId || leadId, data: { workingPhase: newPhase } });
  };

  const handleAssigneeChange = async (leadId: string, newAssignee: string, dbId?: string) => {
    await updateLead.mutateAsync({ id: dbId || leadId, data: { assignedTo: newAssignee } });
  };

  const handleMessageSelect = async (row: any) => {
    setSelectedMessage(row);
    if (row.status === "Unread") {
      await updateMessage.mutateAsync({ id: row.id, data: { status: "Read" } });
    }
  };

  // Filtering
  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    switch (activeTab) {
      case "leads":
        return leads.filter((l: any) => `${l.name} ${l.email} ${l.country}`.toLowerCase().includes(term));
      case "messages":
        return messages.filter((m: any) => `${m.name} ${m.email} ${m.message}`.toLowerCase().includes(term));
      case "newsletter":
        return newsletter.filter((n: any) => n.email.toLowerCase().includes(term));
      case "jobs":
        return jobs.filter((j: any) => `${j.name} ${j.email} ${j.jobTitle}`.toLowerCase().includes(term));
      default:
        return [];
    }
  }, [activeTab, searchTerm, leads, messages, newsletter, jobs]);

  const isLoading = loadingLeads || loadingMessages || loadingNewsletter || loadingJobs;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Lead Management</h1>
          <p className="text-gray-400">Track and manage all form submissions</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <StatsGrid 
        totalLeads={stats.total}
        workingLeads={stats.working}
        inProgressLeads={stats.inProgress}
        completedLeads={stats.completed}
      />

      {/* Tabs */}
      <div className="border-b border-white/10 flex gap-6 overflow-x-auto no-scrollbar">
        {[
          { id: "leads", label: "Project Requests", icon: Users },
          { id: "messages", label: "Contact Messages", icon: MessageSquare },
          { id: "newsletter", label: "Newsletter", icon: Mail },
          { id: "jobs", label: "Job Applications", icon: Briefcase },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 flex items-center gap-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? "border-[color:var(--bright-red)] text-white" : "border-transparent text-gray-400 hover:text-white"}`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden min-h-[400px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[color:var(--bright-red)]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {activeTab === "leads" && (
              <select
                value={progressFilter}
                onChange={(e) => setProgressFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-gray-300 focus:outline-none focus:border-[color:var(--bright-red)] cursor-pointer"
              >
                <option value="All" className="bg-[#0A0A0A]">All Progress States</option>
                <option value="New" className="bg-[#0A0A0A]">New</option>
                <option value="In-Progress" className="bg-[#0A0A0A]">In-Progress</option>
                <option value="Working" className="bg-[#0A0A0A]">Working</option>
                <option value="Completed" className="bg-[#0A0A0A]">Completed</option>
                <option value="Cancelled" className="bg-[#0A0A0A]">Cancelled</option>
              </select>
            )}
          </div>
        </div>

        {/* Dynamic Table Content */}
        {isLoading ? (
          <div className="p-6 text-sm text-gray-400">Loading data...</div>
        ) : (
          <>
            {activeTab === "leads" && (
              <LeadsTable 
                data={filteredData} 
                onView={setSelectedLead}
                onStatusChange={handleProgressChange}
                onAssigneeChange={handleAssigneeChange}
              />
            )}
            {activeTab === "messages" && (
              <MessagesTable data={filteredData} onView={handleMessageSelect} />
            )}
            {activeTab === "newsletter" && (
              <NewsletterTable data={filteredData} onView={setSelectedSubscriber} />
            )}
            {activeTab === "jobs" && (
              <JobsTable data={filteredData} onView={setSelectedJob} />
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <LeadDetailModal
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        onPhaseChange={handlePhaseChange}
        lead={selectedLead}
      />
      <ContactDetailModal
        isOpen={!!selectedMessage}
        onClose={() => setSelectedMessage(null)}
        message={selectedMessage}
      />
      <NewsletterDetailModal
        isOpen={!!selectedSubscriber}
        onClose={() => setSelectedSubscriber(null)}
        subscriber={selectedSubscriber}
      />
      <JobDetailModal
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        application={selectedJob}
      />
    </div>
  );
}
