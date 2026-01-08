import { useMutation } from '@tanstack/react-query';
import api from '/src/services/api';
import { LoginRequest, AuthResponse } from '/src/services/types';
import queryKeys from './queryKeys';
import toast from '/src/components/toast';

export default function useLogin({
  onSuccess,
}: {
  onSuccess?: (data: AuthResponse) => void;
}) {
  return useMutation({
    mutationKey: queryKeys.login,
    mutationFn: async (params: LoginRequest) => {
      return await api.post<AuthResponse>('/login', params);
    },
    onSuccess: (response) => {
      if (response?.data?.user) {
        onSuccess?.(response.data);
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message ?? 'Please try again later',
        status: 'error',
      });
    },
  });
}
