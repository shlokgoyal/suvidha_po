# Suvidha PO — Implementation Plan

## App Overview

A mobile app for mart owners to place purchase orders with distributors.

**Core Flow:**
1. Enter distributor number → see all brands that distributor carries
2. Browse each brand's own product catalogue → add products to cart
3. Review cart (grouped by brand) → place order
4. View all past Purchase Orders in the PO menu (filtered by status)
5. Drill into any PO to see products listed brand-by-brand

---

## Data Relationships

```
Distributor (1)
    └── Brand A (many)          ← each brand belongs to one distributor
    │       └── Product 1       ← each brand has its own set of products
    │       └── Product 2
    │       └── Product 3
    └── Brand B
            └── Product 4
            └── Product 5

Purchase Order (1)
    └── PO Item (many)
            ├── brand_id        ← denormalized for fast grouping
            ├── product_id
            ├── quantity
            └── unit_price
```

> Every brand has its own distinct products. Products are scoped to a brand —
> no product is shared across brands.

---

## Screen Map

```
(Tab 1) Home
  └── Enter distributor number
        └── Brand Listing                    /distributor/[id]/brands
              └── Brand Detail / Products    /distributor/[id]/brand/[brandId]
                    └── [CartFAB]
                          └── Cart           /cart
                                └── Order Placed → Order Detail

(Tab 2) Orders (PO Menu)
  └── PO List (filter: All | Ordered | In Process | Completed)
        └── Order Detail                     /orders/[poId]
              └── Products listed brand-by-brand
```

---

## File Structure

```
suvidha_po/
│
├── app/                                  # Expo Router — screens
│   ├── _layout.tsx                       # Root: Redux Provider + NativeWind
│   ├── (tabs)/
│   │   ├── _layout.tsx                   # Tab bar (Home + Orders)
│   │   ├── index.tsx                     # Home: distributor number entry
│   │   └── orders.tsx                    # PO menu: list of all past orders
│   ├── distributor/
│   │   └── [id]/
│   │       ├── brands.tsx                # All brands for this distributor
│   │       └── brand/
│   │           └── [brandId].tsx         # Products for ONE brand
│   ├── cart.tsx                          # Cart review (grouped by brand)
│   └── orders/
│       └── [poId].tsx                    # Single PO detail (brand-wise)
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── StatusBadge.tsx               # ordered=amber, in_process=blue, completed=green
│   │   ├── Card.tsx
│   │   ├── EmptyState.tsx
│   │   └── LoadingSpinner.tsx
│   ├── distributor/
│   │   └── DistributorSearchForm.tsx     # react-hook-form input + validation
│   ├── brand/
│   │   ├── BrandCard.tsx                 # Logo, name, product count, chevron
│   │   └── BrandSectionHeader.tsx        # Used in SectionList for Cart + Order Detail
│   ├── product/
│   │   ├── ProductRow.tsx                # Name, SKU, price, unit
│   │   └── QuantitySelector.tsx          # +/- stepper, wired to cartSlice
│   ├── cart/
│   │   ├── CartFAB.tsx                   # Floating button with item count badge
│   │   ├── CartItemRow.tsx               # Product row inside cart SectionList
│   │   └── OrderSummary.tsx              # Total items + grand total
│   └── orders/
│       ├── POCard.tsx                    # Summary card in PO list
│       ├── POStatusFilterTabs.tsx        # All | Ordered | In Process | Completed
│       └── OrderItemRow.tsx              # Product row inside order detail SectionList
│
├── store/
│   ├── index.ts                          # configureStore, persistStore, RootState type
│   ├── slices/
│   │   ├── sessionSlice.ts               # { distributor: Distributor | null }
│   │   ├── cartSlice.ts                  # { items: CartItem[], distributorId: string }
│   │   └── uiSlice.ts                    # { loading: {}, errors: {} }
│   └── thunks/
│       ├── distributorThunks.ts          # fetchDistributorByNumber
│       ├── brandThunks.ts                # fetchBrandsByDistributor
│       ├── productThunks.ts              # fetchProductsByBrand
│       └── poThunks.ts                   # createPurchaseOrder, fetchAllPOs, fetchPOById
│
├── services/
│   ├── firebase.ts                       # initializeApp, getFirestore
│   ├── distributorService.ts             # Firestore query: dist_number == input
│   ├── brandService.ts                   # Firestore query: distributor_id == id
│   ├── productService.ts                 # Firestore query: brand_id == id, is_active == true
│   └── poService.ts                      # Firestore add/get for purchase_orders + po_items
│
├── types/
│   └── index.ts                          # All shared TypeScript interfaces
│
├── constants/
│   ├── colors.ts                         # Design tokens (primary, status colors)
│   └── config.ts                         # Firebase config (reads from env)
│
├── utils/
│   ├── groupByBrand.ts                   # POItem[] → { brand: Brand, items: POItem[] }[]
│   ├── formatCurrency.ts                 # formatCurrency(1500) → "₹1,500"
│   └── formatDate.ts                     # Firestore Timestamp → "31 Mar 2026"
│
├── TECHSTACK.md                          # Tech stack with version numbers
├── PLAN.md                               # This file
├── app.json                              # Expo config
├── tailwind.config.js
├── babel.config.js
├── tsconfig.json
└── .env                                  # FIREBASE_API_KEY etc (not committed)
```

