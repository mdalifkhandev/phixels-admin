import { useQuery } from '@tanstack/react-query';
import { teamMembersApi } from '../../services/api';

export function useTeamMembers() {
  return useQuery({
    queryKey: ['team-members'],
    queryFn: () => teamMembersApi.getAll(),
  });
}
