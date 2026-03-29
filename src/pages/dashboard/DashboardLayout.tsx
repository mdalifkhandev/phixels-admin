import { useEffect, useState } from "react";
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
import { analyticsApi, mailApi, careersApi } from "../../services/api";
import { AnalyticsOverview } from "../../types/types";

export function DashboardLayout() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDropoffModalOpen, setIsDropoffModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [timeRange, setTimeRange] = useState("7 Days");
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsOverview | null>(
    null,
  );
  const [mailLogsCount, setMailLogsCount] = useState(0);
  const [careersCount, setCareersCount] = useState(0);

  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      try {
        const [analytics, mailLogs, careers] = await Promise.all([
          analyticsApi.getOverview("all"),
          mailApi.getLogs(),
          careersApi.getAll(),
        ]);
        setAnalyticsData(analytics);
        setMailLogsCount(mailLogs.length);
        setCareersCount(careers.length);
      } catch (error) {
        console.error("Failed to fetch dashboard layout data:", error);
      }
    };

    fetchData();
    // Poll for updates every 30 seconds for real-time feel
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/dashboard/login" replace />;
  }
  const timeRanges = [
    "All",
    "1 Hour",
    "1 Day",
    "3 Days",
    "7 Days",
    "1 Month",
    "3 Months",
    "6 Months",
    "1 Year",
    "Custom",
  ];

  // Pages where time dropdown should be visible
  const analyticsPages = [
    "/dashboard",
    "/dashboard/funnel",
    "/dashboard/geographic",
    "/dashboard/traffic",
    "/dashboard/realtime",
    "/dashboard/leads",
  ];

  const showTimeDropdown = analyticsPages.includes(location.pathname);

  // Use data from API, fallback to 0
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

      <div
        className={`flex-1 transition-all duration-300 ease-in-out flex flex-col ${isSidebarCollapsed ? "ml-20" : "ml-64"}`}
      >
        {/* Compact Header */}
        <header className="h-16 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-40 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Form-Based Metrics Bar */}
            <div className="flex items-center gap-6 text-sm xl:flex">
              {/* Real-Time Users Badge - Circular with Gradient Border */}
              <motion.button
                onClick={() => navigate("/dashboard/realtime")}
                className="relative group cursor-pointer"
                whileHover={{
                  scale: 1.05,
                }}
                whileTap={{
                  scale: 0.95,
                }}
                title="View real-time user activity"
              >
                <div className="relative w-11 h-11 rounded-full flex items-center justify-center">
                  {/* Animated Gradient Border */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        "conic-gradient(from 0deg, #ED1F24, #FFFF00, #00CD49, #ED1F24)",
                    }}
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />

                  {/* Inner Circle */}
                  <div className="absolute inset-[2px] rounded-full bg-[#0A0A0A] flex items-center justify-center">
                    <span className="text-xs font-bold text-white font-mono">
                      {realTimeUsers}
                    </span>
                  </div>

                  {/* Pulsing Dot */}
                  <div className="absolute -top-0.5 -right-0.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[color:var(--vibrant-green)] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[color:var(--vibrant-green)]"></span>
                    </span>
                  </div>
                </div>

                {/* Tooltip */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  <div className="bg-black/90 text-white text-[9px] px-2 py-1 rounded font-medium">
                    Real-Time Users
                  </div>
                </div>
              </motion.button>

              {/* Total Leads */}
              <div
                className="flex items-center gap-3 group cursor-default"
                title="Total Projects Requests"
              >
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                  <Users size={14} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">
                      {metrics.totalLeads}
                    </span>
                    <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      +12 <ArrowUpRight size={8} />
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                    Total Leads
                  </div>
                </div>
              </div>

              {/* Pending Meetings (Step 1) */}
              <div
                className="flex items-center gap-3 group cursor-default"
                title="Leads stuck at Step 1"
              >
                <div className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-500">
                  <Clock size={14} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">
                      {metrics.pendingMeetings}
                    </span>
                    <span className="text-[10px] font-bold text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      Pending
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                    Step 1 Only
                  </div>
                </div>
              </div>

              {/* Confirmed Meetings (Step 2) */}
              <div
                className="flex items-center gap-3 group cursor-default"
                title="Confirmed Bookings"
              >
                <div className="p-1.5 rounded-lg bg-[color:var(--vibrant-green)]/10 text-[color:var(--vibrant-green)]">
                  <CheckCircle size={14} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">
                      {metrics.confirmedMeetings}
                    </span>
                    <span className="text-[10px] font-bold text-[color:var(--vibrant-green)] bg-[color:var(--vibrant-green)]/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      +8 <ArrowUpRight size={8} />
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                    Booked
                  </div>
                </div>
              </div>

              {/* Conversion Rate */}
              <div
                className="flex items-center gap-3 group cursor-default"
                title="Booking Conversion Rate"
              >
                <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
                  <Percent size={14} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">
                      {metrics.conversionRate}%
                    </span>
                    <span className="text-[10px] font-bold text-purple-500 bg-purple-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      +2.4% <ArrowUpRight size={8} />
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                    Conversion
                  </div>
                </div>
              </div>

              {/* Other Forms (Compact) */}
              <div className="h-8 w-px bg-white/10 mx-2" />

              <div className="flex items-center gap-4">
                <div
                  className="flex items-center gap-2 text-gray-400"
                  title="Contact Messages"
                >
                  <MessageSquare size={14} />
                  <span className="text-white font-bold">
                    {metrics.contactMessages}
                  </span>
                </div>
                <div
                  className="flex items-center gap-2 text-gray-400"
                  title="Newsletter Subscribers"
                >
                  <Mail size={14} />
                  <span className="text-white font-bold">
                    {metrics.newsletterSubs}
                  </span>
                </div>
                <div
                  className="flex items-center gap-2 text-gray-400"
                  title="Job Applications"
                >
                  <Briefcase size={14} />
                  <span className="text-white font-bold">
                    {metrics.jobApplications}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
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

            {/* Time Range Dropdown - Conditional */}
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
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsTimeDropdownOpen(false)}
                      />

                      <motion.div
                        initial={{
                          opacity: 0,
                          y: 10,
                          scale: 0.95,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          y: 10,
                          scale: 0.95,
                        }}
                        className="absolute right-0 top-full mt-2 w-40 bg-[#0A0A0A] border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden py-1"
                      >
                        {timeRanges.map((range) => (
                          <button
                            key={range}
                            onClick={() => {
                              setTimeRange(range);
                              setIsTimeDropdownOpen(false);
                            }}
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

            {/* Critical Insights Button - Improved */}
            <motion.button
              onClick={() => setIsDropoffModalOpen(true)}
              className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[color:var(--bright-red)]/10 to-[color:var(--bright-red)]/5 text-[color:var(--bright-red)] hover:from-[color:var(--bright-red)] hover:to-[color:var(--deep-red)] hover:text-white transition-all duration-300 group overflow-hidden"
              whileHover={{
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.98,
              }}
            >
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--bright-red)]/0 via-[color:var(--bright-red)]/20 to-[color:var(--bright-red)]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full blur-xl bg-[color:var(--bright-red)]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative flex items-center gap-2">
                <div className="relative">
                  <AlertCircle
                    size={16}
                    className="group-hover:animate-pulse"
                  />

                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-[color:var(--bright-red)] rounded-full animate-ping opacity-75 group-hover:opacity-0"></span>
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-[color:var(--bright-red)] rounded-full group-hover:bg-white"></span>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">
                  Critical Insights
                </span>
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
