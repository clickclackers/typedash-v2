import { useQuery } from '@tanstack/react-query';
import api from '/src/services/api';
import queryKeys from './queryKeys';

export const useGetChallengesByCategory = ({
  category,
}: {
  category: string;
}) => {
  return useQuery({
    queryKey: queryKeys.challengesByCategory({ category }),
    queryFn: () => api.getChallengesByCategory({ category }),
  });
};
