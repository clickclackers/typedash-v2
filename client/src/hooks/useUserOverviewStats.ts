import { useQuery } from '@tanstack/react-query';
import api from '/src/services/api';

export const useUserOverviewStats = ({ userId }: { userId: string }) => {
  return useQuery({
    queryKey: ['user-overview-stats', userId],
    queryFn: async () => {
      const res = await api.getUserOverviewStats({ userId });
      if (!res) return null;
      return res.data;
    },
  });
};
