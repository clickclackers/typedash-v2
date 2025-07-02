import axios from 'axios';

const http = () => {
  const baseURL: string =
    import.meta.env.VITE_ENV !== 'production'
      ? 'http://localhost:3000/'
      : import.meta.env.VITE_API_URL;
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      //'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
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
