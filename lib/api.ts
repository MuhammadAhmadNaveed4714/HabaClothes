import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { Product } from "@/types";
import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5185/api";
const API_ORIGIN = (() => {
    try {
        return new URL(BASE_URL).origin;
    } catch {
        return "http://localhost:5185";
    }
})();

export const api = axios.create({
    baseURL: BASE_URL,
});

const splitCsv = (value?: string | null) =>
    value
        ? value
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
        : undefined;

const normalizeProduct = (product: Product | (Product & { sizes?: string | string[]; colors?: string | string[] })) => {
    const sizes = Array.isArray(product.sizes)
        ? product.sizes
        : splitCsv(product.sizes as string | undefined);
    const colors = Array.isArray(product.colors)
        ? product.colors
        : splitCsv(product.colors as string | undefined);
    const imageUrl = product.imageUrl?.startsWith("/")
        ? `${API_ORIGIN}${product.imageUrl}`
        : product.imageUrl;
    return { ...product, sizes, colors, imageUrl } as Product;
};

// Attach JWT token to every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    let token = Cookies.get("haba_token");
    if (!token && typeof window !== "undefined") {
        try {
            const persisted = window.localStorage.getItem("haba-auth");
            if (persisted) {
                const parsed = JSON.parse(persisted) as { state?: { token?: string | null } };
                token = parsed?.state?.token || undefined;
            }
        } catch {
            // Ignore malformed persisted auth state.
        }
    }
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Redirect to login on 401
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            Cookies.remove("haba_token");
            if (typeof window !== "undefined") window.location.href = "/login";
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
        api.get("/products", { params }).then((r: AxiosResponse) =>
            Array.isArray(r.data) ? r.data.map(normalizeProduct) : r.data
        ),
    getById: (id: number) => api.get(`/products/${id}`).then((r: AxiosResponse) => normalizeProduct(r.data)),
    create: (data: FormData) =>
        api.post("/products", data).then((r: AxiosResponse) => normalizeProduct(r.data)),
    update: (id: number, data: FormData) =>
        api.put(`/products/${id}`, data).then((r: AxiosResponse) => normalizeProduct(r.data)),
    delete: (id: number) => api.delete(`/products/${id}`).then((r: AxiosResponse) => r.data),
};

// ── Orders ────────────────────────────────────────────────────────────────────
export const ordersApi = {
    create: (data: unknown) => api.post("/orders", data).then((r: AxiosResponse) => r.data),
    getAll: () => api.get("/orders").then((r: AxiosResponse) => r.data),
    getById: (id: number) => api.get(`/orders/${id}`).then((r: AxiosResponse) => r.data),
};