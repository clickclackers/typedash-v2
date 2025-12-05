import { useQuery } from '@tanstack/react-query';
import api from '/src/services/api';

export const useGetUserOverviewStats = () => {
  return useQuery({
    queryKey: ['user-overview-stats'],
    queryFn: api.getUserOverviewStats,
  });
};
