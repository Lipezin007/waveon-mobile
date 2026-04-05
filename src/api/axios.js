import axios from 'axios';
import { Platform } from 'react-native';

function getApiBaseUrl() {
    const envUrl = process.env.EXPO_PUBLIC_API_URL;

    if (envUrl) {
        return envUrl;
    }

    if (__DEV__) {
        // Android emulator cannot reach localhost directly.
        return Platform.OS === 'android' ?
            'http://192.168.0.247:3000' :
            'http://localhost:3000';
    }

    return 'https://waveon-api.onrender.com';
}
console.log('API URL:', process.env.EXPO_PUBLIC_API_URL);
console.log('BASE URL FINAL:', getApiBaseUrl());
const api = axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 10000,
});

export default api;