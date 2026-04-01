# TODO — Suvidha PO
## 7-Phase Implementation Checklist

**Project:** Suvidha PO — Purchase Order App for Suvidha Supermarket
**Stack:** Expo 54 · React Native 0.81 · Redux Toolkit · Firebase Firestore · NativeWind

> Legend: `[ ]` Not started · `[~]` In progress · `[x]` Done

---

## Phase 1 — Project Bootstrap

> Goal: Runnable Expo app with navigation shell, Redux wired, NativeWind configured.

- [ ] Initialise Expo project: `npx create-expo-app suvidha_po --template expo-template-blank-typescript`
- [ ] Install all dependencies from `TECHSTACK.md` with exact version numbers
- [ ] Configure NativeWind: create `tailwind.config.js`, update `babel.config.js`, add `global.css`
- [ ] Create `app/_layout.tsx` — root layout wrapping `<Provider store={store}>` + NativeWind `<GluestackUIProvider>` / wrapper
- [ ] Create `app/(tabs)/_layout.tsx` — tab bar with Home tab (Ionicons `home-outline`) and Orders tab (Ionicons `receipt-outline`)
- [ ] Create placeholder screens: `app/(tabs)/index.tsx` and `app/(tabs)/orders.tsx`
- [ ] Configure `app.json` with app name, icon, splash screen, and `extra` block for Firebase env keys
- [ ] Add `.env` file for Firebase config keys and add it to `.gitignore`
- [ ] Verify app boots on Android emulator or Expo Go with tab navigation working

---

## Phase 2 — Types, Constants & Utilities

> Goal: All shared TypeScript contracts and pure helper functions defined before any component or service touches them.

- [ ] Write `types/index.ts` — all interfaces: `Distributor`, `Brand`, `Product`, `CartItem`, `POItem`, `PurchaseOrder`, `BrandSection`, `POStatus`
- [ ] Write `constants/colors.ts` — Suvidha Orange `#F26522`, Suvidha Blue `#1B3A9E`, status colours (amber/blue/green), text, surface, border tokens
- [ ] Write `constants/config.ts` — read Firebase config from `expo-constants` (`Constants.expoConfig.extra.*`)
- [ ] Write `utils/groupByBrand.ts` — `(items: CartItem[] | POItem[]) => BrandSection[]` — used in Cart and Order Detail `SectionList`
- [ ] Write `utils/formatCurrency.ts` — `formatCurrency(1500) → "₹1,500"`
- [ ] Write `utils/formatDate.ts` — Firestore `Timestamp` → `"31 Mar 2026"`
- [ ] Write unit tests for `groupByBrand`, `formatCurrency`, `formatDate`

---

## Phase 3 — Firebase Setup & Service Layer

> Goal: All Firestore queries encapsulated in service functions, Firestore seeded with test data.

- [ ] Create Firebase project in Firebase Console, enable Firestore in production mode
- [ ] Set Firestore Security Rules: distributors/brands/products readable by all authenticated users; purchase_orders/po_items scoped to `mart_id`
- [ ] Write `services/firebase.ts` — `initializeApp` + `getFirestore`, export `db`
- [ ] Write `services/distributorService.ts`
  - [ ] `getDistributorByNumber(distNumber: string): Promise<Distributor | null>` — `where('dist_number', '==', distNumber)`
- [ ] Write `services/brandService.ts`
  - [ ] `getBrandsByDistributor(distributorId: string): Promise<Brand[]>` — `where('distributor_id', '==', distributorId)`
- [ ] Write `services/productService.ts`
  - [ ] `getProductsByBrand(brandId: string): Promise<Product[]>` — `where('brand_id', '==', brandId)` + `where('is_active', '==', true)`
- [ ] Write `services/poService.ts`
  - [ ] `createPurchaseOrder(cartItems: CartItem[], distributorId: string, martId: string): Promise<string>` — Firestore batch write (order + all items atomically), locks `unit_price` at time of order, returns new PO `id`
  - [ ] `getAllPOs(martId: string): Promise<PurchaseOrder[]>` — `where('mart_id', '==', martId)`, `orderBy('created_at', 'desc')`
  - [ ] `getPOById(poId: string): Promise<PurchaseOrder>` — fetch order + all `po_items` sub-query
- [ ] Seed Firestore with test data:
  - [ ] 2 distributors (e.g. DIST-001, DIST-002)
  - [ ] 3–4 brands per distributor, each with its own distinct product set
  - [ ] 5–8 active products per brand with realistic names, SKUs, units, and prices

---

## Phase 4 — Redux Store

> Goal: Complete Redux store with three slices and four async thunks; cart persisted to AsyncStorage.

