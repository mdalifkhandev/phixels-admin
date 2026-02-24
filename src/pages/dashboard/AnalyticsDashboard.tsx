import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Monitor,
  Smartphone,
  Tablet,
  Users,
  MousePointer,
  Clock,
  Activity,
  Linkedin,
  MessageCircle,
  Mail,
  ExternalLink,
  Facebook,
  BarChart2
} from 'lucide-react';
import { BrandedTrafficChart } from '../../components/dashboard/BrandedTrafficChart';
import { CountryTable } from '../../components/dashboard/CountryTable';
import { CityTable } from '../../components/dashboard/CityTable';
import { CompactMetricCard } from '../../components/dashboard/CompactMetricCard';
import { InteractiveMap } from '../../components/dashboard/InteractiveMap';
import { DataDetailModal } from '../../components/dashboard/DataDetailModal';
import { analyticsApi } from '../../services/api';
import {
  AnalyticsOverview, RealtimeAnalytics, FunnelStage, TopPageData, DeviceData,
  TrafficDataPoint, CountryDataPoint, CityDataPoint
} from '../../types/types';

// --- Mock Data ---
// Keep mock data for charts that are not yet integrated or for fallback


export function AnalyticsDashboard() {
  const [showMap, setShowMap] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsOverview | null>(null);
  const [realtimeData, setRealtimeData] = useState<RealtimeAnalytics | null>(null);
  const [funnelData, setFunnelData] = useState<FunnelStage[]>([]);
  const [topPagesData, setTopPagesData] = useState<TopPageData[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceData | null>(null);
  const [trafficData, setTrafficData] = useState<TrafficDataPoint[]>([]);
  const [countryData, setCountryData] = useState<CountryDataPoint[]>([]);
  const [cityData, setCityData] = useState<CityDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const deviceList = [
    { name: 'Desktop', icon: Monitor, count: deviceData?.desktop || 0, color: 'text-blue-400', bg: 'bg-blue-400' },
    { name: 'Mobile', icon: Smartphone, count: deviceData?.mobile || 0, color: 'text-[color:var(--vibrant-green)]', bg: 'bg-[color:var(--vibrant-green)]' },
    { name: 'Tablet', icon: Tablet, count: deviceData?.tablet || 0, color: 'text-purple-400', bg: 'bg-purple-400' }
  ];

  const totalDeviceCount = deviceList.reduce((acc, d) => acc + (d.count || 0), 0);
  const devices = deviceList.map(d => ({
    ...d,
    percent: totalDeviceCount > 0 ? Math.round(((d.count || 0) / totalDeviceCount) * 100) : 0
  }));

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const [overview, realtime, funnel, pages, devices, traffic, countries, cities] = await Promise.all([
          analyticsApi.getOverview(),
          analyticsApi.getRealtime(),
          analyticsApi.getFunnel(),
          analyticsApi.getTopPages(),
          analyticsApi.getDevices(),
          analyticsApi.getTrafficSeries(),
          analyticsApi.getTopCountries(),
          analyticsApi.getTopCities()
        ]);

        setAnalyticsData(overview);
        setRealtimeData(realtime);
        setFunnelData(funnel);
        setTopPagesData(pages);
        setDeviceData(devices);
        setTrafficData(traffic);
        setCountryData(countries);
        setCityData(cities);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();

    // Refresh realtime data every 30 seconds
    const interval = setInterval(async () => {
      try {
        const realtime = await analyticsApi.getRealtime();
        setRealtimeData(realtime);
      } catch (e) {
        console.error('Failed to refresh realtime data', e);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRowClick = (data: any, title: string) => {
    setModalData(data);
    setModalTitle(title);
    setModalOpen(true);
  };

  const engagementMetrics = [
    {
      name: 'LinkedIn Clicks',
      value: analyticsData?.clickCounts.linkedin || 0,
      icon: Linkedin,
      color: 'text-blue-400'
    },
    {
      name: 'WhatsApp Clicks',
      value: analyticsData?.clickCounts.whatsapp || 0,
      icon: MessageCircle,
      color: 'text-[color:var(--vibrant-green)]'
    },
    {
      name: 'Email Opens',
      value: analyticsData?.clickCounts.emailOpens || 0,
      icon: Mail,
      color: 'text-purple-400'
    },
    {
      name: 'Fiverr Clicks',
      value: analyticsData?.clickCounts.fiverr || 0,
      icon: ExternalLink,
      color: 'text-[color:var(--vibrant-green)]'
    },
    {
      name: 'Facebook Visits',
      value: analyticsData?.clickCounts.facebook || 0,
      icon: Facebook,
      color: 'text-blue-500'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[color:var(--bright-red)] animate-pulse font-bold tracking-widest uppercase text-sm">
          Loading Analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {modalOpen && (
          <DataDetailModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            data={modalData}
            title={modalTitle} />
        )}
      </AnimatePresence>


      {/* Top Metrics Row - Compact & Dense */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <CompactMetricCard
          title="Total Visits"
          value={analyticsData?.totalVisits.toLocaleString() || "0"}
          change="+12%"
          trend="up"
          icon={Users}
          color="text-blue-400"
          delay={0} />

        <CompactMetricCard
          title="Conversions"
          value={analyticsData?.conversions.toLocaleString() || "0"}
          change="+8.5%"
          trend="up"
          icon={MousePointer}
          color="text-[color:var(--bright-red)]"
          delay={0.1} />

        <CompactMetricCard
          title="Bounce Rate"
          value={`${analyticsData?.bounceRate || 0}%`}
          change="-2.1%"
          trend="up"
          icon={Activity}
          color="text-[color:var(--neon-yellow)]"
          delay={0.2} />

        <CompactMetricCard
          title="Avg. Duration"
          value={`${Math.floor((analyticsData?.avgDuration || 0) / 60)}m ${(analyticsData?.avgDuration || 0) % 60}s`}
          change="+15s"
          trend="up"
          icon={Clock}
          color="text-[color:var(--vibrant-green)]"
          delay={0.3} />

      </div>

      {/* Engagement Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {engagementMetrics.map((metric, i) =>
          <div
            key={i}
            className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">

            <div
              className={`p-2 rounded-lg bg-white/5 ${metric.color} bg-opacity-10`}>

              <metric.icon size={16} className={metric.color} />
            </div>
            <div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">
                {metric.name}
              </div>
              <div className="text-lg font-bold text-white">{metric.value}</div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Traffic Chart & Map */}
        <div className="lg:col-span-2 space-y-4">
          {/* Traffic Chart */}
          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <BarChart2
                  size={14}
                  className="text-[color:var(--bright-red)]" />

                Traffic Overview
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowMap(!showMap)}
                  className={`text-xs font-bold px-3 py-1 rounded border transition-all ${showMap ? 'bg-[color:var(--bright-red)] border-[color:var(--bright-red)] text-white' : 'border-white/10 text-gray-400 hover:text-white'}`}>

                  {showMap ? 'Hide Map' : 'View Map'}
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {showMap ?
                <motion.div
                  initial={{
                    opacity: 0,
                    height: 0
                  }}
                  animate={{
                    opacity: 1,
                    height: 'auto'
                  }}
                  exit={{
                    opacity: 0,
                    height: 0
                  }}
                  className="mb-4">

                  <InteractiveMap />
                </motion.div> :

                <motion.div
                  initial={{
                    opacity: 0
                  }}
                  animate={{
                    opacity: 1
                  }}
                  exit={{
                    opacity: 0
                  }}>

                  <BrandedTrafficChart data={trafficData} />
                </motion.div>
              }
            </AnimatePresence>
          </div>

          {/* Top Pages Table */}
          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/10">
            <h2 className="text-xs font-bold text-white mb-3 uppercase tracking-wider">
              Top Performing Pages
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] text-gray-500 uppercase tracking-wider">
                    <th className="py-2 font-medium">Page Path</th>
                    <th className="py-2 text-right">Visits</th>
                    <th className="py-2 text-right">Avg. Time</th>
                    <th className="py-2 text-right">Bounce</th>
                    <th className="py-2 text-right">Conv.</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {topPagesData.map((page, i) =>
                    <tr
                      key={i}
                      onClick={() => handleRowClick(page, 'Page Performance')}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">

                      <td className="py-2 font-medium text-gray-300">
                        {page.path}
                      </td>
                      <td className="py-2 text-right text-gray-400">
                        {page.visits.toLocaleString()}
                      </td>
                      <td className="py-2 text-right text-gray-400">
                        {page.avgTime || "-"}
                      </td>
                      <td className="py-2 text-right text-gray-400">
                        {page.bounce ? `${page.bounce}%` : "-"}
                      </td>
                      <td className="py-2 text-right text-[color:var(--bright-red)] font-bold">
                        {page.conversions.toLocaleString()}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Critical Drop-offs (Master Popup) */}
          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/10">
            <h2 className="text-xs font-bold text-white mb-4 uppercase tracking-wider">
              Master Popup Funnel (Critical Drop-offs)
            </h2>
            <div className="space-y-4">
              {funnelData.map((stage) =>
                <div key={stage.stage} className="relative">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-gray-300 font-medium capitalize">
                      {stage.stage.replace(/_/g, ' ')}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-bold">
                        {stage.users.toLocaleString()}
                      </span>
                      {stage.dropoff && stage.dropoff > 0 &&
                        <span className="text-[color:var(--bright-red)] text-[10px]">
                          -{stage.dropoff}%
                        </span>
                      }
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[color:var(--deep-navy)] to-[color:var(--bright-red)]"
                      style={{
                        width: `${stage.rate}%`
                      }} />

                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Real Time & Geo */}
        <div className="space-y-4">
          {/* Real Time Feed */}
          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/10 flex flex-col h-[300px]">
            <h2 className="text-xs font-bold text-white mb-3 flex items-center justify-between uppercase tracking-wider">
              <span>Real-Time Users</span>
              <span className="text-[10px] font-mono text-[color:var(--bright-red)] animate-pulse">
                {analyticsData?.realtimeUsers || 0} active
              </span>
            </h2>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {(realtimeData?.liveEvents || []).map((user, idx) =>
                <div
                  key={idx}
                  onClick={() =>
                    handleRowClick(user, 'Real-time User Activity')
                  }
                  className="p-2 rounded bg-white/5 border border-white/5 hover:border-[color:var(--bright-red)]/30 transition-colors cursor-pointer group">

                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-white truncate max-w-[120px] group-hover:text-[color:var(--bright-red)] transition-colors">
                      {user.event}
                    </span>
                    <span className="text-[9px] text-gray-500">
                      {user.time}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-gray-400">
                    <span>{user.location}</span>
                    <span>{user.device}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Geo Data */}
          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/10">
            <h2 className="text-xs font-bold text-white mb-3 uppercase tracking-wider">
              Top Cities
            </h2>
            <CityTable
              onRowClick={(data) => handleRowClick(data, 'City Performance')}
              data={cityData} />
            <CountryTable onRowClick={(data) => handleRowClick(data, 'Country Breakdown')} data={countryData} />

          </div>

          {/* Device Breakdown */}
          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/10">
            <h2 className="text-xs font-bold text-white mb-3 uppercase tracking-wider">
              Devices
            </h2>
            <div className="space-y-2">
              {devices.map((device, i) =>
                <div key={i} className="flex items-center gap-2">
                  <device.icon size={12} className="text-gray-400" />
                  <div className="flex-1">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-gray-300">{device.name}</span>
                      <span className="text-white font-bold">
                        {device.percent}%
                      </span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${device.bg}`}
                        style={{
                          width: `${device.percent}%`
                        }} />

                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>);

}