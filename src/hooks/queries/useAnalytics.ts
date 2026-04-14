import { useQuery } from '@tanstack/react-query';
import { analyticsApi, mailApi, careersApi } from '../../services/api';

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const [analytics, mailLogs, careers] = await Promise.all([
        analyticsApi.getOverview("all"),
        mailApi.getLogs(),
        careersApi.getAll(),
      ]);
      return { analytics, mailLogs, careers };
    },
    refetchInterval: 30000, // Sync every 30 seconds
  });
}
