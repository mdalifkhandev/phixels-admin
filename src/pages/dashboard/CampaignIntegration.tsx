import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Facebook,
  Linkedin,
  Plus,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  DollarSign,
  Target,
  MousePointer
} from 'lucide-react';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { analyticsApi } from '../../services/api';
import type { PlatformPerformanceData } from '../../types/types';

export function CampaignIntegration() {
  const [integrations, setIntegrations] = useState<(PlatformPerformanceData & { icon: React.ElementType; lastSyncText: string; metrics: { spend: string; impressions: string; clicks: string; conversions: string } })[]>([]);
  const [totals, setTotals] = useState({
    spend: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0
  });
  const [utmBuilder, setUtmBuilder] = useState({
    url: '',
    source: '',
    medium: '',
    campaign: '',
    term: '',
    content: ''
  });
  const generatedUrl = utmBuilder.url ?
    `${utmBuilder.url}?utm_source=${utmBuilder.source}&utm_medium=${utmBuilder.medium}&utm_campaign=${utmBuilder.campaign}${utmBuilder.term ? `&utm_term=${utmBuilder.term}` : ''}${utmBuilder.content ? `&utm_content=${utmBuilder.content}` : ''}` :
    '';

  useEffect(() => {
    const fetchPlatformData = async () => {
      try {
        const data = await analyticsApi.getPlatformPerformance('30d');
        const iconMap: Record<string, React.ElementType> = {
          google: Globe,
          facebook: Facebook,
          linkedin: Linkedin
        };

        const mapped = data.map((platform) => {
          const lastSyncText = platform.lastSync
            ? `${Math.max(1, Math.floor((Date.now() - new Date(platform.lastSync).getTime()) / 60000))} mins ago`
            : 'Never';
          return {
            ...platform,
            icon: iconMap[platform.id] || Globe,
            lastSyncText,
            metrics: {
              spend: `$${platform.spend.toLocaleString()}`,
              impressions: platform.impressions.toLocaleString(),
              clicks: platform.clicks.toLocaleString(),
              conversions: platform.conversions.toLocaleString()
            }
          };
        });
        setIntegrations(mapped);
        setTotals({
          spend: data.reduce((sum, item) => sum + item.spend, 0),
          impressions: data.reduce((sum, item) => sum + item.impressions, 0),
          clicks: data.reduce((sum, item) => sum + item.clicks, 0),
          conversions: data.reduce((sum, item) => sum + item.conversions, 0)
        });
      } catch (error) {
        console.error('Failed to fetch platform data', error);
      }
    };
    fetchPlatformData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Campaign Integrations
          </h1>
          <p className="text-gray-400">
            Connect and monitor your external advertising platforms
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all">
          <RefreshCw size={20} />
          Sync All Data
        </button>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Ad Spend"
          value={`$${totals.spend.toLocaleString()}`}
          icon={DollarSign}
          color="from-red-500 to-orange-500" />

        <StatsCard
          title="Total Impressions"
          value={totals.impressions.toLocaleString()}
          icon={Target}
          color="from-blue-500 to-cyan-500" />

        <StatsCard
          title="Total Clicks"
          value={totals.clicks.toLocaleString()}
          icon={MousePointer}
          color="from-purple-500 to-pink-500" />

        <StatsCard
          title="Total Conversions"
          value={totals.conversions.toLocaleString()}
          icon={CheckCircle}
          color="from-green-500 to-emerald-500" />

      </div>

      {/* Integrations Grid */}
      <h2 className="text-2xl font-bold text-white mt-8 mb-4">
        Connected Platforms
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {integrations.map((platform) =>
          <motion.div
            key={platform.id}
            whileHover={{
              y: -5
            }}
            className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 relative overflow-hidden group">

            <div className="absolute top-0 right-0 p-4">
              <div
                className={`flex items-center gap-2 text-xs font-bold px-2 py-1 rounded-full ${platform.status === 'connected' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>

                <div
                  className={`w-2 h-2 rounded-full ${platform.status === 'connected' ? 'bg-green-500' : 'bg-gray-400'}`} />

                {platform.status === 'connected' ? 'Active' : 'Inactive'}
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white">
                <platform.icon size={24} />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">
                  {platform.name}
                </h3>
                <p className="text-xs text-gray-400">
                  Last synced: {platform.lastSyncText}
                </p>
              </div>
            </div>

            {platform.status === 'connected' ?
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">Spend</div>
                  <div className="font-bold text-white">
                    {platform.metrics.spend}
                  </div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">Conversions</div>
                  <div className="font-bold text-[color:var(--vibrant-green)]">
                    {platform.metrics.conversions}
                  </div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">Clicks</div>
                  <div className="font-bold text-white">
                    {platform.metrics.clicks}
                  </div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">CTR</div>
                  <div className="font-bold text-blue-400">
                    {(
                      parseInt(platform.metrics.clicks.replace(',', '')) /
                      parseInt(
                        platform.metrics.impressions.replace('K', '000')
                      ) *
                      100).
                      toFixed(2)}
                    %
                  </div>
                </div>
              </div> :

              <div className="h-[152px] flex items-center justify-center mb-6 bg-white/5 rounded-lg border border-dashed border-white/10">
                <p className="text-gray-500 text-sm">
                  Connect account to see metrics
                </p>
              </div>
            }

            <button
              className={`w-full py-3 rounded-xl font-bold transition-colors ${platform.status === 'connected' ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-[color:var(--bright-red)] text-white hover:bg-red-700'}`}>

              {platform.status === 'connected' ?
                'Manage Connection' :
                'Connect Account'}
            </button>
          </motion.div>
        )}

        {/* Add New Integration Card */}
        <motion.button
          whileHover={{
            scale: 1.02
          }}
          className="bg-white/5 border border-dashed border-white/20 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-gray-400 hover:text-white hover:border-white/40 transition-all min-h-[300px]">

          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
            <Plus size={32} />
          </div>
          <span className="font-bold">Add New Integration</span>
        </motion.button>
      </div>

      {/* UTM Builder */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 mt-8">
        <h2 className="text-2xl font-bold text-white mb-6">
          UTM Parameter Builder
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">
                Website URL *
              </label>
              <input
                type="text"
                value={utmBuilder.url}
                onChange={(e) =>
                  setUtmBuilder({
                    ...utmBuilder,
                    url: e.target.value
                  })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                placeholder="https://pixcel.com/landing-page" />

            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400 font-medium">
                  Campaign Source *
                </label>
                <input
                  type="text"
                  value={utmBuilder.source}
                  onChange={(e) =>
                    setUtmBuilder({
                      ...utmBuilder,
                      source: e.target.value
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                  placeholder="google, newsletter" />

              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400 font-medium">
                  Campaign Medium *
                </label>
                <input
                  type="text"
                  value={utmBuilder.medium}
                  onChange={(e) =>
                    setUtmBuilder({
                      ...utmBuilder,
                      medium: e.target.value
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                  placeholder="cpc, email" />

              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">
                Campaign Name *
              </label>
              <input
                type="text"
                value={utmBuilder.campaign}
                onChange={(e) =>
                  setUtmBuilder({
                    ...utmBuilder,
                    campaign: e.target.value
                  })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                placeholder="spring_sale" />

            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-6 flex flex-col justify-center">
            <label className="text-sm text-gray-400 font-medium mb-2">
              Generated URL
            </label>
            <div className="bg-black/50 border border-white/10 rounded-lg p-4 break-all text-gray-300 font-mono text-sm min-h-[100px]">
              {generatedUrl ||
                'Fill in the required fields to generate your tracking URL...'}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(generatedUrl)}
              disabled={!generatedUrl}
              className="mt-4 w-full py-3 rounded-xl bg-[color:var(--bright-red)] text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition-colors flex items-center justify-center gap-2">

              <ExternalLink size={18} />
              Copy Tracking URL
            </button>
          </div>
        </div>
      </div>
    </div>);

}
