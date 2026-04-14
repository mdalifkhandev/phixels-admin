import { useQuery } from '@tanstack/react-query';
import { newsletterApi } from '../../services/api';

export function useNewsletter() {
  return useQuery({
    queryKey: ['newsletter'],
    queryFn: async () => {
      const data = await newsletterApi.getAll();
      return data.map((item: any) => ({
        ...item,
        id: item._id,
      }));
    },
  });
}
