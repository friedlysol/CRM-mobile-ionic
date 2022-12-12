export interface VehicleInterface {
  id: number;
  store_id: number;
  vehicle_number: string;
  vin: string;
  plate: string;
  hash: string;
  created_at?: string;
  updated_at?: string;
}
