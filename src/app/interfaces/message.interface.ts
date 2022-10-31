export interface MessageInterface {
  uuid?: string;
  id?: number;
  person_id: number;
  creator_person_id: number;
  subject: string;
  description: string;
  hot?: boolean;
  object_type: string;
  object_uuid?: string;
  object_id?: number;
  address_id?: number;
  address_name?: string;
  customer_ids?: string;
  type?: string;
  work_order_number?: string;
  client_and_address?: any;
  view_type_id?: number;
  interval_type_id?: number;
  limit_of_repetitions?: number;
  hash?: string;
  sync?: number;
  completed: number;
  completed_at?: string
  created_at?: string;
  updated_at?: string;

  //extra fields
  address?: string;
  city?: string;
  client?: string;
  from_person_first_name?: string;
  from_person_id?: number;
  from_person_last_name?: string;
  interval_type?: string;
  person_first_name?: string;
  person_last_name?: string;
  repeat_updated_at?: string;
  start_interval_date?: string;
  state?: string;
  view_type?: string;
  work_order_address?: string;
  work_order_city?: string;
  work_order_state?: string;
  work_order_zip_code?: string;
  zip_code?: string;
  total_photos?: number;
}

export interface MessageRepeat {
  uuid?: string;
  message_id?: number;
  customer_id?: string;
  number_of_repetitions: number;
  created_at?: string;
  updated_at?: string;
}
