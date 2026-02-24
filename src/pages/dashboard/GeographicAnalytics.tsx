import { useState } from 'react';
import { Globe, MapPin } from 'lucide-react';
import { CountryTable } from '../../components/dashboard/CountryTable';
import { CityTable } from '../../components/dashboard/CityTable';
import { InteractiveMap } from '../../components/dashboard/InteractiveMap';
import { DataDetailModal } from '../../components/dashboard/DataDetailModal';
export function GeographicAnalytics() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [modalTitle, setModalTitle] = useState('');
  const handleRowClick = (data: any, title: string) => {
    setModalData(data);
    setModalTitle(title);
    setModalOpen(true);
  };
  return (
    <div className="space-y-4">
      <DataDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        data={modalData}
        title={modalTitle} />


      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Geographic Data</h1>
      </div>

      {/* Main Map Visualization */}
      <div className="w-full">
        <InteractiveMap />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Country Table */}
        <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
              <Globe size={14} className="text-[color:var(--deep-navy)]" />
              Country Performance
            </h2>
          </div>
          <CountryTable
            onRowClick={(data) => handleRowClick(data, 'Country Performance')} />

        </div>

        {/* City Table */}
        <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
              <MapPin size={14} className="text-[color:var(--bright-red)]" />
              Top Cities
            </h2>
          </div>
          <CityTable
            onRowClick={(data) => handleRowClick(data, 'City Performance')} />

        </div>
      </div>

      {/* Regional Distribution Bar */}
      <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/10">
        <h3 className="text-xs font-bold text-white mb-3 uppercase tracking-wider">
          Regional Distribution
        </h3>
        <div className="flex h-4 rounded-full overflow-hidden">
          <div
            className="h-full bg-[color:var(--deep-navy)]"
            style={{
              width: '45%'
            }}
            title="North America (45%)" />

          <div
            className="h-full bg-blue-800"
            style={{
              width: '32%'
            }}
            title="Europe (32%)" />

          <div
            className="h-full bg-[color:var(--bright-red)]"
            style={{
              width: '15%'
            }}
            title="Asia Pacific (15%)" />

          <div
            className="h-full bg-[color:var(--vibrant-green)]"
            style={{
              width: '5%'
            }}
            title="South America (5%)" />

          <div
            className="h-full bg-gray-600"
            style={{
              width: '3%'
            }}
            title="Others (3%)" />

        </div>
        <div className="flex justify-between mt-2 text-[10px] text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[color:var(--deep-navy)]" />{' '}
            N. America
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-800" /> Europe
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[color:var(--bright-red)]" />{' '}
            Asia Pac.
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[color:var(--vibrant-green)]" />{' '}
            S. America
          </div>
        </div>
      </div>
    </div>);

}