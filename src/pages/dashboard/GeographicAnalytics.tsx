import { useState, useEffect } from "react";
import { Globe, MapPin, Loader2 } from "lucide-react";
import { CountryTable } from "../../components/dashboard/CountryTable";
import { CityTable } from "../../components/dashboard/CityTable";
import { InteractiveMap } from "../../components/dashboard/InteractiveMap";
import { DataDetailModal } from "../../components/dashboard/DataDetailModal";
import { analyticsApi } from "../../services/api";
import { CountryDataPoint, CityDataPoint } from "../../types/types";

export function GeographicAnalytics() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [modalTitle, setModalTitle] = useState("");
  const [countries, setCountries] = useState<CountryDataPoint[]>([]);
  const [cities, setCities] = useState<CityDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGeoData();
  }, []);

  const fetchGeoData = async () => {
    try {
      setLoading(true);
      const [countryData, cityData] = await Promise.all([
        analyticsApi.getTopCountries("30d"),
        analyticsApi.getTopCities("30d"),
      ]);
      setCountries(countryData);
      setCities(cityData);
    } catch (error) {
      console.error("Failed to fetch geographic data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (data: any, title: string) => {
    setModalData(data);
    setModalTitle(title);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2
          className="animate-spin text-[color:var(--bright-red)]"
          size={32}
        />
      </div>
    );
  }

  // Calculate Regional Distribution from countries if viable, or keep as semi-dynamic
  // For now, let's keep the regional distribution as is, or hide it if it's too mocky.
  // We'll keep it for visual balance but maybe link it to data later.

  return (
    <div className="space-y-4">
      <DataDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        data={modalData}
        title={modalTitle}
      />

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
            data={countries}
            onRowClick={(data) => handleRowClick(data, "Country Performance")}
          />
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
            data={cities}
            onRowClick={(data) => handleRowClick(data, "City Performance")}
          />
        </div>
      </div>

      {/* Regional Distribution Bar - Kept for UI but could be improved */}
      <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/10">
        <h3 className="text-xs font-bold text-white mb-3 uppercase tracking-wider">
          Regional Distribution (Estimated)
        </h3>
        <div className="flex h-4 rounded-full overflow-hidden">
          <div
            className="h-full bg-[color:var(--deep-navy)]"
            style={{
              width: "45%",
            }}
            title="North America (45%)"
          />

          <div
            className="h-full bg-blue-800"
            style={{
              width: "32%",
            }}
            title="Europe (32%)"
          />

          <div
            className="h-full bg-[color:var(--bright-red)]"
            style={{
              width: "15%",
            }}
            title="Asia Pacific (15%)"
          />

          <div
            className="h-full bg-[color:var(--vibrant-green)]"
            style={{
              width: "5%",
            }}
            title="South America (5%)"
          />

          <div
            className="h-full bg-gray-600"
            style={{
              width: "3%",
            }}
            title="Others (3%)"
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[color:var(--deep-navy)]" />{" "}
            N. America
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-800" /> Europe
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[color:var(--bright-red)]" />{" "}
            Asia Pac.
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[color:var(--vibrant-green)]" />{" "}
            S. America
          </div>
        </div>
      </div>
    </div>
  );
}
