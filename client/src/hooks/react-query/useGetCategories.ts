import { useQuery } from '@tanstack/react-query';
import api from '/src/services/api';
import queryKeys from './queryKeys';
import { CategoriesResponse } from '/src/services/types';

export const useGetCategories = () => {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: async () => {
      const res = await api.get<CategoriesResponse>('/categories');
      return res.data;
    },
  });
};
