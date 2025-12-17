import { useQuery } from '@tanstack/react-query';
import api from '/src/services/api';
import queryKeys from './queryKeys';

export const useGetCategories = () => {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => api.getCategories(),
  });
};
