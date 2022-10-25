export interface TechStatusInterface {
  id: number;
  time_sheet_reason_type_id: number;
  key: string;
  name: string;
  description_required: boolean;
  use_vehicle: boolean;
  start_after_stop: boolean;
  created_at: string;
  updated_at: string;
}
