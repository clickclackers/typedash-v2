import { useQuery } from '@tanstack/react-query';
import api from '/src/services/api';
import queryKeys from './queryKeys';

export const useGetChallengesByCategory = ({
  categoryId,
}: {
  categoryId: number;
}) => {
  return useQuery({
    queryKey: queryKeys.challengesByCategory({ categoryId }),
    queryFn: () => api.getChallengesByCategory({ categoryId }),
  });
};
