export interface PurchaseOrderInterface {
  uuid?: string;
  id?: number;
  work_order_uuid?: string;
  purchase_order_number?: string;
  supplier_person_id?: number;
  supplier_person_name?: string;
  is_completes_job?: number;


  hash?: string;
  sync?: number;
  created_at?: string;
  updated_at?: string;

  //extra fields
  entries?: PurchaseOrderEntryInterface[];
  status?: string;
  work_order_number?: string;
}

export interface PurchaseOrderEntryInterface {
  uuid?: string;
  id?: number;
  purchase_order_uuid: string;
  purchase_order_id?: number;
  item_id?: number;
  description?: string;
  quantity: number;
  price?: number;
  total?: number;
  hash?: string;
  sync?: number;
  created_at?: string;
  updated_at?: string;
}