- [ ] Write `store/slices/cartSlice.ts`
  - [ ] State: `{ distributorId: string | null, items: CartItem[] }`
  - [ ] Actions: `addItem`, `removeItem`, `updateQuantity`, `clearCart`, `setDistributor`
  - [ ] `addItem` must increment quantity if product already exists in cart
- [ ] Write `store/slices/sessionSlice.ts`
  - [ ] State: `{ distributor: Distributor | null, brands: Brand[], brandProducts: Record<string, Product[]>, allPOs: PurchaseOrder[], currentPO: PurchaseOrder | null }`
  - [ ] `extraReducers` for all four async thunks
- [ ] Write `store/slices/uiSlice.ts`
  - [ ] State: `loading` flags and `errors` strings per domain (distributor, brands, products, pos, placingOrder)
- [ ] Write `store/thunks/distributorThunks.ts` — `fetchDistributorByNumber`
- [ ] Write `store/thunks/brandThunks.ts` — `fetchBrandsByDistributor`
- [ ] Write `store/thunks/productThunks.ts` — `fetchProductsByBrand`
- [ ] Write `store/thunks/poThunks.ts` — `createPurchaseOrder`, `fetchAllPOs`, `fetchPOById`
- [ ] Write `store/index.ts`
  - [ ] `configureStore` with all three slices
  - [ ] `redux-persist` wrapping `cartSlice` with `AsyncStorage` adapter
  - [ ] Export `RootState`, `AppDispatch`, `useAppSelector`, `useAppDispatch`
- [ ] Verify cart items survive app reload via redux-persist

---

## Phase 5 — Reusable UI Components

> Goal: All shared components built and visually verified in isolation before being used in screens.

**Primitive UI (`components/ui/`)**
- [ ] `Button.tsx` — primary (orange fill), secondary (outline), disabled state
- [ ] `StatusBadge.tsx` — pill badge with dot; amber for `ordered`, blue for `in_process`, green for `completed`
- [ ] `Card.tsx` — white surface, 12px border radius, border, shadow
- [ ] `EmptyState.tsx` — icon + heading + subtext + optional CTA button, vertically centred
- [ ] `LoadingSpinner.tsx` — centred activity indicator in Suvidha Orange

**Distributor (`components/distributor/`)**
- [ ] `DistributorSearchForm.tsx` — `react-hook-form` text input with validation, search button, inline error display

**Brand (`components/brand/`)**
- [ ] `BrandCard.tsx` — brand logo (44×44, fallback placeholder), name, product count, chevron; 72px height
- [ ] `BrandSectionHeader.tsx` — 28×28 logo, brand name in Suvidha Blue; used in SectionList in Cart and Order Detail

**Product (`components/product/`)**
- [ ] `ProductRow.tsx` — product name, SKU, unit label, price; contains `QuantitySelector`
- [ ] `QuantitySelector.tsx` — `[–] qty [+]` stepper; 0 state dimmed; active state orange; dispatches `addItem` / `updateQuantity` / `removeItem` to `cartSlice`

**Cart (`components/cart/`)**
- [ ] `CartFAB.tsx` — fixed bottom-right, orange, shows item count badge; navigates to `/cart`; hidden when cart is empty
- [ ] `CartItemRow.tsx` — name, qty, unit, unit price, line total inside cart `SectionList`
- [ ] `OrderSummary.tsx` — total item count and grand total; shown at bottom of Cart screen

**Orders (`components/orders/`)**
- [ ] `POCard.tsx` — distributor name, date, item count, grand total, `StatusBadge`; navigates to order detail on tap
- [ ] `POStatusFilterTabs.tsx` — horizontal tab row: All / Ordered / In Process / Completed; active tab has orange underline
- [ ] `OrderItemRow.tsx` — name, qty, unit, unit price, line total inside order detail `SectionList`

---

## Phase 6 — Screens

> Goal: All six screens implemented in user-flow order, wired to Redux, navigating correctly.

**Screen 1 — Home** (`app/(tabs)/index.tsx`)
- [ ] Render `DistributorSearchForm`
- [ ] On submit: dispatch `fetchDistributorByNumber`; show spinner from `uiSlice.loading.distributor`
- [ ] On success: store distributor in `sessionSlice`, navigate to `/distributor/[id]/brands`
- [ ] On error: display "Distributor not found" error message below the form
- [ ] Show list of recently searched distributors (read from `sessionSlice` or local state)

