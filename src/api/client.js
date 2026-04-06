import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// 10.0.2.2 = host machine localhost inside Android emulator
// For a real device on the same WiFi, use your PC's LAN IP (e.g. http://192.168.68.162/employee/api)
// For production hosting, use: https://yourdomain.com/employee/api
export const BASE_URL = 'https://ems.md-officesupport.com/api';
export const UPLOADS_URL = 'https://ems.md-officesupport.com';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach PHPSESSID as Cookie header so PHP sessions work on mobile
api.interceptors.request.use(async (config) => {
  try {
    const sessionId = await SecureStore.getItemAsync('phpsessid');
    if (sessionId) {
      config.headers['Cookie'] = `PHPSESSID=${sessionId}`;
    }
  } catch (_) {}
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject(error)
);

export default api;
