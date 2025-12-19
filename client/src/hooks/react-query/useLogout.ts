import { useMutation } from '@tanstack/react-query';
import api from '/src/services/api';
import queryKeys from './queryKeys';

export const useLogout = ({ onSuccess }: { onSuccess?: () => void }) => {
  return useMutation({
    mutationKey: queryKeys.logout,
    mutationFn: () => api.logout(),
    onSuccess: () => {
      onSuccess?.();
    },
  });
};
