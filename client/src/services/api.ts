import axios from 'axios';

export const baseURL: string = import.meta.env.DEV
  ? 'http://localhost:3000/'
  : (import.meta.env.VITE_API_URL as string);

export const http = () => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      //'Access-Control-Allow-Origin': '*',
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
  return instance;
};

export default http;
