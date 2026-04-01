import { createAsyncThunk } from '@reduxjs/toolkit';
import * as poService from '@/services/poService';
import type { CartItem, Distributor } from '@/types';

export const createPurchaseOrder = createAsyncThunk(
  'session/createPurchaseOrder',
  async ({
    cartItems,
    distributor,
    martId,
  }: {
    cartItems: CartItem[];
    distributor: Distributor;
    martId: string;
  }) => {
    return await poService.createPO(cartItems, distributor, martId);
  }
);

export const fetchAllPOs = createAsyncThunk(
  'session/fetchAllPOs',
  async (martId: string) => {
    return await poService.getAllPOs(martId);
  }
);

export const fetchPOById = createAsyncThunk(
  'session/fetchPOById',
  async (poId: string) => {
    return await poService.getPOById(poId);
  }
);
