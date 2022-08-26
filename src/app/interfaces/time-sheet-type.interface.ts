export interface TimeSheetTypeInterface {
  id: number;
  time_sheet_reason_id: number;
  reason_type_id: number;
  name: string;
  is_description_required: number;
  is_work_order_related: number;
}
