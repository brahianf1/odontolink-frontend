import axios, { AxiosError, AxiosHeaders } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10);

export interface ApiErrorPayload {
  timestamp?: string;
  status: number;
  error: string;
  message: string;
  path?: string;
  details?: string[];
  traceId?: string;
}

export interface ApiError {
  status?: number;
  error?: string;
  message: string;
  details?: string[];
  traceId?: string;
  retryAfter?: number;
  data?: ApiErrorPayload | unknown;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

const readHeader = (headers: unknown, key: string): string | undefined => {
  if (!headers) return undefined;
  if (headers instanceof AxiosHeaders) {
    const value = headers.get(key);
    return typeof value === 'string' ? value : undefined;
  }
  if (typeof headers !== 'object') return undefined;
  const record = headers as Record<string, unknown>;
  const lower = key.toLowerCase();
  for (const headerKey of Object.keys(record)) {
    if (headerKey.toLowerCase() === lower) {
      const value = record[headerKey];
      return typeof value === 'string' ? value : undefined;
    }
  }
  return undefined;
};

const parseRetryAfter = (value: string | undefined): number | undefined => {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.ceil(seconds);
  }
  const epoch = Date.parse(value);
  if (!Number.isNaN(epoch)) {
    const diff = Math.ceil((epoch - Date.now()) / 1000);
    return diff > 0 ? diff : 0;
  }
  return undefined;
};

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const requestUrl = error.config?.url || '';
    const status = error.response?.status;
    const payload = error.response?.data as Partial<ApiErrorPayload> | undefined;

    if (status === 401 && !requestUrl.includes('/auth/login')) {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    const retryAfter =
      status === 429
        ? parseRetryAfter(
            readHeader(error.response?.headers, 'Retry-After') ||
              readHeader(error.response?.headers, 'X-RateLimit-Reset')
          )
        : undefined;

    const message =
      payload?.message ||
      error.message ||
      'Ocurrió un error inesperado. Intenta nuevamente.';

    const apiError: ApiError = {
      status,
      error: payload?.error,
      message,
      details: payload?.details,
      traceId: payload?.traceId,
      retryAfter,
      data: payload,
    };

    return Promise.reject(apiError);
  }
);

export default apiClient;
