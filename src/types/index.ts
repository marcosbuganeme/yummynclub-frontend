export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: 'client' | 'partner' | 'admin';
  email_verified_at: string | null;
  phone_verified_at: string | null;
}

export interface Plan {
  id: number;
  name: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  interval_count: number;
  description: string | null;
  features: string[] | null;
  stripe_price_id: string | null;
}

export interface Subscription {
  id: number;
  stripe_id: string;
  stripe_status: string;
  stripe_price: string;
  quantity: number;
  trial_ends_at: string | null;
  ends_at: string | null;
  created_at: string;
}

export interface Partner {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  logo_url: string | null;
  validation_rules: Record<string, any> | null;
}

export interface Validation {
  id: number;
  user_id: number;
  partner_id: number;
  subscription_id: number | null;
  validation_type: 'qr_code' | 'totp' | 'cpf';
  status: 'success' | 'failed' | 'expired';
  validated_at: string;
  partner?: Partner;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

