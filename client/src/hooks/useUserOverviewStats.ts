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
      if (!userId) return null;
      const res = await api.getUserOverviewStats({ userId });
      if (!res) return null;
      return res.data;
    },
    enabled: !!userId,
  });
};
