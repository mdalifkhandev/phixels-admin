import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { portfolioApi, servicesApi } from '../../services/api';

export const portfolioKeys = {
  all:      ['admin-portfolio'] as const,
  list:     () => [...portfolioKeys.all, 'list'] as const,
};

export function useAdminPortfolio() {
  return useQuery({
    queryKey: portfolioKeys.list(),
    queryFn:  async () => {
      const [data, servicesData] = await Promise.all([
        portfolioApi.getAll(),
        servicesApi.getCategories(),
      ]);
      return { items: data, services: servicesData };
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useDeletePortfolio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => portfolioApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: portfolioKeys.list() }),
  });
}

export function useReorderPortfolio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => portfolioApi.reorder(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: portfolioKeys.list() }),
  });
}
