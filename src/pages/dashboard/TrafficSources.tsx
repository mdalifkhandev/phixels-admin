import { useState, useEffect } from 'react';
import {
  Share2,
  Search,
  Globe,
  Mail,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from
  'lucide-react';
import { DataDetailModal } from '../../components/dashboard/DataDetailModal';
import { analyticsApi } from '../../services/api';
import { TrafficSourceData } from '../../types/types';

const SOURCE_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  'Direct': { icon: Globe, color: 'text-blue-400', bg: 'bg-blue-400' },
  'Organic Search': { icon: Search, color: 'text-[color:var(--vibrant-green)]', bg: 'bg-[color:var(--vibrant-green)]' },
  'Social Media': { icon: Share2, color: 'text-purple-400', bg: 'bg-purple-400' },
  'Email': { icon: Mail, color: 'text-[color:var(--neon-yellow)]', bg: 'bg-[color:var(--neon-yellow)]' },
  'Paid Ads': { icon: DollarSign, color: 'text-[color:var(--bright-red)]', bg: 'bg-[color:var(--bright-red)]' },
  'Referral': { icon: Share2, color: 'text-indigo-400', bg: 'bg-indigo-400' },
  'Other': { icon: Globe, color: 'text-gray-400', bg: 'bg-gray-400' }
};

export function TrafficSources() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [sources, setSources] = useState<TrafficSourceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      setLoading(true);
      const data = await analyticsApi.getTrafficSources('30d');
      setSources(data);
    } catch (error) {
      console.error('Failed to fetch traffic sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (data: any, title: string) => {
    setModalData(data);
    setModalTitle(title);
    setModalOpen(true);
  };

  const getSourceDisplay = (name: string) => {
    return SOURCE_CONFIG[name] || SOURCE_CONFIG['Other'];
  };

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="animate-spin text-[color:var(--bright-red)]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DataDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        data={modalData}
        title={modalTitle} />


      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Traffic Sources</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Source Breakdown Table */}
        <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/10">
          <h2 className="text-xs font-bold text-white mb-3 uppercase tracking-wider">
            Source Performance
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[10px] text-gray-500 uppercase tracking-wider">
                  <th className="py-2 font-medium">Source</th>
                  <th className="py-2 text-right">Visitors</th>
                  <th className="py-2 text-right">Share</th>
                  <th className="py-2 text-right">Trend</th>
                  <th className="py-2 text-right">Conv. Rate</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {sources.map((source, i) => {
                  const display = getSourceDisplay(source.name);
                  return (
                    <tr
                      key={i}
                      onClick={() => handleRowClick(source, 'Source Performance')}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">

                      <td className="py-2 font-medium text-white flex items-center gap-2">
                        <display.icon size={12} className={display.color} />
                        {source.name}
                      </td>
                      <td className="py-2 text-right text-gray-300">
                        {source.visitors.toLocaleString()}
                      </td>
                      <td className="py-2 text-right text-gray-300">
                        {source.share}%
                      </td>
                      <td className="py-2 text-right">
                        <span
                          className={`flex items-center justify-end gap-0.5 ${source.trend >= 0 ? 'text-[color:var(--vibrant-green)]' : 'text-[color:var(--bright-red)]'}`}>

                          {source.trend >= 0 ? '+' : ''}{source.trend}%
                          {source.trend >= 0 ?
                            <ArrowUpRight size={10} /> :

                            <ArrowDownRight size={10} />
                          }
                        </span>
                      </td>
                      <td className="py-2 text-right font-bold text-white">
                        {source.conversionRate}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Visual Breakdown */}
        <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/10">
          <h2 className="text-xs font-bold text-white mb-4 uppercase tracking-wider">
            Traffic Distribution
          </h2>
          <div className="space-y-4">
            {sources.map((source, i) => {
              const display = getSourceDisplay(source.name);
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <span className="text-gray-300 flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${display.bg}`} />
                      {source.name}
                    </span>
                    <span className="text-white font-bold">{source.share}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${display.bg}`}
                      style={{
                        width: `${source.share}%`
                      }} />

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>);

}