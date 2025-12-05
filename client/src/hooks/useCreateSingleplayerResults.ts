import { useMutation } from '@tanstack/react-query';
import api from '/src/services/api';

export const useCreateSingleplayerResults = ({
  onSuccess,
}: {
  onSuccess: (data: unknown) => void;
}) => {
  return useMutation({
    mutationKey: ['results'],
    mutationFn: api.createSingleplayerResults,
    onSuccess(data) {
      onSuccess(data);
    },
  });
};
