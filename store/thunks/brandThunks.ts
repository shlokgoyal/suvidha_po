import { createAsyncThunk } from '@reduxjs/toolkit';
import { getBrandsByDistributor } from '@/services/brandService';

export const fetchBrandsByDistributor = createAsyncThunk(
  'session/fetchBrandsByDistributor',
  async (distributorId: string) => {
    return await getBrandsByDistributor(distributorId);
  }
);
