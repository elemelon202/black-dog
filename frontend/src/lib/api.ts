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

  assignDriver: (vehicleId: number, driverId: number) =>
    api.post(`/vehicles/${vehicleId}/assign_driver`, { driver_id: driverId }),
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
  pickup_address_line1?: string;
  pickup_address_line2?: string;
  pickup_city?: string;
  pickup_state?: string;
  pickup_company_name?: string;
  delivery_address_line1?: string;
  delivery_address_line2?: string;
  delivery_city?: string;
  delivery_state?: string;
  delivery_company_name?: string;
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

export interface RouteInstructionsData {
  route_instructions?: string;
  pickup_instructions?: string;
  delivery_instructions?: string;
  estimated_arrival_time?: string;
}

// Admin endpoints
export const adminApi = {
  // Orders
  getOrders: (params?: { page?: number; per_page?: number; status?: string; paid?: string }) =>
    api.get('/admin/orders', { params }),

  getOrder: (id: number) => api.get(`/admin/orders/${id}`),

  updateOrder: (id: number, data: Partial<OrderFormData & RouteInstructionsData>) =>
    api.patch(`/admin/orders/${id}`, { order: data }),

  updateRouteInstructions: (id: number, data: RouteInstructionsData) =>
    api.patch(`/admin/orders/${id}`, { order: data }),

  updateOrderStatus: (id: number, status: string, data?: { reason?: string; proof_of_delivery?: string; driver_notes?: string }) =>
    api.post(`/admin/orders/${id}/update_status`, { status, ...data }),

  assignDriver: (orderId: number, vehicleId: number) =>
    api.post(`/admin/orders/${orderId}/assign_driver`, { vehicle_id: vehicleId }),

  getOrderStats: () => api.get('/admin/orders/stats'),

  // Users
  getUsers: (params?: { page?: number; per_page?: number; role?: string }) =>
    api.get('/admin/users', { params }),

  getUser: (id: number) => api.get(`/admin/users/${id}`),

  createUser: (data: { email: string; password: string; first_name: string; last_name: string; phone: string; role: string }) =>
    api.post('/admin/users', { user: data }),

  updateUser: (id: number, data: Partial<{ email: string; first_name: string; last_name: string; phone: string; role: string }>) =>
    api.patch(`/admin/users/${id}`, { user: data }),

  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),

  getDrivers: () => api.get('/admin/users/drivers'),

  getCustomers: (params?: { page?: number; per_page?: number }) =>
    api.get('/admin/users/customers', { params }),

  updateRunSheet: (orderId: number, data: RunSheetData) =>
    api.patch(`/admin/orders/${orderId}/update_run_sheet`, { order: data }),
};

export interface RunSheetData {
  route_instructions?: string;
  pickup_instructions?: string;
  delivery_instructions?: string;
  estimated_departure_time?: string;
  estimated_arrival_time?: string;
  estimated_rest_times?: string;
}

export interface VehicleCheckData {
  oil_level: boolean;
  coolant_level: boolean;
  tyre_condition: boolean;
  lights_working: boolean;
  brakes_working: boolean;
  mirrors_clean: boolean;
  windscreen_condition: boolean;
  fuel_level: number;
  mileage: number;
  notes?: string;
  defects_found: boolean;
  defects_description?: string;
}

export interface JourneyEventData {
  event_type: string;
  notes?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
}

