import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// SET TO true FOR LOCAL DEVELOPMENT, false FOR PRODUCTION
const DEV_MODE = false; // Change to true when testing locally

const client = axios.create({
  baseURL: DEV_MODE
    ? 'http://192.168.1.100:5000/api'  // Replace with your PC's local IP (run: ipconfig)
    : 'https://college-management-mjul.onrender.com/api',
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
