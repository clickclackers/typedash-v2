import { useMutation } from '@tanstack/react-query';
import api from '/src/services/api';
import queryKeys from './queryKeys';

export default function useLogout({ onSuccess }: { onSuccess?: () => void }) {
  return useMutation({
    mutationKey: queryKeys.logout,
    mutationFn: async () => {
      return await api.post('/logout');
    },
    onSuccess: () => {
      onSuccess?.();
    },
  });
}
