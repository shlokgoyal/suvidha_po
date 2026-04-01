import { createAsyncThunk } from '@reduxjs/toolkit';
import { getDistributorByNumber } from '@/services/distributorService';

export const fetchDistributorByNumber = createAsyncThunk(
  'session/fetchDistributorByNumber',
  async (distNumber: string) => {
    const distributor = await getDistributorByNumber(distNumber);
    if (!distributor) {
      throw new Error('Distributor not found. Please check the number.');
    }
    return distributor;
  }
);
