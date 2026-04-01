import { createAsyncThunk } from '@reduxjs/toolkit';
import { getProductsByBrand } from '@/services/productService';

export const fetchProductsByBrand = createAsyncThunk(
  'session/fetchProductsByBrand',
  async (brandId: string) => {
    return await getProductsByBrand(brandId);
  }
);
