import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Smartphone, Monitor, MapPin, Clock, Eye } from 'lucide-react';
import { DataDetailModal } from '../../components/dashboard/DataDetailModal';
export function RealtimeMonitor() {
  const [activeUsers, setActiveUsers] = useState(42);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [modalTitle, setModalTitle] = useState('');
  const handleRowClick = (data: any, title: string) => {
    setModalData(data);
    setModalTitle(title);
    setModalOpen(true);
  };
  // Simulate live data changes
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers((prev) =>
        Math.max(20, Math.min(80, prev + Math.floor(Math.random() * 5) - 2))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  const liveEvents = [
    {
      event: 'Page View: /pricing',
      location: 'London, UK',
      device: 'Desktop',
      time: 'Just now',
      duration: '2m 34s',
      activity: 'Scrolling through pricing tiers',
      status: 'Active'
    },
    {
      event: 'Click: WhatsApp',
      location: 'Mumbai, IN',
      device: 'Mobile',
      time: '2s ago',
      duration: '5m 12s',
      activity: 'Clicked WhatsApp contact button',
      status: 'Active'
    },
    {
      event: 'Page View: /blog/react',
      location: 'New York, US',
      device: 'Desktop',
      time: '5s ago',
      duration: '8m 45s',
      activity: 'Reading blog article',
      status: 'Active'
    },
    {
      event: 'Form Start',
      location: 'Berlin, DE',
      device: 'Desktop',
      time: '12s ago',
      duration: '3m 20s',
      activity: 'Filling contact form',
      status: 'Active'
    },
    {
      event: 'Page View: /home',
      location: 'Toronto, CA',
      device: 'Mobile',
      time: '15s ago',
      duration: '1m 05s',
      activity: 'Browsing homepage',
      status: 'Active'
    },
    {
      event: 'Page View: /services',
      location: 'Sydney, AU',
      device: 'Tablet',
      time: '18s ago',
      duration: '4m 30s',
      activity: 'Viewing service details',
      status: 'Active'
    },
    {
      event: 'Click: Portfolio',
      location: 'Paris, FR',
      device: 'Desktop',
      time: '22s ago',
      duration: '6m 15s',
      activity: 'Exploring portfolio items',
      status: 'Active'
    },
    {
      event: 'Page View: /contact',
      location: 'Tokyo, JP',
      device: 'Mobile',
      time: '28s ago',
      duration: '2m 50s',
      activity: 'Viewing contact information',
      status: 'Active'
    }];

  return (
    <div className="space-y-4">
      <DataDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        data={modalData}
        title={modalTitle} />


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
          className="p-6 rounded-xl bg-gradient-to-br from-[color:var(--deep-navy)] to-black border border-white/10 text-white flex flex-col items-center justify-center text-center relative overflow-hidden">

          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <div className="text-5xl font-bold mb-1 tabular-nums relative z-10">
            {activeUsers}
          </div>
          <div className="text-sm font-medium opacity-90 relative z-10 text-[color:var(--ice-grey)]">
            Active Users on Site
          </div>

          <div className="mt-4 w-full h-12 flex items-end justify-between px-2 gap-0.5">
            {[...Array(20)].map((_, i) =>
              <div
                key={i}
                className="w-full bg-[color:var(--bright-red)] rounded-sm transition-all duration-500 opacity-60"
                style={{
                  height: `${Math.random() * 100}%`
                }} />

            )}
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
                <span className="text-white font-bold text-xs">58%</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-400 h-full"
                  style={{
                    width: '58%'
                  }} />

              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-xs">
                  <Smartphone
                    size={12}
                    className="text-[color:var(--vibrant-green)]" />

                  <span className="text-gray-300">Mobile</span>
                </div>
                <span className="text-white font-bold text-xs">42%</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[color:var(--vibrant-green)] h-full"
                  style={{
                    width: '42%'
                  }} />

              </div>
            </div>
          </div>
        </motion.div>

        {/* Top Active Pages */}
        <motion.div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/10">
          <h2 className="text-xs font-bold text-white mb-4 uppercase tracking-wider">
            Top Active Pages
          </h2>
          <div className="space-y-2">
            {[
              {
                path: '/',
                users: 18
              },
              {
                path: '/pricing',
                users: 8
              },
              {
                path: '/blog/react-hooks',
                users: 5
              },
              {
                path: '/contact',
                users: 4
              }].
              map((page, i) =>
                <div
                  key={i}
                  onClick={() => handleRowClick(page, 'Page Activity')}
                  className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0 cursor-pointer hover:bg-white/5 px-2 rounded transition-colors">

                  <span className="text-xs text-gray-300 font-mono truncate max-w-[150px]">
                    {page.path}
                  </span>
                  <span className="text-[10px] font-bold bg-[color:var(--bright-red)]/10 text-[color:var(--bright-red)] px-1.5 py-0.5 rounded">
                    {page.users}
                  </span>
                </div>
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
                {liveEvents.map((event, i) =>
                  <motion.tr
                    key={i}
                    onClick={() => handleRowClick(event, 'Live User Activity')}
                    initial={{
                      opacity: 0,
                      x: -10
                    }}
                    animate={{
                      opacity: 1,
                      x: 0
                    }}
                    transition={{
                      delay: i * 0.05
                    }}
                    className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer group">

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
                        {event.device === 'Mobile' ?
                          <Smartphone size={10} /> :

                          <Monitor size={10} />
                        }
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
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>);

}