export interface SupplyInterface {
  uuid?: string;
  id?: number;
  job_type_id?: number;
  route?: string;
  type?: string;
  type_id?: number;
  size?: number;
  quantity: number;
  comment?: string;
  acknowledgment?: number;
  shipping_date?: string;
  delivery_status?: string;
  technician_comment?: string;
  sync?: number;
  created_at: string;
  updated_at?: string;
}
