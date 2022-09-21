export interface AccountInterface {
  person_id: number;
  username: string;
  phone?: string;
  token: string;
  is_active?: number;
  api_url?: string;
  api_fallback_url?: string;
  imei?: string;
  device_id?: string;
  device_token?: string;
  device_token_type?: string;
  default_country_prefix?: string;
  created_at?: string;
  update_at?: string;
}
