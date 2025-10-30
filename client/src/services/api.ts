import { createStandaloneToast } from '@chakra-ui/react';
import { AxiosError, AxiosInstance } from 'axios';
import { AuthResponse, StatisticsResponse } from './types';
import axios from 'axios';

export const baseURL: string = import.meta.env.DEV
  ? 'http://localhost:3000/'
  : (import.meta.env.VITE_API_URL as string);

export const instance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});
instance.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

const { toast } = createStandaloneToast();

// Generic API client class
class ApiClient {
  private instance: AxiosInstance;
  private showToast = (
    title: string,
    description: string,
    status: 'success' | 'error',
  ) => {
    toast({
      title,
      description,
      variant: 'solid',
      status,
      position: 'top-right',
      duration: 5000,
      isClosable: true,
    });
  };

  constructor() {
    this.instance = instance;
  }

  async loginUser(params: Record<string, any>) {
    try {
      const res = await this.instance
        .post<AuthResponse>('login', params)
        .then((response) => {
          this.showToast('Logged in', '', 'success');
          return response;
        });
      return res;
    } catch (e) {
      console.log(e);
      if (e instanceof AxiosError) {
        this.showToast('Login failed', `${e.response?.data?.message}`, 'error');
      }
    }
  }

  async registerUser(params: Record<string, any>) {
    try {
      const res = await this.instance
        .post<AuthResponse>('register', params)
        .then((response) => {
          this.showToast('Registered successfully!', '', 'success');
          return response;
        });
      return res;
    } catch (e) {
      if (e instanceof AxiosError) {
        this.showToast(
          'Registration failed',
          `${e.response?.data?.message}`,
          'error',
        );
      }
    }
  }

  async logoutUser() {
    try {
      const res = await this.instance.post('logout').then((response) => {
        this.showToast('You have logged out', '', 'success');
        return response;
      });
      return res;
    } catch (e) {
      if (e instanceof AxiosError) {
        this.showToast(
          'Logout failed',
          `${e.response?.data?.message}`,
          'error',
        );
      }
    }
  }

  async getUserOverviewStats(params: { userId: number }) {
    try {
      const res = await this.instance.get<StatisticsResponse>(
        'user_overview_stats',
        {
          params,
        },
      );
      return res;
    } catch (e) {
      if (e instanceof AxiosError) {
        this.showToast(
          'Failed to get stats',
          `${e.response?.data?.message}`,
          'error',
        );
      }
    }
  }
}

// Export singleton instance
const api = new ApiClient();
export default api;
