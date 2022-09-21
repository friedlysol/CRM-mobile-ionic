export interface AddressApiInterface {
  address_id: number;
  address: string;
  address2: string;
  address_name: string;
  address_note: string;
  address_store_hours?: string;
  city: string;
  state: string;
  zip_code: string;
  latitude: string;
  longitude: string;
  hash: string;
}
