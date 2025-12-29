import { useQuery } from '@tanstack/react-query';
import api from '/src/services/api';
import queryKeys from './queryKeys';
import { ChallengesResponse } from '/src/services/types';

export const useGetChallengesByCategory = ({
  categoryId,
}: {
  categoryId: number;
}) => {
  return useQuery({
    queryKey: queryKeys.challengesByCategory({ categoryId }),
    queryFn: async () => {
      const res = await api.get<ChallengesResponse>('/challenges', {
        params: { categoryId },
      });
      return res.data;
    },
  });
};