// Driver Portal API
export const driverApi = {
  // Dashboard
  getDashboard: () => api.get('/driver/dashboard'),

  // Orders
  getOrders: () => api.get('/driver/orders'),
  getOrder: (id: number) => api.get(`/driver/orders/${id}`),
  getRunSheet: (orderId: number) => api.get(`/driver/orders/${orderId}/run_sheet`),
  updateStatus: (orderId: number, status: string, data?: { driver_notes?: string; signature_data?: string; signature_name?: string }) =>
    api.post(`/driver/orders/${orderId}/update_status`, { status, ...data }),
  recordSignature: (orderId: number, signatureData: string, signatureName: string) =>
    api.post(`/driver/orders/${orderId}/record_signature`, { signature_data: signatureData, signature_name: signatureName }),

  // Journey Events
  getJourneyEvents: (orderId: number) => api.get(`/driver/orders/${orderId}/journey_events`),
  createJourneyEvent: (orderId: number, data: JourneyEventData) =>
    api.post(`/driver/orders/${orderId}/journey_events`, { journey_event: data }),
  notifyCollection: (orderId: number, data?: { notes?: string; location?: string; latitude?: number; longitude?: number }) =>
    api.post(`/driver/orders/${orderId}/journey_events/notify_collection`, data),
  notifyLoaded: (orderId: number, data?: { notes?: string; location?: string }) =>
    api.post(`/driver/orders/${orderId}/journey_events/notify_loaded`, data),
  notifyDeparted: (orderId: number, data?: { notes?: string; location?: string }) =>
    api.post(`/driver/orders/${orderId}/journey_events/notify_departed`, data),
  notifyDeliveryArrival: (orderId: number, data?: { notes?: string; location?: string; latitude?: number; longitude?: number }) =>
    api.post(`/driver/orders/${orderId}/journey_events/notify_delivery_arrival`, data),
  notifyDelivered: (orderId: number, data?: { notes?: string }) =>
    api.post(`/driver/orders/${orderId}/journey_events/notify_delivered`, data),
  reportProblem: (orderId: number, notes: string, location?: string, latitude?: number, longitude?: number) =>
    api.post(`/driver/orders/${orderId}/journey_events/report_problem`, { notes, location, latitude, longitude }),
  reportEmergency: (orderId: number, notes: string, location?: string, latitude?: number, longitude?: number) =>
    api.post(`/driver/orders/${orderId}/journey_events/report_emergency`, { notes, location, latitude, longitude }),
  startRestBreak: (orderId: number, data?: { notes?: string; location?: string }) =>
    api.post(`/driver/orders/${orderId}/journey_events/start_rest_break`, data),
  endRestBreak: (orderId: number, data?: { notes?: string; location?: string }) =>
    api.post(`/driver/orders/${orderId}/journey_events/end_rest_break`, data),

  // Vehicle Checks
  getVehicleChecks: () => api.get('/driver/vehicle_checks'),
  getTodaysChecks: () => api.get('/driver/vehicle_checks/todays_checks'),
  createVehicleCheck: (data: VehicleCheckData) =>
    api.post('/driver/vehicle_checks', { vehicle_check: data }),
  preTrip: (data: VehicleCheckData) =>
    api.post('/driver/vehicle_checks/pre_trip', { vehicle_check: data }),
  postTrip: (data: VehicleCheckData) =>
    api.post('/driver/vehicle_checks/post_trip', { vehicle_check: data }),
};

// Finance API
export interface JobCostData {
  fuel_cost?: number;
  tolls_cost?: number;
  ferry_cost?: number;
  tunnel_cost?: number;
  accommodation_cost?: number;
  food_allowance?: number;
  parking_cost?: number;
  driver_allowance?: number;
  other_costs?: number;
  other_costs_description?: string;
  notes?: string;
}

export interface TravelBookingData {
  booking_type: string;
  provider?: string;
  reference_number?: string;
  departure_datetime?: string;
  arrival_datetime?: string;
  departure_location?: string;
  arrival_location?: string;
  vehicle_type?: string;
  passengers?: number;
  cost?: number;
  currency?: string;
  status?: string;
  confirmation_number?: string;
  booking_url?: string;
  notes?: string;
}

export interface StaffSalaryData {
  user_id: number;
  pay_period_start: string;
  pay_period_end: string;
  base_salary?: number;
  hourly_rate?: number;
  hours_worked?: number;
  overtime_hours?: number;
  overtime_rate?: number;
  bonus?: number;
  mileage_allowance?: number;
  subsistence_allowance?: number;
  tax?: number;
  national_insurance?: number;
  pension_employee?: number;
  pension_employer?: number;
  other_deductions?: number;
  deductions_notes?: string;
  payment_date?: string;
  notes?: string;
}

export interface BusinessExpenseData {
  category: string;
  description: string;
  amount: number;
  expense_date: string;
  vendor?: string;
  invoice_number?: string;
  receipt_reference?: string;
  payment_method?: string;
  notes?: string;
  recurring?: boolean;
  recurring_period?: string;
  vat_reclaimable?: boolean;
  vat_amount?: number;
}

