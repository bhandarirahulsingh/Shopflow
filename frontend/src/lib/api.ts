import axios from 'axios';

// 1. Create base Axios instance targeting our backend routes
export const api = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. Request Interceptor: Automatically injects Bearer Token into EVERY outgoing request!
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('shopflow_access_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 3. Response Interceptor: Automatically extracts clean response data & handles errors
api.interceptors.response.use(
    (response) => {
        // Our backend ApiResponse always packages clean data inside response.data.data
        return response.data.data !== undefined ? response.data.data : response.data;
    },
    (error) => {
        const message = error.response?.data?.message || error.message || 'Something went wrong';
        return Promise.reject(new Error(message));
    }
);

export default api;
