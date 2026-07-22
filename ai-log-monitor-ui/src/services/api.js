import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach Authorization Bearer token to every request automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

export const loginUser = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
};

export const registerUser = async (username, email, password) => {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
};

export const getCurrentUser = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

export const getDashboardData = async () => {
    const response = await api.get('/dashboard');
    return response.data;
};

export const getAllLogs = async () => {
    const response = await api.get('/logs');
    return response.data;
};

export const getLogsPaginated = async (page = 0, size = 10) => {
    const response = await api.get(`/logs/page?page=${page}&size=${size}`);
    return response.data;
};

export const getDailyAnalysis = async () => {
    const response = await api.get('/dashboard/daily');
    return response.data;
};

export const resetAllLogData = async () => {
    const response = await api.post('/admin/reset-data');
    return response.data;
};

export const subscribeToLogStream = (onLogReceived) => {
    const eventSource = new EventSource(`${API_BASE_URL}/logs/stream`);
    
    eventSource.addEventListener('LOG_ANALYSIS', (event) => {
        try {
            const data = JSON.parse(event.data);
            onLogReceived(data);
        } catch (e) {
            console.error("SSE JSON Parse hatası:", e);
        }
    });

    return () => eventSource.close();
};

export default api;
