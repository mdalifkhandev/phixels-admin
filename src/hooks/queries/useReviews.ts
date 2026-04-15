import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '../../services/api';

export const reviewKeys = {
  all:  ['admin-reviews'] as const,
  list: () => [...reviewKeys.all, 'list'] as const,
};

export function useAdminReviews() {
  return useQuery({
    queryKey: reviewKeys.list(),
    queryFn:  () => reviewsApi.getAll(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reviewsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: reviewKeys.list() }),
  });
}

export function useReorderReviews() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => reviewsApi.reorder(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: reviewKeys.list() }),
  });
}
