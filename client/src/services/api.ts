import axios from 'axios';
import toast from '/src/components/toast';

export const baseURL: string = import.meta.env.DEV
  ? '/api' // Use Vite proxy in development for same-origin requests
  : 'https://api.songyang.dev';

const instance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with requests
});

instance.interceptors.response.use(undefined, (error) => {
  if (!axios.isCancel(error)) {
    // Don't show toast for 401 Unauthorized errors - these are expected
    // when checking authentication status (e.g., on page load)
    const status = error?.response?.status;
    if (status !== 401) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message ?? 'Please try again later',
        variant: 'solid',
        status: 'error',
        position: 'top-right',
        isClosable: true,
      });
    }
  }
  return Promise.reject(error);
});

export default instance;
