import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get('refreshToken');
        if (refreshToken) {
          const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
          const { data } = await axios.post(`${baseURL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token } = data;

          Cookies.set('token', access_token, { expires: 1 });
          if (refresh_token) {
            Cookies.set('refreshToken', refresh_token, { expires: 7 });
          }

          api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
          originalRequest.headers['Authorization'] = `Bearer ${access_token}`;

          return api(originalRequest);
        }
      } catch (refreshError) {
        Cookies.remove('token');
        Cookies.remove('refreshToken');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

