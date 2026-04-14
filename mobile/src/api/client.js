import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// SET TO true FOR LOCAL DEVELOPMENT, false FOR PRODUCTION
const DEV_MODE = false; // Change to true when testing locally

const BASE_URL = DEV_MODE ? 'http://192.168.1.100:5000/api' : 'https://college-management-mjul.onrender.com/api';
const SOCKET_URL = DEV_MODE ? 'http://192.168.1.100:5000' : 'https://college-management-mjul.onrender.com';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export { BASE_URL, SOCKET_URL };

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
