export interface FileInterface {
  crc?: string;
  created_at?: string;
  description?: string;
  download_attempts?: number;
  gps_coords?: string;
  hash?: string;
  id?: number;
  is_deleted?: number | boolean;
  is_downloaded?: number | boolean;
  link_person_wo_id?: number;
  object_id?: number;
  object_type: string;
  object_uuid: string;
  path?: string;
  sync?: number;
  thumbnail?: string;
  type: string;
  type_id: number;
  updated_at?: string;
  uuid?: string;
}
