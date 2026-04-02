import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const client = axios.create({
  // Localtunnel: Public access for your phone!
  baseURL: 'https://unspleenish-mittie-curvilinear.ngrok-free.dev/api',
  timeout: 10000,
});

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