export const financeApi = {
  // Overview
  getOverview: (params?: { start_date?: string; end_date?: string }) =>
    api.get('/admin/finances/overview', { params }),

  // Job Profits
  getJobProfits: (params?: { page?: number; per_page?: number; status?: string; start_date?: string; end_date?: string }) =>
    api.get('/admin/finances/job_profits', { params }),

  // Job Costs
  getJobCost: (orderId: number) => api.get(`/admin/orders/${orderId}/job_cost`),
  createJobCost: (orderId: number, data: JobCostData) =>
    api.post(`/admin/orders/${orderId}/job_cost`, { job_cost: data }),
  updateJobCost: (orderId: number, data: JobCostData) =>
    api.patch(`/admin/orders/${orderId}/job_cost`, { job_cost: data }),
  deleteJobCost: (orderId: number) => api.delete(`/admin/orders/${orderId}/job_cost`),

  // Travel Bookings
  getTravelBookings: (orderId: number) => api.get(`/admin/orders/${orderId}/travel_bookings`),
  createTravelBooking: (orderId: number, data: TravelBookingData) =>
    api.post(`/admin/orders/${orderId}/travel_bookings`, { travel_booking: data }),
  updateTravelBooking: (orderId: number, bookingId: number, data: TravelBookingData) =>
    api.patch(`/admin/orders/${orderId}/travel_bookings/${bookingId}`, { travel_booking: data }),
  deleteTravelBooking: (orderId: number, bookingId: number) =>
    api.delete(`/admin/orders/${orderId}/travel_bookings/${bookingId}`),
  getUpcomingBookings: () => api.get('/admin/travel_bookings/upcoming'),
  getProviders: () => api.get('/admin/travel_bookings/providers'),

  // Staff Salaries
  getSalaries: (params?: { user_id?: number; status?: string; period?: string }) =>
    api.get('/admin/staff_salaries', { params }),
  getSalary: (id: number) => api.get(`/admin/staff_salaries/${id}`),
  createSalary: (data: StaffSalaryData) =>
    api.post('/admin/staff_salaries', { staff_salary: data }),
  updateSalary: (id: number, data: Partial<StaffSalaryData>) =>
    api.patch(`/admin/staff_salaries/${id}`, { staff_salary: data }),
  deleteSalary: (id: number) => api.delete(`/admin/staff_salaries/${id}`),
  approveSalary: (id: number) => api.post(`/admin/staff_salaries/${id}/approve`),
  markSalaryPaid: (id: number) => api.post(`/admin/staff_salaries/${id}/mark_paid`),
  getStaffList: () => api.get('/admin/staff_salaries/staff_list'),

  // Business Expenses
  getExpenses: (params?: { category?: string; pending?: boolean; approved?: boolean; month?: string; recurring?: boolean }) =>
    api.get('/admin/business_expenses', { params }),
  getExpense: (id: number) => api.get(`/admin/business_expenses/${id}`),
  createExpense: (data: BusinessExpenseData) =>
    api.post('/admin/business_expenses', { business_expense: data }),
  updateExpense: (id: number, data: Partial<BusinessExpenseData>) =>
    api.patch(`/admin/business_expenses/${id}`, { business_expense: data }),
  deleteExpense: (id: number) => api.delete(`/admin/business_expenses/${id}`),
  approveExpense: (id: number) => api.post(`/admin/business_expenses/${id}/approve`),
  getCategories: () => api.get('/admin/business_expenses/categories'),
};

// HR API
export interface HrEmployee {
  id: number;
  employee_id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  has_hr_folder: boolean;
  documents_count: number;
}

export interface HrDocument {
  name: string;
  path: string;
  category: string;
  document_type: string;
  size: number;
  last_modified: string;
}

export interface HrPayslip {
  filename: string;
  employee_id: number;
  employee_name: string;
  created_at: string;
}

export interface HrPayslipMonth {
  period: string;
  display_name: string;
  payslip_count: number;
  payslips: HrPayslip[];
}

export const hrApi = {
  // Summary
  getSummary: () => api.get('/admin/hr/summary'),

  // Employees
  getEmployees: () => api.get('/admin/hr/employees'),
  getEmployeeFiles: (employeeId: number) => api.get(`/admin/hr/employees/${employeeId}/files`),
  getDocument: (employeeId: number, documentType: string) =>
    api.get(`/admin/hr/employees/${employeeId}/documents/${documentType}`),
  downloadDocument: (employeeId: number, documentType: string) =>
    api.get(`/admin/hr/employees/${employeeId}/documents/${documentType}/download`, { responseType: 'blob' }),
  regenerateEmployeeFiles: (employeeId: number) =>
    api.post(`/admin/hr/employees/${employeeId}/regenerate`),

  // Payslips
  getPayslips: () => api.get('/admin/hr/payslips'),
  getPayslip: (period: string, employeeId: number) =>
    api.get(`/admin/hr/payslips/${period}/${employeeId}`),
  generatePayslips: (period?: string) =>
    api.post('/admin/hr/payslips/generate', { period }),
};
