import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL as string;
export const STORAGE_URL = import.meta.env.VITE_STORAGE_URL as string;

export const axiosInstance = axios.create({
	baseURL: API_URL,
	headers: {
		'Content-Type': 'multipart/form-data',
	},
});

export const axiosWithoutMultipart = axios.create({
	baseURL: API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Instancia ESPECÍFICA para rutas de autenticación (SIN X-Sede-Id)
export const axiosAuth = axios.create({
	baseURL: API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Interceptor para admin (authToken)
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error: any) => {
        return Promise.reject(error);
    }
);

// Interceptor para AUTH - SIN X-Sede-Id
axiosAuth.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error: any) => {
        return Promise.reject(error);
    }
);

// Interceptor para admin (authToken) - sin multipart - CON X-Sede-Id
axiosWithoutMultipart.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        const sedeActivaRaw = localStorage.getItem('sedeActiva');
        if (sedeActivaRaw) {
            try {
                const sedeActiva = JSON.parse(sedeActivaRaw);
                if (sedeActiva?.sede_id) {
                    config.headers['X-Sede-Id'] = String(sedeActiva.sede_id);
                }
            } catch { /* ignore */ }
        }
        return config;
    },
    (error: any) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar respuestas con errores 401 (no autorizado)
const handleUnauthorized = (error: any) => {
	// Evitamos que el interceptor actúe (cerrando sesión) si el 401 viene de un intento de Login
	const isLoginRequest = error.config && error.config.url && error.config.url.includes('login');

	if (error.response?.status === 401 && !isLoginRequest) {
		localStorage.removeItem('authToken');
		if (!window.location.pathname.includes('/login')) {
			window.location.href = '/login';
		}
	}
	return Promise.reject(error);
};

axiosInstance.interceptors.response.use(
	(response) => response,
	handleUnauthorized
);

axiosAuth.interceptors.response.use(
	(response) => response,
	handleUnauthorized
);

axiosWithoutMultipart.interceptors.response.use(
	(response) => response,
	handleUnauthorized
);


