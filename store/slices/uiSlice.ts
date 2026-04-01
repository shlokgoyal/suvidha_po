import { createSlice } from '@reduxjs/toolkit';
import { fetchDistributorByNumber } from '@/store/thunks/distributorThunks';
import { fetchBrandsByDistributor } from '@/store/thunks/brandThunks';
import { fetchProductsByBrand } from '@/store/thunks/productThunks';
import { fetchAllPOs, fetchPOById, createPurchaseOrder } from '@/store/thunks/poThunks';

interface UIState {
  loading: {
    distributor: boolean;
    brands: boolean;
    products: boolean;
    pos: boolean;
    placingOrder: boolean;
  };
  errors: {
    distributor: string | null;
    brands: string | null;
    products: string | null;
    pos: string | null;
  };
}

const initialState: UIState = {
  loading: {
    distributor: false,
    brands: false,
    products: false,
    pos: false,
    placingOrder: false,
  },
  errors: {
    distributor: null,
    brands: null,
    products: null,
    pos: null,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    clearError(state, action: { payload: keyof UIState['errors'] }) {
      state.errors[action.payload] = null;
    },
  },
  extraReducers: (builder) => {
    // Distributor
    builder
      .addCase(fetchDistributorByNumber.pending, (state) => {
        state.loading.distributor = true;
        state.errors.distributor = null;
      })
      .addCase(fetchDistributorByNumber.fulfilled, (state) => {
        state.loading.distributor = false;
      })
      .addCase(fetchDistributorByNumber.rejected, (state, action) => {
        state.loading.distributor = false;
        state.errors.distributor = action.error.message ?? 'Failed to fetch distributor';
      });

    // Brands
    builder
      .addCase(fetchBrandsByDistributor.pending, (state) => {
        state.loading.brands = true;
        state.errors.brands = null;
      })
      .addCase(fetchBrandsByDistributor.fulfilled, (state) => {
        state.loading.brands = false;
      })
      .addCase(fetchBrandsByDistributor.rejected, (state, action) => {
        state.loading.brands = false;
        state.errors.brands = action.error.message ?? 'Failed to fetch brands';
      });

    // Products
    builder
      .addCase(fetchProductsByBrand.pending, (state) => {
        state.loading.products = true;
        state.errors.products = null;
      })
      .addCase(fetchProductsByBrand.fulfilled, (state) => {
        state.loading.products = false;
      })
      .addCase(fetchProductsByBrand.rejected, (state, action) => {
        state.loading.products = false;
        state.errors.products = action.error.message ?? 'Failed to fetch products';
      });

    // POs
    builder
      .addCase(fetchAllPOs.pending, (state) => {
        state.loading.pos = true;
        state.errors.pos = null;
      })
      .addCase(fetchAllPOs.fulfilled, (state) => {
        state.loading.pos = false;
      })
      .addCase(fetchAllPOs.rejected, (state, action) => {
        state.loading.pos = false;
        state.errors.pos = action.error.message ?? 'Failed to fetch orders';
      })
      .addCase(fetchPOById.pending, (state) => {
        state.loading.pos = true;
        state.errors.pos = null;
      })
      .addCase(fetchPOById.fulfilled, (state) => {
        state.loading.pos = false;
      })
      .addCase(fetchPOById.rejected, (state, action) => {
        state.loading.pos = false;
        state.errors.pos = action.error.message ?? 'Failed to fetch order';
      });

    // Place order
    builder
      .addCase(createPurchaseOrder.pending, (state) => {
        state.loading.placingOrder = true;
        state.errors.pos = null;
      })
      .addCase(createPurchaseOrder.fulfilled, (state) => {
        state.loading.placingOrder = false;
      })
      .addCase(createPurchaseOrder.rejected, (state, action) => {
        state.loading.placingOrder = false;
        state.errors.pos = action.error.message ?? 'Failed to place order';
      });
  },
});

export const { clearError } = uiSlice.actions;
export default uiSlice.reducer;
