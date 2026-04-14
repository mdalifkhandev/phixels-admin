import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactRequestApi } from '../../services/api';

export function useMessages() {
  return useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      const data = await contactRequestApi.getAll();
      return data.map((item: any) => ({
        ...item,
        id: item._id,
        _rawDate: new Date(item.createdAt),
      })).sort((a: any, b: any) => b._rawDate.getTime() - a._rawDate.getTime());
    },
  });
}

export function useUpdateMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      contactRequestApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}
