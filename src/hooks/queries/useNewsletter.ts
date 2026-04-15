import { useQuery } from '@tanstack/react-query';
import { newsletterApi } from '../../services/api';

export function useNewsletter() {
  return useQuery({
    queryKey: ['newsletter'],
    queryFn: async () => {
      const data = await newsletterApi.getAll();
      return data
        .map((item: any) => ({
          ...item,
          id: item._id,
          status: "Active", // Explicitly set default status as Active since it's missing in DB
          timestamp: new Date(item.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          _rawDate: new Date(item.createdAt),
        }))
        .sort(
          (a: any, b: any) => b._rawDate.getTime() - a._rawDate.getTime()
        );
    },
  });
}
