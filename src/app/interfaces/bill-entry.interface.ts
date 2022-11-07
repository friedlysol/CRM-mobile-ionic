export interface BillEntryInterface {
  id?: number;
  uuid?: string;
  bill_id?: number;
  bill_status_type_id?: number;
  type_id?: number;
  incorrect_type_id?: number;
  previous_bill_status_type_id?: number;
  supplier_person_id?: number;
  supplier_name?: string;
  approval_person_id?: number;
  link_person_wo_id?: number;
  object_type?: string;
  object_uuid?: string;
  step_name?: string;
  desc?: string;
  subcontractor_name?: string;
  subcontractor_phone?: string;
  qty?: number;
  unit_down?: number;
  unit?: string;
  men?: number;
  hrs?: number;
  price?: number;
  total?: number;
  item_code?: string;
  item_id?: number;
  item_lead_time_type_id?: number;
  labor_rate_type_id?: number;
  trade_type_id?: number;
  from_inventory?: number;
  tax_amount?: number;
  transaction_number?: string;
  reimbursement?: number;
  comment?: string;
  hash?: string;
  sync?: number;
  ready_at?: string;
  created_at?: string;
  updated_at?: string;

  //extra fields
  file_path?: string;
  file_thumbnail?: string;
  type_key?: string;
  type_value?: string;
  is_file?: number | boolean;
  incorrect_bill?: string;
}

export interface BillEntryFiltersInterface {
  query?: string;
  reimbursement?: boolean | number;
  date_from?: string;
  date_to?: string;
  is_approved?: boolean | number;
  is_photo?: boolean | number;
}
