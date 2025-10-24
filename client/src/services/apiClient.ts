import { createStandaloneToast } from '@chakra-ui/react';
import { AxiosError } from 'axios';
import http from '/src/services/api';
import { AuthResponse, StatisticsResponse } from './types';

const { toast } = createStandaloneToast();

// Generic API client class
class ApiClient {
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

  // private handleError = (error: unknown, defaultMessage: string): ApiError => {
  //   if (error instanceof AxiosError) {
  //     const message = error.response?.data?.message || defaultMessage;
  //     this.showToast(defaultMessage, message, 'error');
  //     return { message, status: error.response?.status };
  //   }
  //   const message = error instanceof Error ? error.message : defaultMessage;
  //   this.showToast(defaultMessage, message, 'error');
  //   return { message };
  // };

  async loginUser(params: Record<string, any>) {
    try {
      const res = await http()
        .post<AuthResponse>('login', params)
        .then((response) => {
          this.showToast(
            'Login successful.',
            'You are now logged in.',
            'success',
          );
          return response;
        });
      return res;
    } catch (e) {
      console.log(e);
      if (e instanceof AxiosError) {
        this.showToast(
          'Login failed.',
          // `${e.response?.data.message}.`,
          // `${e.response?.data.message}`,
          'Login is coming soon!',
          'error',
        );
      }
    }
  }

  async registerUser(params: Record<string, any>) {
    try {
      const res = await http()
        .post<AuthResponse>('register', params)
        .then((response) => {
          this.showToast(
            'Registered successfully.',
            'Your account has been created.',
            'success',
          );
          return response;
        });
      return res;
    } catch (e) {
      if (e instanceof AxiosError) {
        this.showToast(
          'Registration failed.',
          // `${e.response?.data.message}`,
          'Registration is coming soon!',
          'error',
        );
      }
    }
  }

  async logoutUser() {
    try {
      const res = await http()
        .post('logout')
        .then((response) => {
          this.showToast(
            'Logout successful.',
            'You are now logged out.',
            'success',
          );
          return response;
        });
      return res;
    } catch (e) {
      if (e instanceof AxiosError) {
        this.showToast(
          'Logout failed.',
          `${e.response?.data.message}.`,
          'error',
        );
      }
    }
  }

  async getUserOverviewStats(params: { userId: string | undefined }) {
    try {
      const res = await http().get<StatisticsResponse>('user_overview_stats', {
        params,
      });
      return res;
    } catch (e) {
      console.log(e);
    }
  }
}

// Export singleton instance
const api = new ApiClient();
export default api;
