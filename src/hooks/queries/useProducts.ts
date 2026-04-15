import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../../services/api';

export const productAdminKeys = {
  all:  ['admin-products'] as const,
  list: () => [...productAdminKeys.all, 'list'] as const,
};

export function useAdminProducts() {
  return useQuery({
    queryKey: productAdminKeys.list(),
    queryFn:  () => productsApi.getAll(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: productAdminKeys.list() }),
  });
}

export function useReorderProducts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => productsApi.reorder(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: productAdminKeys.list() }),
  });
}
