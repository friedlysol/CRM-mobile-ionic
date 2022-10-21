export interface MessageInterface {
  uuid?: string;
  id?: number;
  person_id: number;
  creator_person_id: number;
  subject: string;
  description: string;
  hot?: boolean;
  object_type: string;
  object_uuid: string;
  object_id?: number;
  address_id?: number;
  address_name?: string;
  customer_ids?: string;
  type?: string;
  work_order_number?: string;
  client_and_address?: string;
  view_type_id?: number;
  interval_type_id?: number;
  limit_of_repetitions?: number;
  hash?: string;
  sync?: number;
  completed: boolean
  completed_at?: string
  created_at?: string;
  updated_at?: string;
}
