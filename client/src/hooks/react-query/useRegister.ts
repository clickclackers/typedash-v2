import { useMutation } from '@tanstack/react-query';
import api from '/src/services/api';
import { RegisterRequest, AuthResponse } from '/src/services/types';
import queryKeys from './queryKeys';

export default function useRegister({
  onSuccess,
}: {
  onSuccess?: (data: AuthResponse) => void;
}) {
  return useMutation({
    mutationKey: queryKeys.register,
    mutationFn: async (params: RegisterRequest) => {
      return await api.post<AuthResponse>('/register', params);
    },
    onSuccess: (response) => {
      if (response?.data?.user) {
        onSuccess?.(response.data);
      }
    },
  });
}
