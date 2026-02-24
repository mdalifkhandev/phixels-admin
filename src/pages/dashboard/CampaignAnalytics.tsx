import { useEffect, useState } from 'react';
import { DataDetailModal } from '../../components/dashboard/DataDetailModal';
import { analyticsApi } from '../../services/api';
export function CampaignAnalytics() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const handleRowClick = (data: any, title: string) => {
    setModalData(data);
    setModalTitle(title);
    setModalOpen(true);
  };

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      try {
        const data = await analyticsApi.getCampaignPerformance('30d');
        setCampaigns(
          data.map((item) => ({
            ...item,
            impressions: item.impressions.toLocaleString(),
            clicks: item.clicks.toLocaleString(),
            ctr: `${item.ctr}%`,
            cost: `$${item.cost}`,
            roi: `${item.roi}%`
          }))
        );
      } catch (error) {
        console.error('Failed to fetch campaigns', error);
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  return (
    <div className="space-y-6">
      <DataDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        data={modalData}
        title={modalTitle} />


      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Campaign Performance</h1>
      </div>

      {loading && <div className="text-gray-400 text-sm">Loading campaign data...</div>}

      {/* Campaign Table */}
      <div className="rounded-xl bg-[#0A0A0A] border border-white/10 overflow-hidden">
        <div className="p-5 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-sm font-bold text-white">All Campaigns</h2>
          <div className="flex gap-2">
            <button className="text-xs px-2 py-1 rounded bg-white/5 text-white hover:bg-white/10">
              Active
            </button>
            <button className="text-xs px-2 py-1 rounded bg-transparent text-gray-400 hover:text-white">
              Paused
            </button>
            <button className="text-xs px-2 py-1 rounded bg-transparent text-gray-400 hover:text-white">
              Ended
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[10px] text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-5 font-medium">Campaign Name</th>
                <th className="py-3 px-5 font-medium">Status</th>
                <th className="py-3 px-5 font-medium text-right">
                  Impressions
                </th>
                <th className="py-3 px-5 font-medium text-right">Clicks</th>
                <th className="py-3 px-5 font-medium text-right">CTR</th>
                <th className="py-3 px-5 font-medium text-right">
                  Conversions
                </th>
                <th className="py-3 px-5 font-medium text-right">Cost</th>
                <th className="py-3 px-5 font-medium text-right">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {campaigns.map((campaign, i) =>
                <tr
                  key={i}
                  onClick={() => handleRowClick(campaign, 'Campaign Details')}
                  className="hover:bg-white/5 transition-colors group cursor-pointer">

                  <td className="py-3 px-5">
                    <span className="text-white font-medium block group-hover:text-red-500 transition-colors">
                      {campaign.name}
                    </span>
                  </td>
                  <td className="py-3 px-5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${campaign.status === 'Active' ? 'bg-green-500/10 text-green-500' : campaign.status === 'Paused' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-gray-500/10 text-gray-500'}`}>

                      {campaign.status}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-right text-gray-300">
                    {campaign.impressions}
                  </td>
                  <td className="py-3 px-5 text-right text-gray-300">
                    {campaign.clicks}
                  </td>
                  <td className="py-3 px-5 text-right text-gray-300">
                    {campaign.ctr}
                  </td>
                  <td className="py-3 px-5 text-right text-white font-bold">
                    {campaign.conversions}
                  </td>
                  <td className="py-3 px-5 text-right text-gray-300">
                    {campaign.cost}
                  </td>
                  <td className="py-3 px-5 text-right font-bold text-green-500">
                    {campaign.roi}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>);

}
