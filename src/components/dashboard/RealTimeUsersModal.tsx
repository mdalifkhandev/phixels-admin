import { useEffect, useState, createElement } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Clock,
  Eye,
  Activity
} from
  'lucide-react';
interface RealTimeUser {
  id: number;
  page: string;
  location: string;
  city: string;
  country: string;
  device: 'Desktop' | 'Mobile' | 'Tablet';
  duration: string;
  activity: string;
  timestamp: string;
}
interface RealTimeUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
}
// Mock real-time user data
const generateMockUsers = (): RealTimeUser[] => [
  {
    id: 1,
    page: '/services/web-design',
    location: 'Dhaka, Bangladesh',
    city: 'Dhaka',
    country: 'Bangladesh',
    device: 'Mobile',
    duration: '2m 34s',
    activity: 'Scrolling',
    timestamp: 'Just now'
  },
  {
    id: 2,
    page: '/blog/ui-trends-2024',
    location: 'London, United Kingdom',
    city: 'London',
    country: 'United Kingdom',
    device: 'Desktop',
    duration: '5m 12s',
    activity: 'Reading',
    timestamp: '3s ago'
  },
  {
    id: 3,
    page: '/contact',
    location: 'New York, USA',
    city: 'New York',
    country: 'USA',
    device: 'Desktop',
    duration: '1m 45s',
    activity: 'Filling form',
    timestamp: '8s ago'
  },
  {
    id: 4,
    page: '/',
    location: 'Toronto, Canada',
    city: 'Toronto',
    country: 'Canada',
    device: 'Mobile',
    duration: '45s',
    activity: 'Browsing',
    timestamp: '15s ago'
  },
  {
    id: 5,
    page: '/portfolio',
    location: 'Berlin, Germany',
    city: 'Berlin',
    country: 'Germany',
    device: 'Tablet',
    duration: '3m 20s',
    activity: 'Viewing images',
    timestamp: '22s ago'
  },
  {
    id: 6,
    page: '/services/mobile-dev',
    location: 'Mumbai, India',
    city: 'Mumbai',
    country: 'India',
    device: 'Mobile',
    duration: '1m 10s',
    activity: 'Scrolling',
    timestamp: '28s ago'
  },
  {
    id: 7,
    page: '/case-studies',
    location: 'Sydney, Australia',
    city: 'Sydney',
    country: 'Australia',
    device: 'Desktop',
    duration: '4m 55s',
    activity: 'Reading',
    timestamp: '35s ago'
  },
  {
    id: 8,
    page: '/blog',
    location: 'Paris, France',
    city: 'Paris',
    country: 'France',
    device: 'Desktop',
    duration: '2m 18s',
    activity: 'Browsing',
    timestamp: '42s ago'
  }];