**Screen 2 — Brand Listing** (`app/distributor/[id]/brands.tsx`)
- [ ] On mount: dispatch `fetchBrandsByDistributor(id)`
- [ ] Show `LoadingSpinner` while `uiSlice.loading.brands` is true
- [ ] `FlatList` of `BrandCard`; show `EmptyState` if no brands returned
- [ ] Tapping a brand navigates to `/distributor/[id]/brand/[brandId]`
- [ ] `CartFAB` visible; reflects live cart count from `cartSlice`
- [ ] Stack header shows distributor name in white on Suvidha Blue

**Screen 3 — Products** (`app/distributor/[id]/brand/[brandId].tsx`)
- [ ] On mount: dispatch `fetchProductsByBrand(brandId)`
- [ ] Show `LoadingSpinner` while loading; `EmptyState` if no products
- [ ] `FlatList` of `ProductRow` with integrated `QuantitySelector` per row
- [ ] `CartFAB` visible; live cart count updates on every stepper interaction
- [ ] Stack header shows brand name

**Screen 4 — Cart** (`app/cart.tsx`)
- [ ] Read `cartSlice.items` from Redux; show `EmptyState` if cart is empty
- [ ] Call `groupByBrand(items)` to build `sections` for `SectionList`
- [ ] `renderSectionHeader` → `BrandSectionHeader`; `renderItem` → `CartItemRow`
- [ ] `OrderSummary` pinned at bottom with grand total
- [ ] "Place Order" button (full-width, orange) dispatches `createPurchaseOrder` thunk
- [ ] On success: dispatch `clearCart()`, show success toast, navigate to `/orders/[newPoId]`
- [ ] On failure: show error banner; cart is preserved

**Screen 5 — PO Menu** (`app/(tabs)/orders.tsx`)
- [ ] On mount: dispatch `fetchAllPOs(martId)`
- [ ] `POStatusFilterTabs` at top; selected filter stored in local component state
- [ ] Filter `sessionSlice.allPOs` client-side by active status tab
- [ ] `FlatList` of `POCard`; show `EmptyState` for no orders or no filtered results
- [ ] Pull-to-refresh re-dispatches `fetchAllPOs`
- [ ] Tapping a card navigates to `/orders/[poId]`

**Screen 6 — Order Detail** (`app/orders/[poId].tsx`)
- [ ] On mount: dispatch `fetchPOById(poId)`; show `LoadingSpinner` while fetching
- [ ] Header area: distributor name, formatted date, `StatusBadge`
- [ ] `SectionList` grouped by brand using `groupByBrand(po.items)`
- [ ] `renderSectionHeader` → `BrandSectionHeader`; `renderItem` → `OrderItemRow`
- [ ] `POTotalSummary` at bottom: total items + grand total

---

## Phase 7 — Polish, Testing & Build

> Goal: Production-ready app — all edge cases handled, tested end-to-end, APK generated.

**UX Polish**
- [ ] Add pull-to-refresh on Brand Listing screen
- [ ] Add skeleton loaders (shimmer: `#EFEFEF` → `#E0E0E0`) on Brand Listing, Product, and PO List screens
- [ ] Add error banners with "Retry" buttons driven by `uiSlice.errors.*`
- [ ] Show "No internet connection" banner when device is offline
- [ ] Add confirmation dialog when user switches distributor mid-cart ("This will clear your current cart. Continue?")
- [ ] Animate CartFAB badge count change on quantity update
- [ ] Ensure all interactive elements meet 44×44pt minimum touch target

**End-to-End Testing**
- [ ] Flow: enter distributor → browse 2+ brands → add products → review cart (verify brand grouping) → place order → land on order detail
- [ ] Flow: open Orders tab → verify new PO appears with status `ordered` → verify `StatusBadge` colour is amber
- [ ] Flow: filter PO list by each status tab — verify correct POs shown
- [ ] Flow: reopen app mid-cart — verify cart is restored from AsyncStorage
- [ ] Flow: enter invalid distributor number — verify error message shown
- [ ] Verify `unit_price` in order detail matches price at time of order, not any updated catalogue price
- [ ] Verify brand-wise grouping is correct in both Cart and Order Detail for a multi-brand order

**Unit Tests**
- [ ] `groupByBrand` — multiple brands, single brand, empty array
- [ ] `cartSlice` — addItem, removeItem, updateQuantity, clearCart, duplicate product increment
- [ ] `formatCurrency` — zero, small, large values
- [ ] `formatDate` — valid Timestamp, edge dates

**Build & Deployment**
- [ ] Configure `eas.json` with `preview` and `production` build profiles
- [ ] Run `eas build --platform android --profile preview` and verify APK installs correctly
- [ ] Test APK on a physical Android device (not just emulator)
- [ ] Verify Firebase Security Rules block cross-mart data access
- [ ] Confirm Firebase config keys are not present in the built bundle (use `expo-constants` only)
- [ ] Tag release commit: `git tag v1.0.0`
