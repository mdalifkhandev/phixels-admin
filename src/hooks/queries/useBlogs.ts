import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogsApi, servicesApi } from '../../services/api';

export const blogKeys = {
  all:      ['admin-blogs'] as const,
  list:     () => [...blogKeys.all, 'list'] as const,
  services: () => ['admin-service-categories'] as const,
};

export function useAdminBlogs() {
  return useQuery({
    queryKey: blogKeys.list(),
    queryFn:  () => blogsApi.getAll(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useAdminServiceCategories() {
  return useQuery({
    queryKey: blogKeys.services(),
    queryFn:  () => servicesApi.getCategories(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useDeleteBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => blogsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: blogKeys.list() }),
  });
}

export function useReorderBlogs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (blogs: { id: string; position: number }[]) => blogsApi.reorder(blogs),
    onSuccess: () => qc.invalidateQueries({ queryKey: blogKeys.list() }),
  });
}
