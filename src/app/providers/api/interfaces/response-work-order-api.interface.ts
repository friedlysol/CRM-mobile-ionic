import { SyncApiInterface } from '@app/providers/api/interfaces/sync-api.interface';
import { AddressApiInterface } from '@app/providers/api/interfaces/address-api.interface';

export interface ResponseWorkOrderApiInterface {
  response: {
    addresses: AddressApiInterface[];
    syncs: SyncApiInterface[];
    workorders: WorkOrderApiInterface[];
  };
}

export interface WorkOrderApiInterface {
  address_id: number;
  address_uuid?: string;
  assets_enabled: number;
  assigned_vendors: AssignedVendorApiInterface[];
  billing_company_person_id: string;
  call_status: string;
  call_type: string;
  canceled_at: string;
  client: string;
  company_person_id: number;
  completed_at: string;
  confirmed_at:  string;
  count_files: number;
  current_time_sheet_reason: number;
  customer_id: string;
  created_at: string;
  description: string;
  estimated_time: string;
  expected_completion_date: string;
  external_app_url: string;
  fax: string;
  hash: string;
  hazard_assessment: object;
  id: number;
  instructions: string;
  integration_info: string;
  is_deleted: boolean | number;
  ivr_button_label: string;
  ivr_button_url: string;
  ivr_from_store: string;
  ivr_instructions: string;
  ivr_number: string;
  ivr_number_forward: string;
  ivr_pin: string;
  latitude: string;
  link_person_wo_id: number;
  longitude: string;
  original_tech_status_type_id: number;
  phone: string;
  pleatlink_approved: boolean;
  primary_technician: string;
  priority: string;
  purchase_orders: PurchaseOrderApiInterface[];
  qb_info: string;
  received_date: string;
  required_asset_files: object;
  required_completion_code: number;
  required_labor_files: object;
  required_validate: object;
  required_work_order_files: object;
  required_work_order_signature: number;
  scheduled_date: string;
  site_issue_required: number;
  site_note: string;
  state: string;
  status: string;
  store_number: string;
  tech_status_type_id: number;
  trade_type_id: number;
  wo_status: string;
  wo_type_id: number;
  work_order_id: number;
  work_order_number: string;
}

export interface AssignedVendorApiInterface {
  estimated_time: string;
  name: string;
  scheduled_date: string;
  tech_status: string;
}

export interface PurchaseOrderApiInterface {
  assigned_vendor: string;
  comment: string;
  date: string;
  eta_date: string;
  purchase_order_id: string;
  purchase_order_number: string;
  ship_to: string;
  status: string;
  supplier: string;
}
