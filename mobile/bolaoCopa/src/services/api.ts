import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const API_BASE_URL = "http://10.0.2.2:8080/api";

console.log("URL DA API:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});


api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('jwt_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const token = await AsyncStorage.getItem('jwt_token');
    const isLoginEndpoint = error.config?.url?.includes('/auth/login');
    if (
      (!isLoginEndpoint && error.response?.status === 401) ||
      (error.response?.status === 404 && error.response?.data?.erro === 'Usuario logado nao encontrado')
    ) {
      if (token) {
        await AsyncStorage.removeItem('jwt_token');
        await AsyncStorage.removeItem('user_email');
        router.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

export { api };
