export interface User {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}

export interface PagedResult<T> {
  page: number;
  pageSize: number;
  total: number;
  items: T[];
}
