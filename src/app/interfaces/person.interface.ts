export interface PersonInterface {
  uuid?: string;
  id: number;
  kind?: string;
  type?: string;
  first_name?: string;
  last_name?: string;
  status_type_id?: number;
  hash?: string;
  created_at?: string;
  updated_at?: string;

  //extra fields
  label?: string;
}
