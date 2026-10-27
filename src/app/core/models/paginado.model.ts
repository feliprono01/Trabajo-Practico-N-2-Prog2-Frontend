export interface Paginado<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
