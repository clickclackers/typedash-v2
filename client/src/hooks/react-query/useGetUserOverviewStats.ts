import { useQuery } from '@tanstack/react-query';
import api from '/src/services/api';
import queryKeys from './queryKeys';

export const useGetUserOverviewStats = () => {
  return useQuery({
    queryKey: queryKeys.userOverviewStats,
    queryFn: api.getUserOverviewStats,
  });
};
