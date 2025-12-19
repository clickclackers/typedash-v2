import { useMutation } from '@tanstack/react-query';
import api from '/src/services/api';
import { RegisterRequest, AuthResponse } from '/src/services/types';
import queryKeys from './queryKeys';

export const useRegister = ({
  onSuccess,
}: {
  onSuccess?: (data: AuthResponse) => void;
}) => {
  return useMutation({
    mutationKey: queryKeys.register,
    mutationFn: (params: RegisterRequest) => api.register(params),
    onSuccess: (response) => {
      if (response?.data?.user) {
        onSuccess?.(response.data);
      }
    },
  });
};
