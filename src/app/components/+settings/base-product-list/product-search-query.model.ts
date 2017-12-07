export interface ProductSearchQueryParams {
  search?: string;
  page: number;
  page_size: number;
  ordering: string;
  status?: string;
  exclude_status?: string;
  category?: number;
}