export function RealTimeUsersModal({
  isOpen,
  onClose
}: RealTimeUsersModalProps) {
  const [users, setUsers] = useState<RealTimeUser[]>(generateMockUsers());
  const [activeCount, setActiveCount] = useState(42);
  // Simulate real-time updates
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setUsers(generateMockUsers());
      setActiveCount((prev) => prev + Math.floor(Math.random() * 3) - 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [isOpen]);
  if (!isOpen) return null;
  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'Desktop':
        return Monitor;
      case 'Mobile':
        return Smartphone;
      case 'Tablet':
        return Tablet;
      default:
        return Monitor;
    }
  };
  const getDeviceColor = (device: string) => {
    switch (device) {
      case 'Desktop':
        return 'text-blue-400';
      case 'Mobile':
        return 'text-[color:var(--vibrant-green)]';
      case 'Tablet':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };
  // Group users by page
  const usersByPage = users.reduce(
    (acc, user) => {
      if (!acc[user.page]) acc[user.page] = [];
      acc[user.page].push(user);
      return acc;
    },
    {} as Record<string, RealTimeUser[]>
  );
  // Group users by country
  const usersByCountry = users.reduce(
    (acc, user) => {
      if (!acc[user.country]) acc[user.country] = 0;
      acc[user.country]++;
      return acc;
    },
    {} as Record<string, number>
  );
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
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
          className="relative w-full max-w-6xl bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-[color:var(--vibrant-green)]/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="p-2 rounded-lg bg-[color:var(--vibrant-green)]/20 text-[color:var(--vibrant-green)]">
                  <Activity size={24} />
                </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[color:var(--vibrant-green)] rounded-full animate-ping"></span>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[color:var(--vibrant-green)] rounded-full"></span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Real-Time Users
                  <span className="text-sm font-mono text-[color:var(--vibrant-green)] bg-[color:var(--vibrant-green)]/10 px-2 py-1 rounded">
                    {activeCount} active
                  </span>
                </h2>
                <p className="text-sm text-gray-400">
                  Live user activity across your website
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">

              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Live User Feed */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                  Live Activity Feed
                </h3>
                <div className="space-y-3">
                  {users.map((user, index) =>
                    <motion.div
                      key={user.id}
                      initial={{
                        opacity: 0,
                        x: -20
                      }}
                      animate={{
                        opacity: 1,
                        x: 0
                      }}
                      transition={{
                        delay: index * 0.05
                      }}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[color:var(--vibrant-green)]/30 transition-all group">

                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg bg-white/5 ${getDeviceColor(user.device)}`}>

                            {createElement(getDeviceIcon(user.device), {
                              size: 16
                            })}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white group-hover:text-[color:var(--vibrant-green)] transition-colors">
                              {user.page}
                            </div>
                            <div className="text-xs text-gray-400 flex items-center gap-1">
                              <MapPin size={10} />
                              {user.location}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-500">
                          {user.timestamp}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="flex items-center gap-2 text-xs">
                          <Clock size={12} className="text-gray-400" />
                          <span className="text-gray-300">{user.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Eye size={12} className="text-gray-400" />
                          <span className="text-gray-300">{user.activity}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          {createElement(getDeviceIcon(user.device), {
                            size: 12,
                            className: 'text-gray-400'
                          })}
                          <span className="text-gray-300">{user.device}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Right Column: Stats & Breakdown */}
              <div className="space-y-6">
                {/* Pages Breakdown */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
                    Active Pages
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(usersByPage).
                      sort(([, a], [, b]) => b.length - a.length).
                      slice(0, 5).
                      map(([page, pageUsers]) =>
                        <div key={page} className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-300 truncate max-w-[150px]">
                              {page}
                            </span>
                            <span className="text-white font-bold">
                              {pageUsers.length}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[color:var(--vibrant-green)] to-[color:var(--neon-yellow)]"
                              style={{
                                width: `${pageUsers.length / users.length * 100}%`
                              }} />

                          </div>
                        </div>
                      )}
                  </div>
                </div>

                {/* Country Breakdown */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
                    Top Countries
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(usersByCountry).
                      sort(([, a], [, b]) => b - a).
                      slice(0, 5).
                      map(([country, count]) =>
                        <div
                          key={country}
                          className="flex justify-between items-center text-xs">

                          <span className="text-gray-300">{country}</span>
                          <span className="text-white font-bold">{count}</span>
                        </div>
                      )}
                  </div>
                </div>

                {/* Device Breakdown */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
                    Devices
                  </h4>
                  <div className="space-y-3">
                    {['Desktop', 'Mobile', 'Tablet'].map((device) => {
                      const count = users.filter(
                        (u) => u.device === device
                      ).length;
                      const percentage = count / users.length * 100;
                      return (
                        <div key={device} className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2">
                              {createElement(getDeviceIcon(device), {
                                size: 12,
                                className: getDeviceColor(device)
                              })}
                              <span className="text-gray-300">{device}</span>
                            </div>
                            <span className="text-white font-bold">
                              {count}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${device === 'Desktop' ? 'bg-blue-400' : device === 'Mobile' ? 'bg-[color:var(--vibrant-green)]' : 'bg-purple-400'}`}
                              style={{
                                width: `${percentage}%`
                              }} />

                          </div>
                        </div>);

                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>);

}