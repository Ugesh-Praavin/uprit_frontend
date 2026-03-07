import axios from 'axios';

/**
 * Axios instance with base URL and JWT interceptor.
 * Automatically attaches Bearer token from localStorage.
 * Redirects to /login on 401 responses.
 */
const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

// ── Request Interceptor: Attach JWT ────────────────
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('uprit_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response Interceptor: Handle 401 ───────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('uprit_token');
            localStorage.removeItem('uprit_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
