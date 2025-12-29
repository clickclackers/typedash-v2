import { useMutation } from '@tanstack/react-query';
import api from '/src/services/api';
import { LoginRequest, AuthResponse } from '/src/services/types';
import queryKeys from './queryKeys';

export const useLogin = ({
  onSuccess,
}: {
  onSuccess?: (data: AuthResponse) => void;
}) => {
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
  });
};
