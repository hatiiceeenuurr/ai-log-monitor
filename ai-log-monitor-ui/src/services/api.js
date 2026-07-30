import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach Authorization Bearer token to every request automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// Intercept responses to handle 401 Unauthorized globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Session expired or unauthorized (401). Logging out...");
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

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

export const changePassword = async (currentPassword, newPassword) => {
    const response = await api.post('/auth/change-password', { currentPassword, newPassword });
    return response.data;
};

export const requestPasswordResetCode = async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
};

export const confirmPasswordReset = async (email, code, newPassword) => {
    const response = await api.post('/auth/reset-password', { email, code, newPassword });
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

export const getLogsPaginated = async (page = 0, size = 10, severity = 'ALL', search = '') => {
    try {
        const response = await api.get(`/logs/page?page=${page}&size=${size}&severity=${severity}&search=${encodeURIComponent(search)}`);
        return response.data;
    } catch (e) {
        throw e;
    }
};

export const getDailyAnalysis = async () => {
    const response = await api.get('/dashboard/daily');
    return response.data;
};

export const resetAllLogData = async () => {
    const response = await api.post('/admin/reset-data');
    return response.data;
};

export const searchLogs = async (query) => {
    const response = await api.get('/search', { params: { query } });
    return response.data;
};

export const subscribeToLogStream = (onLogReceived) => {
    let eventSource = null;
    let reconnectTimeout = null;

    const connect = () => {
        eventSource = new EventSource(`${API_BASE_URL}/logs/stream`);
        
        eventSource.addEventListener('LOG_ANALYSIS', (event) => {
            try {
                const data = JSON.parse(event.data);
                onLogReceived(data);
            } catch (e) {
                console.error("SSE JSON Parse error:", e);
            }
        });

        eventSource.onerror = (error) => {
            console.error("SSE Connection Error. Attempting to reconnect...", error);
            eventSource.close();
            // Reconnect after 5 seconds
            reconnectTimeout = setTimeout(connect, 5000);
        };
    };

    connect();

    return () => {
        if (eventSource) eventSource.close();
        if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
};

export const getHealthStatus = async () => {
    try {
        const response = await api.get('/health');
        return response.data;
    } catch (e) {
        throw e;
    }
};

export const getSettings = async () => {
    const response = await api.get('/settings');
    return response.data;
};

export const updateSettings = async (settings) => {
    const response = await api.post('/settings', settings);
    return response.data;
};

export default api;
