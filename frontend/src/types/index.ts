export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  company_name?: string;
  company_registration_number?: string;
  vat_number?: string;
  billing_address?: string;
  role: 'customer' | 'driver' | 'dispatcher' | 'admin';
  demo_user: boolean;
  created_at: string;
}

export interface Quote {
  id: number;
  quote_number: string;
  status: 'draft' | 'pending' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
  pickup_postcode: string;
  delivery_postcode: string;
  pickup_country: string;
  delivery_country: string;
  distance_km: number;
  estimated_duration_hours: number;
  vehicle_type_required: string;
  cargo_weight_kg: number;
  cargo_volume_cbm?: number;
  cargo_description: string;
  requires_tail_lift: boolean;
  requires_pallet_jack: boolean;
  is_hazardous: boolean;
  is_temperature_controlled: boolean;
  base_price: number;
  fuel_surcharge: number;
  distance_charge: number;
  additional_services_charge: number;
  vat_amount: number;
  total_price: number;
  valid_until: string;
  notes?: string;
  expired: boolean;
  domestic: boolean;
  created_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  status: 'pending' | 'confirmed' | 'assigned' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'on_hold' | 'failed_delivery';
  pickup_date?: string;
  delivery_date?: string;
  actual_pickup_date?: string;
  actual_delivery_date?: string;
  pickup_contact_name: string;
  pickup_contact_phone: string;
  delivery_contact_name: string;
  delivery_contact_phone: string;
  special_instructions?: string;
  tracking_number: string;
  tracking_url: string;
  proof_of_delivery?: string;
  driver_notes?: string;
  total_amount: number;
  paid: boolean;
  estimated_delivery?: string;
  created_at: string;
  quote?: Quote;
  vehicle?: Vehicle;
  route?: Route;
  payment?: Payment;
}

export interface Vehicle {
  id: number;
  name: string;
  vehicle_type: string;
  registration_number: string;
  max_weight_kg: number;
  max_volume_cbm: number;
  length_m: number;
  width_m: number;
  height_m: number;
  available: boolean;
  display_name: string;
  capacity_description: string;
}

export interface VehicleType {
  type: string;
  display_name: string;
  max_weight_kg: number;
  max_volume_cbm: number;
  typical_length_m: number;
  base_rate: number;
  rate_per_km: number;
  minimum_charge: number;
}

export interface Route {
  id: number;
  origin_postcode: string;
  destination_postcode: string;
  origin_country: string;
  destination_country: string;
  distance_km: number;
  estimated_duration_hours: number;
  actual_duration_hours?: number;
  fuel_cost: number;
  toll_cost: number;
  ferry_cost: number;
  total_route_cost: number;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  progress_percentage: number;
  eta?: string;
  domestic: boolean;
  requires_ferry: boolean;
}

export interface Payment {
  id: number;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'partially_refunded' | 'cancelled';
  payment_method?: string;
  invoice_number: string;
  paid_at?: string;
  refunded_at?: string;
  refund_amount?: number;
  created_at: string;
}

export interface QuoteEstimate {
  distance_km: number;
  estimated_duration_hours: number;
  base_price: number;
  fuel_surcharge: number;
  distance_charge: number;
  additional_services_charge: number;
  subtotal: number;
  vat_amount: number;
  total_price: number;
  breakdown: PriceBreakdownItem[];
}

export interface PriceBreakdownItem {
  description: string;
  amount: number;
}

export interface ShippingInfo {
  company: CompanyInfo;
  services: Service[];
  coverage: Coverage;
  regulations: Regulations;
}

export interface CompanyInfo {
  name: string;
  tagline: string;
  established: string;
  fleet_size: string;
  certifications: string[];
  contact: {
    phone: string;
    email: string;
    address: string;
  };
}

export interface Service {
  name: string;
  description: string;
  ideal_for: string;
}

export interface Coverage {
  uk: {
    coverage: string;
    zones: string[];
  };
  europe: {
    coverage: string;
    primary_routes: string[];
    extended_routes: string[];
  };
}

export interface Regulations {
  driver_hours: Record<string, string>;
  vehicle_regulations: Record<string, string>;
  environmental: Record<string, string>;
}
