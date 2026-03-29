import { useEffect, useMemo, useState } from "react";
import { Home, Package, Save, Settings } from "lucide-react";
import { ManagementStatsCard } from "../../components/dashboard/ManagementStatsCard";
import { StatusModal } from "../../components/dashboard/StatusModal";
import { pageMetricsApi } from "../../services/api";
import type {
  PageMetric,
  PageMetricIconKey,
  PageMetricsContent,
} from "../../types/types";

type TabKey = "home" | "services" | "products";

const PRODUCT_ICON_OPTIONS: PageMetricIconKey[] = [
  "users",
  "download",
  "star",
  "trending-up",
];

const DEFAULT_PAGE_METRICS: PageMetricsContent = {
  homeHeroMetrics: [
    { label: "Revenue Growth", value: 420, suffix: "%" },
    { label: "Active Users", value: 1.2, suffix: "M+" },
  ],
  servicesPageMetrics: [
    { label: "Projects Delivered", value: 500, suffix: "+" },
    { label: "Happy Clients", value: 300, suffix: "+" },
    { label: "Expert Developers", value: 50, suffix: "+" },
    { label: "Countries Served", value: 25, suffix: "+" },
  ],
  productsPageMetrics: [
    { label: "Active Users", value: 1.2, suffix: "M+", iconKey: "users" },
    { label: "Total Downloads", value: 2.5, suffix: "M+", iconKey: "download" },
    { label: "Average Rating", value: 4.8, suffix: "", iconKey: "star" },
    { label: "Growth Rate", value: 150, suffix: "%", iconKey: "trending-up" },
  ],
};

const TAB_CONFIG: Array<{
  key: TabKey;
  label: string;
  description: string;
  field: "homeHeroMetrics" | "servicesPageMetrics" | "productsPageMetrics";
}> = [
  {
    key: "home",
    label: "Home Hero",
    description: "Manage the two floating hero metrics on the homepage.",
    field: "homeHeroMetrics",
  },
  {
    key: "services",
    label: "Services",
    description: "Manage the four stats shown on the services page.",
    field: "servicesPageMetrics",
  },
  {
    key: "products",
    label: "Products",
    description: "Manage the four stats and icons shown on the products page.",
    field: "productsPageMetrics",
  },
];

export function PageMetricsManagement() {
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [pageMetrics, setPageMetrics] =
    useState<PageMetricsContent>(DEFAULT_PAGE_METRICS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  useEffect(() => {
    void fetchPageMetrics();
  }, []);

  const fetchPageMetrics = async () => {
    try {
      setLoading(true);
      const result = await pageMetricsApi.get();
      setPageMetrics(result);
    } catch (err: any) {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Load Failed",
        message: err.message || "Failed to load page metrics",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMetric = (
    field: "homeHeroMetrics" | "servicesPageMetrics" | "productsPageMetrics",
    index: number,
    key: keyof PageMetric,
    value: string | number,
  ) => {
    setPageMetrics((prev) => {
      const metrics = [...prev[field]] as PageMetric[];
      metrics[index] = {
        ...metrics[index],
        [key]: key === "value" ? Number(value) || 0 : value,
      };
      return {
        ...prev,
        [field]: metrics,
      };
    });
  };

  const handleSave = async () => {
    const currentTab = TAB_CONFIG.find((tab) => tab.key === activeTab)!;

    try {
      setSaving(true);
      const updated = await pageMetricsApi.update(pageMetrics);
      setPageMetrics(updated);
      setStatusModal({
        isOpen: true,
        type: "success",
        title: "Metrics Updated",
        message: `${currentTab.label} metrics have been updated.`,
      });
    } catch (err: any) {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Save Failed",
        message: err.message || "Failed to update page metrics",
      });
    } finally {
      setSaving(false);
    }
  };

  const stats = useMemo(
    () => [
      {
        title: "Home Metrics",
        value: pageMetrics.homeHeroMetrics.length,
        icon: Home,
        color: "from-blue-500 to-cyan-500",
      },
      {
        title: "Services Metrics",
        value: pageMetrics.servicesPageMetrics.length,
        icon: Settings,
        color: "from-emerald-500 to-green-500",
      },
      {
        title: "Products Metrics",
        value: pageMetrics.productsPageMetrics.length,
        icon: Package,
        color: "from-amber-500 to-orange-500",
      },
    ],
    [pageMetrics],
  );

  if (loading) {
    return <div className="text-white p-4">Loading page metrics...</div>;
  }

  const currentTab = TAB_CONFIG.find((tab) => tab.key === activeTab)!;
  const metrics = pageMetrics[currentTab.field] as PageMetric[];

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Page Metrics Management
            </h1>
            <p className="text-gray-400">
              Manage homepage hero, services, and products page metrics from one
              place.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((item) => (
            <ManagementStatsCard
              key={item.title}
              title={item.title}
              value={item.value}
              icon={item.icon}
              color={item.color}
            />
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 rounded-xl border transition-colors ${
                activeTab === tab.key
                  ? "border-[color:var(--bright-red)] bg-[color:var(--bright-red)]/10 text-white"
                  : "border-white/10 bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {currentTab.label}
              </h2>
              <p className="text-sm text-gray-400">{currentTab.description}</p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[color:var(--bright-red)] to-[color:var(--deep-red)] text-white font-bold hover:shadow-[0_0_20px_rgba(237,31,36,0.6)] transition-all disabled:opacity-60"
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save Metrics"}
            </button>
          </div>

          <div className="space-y-4">
            {metrics.map((metric, index) => (
              <div
                key={`${currentTab.key}-${index}`}
                className={`grid gap-4 items-end rounded-xl border border-white/10 bg-black/20 p-4 ${
                  activeTab === "products"
                    ? "grid-cols-1 md:grid-cols-[1.5fr_1fr_0.8fr_1fr]"
                    : "grid-cols-1 md:grid-cols-[1.8fr_1fr_0.8fr]"
                }`}
              >
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 font-medium">
                    Label
                  </label>
                  <input
                    type="text"
                    value={metric.label}
                    onChange={(e) =>
                      updateMetric(
                        currentTab.field,
                        index,
                        "label",
                        e.target.value,
                      )
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400 font-medium">
                    Value
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={metric.value}
                    onChange={(e) =>
                      updateMetric(
                        currentTab.field,
                        index,
                        "value",
                        e.target.value,
                      )
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400 font-medium">
                    Suffix
                  </label>
                  <input
                    type="text"
                    value={metric.suffix}
                    onChange={(e) =>
                      updateMetric(
                        currentTab.field,
                        index,
                        "suffix",
                        e.target.value,
                      )
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                  />
                </div>

                {activeTab === "products" ? (
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 font-medium">
                      Icon
                    </label>
                    <select
                      value={metric.iconKey || "users"}
                      onChange={(e) =>
                        updateMetric(
                          currentTab.field,
                          index,
                          "iconKey",
                          e.target.value,
                        )
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[color:var(--bright-red)] focus:outline-none"
                    >
                      {PRODUCT_ICON_OPTIONS.map((iconKey) => (
                        <option
                          key={iconKey}
                          value={iconKey}
                          style={{
                            color: "#111111",
                            backgroundColor: "#FFFFFF",
                          }}
                        >
                          {iconKey}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      </div>

      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal((prev) => ({ ...prev, isOpen: false }))}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
      />
    </>
  );
}
