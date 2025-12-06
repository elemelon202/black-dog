import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/sign_in', { user: { email, password } }),

  register: (userData: {
    email: string;
    password: string;
    password_confirmation: string;
    first_name: string;
    last_name: string;
    phone: string;
    company_name?: string;
  }) => api.post('/auth', { user: userData }),

  logout: () => api.delete('/auth/sign_out'),
};

// Quotes endpoints
export const quotesApi = {
  getAll: (params?: { page?: number; per_page?: number }) =>
    api.get('/quotes', { params }),

  getOne: (id: number) => api.get(`/quotes/${id}`),

  create: (quoteData: QuoteFormData) =>
    api.post('/quotes', { quote: quoteData }),

  update: (id: number, quoteData: Partial<QuoteFormData>) =>
    api.patch(`/quotes/${id}`, { quote: quoteData }),

  delete: (id: number) => api.delete(`/quotes/${id}`),

  accept: (id: number) => api.post(`/quotes/${id}/accept`),

  reject: (id: number) => api.post(`/quotes/${id}/reject`),

  convertToOrder: (id: number) => api.post(`/quotes/${id}/convert_to_order`),

  quickEstimate: (data: QuickEstimateData) =>
    api.post('/quotes/quick_estimate', data),
};

// Orders endpoints
export const ordersApi = {
  getAll: (params?: { page?: number; per_page?: number; status?: string }) =>
    api.get('/orders', { params }),

  getOne: (id: number) => api.get(`/orders/${id}`),

  create: (orderData: OrderFormData) =>
    api.post('/orders', { order: orderData }),

  update: (id: number, orderData: Partial<OrderFormData>) =>
    api.patch(`/orders/${id}`, { order: orderData }),

  cancel: (id: number, reason?: string) =>
    api.post(`/orders/${id}/cancel`, { reason }),

  track: (trackingNumber: string) =>
    api.get('/orders/track', { params: { tracking_number: trackingNumber } }),
};

// Vehicles endpoints
export const vehiclesApi = {
  getAll: (params?: { available?: boolean; vehicle_type?: string }) =>
    api.get('/vehicles', { params }),

  getVehicleTypes: () => api.get('/vehicles/vehicle_types'),
};

// Payments endpoints
export const paymentsApi = {
  createIntent: (orderId: number) =>
    api.post(`/orders/${orderId}/payments/create_intent`),

  confirm: (paymentId: number) => api.post(`/payments/${paymentId}/confirm`),
};

// Shipping info endpoints
export const shippingApi = {
  getInfo: () => api.get('/shipping/info'),
  getUkShipping: () => api.get('/shipping/uk'),
  getEuShipping: () => api.get('/shipping/eu'),
  getVehicleGuide: () => api.get('/shipping/vehicles'),
};

// Types
export interface QuoteFormData {
  pickup_postcode: string;
  delivery_postcode: string;
  pickup_country: string;
  delivery_country: string;
  vehicle_type_required?: string;
  cargo_weight_kg: number;
  cargo_volume_cbm?: number;
  cargo_description: string;
  requires_tail_lift?: boolean;
  requires_pallet_jack?: boolean;
  is_hazardous?: boolean;
  is_temperature_controlled?: boolean;
  notes?: string;
}

export interface QuickEstimateData {
  pickup_postcode: string;
  delivery_postcode: string;
  pickup_country: string;
  delivery_country: string;
  cargo_weight_kg: number;
  vehicle_type_required?: string;
}

export interface OrderFormData {
  quote_id?: number;
  pickup_date?: string;
  delivery_date?: string;
  pickup_contact_name: string;
  pickup_contact_phone: string;
  delivery_contact_name: string;
  delivery_contact_phone: string;
  special_instructions?: string;
}
