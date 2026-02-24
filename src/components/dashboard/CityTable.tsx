import { MapPin } from 'lucide-react';
import { CityDataPoint } from '../../types/types';

const defaultCityData: (CityDataPoint & { conversion?: string; trend?: string; funnel?: number[] })[] = [];

interface CityTableProps {
  onRowClick?: (data: any) => void;
  data?: CityDataPoint[];
}

export function CityTable({ onRowClick, data: propData }: CityTableProps) {
  const displayCities = propData && propData.length > 0 ? propData : defaultCityData;
  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-[10px] text-gray-500 uppercase tracking-wider">
              <th className="py-2 px-2 font-medium">City</th>
              <th className="py-2 px-2 font-medium text-right">Visitors</th>
              <th className="py-2 px-2 font-medium text-center">Funnel</th>
              <th className="py-2 px-2 font-medium text-right">Conv. Rate</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {displayCities.map((city: any) =>
              <tr
                key={city.name}
                onClick={() => onRowClick && onRowClick(city)}
                className="border-b border-white/5 hover:bg-white/5 transition-colors group cursor-pointer">

                <td className="py-2 px-2">
                  <div className="flex items-center gap-2">
                    <MapPin size={12} className="text-gray-500" />
                    <span className="text-gray-300 group-hover:text-white transition-colors">
                      {city.name}
                    </span>
                  </div>
                </td>
                <td className="py-2 px-2 text-right text-gray-400 font-mono">
                  {city.visitors?.toLocaleString()}
                </td>
                <td className="py-2 px-2">
                  <div className="flex justify-center items-center gap-1">
                    {(city.funnel || [100, 60, 12]).map((val: any, i: number) =>
                      <div
                        key={i}
                        className="w-8 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[color:var(--bright-red)]"
                          style={{
                            width: `${val}%`,
                            opacity: 1 - i * 0.3
                          }} />
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-2 px-2 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-gray-300">
                      {city.conversion || city.conversionRate || '0%'}
                    </span>
                    <span
                      className={`text-[9px] ${city.trend?.startsWith('+') ? 'text-[color:var(--vibrant-green)]' : 'text-[color:var(--bright-red)]'}`}>
                      {city.trend || '+0%'}
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>);
}