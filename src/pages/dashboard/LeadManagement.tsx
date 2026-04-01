import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Clock,
  CheckCircle,
  TrendingUp,
  Download,
  Search,
  Mail,
  Calendar,
  MessageSquare,
  Briefcase,
  Eye,
} from "lucide-react";
import { ManagementStatsCard } from "../../components/dashboard/ManagementStatsCard";
import { DataTable } from "../../components/dashboard/DataTable";
import { LeadDetailModal } from "../../components/dashboard/LeadDetailModal";
import { ContactDetailModal } from "../../components/dashboard/ContactDetailModal";
import { NewsletterDetailModal } from "../../components/dashboard/NewsletterDetailModal";
import { JobDetailModal } from "../../components/dashboard/JobDetailModal";
import {
  teamMembersApi,
  projectRequestApi,
  contactRequestApi,
  newsletterApi,
  jobApplicationApi,
} from "../../services/api";
import type { TeamMember } from "../../types/types";

type LeadRow = {
  id: string;
  dbId?: string;
  timestamp: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  budget: string;
  status: "Confirmed" | "Pending";
  meetingDate: string;
  meetingTime: string;
  folderUrl: string;
  description: string;
  files?: Array<{ name: string; url: string }>;
  projectProgress: string;
  workingPhase?: string;
  assignedTo: string;
  _rawDate: Date;
};

type MessageRow = {
  id: string;
  timestamp: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  message: string;
  status: "Unread" | "Read";
  _rawDate: Date;
};

type NewsletterRow = {
  id: string;
  email: string;
  timestamp: string;
  status: "Active" | "Unsubscribed";
};

type JobRow = {
  id: string;
  timestamp: string;
  name: string;
  email: string;
  portfolio: string;
  jobTitle: string;
  resumeUrl: string;
  status: "New" | "Reviewing" | "Shortlisted" | "Rejected";
};

const formatTimestamp = (value?: string | Date) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString();
};

const getProgressColor = (status: string) => {
  switch (status) {
    case "New":
      return {
        row: "bg-blue-500/5",
        select: "text-blue-500 border-blue-500/30",
      };
    case "Pending":
      return {
        row: "bg-yellow-500/5",
        select: "text-yellow-500 border-yellow-500/30",
      };
    case "In-Progress":
      return {
        row: "bg-indigo-500/5",
        select: "text-indigo-500 border-indigo-500/30",
      };
    case "Meeting Scheduled":
      return {
        row: "bg-purple-500/5",
        select: "text-purple-500 border-purple-500/30",
      };
    case "Confirm":
      return {
        row: "bg-cyan-500/5",
        select: "text-cyan-500 border-cyan-500/30",
      };
    case "Working":
      return {
        row: "bg-orange-500/5",
        select: "text-orange-500 border-orange-500/30",
      };
    case "Completed":
      return {
        row: "bg-green-500/5",
        select: "text-green-500 border-green-500/30",
      };
    case "Cancelled":
      return {
        row: "bg-red-500/5",
        select: "text-red-500 border-red-500/30",
      };
    default:
      return { row: "", select: "text-white border-white/10" };
  }
};

