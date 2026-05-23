import { configureStore } from '@reduxjs/toolkit';
import productsReducer from '../features/products/productSlice';
import usersReducer from '../features/users/userSlice';

export const store = configureStore({
  reducer: {
    users: usersReducer,
    products: productsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
