import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Smartphone,
  Monitor,
  MapPin,
  Clock,
  Eye,
} from "lucide-react";
import { DataDetailModal } from "../../components/dashboard/DataDetailModal";
import { analyticsApi } from "../../services/api";
import type { RealtimeAnalytics } from "../../types/types";

export function RealtimeMonitor() {
  const [data, setData] = useState<RealtimeAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [modalTitle, setModalTitle] = useState("");

  const fetchRealtimeData = async () => {
    try {
      const result = await analyticsApi.getRealtime();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch realtime analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRealtimeData();
    const interval = setInterval(fetchRealtimeData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const handleRowClick = (data: any, title: string) => {
    setModalData(data);
    setModalTitle(title);
    setModalOpen(true);
  };

  const activeUsers = data?.activeUsers ?? 0;
  const liveEvents = data?.liveEvents ?? [];

  // Dynamic calculations for devices and pages
  const deviceCounts = data?.deviceCounts ?? { desktop: 0, mobile: 0, tablet: 0 };
  const totalDevices = Object.values(deviceCounts).reduce((a, b) => a + b, 0) || 1;
  const desktopPct = Math.round(((deviceCounts.desktop || 0) / totalDevices) * 100);
  const mobilePct = Math.round(((deviceCounts.mobile || 0) / totalDevices) * 100);
  const tabletPct = Math.round(((deviceCounts.tablet || 0) / totalDevices) * 100);

  const topPages = Object.entries(data?.pageCounts ?? {})
    .map(([path, users]) => ({ path, users }))
    .sort((a, b) => b.users - a.users)
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <DataDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        data={modalData}
        title={modalTitle}
      />

      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-white">Real-time Monitor</h1>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[color:var(--vibrant-green)] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[color:var(--vibrant-green)]"></span>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Active Users Card */}
        <motion.div
          layout
          className="p-6 rounded-xl bg-gradient-to-br from-[color:var(--deep-navy)] to-black border border-white/10 text-white flex flex-col items-center justify-center text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <div className="text-5xl font-bold mb-1 tabular-nums relative z-10">
            {activeUsers}
          </div>
          <div className="text-sm font-medium opacity-90 relative z-10 text-[color:var(--ice-grey)]">
            Active Users on Site
          </div>

          <div className="mt-4 w-full h-12 flex items-end justify-between px-2 gap-0.5">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-full bg-[color:var(--bright-red)] rounded-sm transition-all duration-500 opacity-60"
                style={{
                  height: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Device Breakdown */}
        <motion.div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/10">
          <h2 className="text-xs font-bold text-white mb-4 uppercase tracking-wider">
            Active Devices
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-xs">
                  <Monitor size={12} className="text-blue-400" />
                  <span className="text-gray-300">Desktop</span>
                </div>
                <span className="text-white font-bold text-xs">{desktopPct}%</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-400 h-full"
                  style={{
                    width: `${desktopPct}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-xs">
                  <Smartphone
                    size={12}
                    className="text-[color:var(--vibrant-green)]"
                  />

                  <span className="text-gray-300">Mobile</span>
                </div>
                <span className="text-white font-bold text-xs">{mobilePct}%</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[color:var(--vibrant-green)] h-full"
                  style={{
                    width: `${mobilePct}%`,
                  }}
                />
              </div>
            </div>

            {tabletPct > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-xs">
                    <Smartphone
                      size={12}
                      className="text-purple-400"
                    />

                    <span className="text-gray-300">Tablet</span>
                  </div>
                  <span className="text-white font-bold text-xs">{tabletPct}%</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-400 h-full"
                    style={{
                      width: `${tabletPct}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Active Pages */}
        <motion.div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/10">
          <h2 className="text-xs font-bold text-white mb-4 uppercase tracking-wider">
            Top Active Pages
          </h2>
          <div className="space-y-2">
            {topPages.length > 0 ? (
              topPages.map((page, i) => (
                <div
                  key={i}
                  onClick={() => handleRowClick(page, "Page Activity")}
                  className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0 cursor-pointer hover:bg-white/5 px-2 rounded transition-colors"
                >
                  <span className="text-xs text-gray-300 font-mono truncate max-w-[150px]">
                    {page.path}
                  </span>
                  <span className="text-[10px] font-bold bg-[color:var(--bright-red)]/10 text-[color:var(--bright-red)] px-1.5 py-0.5 rounded">
                    {page.users}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-500 italic py-2">No active pages</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Live Feed */}
      <motion.div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/10">
        <h2 className="text-xs font-bold text-white mb-4 uppercase tracking-wider">
          Live Activity Feed
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[10px] text-gray-500 uppercase tracking-wider">
                <th className="py-2 px-3 font-medium">Event</th>
                <th className="py-2 px-3 font-medium">Location</th>
                <th className="py-2 px-3 font-medium">Device</th>
                <th className="py-2 px-3 font-medium">Duration</th>
                <th className="py-2 px-3 font-medium">Activity</th>
                <th className="py-2 px-3 font-medium text-right">Time</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {liveEvents.map((event, i) => (
                  <motion.tr
                    key={i}
                    onClick={() => handleRowClick(event, "Live User Activity")}
                    initial={{
                      opacity: 0,
                      x: -10,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: i * 0.05,
                    }}
                    className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-full bg-white/5 text-[color:var(--vibrant-green)] group-hover:bg-[color:var(--vibrant-green)]/20 transition-colors">
                          <Activity size={10} />
                        </div>
                        <span className="text-white text-xs font-medium">
                          {event.event}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 text-gray-400 text-xs">
                        <MapPin size={10} /> {event.location}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 text-gray-400 text-xs">
                        {event.device === "Mobile" ? (
                          <Smartphone size={10} />
                        ) : (
                          <Monitor size={10} />
                        )}
                        {event.device}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 text-blue-400 text-xs font-mono">
                        <Clock size={10} />
                        {event.duration}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 text-gray-300 text-xs">
                        <Eye size={10} />
                        <span className="truncate max-w-[180px]">
                          {event.activity}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="text-xs text-gray-500 font-mono">
                        {event.time}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
