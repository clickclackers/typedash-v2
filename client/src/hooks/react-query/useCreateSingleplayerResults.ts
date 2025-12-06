import { useMutation } from '@tanstack/react-query';
import api from '/src/services/api';
import queryKeys from './queryKeys';

export const useCreateSingleplayerResults = ({
  onSuccess,
}: {
  onSuccess?: (data: unknown) => void;
}) => {
  return useMutation({
    mutationKey: queryKeys.singleplayerResults,
    mutationFn: api.createSingleplayerResults,
    onSuccess(data) {
      onSuccess?.(data);
    },
  });
};
