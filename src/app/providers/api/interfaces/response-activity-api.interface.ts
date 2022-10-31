import { SyncApiInterface } from '@app/providers/api/interfaces/sync-api.interface';
import { FileInterface } from '@app/interfaces/file.interface';

export interface ResponseActivityApiInterface {
  response: {
    activities_syncs?: SyncApiInterface[]; //api v2
    confirmations_syncs?: SyncApiInterface[]; //api v2
    syncs?: SyncApiInterface[]; //api v1
    confirmationSyncs?: SyncApiInterface[]; //api v1
    activities: ActivityApiInterface[];
    files: FileInterface[]
  };
}

export interface ActivityApiInterface {
  id: number;
  person_id: number;
  creator_person_id: number;
  table_name: string;
  record_id: number;
  subject: string;
  description: string;
  hot: boolean;
  hot_type_id: number;
  type: string;
  address_id: number;
  address: string;
  address2: string;
  address_name: string;
  city: string;
  state: string;
  zip_code: string;
  latitude: string;
  longitude: string;
  work_order_number: string;
  customer_name: string;
  customer_ids: string;
  number_of_repetitions: number;
  view_type_id: number;
  interval_type_id: number;
  hash: string;
  completed: number;
  completed_at: string;
  created_at: string;
  updated_at: string;
}
