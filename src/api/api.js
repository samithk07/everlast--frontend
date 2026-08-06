import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let isRedirecting = false;

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Don't intercept login/register/profile requests
    if (
      error.response?.status === 401 &&
      !originalRequest.url.includes("/auth/login") &&
      !originalRequest.url.includes("/auth/register") &&
      !originalRequest.url.includes("/auth/getProfile")
    ) {
      toast.error("Session expired. Please login again.");

      if (!isRedirecting) {
        isRedirecting = true;

        try {
          await api.post("/auth/logout");
        } catch (err) {
          console.log(err);
        }

        localStorage.clear();

        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// ---------------- Error Helper ----------------

export const getErrorMessage = (
  error,
  fallback = "Something went wrong."
) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

// ---------------- Auth ----------------

export const authService = {
  login: (email, password) =>
    api.post("/auth/login", { email, password }).then((res) => res.data),

  register: (userData) =>
    api.post("/auth/register", userData).then((res) => res.data),

  me: () =>
    api.get("/auth/getProfile").then((res) => res.data),

  logout: () =>
    api.post("/auth/logout").then((res) => res.data),
};

// ---------------- Products ----------------

export const productsService = {
  list: () =>
    api.get("/products").then((res) => res.data),

  getById: (id) =>
    api.get(`/products/${id}`).then((res) => res.data),
};

// ---------------- Cart ----------------

export const cartService = {
  get: () =>
    api.get("/cart").then((res) => res.data),

  add: (productId) =>
    api.post(`/cart/${productId}`).then((res) => res.data),

  remove: (productId) =>
    api.delete(`/cart/${productId}`).then((res) => res.data),

  updateQuantity: (productId, quantity) =>
    api.put(`/cart/${productId}`, { quantity }).then((res) => res.data),

  clear: () =>
    api.delete("/cart").then((res) => res.data),
};

// ---------------- Orders ----------------

export const ordersService = {
  create: (orderData) =>
    api.post("/orders", orderData).then((res) => res.data),

  listMine: () =>
    api.get("/orders").then((res) => res.data),

  getById: (id) =>
    api.get(`/orders/${id}`).then((res) => res.data),
};


//-------------------service----------------

export const serviceService = {
  create: (serviceData) =>
    api.post("/services", serviceData).then((res) => res.data),

  getMyServices: () =>
    api.get("/services").then((res) => res.data),

  getById: (id) =>
    api.get(`/services/${id}`).then((res) => res.data),

  cancel: (id) =>
    api.patch(`/services/${id}/cancel`).then((res) => res.data),
};

