import { useState } from 'react';
import {
  Share2,
  Search,
  Globe,
  Mail,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from
  'lucide-react';
import { DataDetailModal } from '../../components/dashboard/DataDetailModal';
export function TrafficSources() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [modalTitle, setModalTitle] = useState('');
  const handleRowClick = (data: any, title: string) => {
    setModalData(data);
    setModalTitle(title);
    setModalOpen(true);
  };
  const sources = [
    {
      name: 'Direct',
      visitors: '4,200',
      percent: '35%',
      conversion: '4.2%',
      icon: Globe,
      color: 'text-blue-400',
      bg: 'bg-blue-400',
      trend: '+12%'
    },
    {
      name: 'Organic Search',
      visitors: '3,800',
      percent: '30%',
      conversion: '6.8%',
      icon: Search,
      color: 'text-[color:var(--vibrant-green)]',
      bg: 'bg-[color:var(--vibrant-green)]',
      trend: '+5%'
    },
    {
      name: 'Social Media',
      visitors: '2,400',
      percent: '20%',
      conversion: '3.5%',
      icon: Share2,
      color: 'text-purple-400',
      bg: 'bg-purple-400',
      trend: '-2%'
    },
    {
      name: 'Email',
      visitors: '1,200',
      percent: '10%',
      conversion: '12.4%',
      icon: Mail,
      color: 'text-[color:var(--neon-yellow)]',
      bg: 'bg-[color:var(--neon-yellow)]',
      trend: '+8%'
    },
    {
      name: 'Paid Ads',
      visitors: '600',
      percent: '5%',
      conversion: '8.1%',
      icon: DollarSign,
      color: 'text-[color:var(--bright-red)]',
      bg: 'bg-[color:var(--bright-red)]',
      trend: '-5%'
    }];

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
                {sources.map((source, i) =>
                  <tr
                    key={i}
                    onClick={() => handleRowClick(source, 'Source Performance')}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">

                    <td className="py-2 font-medium text-white flex items-center gap-2">
                      <source.icon size={12} className={source.color} />
                      {source.name}
                    </td>
                    <td className="py-2 text-right text-gray-300">
                      {source.visitors}
                    </td>
                    <td className="py-2 text-right text-gray-300">
                      {source.percent}
                    </td>
                    <td className="py-2 text-right">
                      <span
                        className={`flex items-center justify-end gap-0.5 ${source.trend.startsWith('+') ? 'text-[color:var(--vibrant-green)]' : 'text-[color:var(--bright-red)]'}`}>

                        {source.trend}
                        {source.trend.startsWith('+') ?
                          <ArrowUpRight size={10} /> :

                          <ArrowDownRight size={10} />
                        }
                      </span>
                    </td>
                    <td className="py-2 text-right font-bold text-white">
                      {source.conversion}
                    </td>
                  </tr>
                )}
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
            {sources.map((source, i) =>
              <div key={i}>
                <div className="flex items-center justify-between mb-1 text-xs">
                  <span className="text-gray-300 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${source.bg}`} />
                    {source.name}
                  </span>
                  <span className="text-white font-bold">{source.percent}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${source.bg}`}
                    style={{
                      width: source.percent
                    }} />

                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>);

}