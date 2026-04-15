import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { careersApi } from '../../services/api';

export const careerAdminKeys = {
  all:  ['admin-careers'] as const,
  list: () => [...careerAdminKeys.all, 'list'] as const,
};

export function useAdminCareers() {
  return useQuery({
    queryKey: careerAdminKeys.list(),
    queryFn:  () => careersApi.getAll(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useDeleteCareer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => careersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: careerAdminKeys.list() }),
  });
}
