export interface PaginationInterface {
  total: number;
  totalPages: number;
  page: number;
  limit: number;
  prev: boolean;
  next: boolean;
}