---

## TypeScript Types

```typescript
// types/index.ts

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
  brand_id: string;       // each product belongs to exactly one brand
  name: string;
  sku?: string;
  unit: string;
  price: number;
  image_url?: string;
  is_active: boolean;
}

export interface CartItem {
  product: Product;
  brand: Brand;           // carried along so cart can group by brand
  quantity: number;
}

export interface POItem {
  id: string;
  po_id: string;
  product: Product;
  brand: Brand;           // denormalized — enables brand-wise grouping without joins
  quantity: number;
  unit_price: number;     // price locked at time of order
}

export interface PurchaseOrder {
  id: string;
  distributor: Distributor;
  status: POStatus;
  created_at: string;     // ISO string after Firestore Timestamp conversion
  items: POItem[];
}

// Grouped structure used by SectionList in Cart and Order Detail
export interface BrandSection {
  brand: Brand;
  data: (CartItem | POItem)[];
}
```

---

## Redux Store Design

### cartSlice

```typescript
// store/slices/cartSlice.ts

interface CartState {
  distributorId: string | null;
  items: CartItem[];
}

// Actions:
// addItem(CartItem)        — if product already in cart, increase qty
// removeItem(productId)    — remove entirely
// updateQuantity({ productId, quantity })
// clearCart()              — called after order is placed
// setDistributor(id)       — set when distributor is selected
```

Persisted to AsyncStorage via redux-persist so the cart survives app restarts.

### sessionSlice

```typescript
// store/slices/sessionSlice.ts

interface SessionState {
  distributor: Distributor | null;
  brands: Brand[];         // brands for current distributor
  brandProducts: Record<string, Product[]>;  // brandId → products[]
  allPOs: PurchaseOrder[];
  currentPO: PurchaseOrder | null;
}
```

### uiSlice

```typescript
// store/slices/uiSlice.ts

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
```

---

## Firestore Thunk Pattern

```typescript
// store/thunks/brandThunks.ts

export const fetchBrandsByDistributor = createAsyncThunk(
  'session/fetchBrands',
  async (distributorId: string) => {
    return await brandService.getBrandsByDistributor(distributorId);
    // Returns Brand[]
    // Firestore query: collection('brands').where('distributor_id', '==', distributorId)
  }
);

// Reducer handles:
//   pending   → uiSlice.loading.brands = true
//   fulfilled → sessionSlice.brands = payload
//   rejected  → uiSlice.errors.brands = error.message
```

