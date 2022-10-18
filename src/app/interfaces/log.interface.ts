export interface LogInterface {
  id?: number;
  type: string;
  message: string;
  stack?: string;
  data?: string;
  created_at?: string;
}
