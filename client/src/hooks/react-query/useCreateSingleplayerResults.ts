import { useMutation } from '@tanstack/react-query';
import api from '/src/services/api';
import queryKeys from './queryKeys';
import { ResultsRequest } from '/src/services/types';

export const useCreateSingleplayerResults = ({
  onSuccess,
}: {
  onSuccess?: (data: unknown) => void;
}) => {
  return useMutation({
    mutationKey: queryKeys.singleplayerResults,
    mutationFn: async (params: ResultsRequest) => {
      console.log(params);
      const res = await api.post('/results_single', params);
      return res.data;
    },
    onSuccess(data) {
      onSuccess?.(data);
    },
  });
};
