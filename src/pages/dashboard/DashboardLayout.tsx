import { useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/dashboard/Sidebar";
import { useAuth } from "../../context/AuthContext";
import {
  Users,
  Percent,
  ChevronDown,
  Calendar,
  ArrowUpRight,
  MessageSquare,
  Mail,
  Briefcase,
  CheckCircle,
  Clock,
  AlertCircle,
  Bell,
} from "lucide-react";
import { DropOffsModal } from "../../components/dashboard/DropOffsModal";
import { NotificationDropdown } from "../../components/dashboard/NotificationDropdown";
import { motion, AnimatePresence } from "framer-motion";

// Hooks
import { useDashboardSummary } from "../../hooks/queries/useAnalytics";

export function DashboardLayout() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDropoffModalOpen, setIsDropoffModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [timeRange, setTimeRange] = useState("7 Days");
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);

  // Use the new React Query hook
  const { data, isLoading } = useDashboardSummary();

  if (!isAuthenticated) {
    return <Navigate to="/dashboard/login" replace />;
  }

  const analyticsData = data?.analytics || null;
  const mailLogsCount = data?.mailLogs?.length || 0;
  const careersCount = data?.careers?.length || 0;

  const timeRanges = [
    "All", "1 Hour", "1 Day", "3 Days", "7 Days", "1 Month", "3 Months", "6 Months", "1 Year", "Custom",
  ];

  const analyticsPages = [
    "/dashboard", "/dashboard/funnel", "/dashboard/geographic", "/dashboard/traffic", "/dashboard/realtime", "/dashboard/leads",
  ];

  const showTimeDropdown = analyticsPages.includes(location.pathname);

  const metrics = {
    totalLeads: analyticsData?.totalLeads || 0,
    pendingMeetings: analyticsData?.pendingLeads || 0,
    confirmedMeetings: analyticsData?.bookedLeads || 0,
    conversionRate: analyticsData?.conversionRate || 0,
    contactMessages: mailLogsCount,
    newsletterSubs: analyticsData?.newsletterSubs || 0,
    jobApplications: careersCount,
  };

  const realTimeUsers = analyticsData?.realtimeUsers || 0;

  return (
    <div className="min-h-screen bg-[#050505] flex">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div className={`flex-1 transition-all duration-300 ease-in-out flex flex-col ${isSidebarCollapsed ? "ml-20" : "ml-64"}`}>
        <header className="h-16 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-40 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-6 text-sm xl:flex">
              {/* Real-Time Users Badge */}
              <motion.button
                onClick={() => navigate("/dashboard/realtime")}
                className="relative group cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="View real-time user activity"
              >
                <div className="relative w-11 h-11 rounded-full flex items-center justify-center">
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ background: "conic-gradient(from 0deg, #ED1F24, #FFFF00, #00CD49, #ED1F24)" }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  />
                  <div className="absolute inset-[2px] rounded-full bg-[#0A0A0A] flex items-center justify-center">
                    <span className="text-xs font-bold text-white font-mono">{realTimeUsers}</span>
                  </div>
                  <div className="absolute -top-0.5 -right-0.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[color:var(--vibrant-green)] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[color:var(--vibrant-green)]"></span>
                    </span>
                  </div>
                </div>
              </motion.button>

              {/* Metrics Grid (Condensed logic) */}
              {[
                { title: "Total Leads", value: metrics.totalLeads, icon: Users, color: "blue", label: "Total Leads", trend: "+12" },
                { title: "Step 1 Only", value: metrics.pendingMeetings, icon: Clock, color: "yellow", label: "Pending" },
                { title: "Booked", value: metrics.confirmedMeetings, icon: CheckCircle, color: "[color:var(--vibrant-green)]", label: "Booked", trend: "+8" },
                { title: "Conversion", value: `${metrics.conversionRate}%`, icon: Percent, color: "purple", label: "Conversion", trend: "+2.4%" },
              ].map((m, idx) => (
                <div key={idx} className="flex items-center gap-3 group cursor-default" title={m.title}>
                  <div className={`p-1.5 rounded-lg bg-${m.color}-500/10 text-${m.color}-500`}>
                    <m.icon size={14} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{m.value}</span>
                      {m.trend && (
                        <span className={`text-[10px] font-bold text-${m.color}-500 bg-${m.color}-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5`}>
                          {m.trend} <ArrowUpRight size={8} />
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">{m.label}</div>
                  </div>
                </div>
              ))}

              <div className="h-8 w-px bg-white/10 mx-2" />
              <div className="flex items-center gap-4">
                {[
                  { icon: MessageSquare, value: metrics.contactMessages, title: "Contact Messages" },
                  { icon: Mail, value: metrics.newsletterSubs, title: "Newsletter Subscribers" },
                  { icon: Briefcase, value: metrics.jobApplications, title: "Job Applications" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-gray-400" title={item.title}>
                    <item.icon size={14} />
                    <span className="text-white font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all relative"
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-2 w-2 h-2 bg-[color:var(--bright-red)] rounded-full border border-[#0A0A0A]"></span>
              </button>
              <NotificationDropdown
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
                notifications={analyticsData?.notifications}
              />
            </div>

            {showTimeDropdown && (
              <div className="relative">
                <button
                  onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Calendar size={12} />
                  {timeRange}
                  <ChevronDown size={12} />
                </button>

                <AnimatePresence>
                  {isTimeDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsTimeDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-40 bg-[#0A0A0A] border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden py-1"
                      >
                        {timeRanges.map((range) => (
                          <button
                            key={range}
                            onClick={() => { setTimeRange(range); setIsTimeDropdownOpen(false); }}
                            className={`w-full text-left px-4 py-2 text-xs hover:bg-white/5 transition-colors ${timeRange === range ? "text-[color:var(--bright-red)] font-bold" : "text-gray-400"}`}
                          >
                            {range}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}

            <motion.button
              onClick={() => setIsDropoffModalOpen(true)}
              className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[color:var(--bright-red)]/10 to-[color:var(--bright-red)]/5 text-[color:var(--bright-red)] hover:from-[color:var(--bright-red)] hover:to-[color:var(--deep-red)] hover:text-white transition-all duration-300 group overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative flex items-center gap-2">
                <AlertCircle size={16} className="group-hover:animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider">Critical Insights</span>
              </div>
            </motion.button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      <DropOffsModal
        isOpen={isDropoffModalOpen}
        onClose={() => setIsDropoffModalOpen(false)}
        insights={analyticsData?.criticalInsights}
        totalLeads={analyticsData?.totalLeads || 0}
        pendingLeads={analyticsData?.pendingLeads || 0}
        bookedLeads={analyticsData?.bookedLeads || 0}
      />
    </div>
  );
}
