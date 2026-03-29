import { useEffect, useState } from "react";
import { Filter, Target, Users, CheckCircle, Clock } from "lucide-react";
import { analyticsApi } from "../../services/api";
export function ConversionFunnel() {
  const [selectedFilter, setSelectedFilter] = useState("All Traffic");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    views: 0,
    step1: 0,
    step2: 0,
  });
  const filters = [
    "All Traffic",
    "Organic Search",
    "Social Media",
    "Paid Ads",
    "Direct",
    "Email",
  ];

  useEffect(() => {
    const fetchFunnel = async () => {
      setLoading(true);
      try {
        const funnel = await analyticsApi.getFunnel(
          "all",
          selectedFilter === "All Traffic" ? undefined : selectedFilter,
        );
        const popup =
          funnel.find((step) => step.stage === "popup_open")?.users || 0;
        const step1 =
          funnel.find((step) => step.stage === "lead_submitted")?.users || 0;
        const step2 =
          funnel.find((step) => step.stage === "meeting_booked")?.users || 0;
        setData({
          views: popup,
          step1,
          step2,
        });
      } catch (error) {
        console.error("Failed to fetch funnel data", error);
        setData({ views: 0, step1: 0, step2: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchFunnel();
  }, [selectedFilter]);

  const step1Conversion =
    data.views > 0 ? ((data.step1 / data.views) * 100).toFixed(1) : "0.0";
  const step2Conversion =
    data.step1 > 0 ? ((data.step2 / data.step1) * 100).toFixed(1) : "0.0";
  const totalConversion =
    data.views > 0 ? ((data.step2 / data.views) * 100).toFixed(1) : "0.0";
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Conversion Funnel
          </h1>
          <p className="text-gray-400 text-sm">
            Analyze your Master Popup user journey
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Funnel Visualization - Custom Step Design */}
        <div className="lg:col-span-3 p-8 rounded-2xl bg-[#0A0A0A] border border-white/10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[color:var(--bright-red)] via-[color:var(--neon-yellow)] to-[color:var(--vibrant-green)] opacity-50" />

          <div className="flex items-center justify-between mb-12">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-wider">
              <Target size={20} className="text-[color:var(--vibrant-green)]" />
              Funnel Flow: {selectedFilter}
            </h2>
            {loading && (
              <span className="text-xs text-gray-400">Loading...</span>
            )}
          </div>

          <div className="relative space-y-4">
            {/* Step 1: Impressions */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2 px-4">
                <span className="text-sm font-bold text-gray-400 uppercase">
                  1. Popup Impressions
                </span>
                <span className="text-sm font-bold text-white">
                  {data.views.toLocaleString()} Users
                </span>
              </div>
              <div className="h-16 bg-white/5 border border-white/10 rounded-xl flex items-center px-6 relative overflow-hidden group hover:border-white/20 transition-all">
                <div
                  className="absolute left-0 top-0 bottom-0 bg-blue-500/20 w-full transition-all duration-1000"
                  style={{
                    width: "100%",
                  }}
                />

                <Users className="text-blue-500 mr-4 relative z-10" size={24} />
                <div className="relative z-10">
                  <div className="text-lg font-bold text-white">
                    Total Views
                  </div>
                  <div className="text-xs text-gray-400">
                    Unique visitors seeing popup
                  </div>
                </div>
              </div>

              {/* Connector */}
              <div className="h-12 flex justify-center items-center relative">
                <div className="w-0.5 h-full bg-white/10 absolute" />
                <div className="bg-[#0A0A0A] border border-white/10 px-3 py-1 rounded-full text-xs text-gray-400 z-10 flex items-center gap-1">
                  <span className="text-[color:var(--bright-red)] font-bold">
                    {100 - parseFloat(step1Conversion)}% Drop-off
                  </span>
                </div>
              </div>
            </div>

            {/* Step 2: Step 1 Completion */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2 px-4">
                <span className="text-sm font-bold text-gray-400 uppercase">
                  2. Details Submitted (Step 1)
                </span>
                <span className="text-sm font-bold text-white">
                  {data.step1.toLocaleString()} Leads
                </span>
              </div>
              <div className="h-16 bg-white/5 border border-white/10 rounded-xl flex items-center px-6 relative overflow-hidden group hover:border-white/20 transition-all">
                <div
                  className="absolute left-0 top-0 bottom-0 bg-yellow-500/20 transition-all duration-1000"
                  style={{
                    width: `${step1Conversion}%`,
                  }}
                />

                <Clock
                  className="text-yellow-500 mr-4 relative z-10"
                  size={24}
                />

                <div className="relative z-10">
                  <div className="text-lg font-bold text-white">
                    Leads Captured
                  </div>
                  <div className="text-xs text-gray-400">
                    Name, Email, Budget collected
                  </div>
                </div>
                <div className="ml-auto relative z-10 text-right">
                  <div className="text-lg font-bold text-white">
                    {step1Conversion}%
                  </div>
                  <div className="text-xs text-gray-400">Conversion</div>
                </div>
              </div>

              {/* Connector */}
              <div className="h-12 flex justify-center items-center relative">
                <div className="w-0.5 h-full bg-white/10 absolute" />
                <div className="bg-[#0A0A0A] border border-white/10 px-3 py-1 rounded-full text-xs text-gray-400 z-10 flex items-center gap-1">
                  <span className="text-yellow-500 font-bold">
                    {100 - parseFloat(step2Conversion)}% Pending
                  </span>
                </div>
              </div>
            </div>

            {/* Step 3: Meeting Booked */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2 px-4">
                <span className="text-sm font-bold text-gray-400 uppercase">
                  3. Meeting Booked (Step 2)
                </span>
                <span className="text-sm font-bold text-white">
                  {data.step2.toLocaleString()} Bookings
                </span>
              </div>
              <div className="h-16 bg-white/5 border border-white/10 rounded-xl flex items-center px-6 relative overflow-hidden group hover:border-white/20 transition-all">
                <div
                  className="absolute left-0 top-0 bottom-0 bg-[color:var(--vibrant-green)]/20 transition-all duration-1000"
                  style={{
                    width: `${totalConversion}%`,
                  }}
                />

                <CheckCircle
                  className="text-[color:var(--vibrant-green)] mr-4 relative z-10"
                  size={24}
                />

                <div className="relative z-10">
                  <div className="text-lg font-bold text-white">
                    Confirmed Meetings
                  </div>
                  <div className="text-xs text-gray-400">
                    Date & Time scheduled
                  </div>
                </div>
                <div className="ml-auto relative z-10 text-right">
                  <div className="text-lg font-bold text-white">
                    {step2Conversion}%
                  </div>
                  <div className="text-xs text-gray-400">Completion</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
            <div className="text-sm text-gray-400">Overall Conversion Rate</div>
            <div className="text-2xl font-bold text-[color:var(--vibrant-green)]">
              {totalConversion}%
            </div>
          </div>
        </div>

        {/* Filters Panel - Fixed */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-white/10 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <Filter size={14} className="text-gray-400" />
                Traffic Segment
              </h3>
            </div>
            <div className="space-y-2">
              {filters.map((filter, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedFilter(filter)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${selectedFilter === filter ? "bg-white/5 border-[color:var(--bright-red)]/50" : "hover:bg-white/5 border-transparent hover:border-white/10"}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${selectedFilter === filter ? "border-[color:var(--bright-red)]" : "border-gray-600"}`}
                  >
                    {selectedFilter === filter && (
                      <div className="w-2 h-2 rounded-full bg-[color:var(--bright-red)]" />
                    )}
                  </div>
                  <span
                    className={`text-sm ${selectedFilter === filter ? "text-white font-bold" : "text-gray-400"}`}
                  >
                    {filter}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
