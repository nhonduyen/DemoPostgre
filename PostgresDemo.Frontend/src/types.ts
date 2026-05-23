export interface User {
  id: string;
  name: string;
  username: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string | null;
}

export interface PagedResult<T> {
  page: number;
  pageSize: number;
  total: number;
  items: T[];
}
