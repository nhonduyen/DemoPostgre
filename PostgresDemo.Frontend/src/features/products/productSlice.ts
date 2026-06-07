import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/api';
import type { PagedResult, Product } from '../../types';

interface ProductState {
  items: Product[];
  page: number;
  pageSize: number;
  total: number;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: ProductState = {
  items: [],
  page: 1,
  pageSize: 10,
  total: 0,
  status: 'idle',
  error: null,
};

export const fetchProducts = createAsyncThunk(
  'products/fetch',
  async ({ page, pageSize }: { page: number; pageSize: number }) => {
    const response = await api.get<PagedResult<Product>>('/products', {
      params: { page, pageSize },
    });
    return response.data;
  }
);

export const createProduct = createAsyncThunk(
  'products/create',
  async (payload: { name: string; price: number; description?: string }) => {
    const response = await api.post<Product>('/products', payload);
    return response.data;
  }
);

export const createProductsBulk = createAsyncThunk(
  'products/createBulk',
  async (payload: { products: Array<{ name: string; price: number; description?: string }> }) => {
    const response = await api.post<Product[]>('/products/bulk', payload);
    return response.data;
  }
);

export const updateProduct = createAsyncThunk(
  'products/update',
  async (payload: { id: string; name: string; price: number; description?: string }) => {
    const response = await api.put<Product>(`/products/${payload.id}`, {
      name: payload.name,
      price: payload.price,
      description: payload.description,
    });
    return response.data;
  }
);

export const deleteProduct = createAsyncThunk('products/delete', async (id: string) => {
  await api.delete(`/products/${id}`);
  return id;
});

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<PagedResult<Product>>) => {
        state.status = 'idle';
        state.items = action.payload.items;
        state.page = action.payload.page;
        state.pageSize = action.payload.pageSize;
        state.total = action.payload.total;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Unable to load products';
      })
      .addCase(createProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.items.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createProductsBulk.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.items = [...action.payload, ...state.items];
        state.total += action.payload.length;
      })
      .addCase(updateProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index >= 0) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.total = Math.max(0, state.total - 1);
      });
  },
});

export default productsSlice.reducer;
