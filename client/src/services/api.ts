import { AxiosInstance } from 'axios';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ResultsRequest,
  StatisticsResponse,
  ChallengesResponse,
  CategoriesResponse,
} from '/src/services/types';
import axios from 'axios';
import toast from '/src/components/toast';

export const baseURL: string = import.meta.env.DEV
  ? 'http://localhost:3000'
  : 'https://api.songyang.dev';

export const instance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

instance.interceptors.response.use(undefined, (error) => {
  if (!axios.isCancel(error)) {
    toast({
      title: 'Error',
      description: error?.response?.data?.message ?? 'Please try again later',
      variant: 'solid',
      status: 'error',
      position: 'top-right',
      isClosable: true,
    });
  }
  return Promise.reject(error);
});

class ApiClient {
  private instance: AxiosInstance;

  constructor(instance: AxiosInstance) {
    this.instance = instance;
  }

  // const declaration is used instead of function declaration to maintain reference to the correct 'this'

  login = async (params: LoginRequest) => {
    return await this.instance.post<AuthResponse>('/login', params);
  };

  register = async (params: RegisterRequest) => {
    return await this.instance.post<AuthResponse>('/register', params);
  };

  logout = async () => {
    return await this.instance.post('/logout');
  };

  getUserOverviewStats = async () => {
    const res = await this.instance.get<StatisticsResponse>(
      '/user_overview_stats',
    );
    return res.data;
  };

  createSingleplayerResults = async (params: ResultsRequest) => {
    const res = await this.instance.post('/single_challenge_stats', params);
    return res.data;
  };

  getChallengesByCategory = async (params: { categoryId: number }) => {
    const res = await this.instance.get<ChallengesResponse>('/challenges', {
      params,
    });
    return res.data;
  };

  getCategories = async () => {
    const res = await this.instance.get<CategoriesResponse>('/categories');
    return res.data;
  };
}

const api = new ApiClient(instance);

export default api;
