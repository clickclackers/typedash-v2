import { useQuery } from '@tanstack/react-query';
import api from '/src/services/api';

export const useUserOverviewStats = () => {
  return useQuery({
    queryKey: ['user-overview-stats'],
    queryFn: async () => {
      const res = await api.getUserOverviewStats();
      if (!res) {
        throw new Error('Failed to get stats');
      }
      return res.data;
    },
  });
};
