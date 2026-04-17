import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5185/api";

export const api = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = Cookies.get("haba_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Redirect to login on 401
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            Cookies.remove("haba_token");
            if (typeof window !== "undefined") window.location.href = "/auth/login";
        }
        return Promise.reject(error);
    }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
    login: (data: { email: string; password: string }) =>
        api.post("/auth/login", data).then((r: AxiosResponse) => r.data),
    register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
        api.post("/auth/register", data).then((r: AxiosResponse) => r.data),
    me: () => api.get("/auth/me").then((r: AxiosResponse) => r.data),
};

// ── Products ──────────────────────────────────────────────────────────────────
export const productsApi = {
    getAll: (params?: { category?: string; search?: string; page?: number; pageSize?: number }) =>
        api.get("/products", { params }).then((r: AxiosResponse) => r.data),
    getById: (id: number) => api.get(`/products/${id}`).then((r: AxiosResponse) => r.data),
    create: (data: FormData) =>
        api.post("/products", data, { headers: { "Content-Type": "multipart/form-data" } }).then((r: AxiosResponse) => r.data),
    update: (id: number, data: FormData) =>
        api.put(`/products/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } }).then((r: AxiosResponse) => r.data),
    delete: (id: number) => api.delete(`/products/${id}`).then((r: AxiosResponse) => r.data),
};

// ── Orders ────────────────────────────────────────────────────────────────────
export const ordersApi = {
    create: (data: unknown) => api.post("/orders", data).then((r: AxiosResponse) => r.data),
    getAll: () => api.get("/orders").then((r: AxiosResponse) => r.data),
    getById: (id: number) => api.get(`/orders/${id}`).then((r: AxiosResponse) => r.data),
};