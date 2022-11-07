export interface FileApiInterface {
  id: number;
  link_person_wo_id: number;
  type: string;
  type_id: number;
  filename: string;
  table_name: string;
  record_id: number;
  gps_location: string;
  description: string;
  crc: string;
  link: string;
  hash: string;
  created_at: string;
  updated_at: string;

  //extra fields
  object_type?: string;
  object_uuid?: string;
  object_id?: number;
}
