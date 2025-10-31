import { AxiosInstance } from 'axios';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  StatisticsResponse,
} from '/src/services/types';
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

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = instance;
  }

  async loginUser(params: LoginRequest) {
    return await this.instance.post<AuthResponse>('login', params);
  }

  async registerUser(params: RegisterRequest) {
    return await this.instance.post<AuthResponse>('register', params);
  }

  async logoutUser() {
    return await this.instance.post('logout');
  }

  async getUserOverviewStats(params: { userId: number }) {
    return await this.instance.get<StatisticsResponse>('user_overview_stats', {
      params,
    });
  }
}

const api = new ApiClient();
export default api;
