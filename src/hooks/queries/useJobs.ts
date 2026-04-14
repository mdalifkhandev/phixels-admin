import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobApplicationApi } from '../../services/api';

export function useJobs() {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const data = await jobApplicationApi.getAll();
      return data.map((item: any) => ({
        ...item,
        id: item._id,
      }));
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      jobApplicationApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}
