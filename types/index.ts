export type POStatus = 'ordered' | 'in_process' | 'completed';

export interface Distributor {
  id: string;
  dist_number: string;
  name: string;
  phone?: string;
}

export interface Brand {
  id: string;
  distributor_id: string;
  name: string;
  logo_url?: string;
}

export interface Product {
  id: string;
  brand_id: string;
  name: string;
  sku?: string;
  unit: string;
  price: number;
  image_url?: string;
  is_active: boolean;
}

export interface CartItem {
  product: Product;
  brand: Brand;
  quantity: number;
}

export interface POItem {
  id: string;
  po_id: string;
  product: Product;
  brand: Brand;
  quantity: number;
  unit_price: number;
}

export interface PurchaseOrder {
  id: string;
  distributor: Distributor;
  status: POStatus;
  created_at: string;
  items: POItem[];
}

export interface BrandSection {
  brand: Brand;
  data: (CartItem | POItem)[];
}
