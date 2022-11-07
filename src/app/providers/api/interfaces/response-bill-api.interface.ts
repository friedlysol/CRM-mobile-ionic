import { SyncApiInterface } from '@app/providers/api/interfaces/sync-api.interface';
import { FileApiInterface } from '@app/providers/api/interfaces/file-api.interface';

export interface ResponseBillApiInterface {
  response: {
    syncs: SyncApiInterface[];
    bill_entries: BillEntryApiInterface[];
    files: FileApiInterface[]
  };
}

export interface BillEntryApiInterface {
  id: number;
  bill_id: number;
  type_id: number;
  supplier_name: string;
  description: string;
  qty: number;
  price: number;
  tax_amount: number;
  total: number;
  transaction_number: string;
  reimbursement: number;
  approval_person_id: number;
  bill_status_type_id: number;
  previous_bill_status_type_id: number;
  incorrect_type_id: number;
  comment: string;
  hash: string;
  created_at: string;
  updated_at: string;
  table_name?:string;
  record_id?:string;

  //extra fields
  object_uuid?: string;
}
