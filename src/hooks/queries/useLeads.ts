import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectRequestApi } from '../../services/api';

export function useLeads(progressFilter: string = 'All') {
  return useQuery({
    queryKey: ['leads', progressFilter],
    queryFn: async () => {
      const params = progressFilter !== 'All' ? { projectProgress: progressFilter } : undefined;
      const data = await projectRequestApi.getAll(params);
      
      // Process and sort leads
      return data.map((item: any) => ({
        ...item,
        id: `REQ-${(item.requestId || item._id || "000000").slice(-6).toUpperCase()}`,
        dbId: item._id,
        timestamp: new Date(item.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        _rawDate: new Date(item.createdAt),
      })).sort((a: any, b: any) => {
        if (a.projectProgress === 'Cancelled' && b.projectProgress !== 'Cancelled') return 1;
        if (a.projectProgress !== 'Cancelled' && b.projectProgress === 'Cancelled') return -1;
        return b._rawDate.getTime() - a._rawDate.getTime();
      });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      projectRequestApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-overview'] });
    },
  });
}