> All four thunk files follow this same pattern: async thunk → service call →
> dispatched to the relevant slice via `extraReducers`.

---

## Implementation Phases

### Phase 1 — Bootstrap (Day 1)

1. `npx create-expo-app suvidha_po --template expo-template-blank-typescript`
2. Install all packages from TECHSTACK.md
3. Configure NativeWind: `tailwind.config.js` + `babel.config.js` + `global.css`
4. Set up `app/_layout.tsx` with `<Provider store={store}>` and NativeWind wrapper
5. Set up `app/(tabs)/_layout.tsx` with two tabs: Home and Orders

### Phase 2 — Types, Utils, Constants (Day 1)

6. Write `types/index.ts`
7. Write `constants/colors.ts` — define status colors (`ordered`, `in_process`, `completed`)
8. Write `utils/groupByBrand.ts` — critical utility used in Cart and Order Detail
9. Write `utils/formatCurrency.ts` and `utils/formatDate.ts`

### Phase 3 — Firebase Setup + Services (Day 2)

10. Create Firebase project, enable Firestore, set security rules
11. Write `services/firebase.ts` — initialize Firebase with config from `.env`
12. Write `services/distributorService.ts`
    - `getDistributorByNumber(distNumber: string): Promise<Distributor | null>`
    - Firestore: `where('dist_number', '==', distNumber)`
13. Write `services/brandService.ts`
    - `getBrandsByDistributor(distributorId: string): Promise<Brand[]>`
14. Write `services/productService.ts`
    - `getProductsByBrand(brandId: string): Promise<Product[]>`
    - Filter: `where('is_active', '==', true)`
15. Write `services/poService.ts`
    - `createPurchaseOrder(cartItems, distributorId): Promise<string>` (returns new PO id)
    - `getAllPOs(martId): Promise<PurchaseOrder[]>`
    - `getPOById(poId: string): Promise<PurchaseOrder>`
16. Seed Firestore with test data: 2 distributors, 3-4 brands each, 5-8 products per brand

### Phase 4 — Redux Store (Day 2)

17. Write `store/slices/cartSlice.ts` with all actions listed above
18. Write `store/slices/sessionSlice.ts` and `store/slices/uiSlice.ts`
19. Write all four thunk files in `store/thunks/`
20. Write `store/index.ts`:
    - `configureStore` with cartSlice persisted via redux-persist
    - Export `RootState`, `AppDispatch` types, `useAppSelector`, `useAppDispatch` hooks

### Phase 5 — Reusable UI Components (Day 3)

21. `components/ui/StatusBadge.tsx`
    - Props: `status: POStatus`
    - Colors: amber (`ordered`), blue (`in_process`), green (`completed`)
22. `components/ui/Button.tsx`, `Card.tsx`, `EmptyState.tsx`, `LoadingSpinner.tsx`
23. `components/product/QuantitySelector.tsx` ← most critical component
    - Shows `0` (muted) when product not in cart
    - Shows current quantity when in cart
    - `+` calls `dispatch(addItem(...))`, `-` calls `dispatch(updateQuantity/removeItem(...))`
24. `components/cart/CartFAB.tsx`
    - Reads `cartSlice.items.length` from Redux
    - Navigates to `/cart` on press
    - Shows count badge when cart is non-empty

### Phase 6 — Screens (Day 3–5)

Implement in user-flow order:

**Screen 1: Home** (`app/(tabs)/index.tsx`)
- `DistributorSearchForm` with react-hook-form
- On submit: dispatch `fetchDistributorByNumber(value)`
- On success: dispatch `setDistributor`, navigate to `/distributor/[id]/brands`
- Show error if not found

