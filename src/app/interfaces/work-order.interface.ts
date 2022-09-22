export interface WorkOrderInterface {
  address_id: number;
  address_uuid: string;
  assigned_techs_vendors: string | object;
  call_status: string;
  call_type: string;
  canceled_at: string;
  client: string;
  company_person_id: number;
  completed_at: string;
  confirmed_at: string;
  count_files: number;
  current_time_sheet_reason: number;
  customer_id: string;
  description: string;
  estimated_time: string;
  expected_completion_date: string;
  external_app_url: string;
  fax: string;
  hash: string;
  hazard_assessment: string | object;
  id: number;
  instruction: string;
  integration_info: string;
  is_deleted: number | boolean;
  ivr_button_label: string;
  ivr_button_url: string;
  ivr_from_store: string;
  ivr_instructions: string;
  ivr_number: string;
  ivr_number_forward: string;
  ivr_pin: string;
  link_person_wo_id: number;
  phone: string;
  pleatlink_approved: boolean;
  primary_technician: string;
  priority: string;
  purchase_orders: string | object;
  qb_info: string;
  received_date: string;
  required_asset_files: string | object;
  required_completion_code: number | boolean;
  required_labor_files: string | object;
  required_validate: string | object;
  required_work_order_files: string | object;
  required_work_order_signature: number | boolean;
  scheduled_date: string;
  site_issue_required: number | boolean;
  site_note: string;
  status: string;
  tech_status_type_id: number;
  trade_type_id: number;
  wo_type_id: number;
  work_order_id: number;
  work_order_number: string;

  //optional fields
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  tech_status?: string;
}