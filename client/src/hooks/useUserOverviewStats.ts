import { useQuery } from '@tanstack/react-query';
import api from '/src/services/api';

export const useUserOverviewStats = ({
  userId,
}: {
  userId: number | undefined;
}) => {
  return useQuery({
    queryKey: ['user-overview-stats', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('Please login');
      }
      const res = await api.getUserOverviewStats({ userId });
      if (!res) {
        throw new Error('Failed to get stats');
      }
      return res.data;
    },
    enabled: !!userId,
  });
};