**Screen 2: Brand Listing** (`app/distributor/[id]/brands.tsx`)
- On mount: dispatch `fetchBrandsByDistributor(id)`
- Read `sessionSlice.brands` and `uiSlice.loading.brands` from Redux
- `FlatList` of `BrandCard` — each card shows brand name, logo, product count
- `CartFAB` in top-right corner
- Tapping a brand → `/distributor/[id]/brand/[brandId]`

**Screen 3: Products** (`app/distributor/[id]/brand/[brandId].tsx`)
- On mount: dispatch `fetchProductsByBrand(brandId)`
- Read `sessionSlice.brandProducts[brandId]` from Redux
- `FlatList` of `ProductRow` — each row has `QuantitySelector`
- `CartFAB` visible

**Screen 4: Cart** (`app/cart.tsx`)
- Read `cartSlice.items` from Redux
- Group using `groupByBrand(items)` → pass to `SectionList` as `sections`
- `renderSectionHeader` → `BrandSectionHeader` (brand logo + name)
- `renderItem` → `CartItemRow` (name, qty, unit, line total)
- `OrderSummary` at bottom (total items, grand total)
- "Place Order" button → dispatch `createPurchaseOrder` thunk
  - On success: dispatch `clearCart()`, navigate to `/orders/[newPoId]`

**Screen 5: PO Menu** (`app/(tabs)/orders.tsx`)
- On mount: dispatch `fetchAllPOs(martId)`
- `POStatusFilterTabs` at top: All / Ordered / In Process / Completed
- Filter `sessionSlice.allPOs` client-side by selected status tab
- `FlatList` of `POCard` (distributor, date, item count, `StatusBadge`)
- Tapping a card → `/orders/[poId]`

**Screen 6: Order Detail** (`app/orders/[poId].tsx`)
- On mount: dispatch `fetchPOById(poId)`
- Read `sessionSlice.currentPO` from Redux
- `PODetailHeader`: PO date, distributor name, `StatusBadge`
- `SectionList` grouped by brand using `groupByBrand(po.items)`
  - `renderSectionHeader` → `BrandSectionHeader`
  - `renderItem` → `OrderItemRow` (name, qty, unit, unit price, line total)
- `POTotalSummary` at bottom

### Phase 7 — Polish (Day 5–6)

25. Pull-to-refresh on PO list and Brand list
26. Empty states: no brands found, empty cart, no orders yet
27. Loading skeletons or spinners driven by `uiSlice.loading.*`
28. Error banners driven by `uiSlice.errors.*` with retry buttons
29. Back button headers in stack screens
30. Cart badge in tab bar or on CartFAB driven by `cartSlice.items.length`

### Phase 8 — Build & Test (Day 6–7)

31. End-to-end flow test:
    - Enter dist number → browse brands → add products from 2+ brands → cart → place order → PO list → order detail
32. Verify brand-wise grouping in Cart and Order Detail
33. Verify all 3 status colours on `StatusBadge`
34. Configure EAS Build for Android APK (`eas build --platform android --profile preview`)
35. Test on physical device via Expo Go or EAS preview build

---

## Key Architectural Notes

### SectionList for brand-wise grouping
Both Cart and Order Detail use React Native's `SectionList` with `sections` built by
`groupByBrand()`. This is the native primitive for grouped lists — no nested FlatLists,
no performance issues.

### Products are brand-scoped
Each brand has its own product catalogue. When navigating to a brand, only that
brand's products are fetched (`where('brand_id', '==', brandId)`). The cart carries
the full `Brand` object alongside each `CartItem` to enable grouping at checkout.

### Cart persistence
redux-persist serialises `cartSlice` to AsyncStorage. If the user exits mid-order,
the cart is restored on next launch. `clearCart()` is called only after a successful
order placement.

### No RTK Query for Firestore
RTK Query assumes request/response semantics. Firestore's `onSnapshot` is a
subscription. Async thunks dispatch to Redux slices — this is the standard
Firestore + Redux pattern and gives the flexibility to add real-time listeners
later if needed (e.g., for order status updates from the distributor side).
