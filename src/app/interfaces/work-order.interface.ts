export interface WorkOrderInterface {
  uuid?: string;
  address_id: number;
  address_uuid: string;
  assigned_techs_vendors: string | object;
  call_status: string;
  call_type: string;
  canceled_at: string;
  client: string;
  company_person_id: number;
  completed_at: string;
  conditions_comment?: string;
  conditions_type_id?: number;
  confirmed_at: string;
  count_files: number;
  covered_area_comment?: string;
  covered_area_type_id?: number;
  current_time_sheet_reason: number;
  customer_id: string;
  description: string;
  estimated_install_time?: number;
  estimated_time: string;
  expected_completion_date: string;
  exterior_comment?: string;
  exterior_type_id?: number;
  external_app_url: string;
  fax: string;
  foundation_comment?: string;
  foundation_type_id?: number;
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
  job_type?: string;
  link_person_wo_id: number;
  payment_capture?: string;
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
  structure_comment?: string;
  structure_type_id?: number;
  tech_status_type_id: number;
  trade_type_id: number;
  wo_type_id: number;
  wo_type?: string;
  work_order_id: number;
  work_order_number: string;

  //extra fields
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  tech_status?: string;
  label?: string;
}
