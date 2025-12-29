import { useQuery } from '@tanstack/react-query';
import api from '/src/services/api';
import queryKeys from './queryKeys';
import { StatisticsResponse } from '/src/services/types';

export const useGetUserOverviewStats = () => {
  return useQuery({
    queryKey: queryKeys.userOverviewStats,
    queryFn: async () => {
      const res = await api.get<StatisticsResponse>('/user_overview_stats');
      return res.data;
    },
  });
};
