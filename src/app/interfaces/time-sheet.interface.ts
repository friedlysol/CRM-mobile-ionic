export interface TimeSheetInterface {
  uuid?: string;
  id?: number;
  type_id: number;
  vehicle_id?: number;
  start_at?: string;
  stop_at?: string;
  start_gps?: string;
  stop_gps?: string;
  description?: string;
  object_type: string;
  object_uuid: string;
  work_order_number?: string;
  changed_in_crm?: number;
  change_reason?: string;
  hash?: string;
  sync?: number;
  auto_close_at?: string;
  created_at?: string;
  updated_at?: string;

  //extra fields
  type?: string;
  time?: number;
}
