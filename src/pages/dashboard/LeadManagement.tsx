import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Clock,
  CheckCircle,
  Percent,
  Filter,
  Download,
  Search,
  Mail,
  Calendar,
  Folder,
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
import { analyticsApi, mailApi } from "../../services/api";
import type { MailLog } from "../../types/types";

type LeadRow = {
  id: string;
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

const normalizeText = (value: unknown) =>
  typeof value === "string" ? value : "";

export function LeadManagement() {
  const [activeTab, setActiveTab] = useState<
    "leads" | "messages" | "newsletter" | "jobs"
  >("leads");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [newsletter, setNewsletter] = useState<NewsletterRow[]>([]);
  const [jobs, setJobs] = useState<JobRow[]>([]);

  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [selectedSubscriber, setSelectedSubscriber] = useState<any>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [events, logs] = await Promise.all([
          analyticsApi.getEvents({
            range: "all",
            eventType:
              "lead_submitted,meeting_booked,contact_submitted,newsletter_subscribed,job_applied",
            limit: 500,
          }),
          mailApi.getLogs(),
        ]);

        const leadEvents = events.filter(
          (item) =>
            item.eventType === "lead_submitted" ||
            item.eventType === "meeting_booked",
        );
        const groupedLeads = new Map<string, LeadRow>();

        leadEvents.forEach((event) => {
          const metadata = event.metadata || {};
          const sessionId = event.sessionId || event._id;
          const existing = groupedLeads.get(sessionId);

          if (!existing) {
            groupedLeads.set(sessionId, {
              id: `REQ-${sessionId.slice(-6).toUpperCase()}`,
              timestamp: formatTimestamp(event.eventAt),
              name: normalizeText(metadata.name) || "Unknown",
              email: normalizeText(metadata.email) || "N/A",
              phone: normalizeText(metadata.phone) || "N/A",
              country:
                normalizeText(metadata.country) || event.country || "Unknown",
              budget: normalizeText(metadata.budget) || "N/A",
              status:
                event.eventType === "meeting_booked" ? "Confirmed" : "Pending",
              meetingDate: normalizeText(metadata.meetingDate) || "",
              meetingTime: normalizeText(metadata.meetingTime) || "",
              folderUrl: normalizeText(metadata.folderUrl) || "#",
              description:
                normalizeText(metadata.description) ||
                normalizeText(metadata.message) ||
                "No description provided.",
              files: Array.isArray(metadata.files) ? metadata.files : [],
              _rawDate: new Date(event.eventAt),
            } as any);
          } else {
            // Processing older events now (since list is descending)
            if (existing.name === "Unknown" && metadata.name) {
              existing.name = normalizeText(metadata.name);
            }
            if (existing.email === "N/A" && metadata.email) {
              existing.email = normalizeText(metadata.email);
            }
            if (existing.phone === "N/A" && metadata.phone) {
              existing.phone = normalizeText(metadata.phone);
            }
            if (existing.budget === "N/A" && metadata.budget) {
              existing.budget = normalizeText(metadata.budget);
            }
            if (existing.folderUrl === "#" && metadata.folderUrl) {
              existing.folderUrl = normalizeText(metadata.folderUrl);
            }
            if (
              existing.description === "No description provided." &&
              (metadata.description || metadata.message)
            ) {
              existing.description =
                normalizeText(metadata.description) ||
                normalizeText(metadata.message);
            }
            if (
              (!existing.files || existing.files.length === 0) &&
              Array.isArray(metadata.files) &&
              metadata.files.length > 0
            ) {
              existing.files = metadata.files;
            }

            if (
              event.eventType === "meeting_booked" &&
              existing.status === "Pending"
            ) {
              existing.status = "Confirmed";
              if (!existing.meetingDate)
                existing.meetingDate = normalizeText(metadata.meetingDate);
              if (!existing.meetingTime)
                existing.meetingTime = normalizeText(metadata.meetingTime);
            }
          }
        });

        setLeads(
          Array.from(groupedLeads.values()).sort(
            (a: any, b: any) => b._rawDate.getTime() - a._rawDate.getTime(),
          ),
        );

        const contactEvents = events.filter(
          (item) => item.eventType === "contact_submitted",
        );
        const messageRows = contactEvents.map((event, index) => {
          const metadata = event.metadata || {};
          return {
            id: event._id || `MSG-${index + 1}`,
            timestamp: formatTimestamp(event.eventAt),
            name: normalizeText(metadata.name) || "Unknown",
            email: normalizeText(metadata.email) || "N/A",
            phone: normalizeText(metadata.phone) || "N/A",
            country:
              normalizeText(metadata.country) || event.country || "Unknown",
            message: normalizeText(metadata.message) || "No message found.",
            status: "Unread" as const,
          };
        });

        const fallbackFromMailLogs: MessageRow[] = (logs as MailLog[])
          .filter((log) =>
            /contact|inquiry|message/i.test((log as any).subject || ""),
          )
          .map((log, idx) => ({
            id: (log as any)._id || `MAIL-${idx + 1}`,
            timestamp: formatTimestamp((log as any).createdAt),
            name: "Website Visitor",
            email: (log as any).email || (log as any).to || "N/A",
            phone: "N/A",
            country: "Unknown",
            message: (log as any).text || (log as any).message || "No message",
            status: "Read" as const,
          }));

        setMessages(
          messageRows.length > 0 ? messageRows : fallbackFromMailLogs,
        );

        const newsletterEvents = events.filter(
          (item) => item.eventType === "newsletter_subscribed",
        );
        const uniqueSubscribers = new Map<string, NewsletterRow>();
        newsletterEvents.forEach((event, index) => {
          const metadata = event.metadata || {};
          const email =
            normalizeText(metadata.email) ||
            `subscriber-${index + 1}@unknown.com`;
          if (!uniqueSubscribers.has(email)) {
            uniqueSubscribers.set(email, {
              id: event._id || `SUB-${index + 1}`,
              email,
              timestamp: formatTimestamp(event.eventAt),
              status: "Active",
            });
          }
        });
        setNewsletter(Array.from(uniqueSubscribers.values()));

        const jobEvents = events.filter(
          (item) => item.eventType === "job_applied",
        );
        const jobRows = jobEvents.map((event, index) => {
          const metadata = event.metadata || {};
          return {
            id: event._id || `JOB-${index + 1}`,
            timestamp: formatTimestamp(event.eventAt),
            name: normalizeText(metadata.name) || "Unknown Applicant",
            email: normalizeText(metadata.email) || "N/A",
            portfolio:
              normalizeText(metadata.portfolio) ||
              normalizeText(metadata.portfolioUrl) ||
              "#",
            jobTitle:
              normalizeText(metadata.jobTitle) || "Unspecified Position",
            resumeUrl: normalizeText(metadata.resumeUrl) || "#",
            status: "New" as const,
          };
        });
        setJobs(jobRows);
      } catch (error) {
        console.error("Failed to fetch lead management data", error);
        setLeads([]);
        setMessages([]);
        setNewsletter([]);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      key: "status",
      label: "Status",
      render: (value: string, row: any) => (
        <span
          onClick={() => setSelectedLead(row)}
          className={`cursor-pointer px-2 py-1 rounded-full text-xs font-bold ${value === "Confirmed" ? "bg-[color:var(--vibrant-green)]/20 text-[color:var(--vibrant-green)]" : "bg-yellow-500/20 text-yellow-500"}`}
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
      key: "folderUrl",
      label: "Actions",
      render: (value: string, row: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedLead(row)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <a
            href={value && value !== "#" ? value : undefined}
            target="_blank"
            rel="noreferrer"
            className={`hidden p-2 rounded-lg transition-colors ${
              value && value !== "#"
                ? "text-blue-400 hover:bg-white/10"
                : "text-gray-600 cursor-not-allowed"
            }`}
            onClick={(e) => {
              if (!value || value === "#") {
                e.preventDefault();
              }
            }}
            title={
              value && value !== "#"
                ? "Open Project Folder"
                : "No folder available"
            }
          >
            <Folder size={16} />
          </a>
        </div>
      ),
    },
  ];

  const messageColumns = [
    {
      key: "name",
      label: "Sender",
      render: (value: string, row: any) => (
        <div
          onClick={() => setSelectedMessage(row)}
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
          onClick={() => setSelectedMessage(row)}
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
          onClick={() => setSelectedMessage(row)}
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
          onClick={() => setSelectedMessage(row)}
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

  const totalLeads = leads.length;
  const pendingLeads = leads.filter((lead) => lead.status === "Pending").length;
  const confirmedLeads = leads.filter(
    (lead) => lead.status === "Confirmed",
  ).length;
  const conversionRate =
    totalLeads > 0 ? ((confirmedLeads / totalLeads) * 100).toFixed(1) : "0.0";

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
          title="Pending (Step 1)"
          value={pendingLeads}
          icon={Clock}
          color="from-yellow-500 to-orange-500"
        />

        <ManagementStatsCard
          title="Confirmed (Step 2)"
          value={confirmedLeads}
          icon={CheckCircle}
          color="from-green-500 to-emerald-500"
        />

        <ManagementStatsCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          icon={Percent}
          color="from-purple-500 to-pink-500"
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
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-gray-300 hover:text-white">
              <Filter size={14} />
              Filter
            </button>
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