export function LeadManagement() {
  const [activeTab, setActiveTab] = useState<
    "leads" | "messages" | "newsletter" | "jobs"
  >("leads");
  const [searchTerm, setSearchTerm] = useState("");
  const [progressFilter, setProgressFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [newsletter, setNewsletter] = useState<NewsletterRow[]>([]);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [workingLeads, setWorkingLeads] = useState(0);
  const [inProgressLeads, setInProgressLeads] = useState(0);
  const [completedLeads, setCompletedLeads] = useState(0);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [selectedSubscriber, setSelectedSubscriber] = useState<any>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  const fetchData = async (filter: string = "All") => {
    setLoading(true);
    try {
      const fetchParams: Record<string, string> =
        filter !== "All" ? { projectProgress: filter } : {};

      const [
        members,
        dbLeadsFiltered,
        dbLeadsTotal,
        dbMessagesRaw,
        dbNewslettersRaw,
        dbJobsRaw,
      ] = await Promise.all([
        teamMembersApi.getAll().catch(() => []),
        projectRequestApi.getAll(fetchParams).catch(() => []),
        projectRequestApi.getAll().catch(() => []), // Always fetch total for stats
        contactRequestApi.getAll().catch(() => []),
        newsletterApi.getAll().catch(() => []),
        jobApplicationApi.getAll().catch(() => []),
      ]);

      setTeamMembers(members);

      // Calculate stats from TOTAL leads
      const working = dbLeadsTotal.filter(
        (l: any) => l.projectProgress === "Working",
      ).length;
      const inProgress = dbLeadsTotal.filter(
        (l: any) => l.projectProgress === "In-Progress",
      ).length;
      const completed = dbLeadsTotal.filter(
        (l: any) => l.projectProgress === "Completed",
      ).length;

      setTotalLeads(dbLeadsTotal.length);
      setWorkingLeads(working);
      setInProgressLeads(inProgress);
      setCompletedLeads(completed);

      const leadsProcessed: LeadRow[] = dbLeadsFiltered.map((req: any) => ({
        id: `REQ-${(req.requestId || req._id || "000000").slice(-6).toUpperCase()}`,
        dbId: req._id,
        timestamp: formatTimestamp(req.createdAt),
        name: req.name || "Unknown",
        email: req.email || "N/A",
        phone: req.phone || "N/A",
        country: req.country || "Unknown",
        budget: req.budget || "N/A",
        status: req.status || "Pending",
        meetingDate: req.meetingDate || "",
        meetingTime: req.meetingTime || "",
        folderUrl: req.folderUrl || "#",
        description: req.description || "No description provided.",
        files: Array.isArray(req.files) ? req.files : [],
        projectProgress: req.projectProgress || "New",
        workingPhase: req.workingPhase || null,
        assignedTo: req.assignedTo || "Unassigned",
        _rawDate: new Date(req.createdAt),
      }));

      setLeads(
        leadsProcessed.sort((a, b) => {
          if (
            a.projectProgress === "Cancelled" &&
            b.projectProgress !== "Cancelled"
          )
            return 1;
          if (
            a.projectProgress !== "Cancelled" &&
            b.projectProgress === "Cancelled"
          )
            return -1;
          return b._rawDate.getTime() - a._rawDate.getTime();
        }),
      );

      const messagesProcessed: MessageRow[] = dbMessagesRaw.map((req: any) => ({
        id: req._id,
        timestamp: formatTimestamp(req.createdAt),
        name: req.name || "Unknown",
        email: req.email || "N/A",
        phone: req.phone || "N/A",
        country: req.country || "Unknown",
        message: req.message || "No message found.",
        status: req.status === "Read" ? "Read" : "Unread",
        _rawDate: new Date(req.createdAt),
      }));
      setMessages(messagesProcessed);

      const newsletterProcessed: NewsletterRow[] = dbNewslettersRaw.map(
        (req: any) => ({
          id: req._id,
          email: req.email,
          timestamp: formatTimestamp(req.createdAt),
          status: "Active",
        }),
      );
      setNewsletter(newsletterProcessed);

      const jobsProcessed: JobRow[] = dbJobsRaw.map((req: any) => ({
        id: req._id,
        timestamp: formatTimestamp(req.createdAt),
        name: req.name || "Unknown Applicant",
        email: req.email || "N/A",
        portfolio: req.portfolio || "#",
        jobTitle: req.jobTitle || "Position",
        resumeUrl: req.resumeUrl || "#",
        status: req.status || "New",
      }));
      setJobs(jobsProcessed);
    } catch (error) {
      console.error("Failed to fetch lead management data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(progressFilter);
  }, [activeTab, progressFilter]);

  const handleProgressChange = async (
    leadId: string,
    newProgress: string,
    dbId?: string,
  ) => {
    // 1. Validation: Prevent "Working" if unassigned
    const targetLead = leads.find((l) => l.id === leadId);
    if (
      newProgress === "Working" &&
      (!targetLead?.assignedTo || targetLead.assignedTo === "Unassigned")
    ) {
      alert("Please assign a team member before moving to 'Working' status.");
      return;
    }

    const targetLeadArr = leads.filter((l) => l.id === leadId);
    if (targetLeadArr.length === 0) return;
    const oldProgress = targetLeadArr[0].projectProgress;

    setLeads((prev) => {
      const updated = prev.map((lead) =>
        lead.id === leadId ? { ...lead, projectProgress: newProgress } : lead,
      );

      // Update Global Stats relatively
      if (oldProgress !== newProgress) {
        if (oldProgress === "Working") setWorkingLeads((p) => p - 1);
        if (oldProgress === "In-Progress") setInProgressLeads((p) => p - 1);
        if (oldProgress === "Completed") setCompletedLeads((p) => p - 1);

        if (newProgress === "Working") setWorkingLeads((p) => p + 1);
        if (newProgress === "In-Progress") setInProgressLeads((p) => p + 1);
        if (newProgress === "Completed") setCompletedLeads((p) => p + 1);
      }

      // Update selected lead if it's the one being modified
      if (
        selectedLead &&
        (selectedLead.id === leadId || selectedLead.dbId === dbId)
      ) {
        const target = updated.find((l) => l.id === leadId);
        if (target) setSelectedLead(target);
      }
      return updated.sort((a: any, b: any) => {
        if (
          a.projectProgress === "Cancelled" &&
          b.projectProgress !== "Cancelled"
        )
          return 1;
        if (
          a.projectProgress !== "Cancelled" &&
          b.projectProgress === "Cancelled"
        )
          return -1;
        return b._rawDate.getTime() - a._rawDate.getTime();
      });
    });
    try {
      if (dbId) {
        await projectRequestApi.update(dbId, { projectProgress: newProgress });
      }
    } catch (error) {
      console.error("Failed to update project progress", error);
    }
  };

  const handlePhaseChange = async (
    leadId: string,
    newPhase: string,
    dbId?: string,
  ) => {
    setLeads((prev) => {
      const updated = prev.map((lead) =>
        lead.id === leadId ? { ...lead, workingPhase: newPhase } : lead,
      );
      // Update selected lead to reflect changes in the modal immediately
      if (
        selectedLead &&
        (selectedLead.id === leadId || selectedLead.dbId === dbId)
      ) {
        const target = updated.find((l) => l.id === leadId);
        if (target) setSelectedLead(target);
      }
      return updated;
    });
    try {
      if (dbId) {
        await projectRequestApi.update(dbId, { workingPhase: newPhase });
      }
    } catch (error) {
      console.error("Failed to update project phase", error);
    }
  };

  const PhaseTracker = ({ currentPhase }: { currentPhase?: string }) => {
    const phases = ["UI/UX", "Frontend", "Backend", "Deploy"];
    const currentIndex = phases.indexOf(currentPhase || "");

    return (
      <div className="flex flex-col gap-1 mt-1">
        <div className="text-[10px] text-gray-500 font-medium">
          Stage {currentIndex + 1}:{" "}
          <span className="text-gray-400">{currentPhase || "UI/UX"}</span>
        </div>
      </div>
    );
  };

  const handleAssigneeChange = async (
    leadId: string,
    newAssignee: string,
    dbId?: string,
  ) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId ? { ...lead, assignedTo: newAssignee } : lead,
      ),
    );
    try {
      if (dbId) {
        await projectRequestApi.update(dbId, { assignedTo: newAssignee });
      }
    } catch (error) {
      console.error("Failed to update project assignee", error);
    }
  };

  const handleMessageSelect = async (messageRow: any) => {
    setSelectedMessage(messageRow);
    if (messageRow.status === "Unread") {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageRow.id ? { ...m, status: "Read" } : m,
        ),
      );
      try {
        await contactRequestApi.update(messageRow.id, { status: "Read" });
      } catch (error) {
        console.error("Failed to mark message as read in DB", error);
      }
    }
  };

  const filteredLeads = useMemo(
    () =>
      leads.filter((item) =>
        `${item.name} ${item.email} ${item.country}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
      ),
    [leads, searchTerm],
  );

  const filteredMessages = useMemo(
    () =>
      messages.filter((item) =>
        `${item.name} ${item.email} ${item.message}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
      ),
    [messages, searchTerm],
  );

  const filteredNewsletter = useMemo(
    () =>
      newsletter.filter((item) =>
        item.email.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [newsletter, searchTerm],
  );

  const filteredJobs = useMemo(
    () =>
      jobs.filter((item) =>
        `${item.name} ${item.email} ${item.jobTitle}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
      ),
    [jobs, searchTerm],
  );

  const leadColumns = [
    {
      key: "name",
      label: "Client Details",
      render: (value: string, row: any) => (
        <div
          onClick={() => setSelectedLead(row)}
          className="cursor-pointer group"
        >
          <div className="font-bold text-white group-hover:text-[color:var(--bright-red)] transition-colors">
            {value}
          </div>
          <div className="text-xs text-gray-400">{row.email}</div>
        </div>
      ),
    },
    {
      key: "timestamp",
      label: "Submitted",
      render: (value: string, row: any) => (
        <span
          onClick={() => setSelectedLead(row)}
          className="cursor-pointer text-xs text-gray-400"
        >
          {value}
        </span>
      ),
    },
    {
      key: "budget",
      label: "Budget",
      render: (value: string, row: any) => (
        <span
          onClick={() => setSelectedLead(row)}
          className="text-gray-300 font-medium cursor-pointer"
        >
          {value}
        </span>
      ),
    },
    {
      key: "meetingDate",
      label: "Meeting",
      render: (value: string, row: any) => (
        <div onClick={() => setSelectedLead(row)} className="cursor-pointer">
          {value ? (
            <div className="flex items-center gap-1 text-xs text-gray-300">
              <Calendar size={12} />
              {value} at {row.meetingTime}
            </div>
          ) : (
            <span className="text-xs text-gray-500 italic">Not booked</span>
          )}
        </div>
      ),
    },
    {
      key: "assignedTo",
      label: "Assignee",
      render: (value: string, row: any) => (
        <select
          value={value}
          onChange={(e) =>
            handleAssigneeChange(row.id, e.target.value, row.dbId)
          }
          className="bg-[#0A0A0A] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[color:var(--bright-red)]"
          onClick={(e) => e.stopPropagation()}
        >
          <option value="Unassigned">Unassigned</option>
          {teamMembers.map((member) => (
            <option key={member._id} value={member.name}>
              {member.name}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: "projectProgress",
      label: "Project Progress",
      render: (value: string, row: any) => {
        const colors = getProgressColor(value);
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <select
                value={value}
                onChange={(e) =>
                  handleProgressChange(row.id, e.target.value, row.dbId)
                }
                className={`bg-[#0A0A0A] border rounded-lg px-2 py-1 text-xs font-medium focus:outline-none focus:border-[color:var(--bright-red)] transition-colors ${colors.select}`}
                onClick={(e) => e.stopPropagation()} // Prevent double clicks
              >
                <option value="New">New</option>
                <option value="Pending">Pending</option>
                <option value="In-Progress">In-Progress</option>
                <option value="Working">Working</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedLead(row);
                }}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                title="View Details"
              >
                <Eye size={16} />
              </button>
            </div>
            {value === "Working" && (
              <PhaseTracker currentPhase={row.workingPhase} />
            )}
          </div>
        );
      },
    },
  ];

  const messageColumns = [
    {
      key: "name",
      label: "Sender",
      render: (value: string, row: any) => (
        <div
          onClick={() => handleMessageSelect(row)}
          className="cursor-pointer group"
        >
          <div className="font-bold text-white group-hover:text-blue-500 transition-colors">
            {value}
          </div>
          <div className="text-xs text-gray-400">{row.email}</div>
        </div>
      ),
    },
    {
      key: "message",
      label: "Message Preview",
      render: (value: string, row: any) => (
        <div
          onClick={() => handleMessageSelect(row)}
          className="cursor-pointer text-sm text-gray-300 truncate max-w-[300px]"
        >
          {value}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: string, row: any) => (
        <span
          onClick={() => handleMessageSelect(row)}
          className={`cursor-pointer px-2 py-1 rounded-full text-xs font-bold ${value === "Unread" ? "bg-blue-500/20 text-blue-500" : "bg-gray-500/20 text-gray-400"}`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "timestamp",
      label: "Date",
      render: (value: string, row: any) => (
        <span
          onClick={() => handleMessageSelect(row)}
          className="cursor-pointer text-xs text-gray-500"
        >
          {value}
        </span>
      ),
    },
  ];

  const newsletterColumns = [
    {
      key: "email",
      label: "Subscriber Email",
      render: (value: string, row: any) => (
        <div
          onClick={() => setSelectedSubscriber(row)}
          className="cursor-pointer font-bold text-white hover:text-purple-500 transition-colors"
        >
          {value}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: string, row: any) => (
        <span
          onClick={() => setSelectedSubscriber(row)}
          className={`cursor-pointer px-2 py-1 rounded-full text-xs font-bold ${value === "Active" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "timestamp",
      label: "Subscribed Date",
      render: (value: string, row: any) => (
        <span
          onClick={() => setSelectedSubscriber(row)}
          className="cursor-pointer text-xs text-gray-500"
        >
          {value}
        </span>
      ),
    },
  ];

  const jobColumns = [
    {
      key: "name",
      label: "Applicant",
      render: (value: string, row: any) => (
        <div
          onClick={() => setSelectedJob(row)}
          className="cursor-pointer group"
        >
          <div className="font-bold text-white group-hover:text-pink-500 transition-colors">
            {value}
          </div>
          <div className="text-xs text-gray-400">{row.jobTitle}</div>
        </div>
      ),
    },
    {
      key: "portfolio",
      label: "Portfolio",
      render: (_value: string) => (
        <a
          href={_value}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-blue-400 hover:underline truncate max-w-[150px] block"
        >
          {_value}
        </a>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: string, row: any) => {
        let colorClass = "bg-gray-500/20 text-gray-400";
        if (value === "New") colorClass = "bg-blue-500/20 text-blue-500";
        if (value === "Shortlisted")
          colorClass = "bg-green-500/20 text-green-500";
        if (value === "Rejected") colorClass = "bg-red-500/20 text-red-500";
        return (
          <span
            onClick={() => setSelectedJob(row)}
            className={`cursor-pointer px-2 py-1 rounded-full text-xs font-bold ${colorClass}`}
          >
            {value}
          </span>
        );
      },
    },
    {
      key: "id",
      label: "Action",
      render: (_value: string, row: any) => (
        <button
          onClick={() => setSelectedJob(row)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
        >
          <Eye size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">
            Lead Management
          </h1>
          <p className="text-gray-400">Track and manage all form submissions</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ManagementStatsCard
          title="Total Leads"
          value={totalLeads}
          icon={Users}
          color="from-blue-500 to-cyan-500"
        />

        <ManagementStatsCard
          title="In-Progress"
          value={inProgressLeads}
          icon={Clock}
          color="from-indigo-500 to-purple-500"
        />

        <ManagementStatsCard
          title="Working"
          value={workingLeads}
          icon={TrendingUp}
          color="from-orange-500 to-amber-500"
        />

        <ManagementStatsCard
          title="Completed"
          value={completedLeads}
          icon={CheckCircle}
          color="from-green-500 to-emerald-500"
        />
      </div>

      <div className="border-b border-white/10 flex gap-6 overflow-x-auto no-scrollbar">
        {[
          {
            id: "leads",
            label: "Project Requests",
            icon: Users,
          },
          {
            id: "messages",
            label: "Contact Messages",
            icon: MessageSquare,
          },
          {
            id: "newsletter",
            label: "Newsletter",
            icon: Mail,
          },
          {
            id: "jobs",
            label: "Job Applications",
            icon: Briefcase,
          },
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

      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden min-h-[400px]">
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              size={16}
            />

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
                <option value="All" className="bg-[#0A0A0A]">
                  All Progress States
                </option>
                <option value="New" className="bg-[#0A0A0A]">
                  New
                </option>
                <option value="In-Progress" className="bg-[#0A0A0A]">
                  In-Progress
                </option>
                <option value="Working" className="bg-[#0A0A0A]">
                  Working
                </option>
                <option value="Completed" className="bg-[#0A0A0A]">
                  Completed
                </option>
                <option value="Cancelled" className="bg-[#0A0A0A]">
                  Cancelled
                </option>
              </select>
            )}
          </div>
        </div>

        {loading && (
          <div className="p-6 text-sm text-gray-400">Loading data...</div>
        )}

        {!loading && activeTab === "leads" && (
          <DataTable
            columns={leadColumns}
            data={filteredLeads}
            searchable={false}
            rowClassName={(row) => getProgressColor(row.projectProgress).row}
          />
        )}

        {!loading && activeTab === "messages" && (
          <DataTable
            columns={messageColumns}
            data={filteredMessages}
            searchable={false}
          />
        )}

        {!loading && activeTab === "newsletter" && (
          <DataTable
            columns={newsletterColumns}
            data={filteredNewsletter}
            searchable={false}
          />
        )}

        {!loading && activeTab === "jobs" && (
          <DataTable
            columns={jobColumns}
            data={filteredJobs}
            searchable={false}
          />
        )}
      </div>

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
