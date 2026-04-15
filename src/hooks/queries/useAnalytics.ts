import { useQuery } from '@tanstack/react-query';
import { analyticsApi, mailApi, careersApi } from '../../services/api';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const analyticsKeys = {
  all:              ['analytics'] as const,
  summary:          () => [...analyticsKeys.all, 'summary'] as const,
  realtime:         () => [...analyticsKeys.all, 'realtime'] as const,
  overview:         (range: string) => [...analyticsKeys.all, 'overview', range] as const,
  funnel:           (range: string, source?: string) => [...analyticsKeys.all, 'funnel', range, source] as const,
  traffic:          (range: string) => [...analyticsKeys.all, 'traffic', range] as const,
  topPages:         (range: string) => [...analyticsKeys.all, 'top-pages', range] as const,
  topCities:        (range: string) => [...analyticsKeys.all, 'top-cities', range] as const,
  topCountries:     (range: string) => [...analyticsKeys.all, 'top-countries', range] as const,
  devices:          (range: string) => [...analyticsKeys.all, 'devices', range] as const,
  trafficSources:   (range: string) => [...analyticsKeys.all, 'traffic-sources', range] as const,
  campaigns:        (range: string) => [...analyticsKeys.all, 'campaigns', range] as const,
  platforms:        (range: string) => [...analyticsKeys.all, 'platforms', range] as const,
};

// ─── Dashboard Summary (DashboardHome) ───────────────────────────────────────
export function useDashboardSummary() {
  return useQuery({
    queryKey: analyticsKeys.summary(),
    queryFn: async () => {
      const [analytics, mailLogs, careers] = await Promise.all([
        analyticsApi.getOverview('all'),
        mailApi.getLogs(),
        careersApi.getAll(),
      ]);
      return { analytics, mailLogs, careers };
    },
    staleTime: 1000 * 60 * 2,   // 2 minutes
    refetchInterval: 1000 * 30, // auto-refresh every 30s
  });
}

// ─── Realtime Analytics (RealtimeMonitor + AnalyticsDashboard) ───────────────
// This is realtime — short staleTime, frequent refetch, always cached
export function useRealtimeAnalytics() {
  return useQuery({
    queryKey: analyticsKeys.realtime(),
    queryFn:  () => analyticsApi.getRealtime(),
    staleTime:       0,            // always considered stale (always fresh from server)
    gcTime:          1000 * 60,    // keep in cache 1 minute
    refetchInterval: 1000 * 10,   // auto-refresh every 10 seconds
    refetchIntervalInBackground: false, // stop polling when tab is hidden
    retry: 1,
  });
}

// ─── Analytics Overview (AnalyticsDashboard) ─────────────────────────────────
export function useAnalyticsOverview(range: string = 'all') {
  return useQuery({
    queryKey: analyticsKeys.overview(range),
    queryFn:  () => analyticsApi.getOverview(range),
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 30,
  });
}

// ─── Funnel (ConversionFunnel) ────────────────────────────────────────────────
export function useAnalyticsFunnel(range: string = 'all', source?: string) {
  return useQuery({
    queryKey: analyticsKeys.funnel(range, source),
    queryFn:  () => analyticsApi.getFunnel(range, source),
    staleTime: 1000 * 60 * 5,
  });
}

// ─── Traffic Series (AnalyticsDashboard) ─────────────────────────────────────
export function useTrafficSeries(range: string = '7d') {
  return useQuery({
    queryKey: analyticsKeys.traffic(range),
    queryFn:  () => analyticsApi.getTrafficSeries(range),
    staleTime: 1000 * 60 * 5,
  });
}

// ─── Top Pages ────────────────────────────────────────────────────────────────
export function useTopPages(range: string = '7d') {
  return useQuery({
    queryKey: analyticsKeys.topPages(range),
    queryFn:  () => analyticsApi.getTopPages(range),
    staleTime: 1000 * 60 * 5,
  });
}

// ─── Geographic (GeographicAnalytics) ────────────────────────────────────────
export function useTopCities(range: string = '7d') {
  return useQuery({
    queryKey: analyticsKeys.topCities(range),
    queryFn:  () => analyticsApi.getTopCities(range),
    staleTime: 1000 * 60 * 5,
  });
}

export function useTopCountries(range: string = '7d') {
  return useQuery({
    queryKey: analyticsKeys.topCountries(range),
    queryFn:  () => analyticsApi.getTopCountries(range),
    staleTime: 1000 * 60 * 5,
  });
}

// ─── Devices ─────────────────────────────────────────────────────────────────
export function useDeviceData(range: string = '7d') {
  return useQuery({
    queryKey: analyticsKeys.devices(range),
    queryFn:  () => analyticsApi.getDevices(range),
    staleTime: 1000 * 60 * 5,
  });
}

// ─── Traffic Sources (TrafficSources page) ───────────────────────────────────
export function useTrafficSources(range: string = '7d') {
  return useQuery({
    queryKey: analyticsKeys.trafficSources(range),
    queryFn:  () => analyticsApi.getTrafficSources(range),
    staleTime: 1000 * 60 * 5,
  });
}

// ─── Campaigns (CampaignAnalytics) ───────────────────────────────────────────
export function useCampaignPerformance(range: string = '30d') {
  return useQuery({
    queryKey: analyticsKeys.campaigns(range),
    queryFn:  () => analyticsApi.getCampaignPerformance(range),
    staleTime: 1000 * 60 * 5,
  });
}

export function usePlatformPerformance(range: string = '30d') {
  return useQuery({
    queryKey: analyticsKeys.platforms(range),
    queryFn:  () => analyticsApi.getPlatformPerformance(range),
    staleTime: 1000 * 60 * 5,
  });
}

// ─── Full Analytics Dashboard (combined — AnalyticsDashboard page) ────────────
// Fetches all static analytics data at once with Promise.all
export function useAnalyticsDashboard(range: string = '7d') {
  return useQuery({
    queryKey: [...analyticsKeys.all, 'dashboard', range] as const,
    queryFn: async () => {
      const [
        overview,
        funnel,
        pages,
        devices,
        traffic,
        countries,
        cities,
      ] = await Promise.all([
        analyticsApi.getOverview(),
        analyticsApi.getFunnel(),
        analyticsApi.getTopPages(range),
        analyticsApi.getDevices(range),
        analyticsApi.getTrafficSeries(range),
        analyticsApi.getTopCountries(range),
        analyticsApi.getTopCities(range),
      ]);
      return { overview, funnel, pages, devices, traffic, countries, cities };
    },
    staleTime: 1000 * 60 * 5,   // 5 min cache
    refetchInterval: 1000 * 60, // background refresh every 60s
  });
}
