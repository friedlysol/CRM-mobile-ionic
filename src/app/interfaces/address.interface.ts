export interface AddressInterface {
  uuid?: string;
  id?: number;
  address: string;
  address2: string;
  address_name: string;
  address_note: string;
  address_store_hours: string | object;
  city: string;
  state: string;
  zip_code: string;
  latitude: string;
  longitude: string;
  hash: string;
  created_at?: string;
  updated_at?: string;
  sync?: number;
}
