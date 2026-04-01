import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Brand, Distributor, Product, PurchaseOrder } from '@/types';
import { fetchDistributorByNumber } from '@/store/thunks/distributorThunks';
import { fetchBrandsByDistributor } from '@/store/thunks/brandThunks';
import { fetchProductsByBrand } from '@/store/thunks/productThunks';
import { fetchAllPOs, fetchPOById, createPurchaseOrder } from '@/store/thunks/poThunks';

interface SessionState {
  distributor: Distributor | null;
  brands: Brand[];
  brandProducts: Record<string, Product[]>;
  allPOs: PurchaseOrder[];
  currentPO: PurchaseOrder | null;
}

const initialState: SessionState = {
  distributor: null,
  brands: [],
  brandProducts: {},
  allPOs: [],
  currentPO: null,
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    clearSession(state) {
      state.distributor = null;
      state.brands = [];
      state.brandProducts = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDistributorByNumber.fulfilled, (state, action) => {
        state.distributor = action.payload;
      })
      .addCase(fetchBrandsByDistributor.fulfilled, (state, action) => {
        state.brands = action.payload;
      })
      .addCase(fetchProductsByBrand.fulfilled, (state, action) => {
        state.brandProducts[action.meta.arg] = action.payload;
      })
      .addCase(fetchAllPOs.fulfilled, (state, action) => {
        state.allPOs = action.payload;
      })
      .addCase(fetchPOById.fulfilled, (state, action) => {
        state.currentPO = action.payload;
      })
      .addCase(createPurchaseOrder.fulfilled, (state, action) => {
        state.currentPO = action.payload;
        state.allPOs.unshift(action.payload);
      });
  },
});

export const { clearSession } = sessionSlice.actions;
export default sessionSlice.reducer;
