import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/api';
import type { PagedResult, User } from '../../types';

interface UserState {
  items: User[];
  page: number;
  pageSize: number;
  total: number;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: UserState = {
  items: [],
  page: 1,
  pageSize: 10,
  total: 0,
  status: 'idle',
  error: null,
};

export const fetchUsers = createAsyncThunk(
  'users/fetch',
  async ({ page, pageSize }: { page: number; pageSize: number }) => {
    const response = await api.get<PagedResult<User>>('/users', {
      params: { page, pageSize },
    });
    return response.data;
  }
);

export const createUser = createAsyncThunk('users/create', async (name: string) => {
  const response = await api.post<User>('/users', { name });
  return response.data;
});

export const updateUser = createAsyncThunk(
  'users/update',
  async ({ id, name }: { id: string; name: string }) => {
    const response = await api.put<User>(`/users/${id}`, { name });
    return response.data;
  }
);

export const deleteUser = createAsyncThunk('users/delete', async (id: string) => {
  await api.delete(`/users/${id}`);
  return id;
});

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<PagedResult<User>>) => {
        state.status = 'idle';
        state.items = action.payload.items;
        state.page = action.payload.page;
        state.pageSize = action.payload.pageSize;
        state.total = action.payload.total;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Unable to load users';
      })
      .addCase(createUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.items.unshift(action.payload);
        state.total += 1;
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index >= 0) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.total = Math.max(0, state.total - 1);
      });
  },
});

export default usersSlice.reducer;
