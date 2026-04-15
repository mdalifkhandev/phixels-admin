import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { caseStudiesApi } from '../../services/api';

export const caseStudyAdminKeys = {
  all:  ['admin-case-studies'] as const,
  list: () => [...caseStudyAdminKeys.all, 'list'] as const,
};

export function useAdminCaseStudies() {
  return useQuery({
    queryKey: caseStudyAdminKeys.list(),
    queryFn:  () => caseStudiesApi.getAll(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useDeleteCaseStudy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => caseStudiesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: caseStudyAdminKeys.list() }),
  });
}

export function useReorderCaseStudies() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => caseStudiesApi.reorder(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: caseStudyAdminKeys.list() }),
  });
}
