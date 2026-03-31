# Suvidha PO — Tech Stack Document

## Platform

**React Native (Expo SDK 54) — Mobile First**

Mart owners order from distributors on the shop floor. Mobile is the primary target.
Expo SDK 54 is the last SDK to support the Old Architecture; New Architecture is recommended.

---

## Core Framework

| Package | Version | Purpose |
|---|---|---|
| `expo` | `~54.0.0` | Managed workflow, build tooling |
| `react-native` | `0.81.0` | Core mobile framework |
| `react` | `19.1.0` | UI library |
| `expo-router` | `~6.0.0` | File-based navigation (stacks + tabs) |
| `typescript` | `^5.8.0` | Type safety |

---

## Navigation

| Package | Version | Purpose |
|---|---|---|
| `expo-router` | `~6.0.0` | Primary router — file-based routing |
| `react-native-screens` | `^4.24.0` | Native screen containers |
| `react-native-safe-area-context` | `^5.7.0` | Safe area insets |
| `react-native-gesture-handler` | `^3.0.0` | Gesture support for navigation |

---

## State Management — Redux

All state (client and server cache) is managed through Redux Toolkit.

| Package | Version | Purpose |
|---|---|---|
| `@reduxjs/toolkit` | `^2.11.2` | Redux Toolkit — slices, thunks, RTK Query |
| `react-redux` | `^9.2.0` | React bindings for Redux |
| `redux-persist` | `^6.0.0` | Persist cart to AsyncStorage across sessions |
| `@react-native-async-storage/async-storage` | `^3.0.2` | Storage adapter for redux-persist |

### Redux Slices

```
store/
├── index.ts                  # configureStore, persistStore
├── slices/
│   ├── sessionSlice.ts       # current distributor in session
│   ├── cartSlice.ts          # cart items (persisted)
│   └── uiSlice.ts            # loading/error UI states
└── thunks/
    ├── distributorThunks.ts  # Firestore calls for distributor lookup
    ├── brandThunks.ts        # Firestore calls for brand listing
    ├── productThunks.ts      # Firestore calls for product listing
    └── poThunks.ts           # Firestore calls for PO create/fetch
```

> **Why not RTK Query for Firestore?**
> RTK Query is optimised for REST/GraphQL request-response cycles. Firestore uses
> real-time `onSnapshot` listeners. Async thunks dispatch Redux actions directly
> from Firestore callbacks, which is the idiomatic pattern for Firestore + Redux.

---

## Backend & Database — Firebase Firestore

| Package | Version | Purpose |
|---|---|---|
| `firebase` | `^12.11.0` | Firebase JS SDK (Firestore, Auth) |

### Firestore Collections

```
distributors/
  {distributorId}/
    dist_number: string          # the code the mart enters
    name: string
    phone: string

brands/
  {brandId}/
    distributor_id: string       # FK → distributors
    name: string
    logo_url: string

products/
  {productId}/
    brand_id: string             # FK → brands
    name: string
    sku: string
    unit: string                 # "carton" | "box" | "piece"
    price: number
    is_active: boolean

purchase_orders/
  {poId}/
    distributor_id: string
    mart_id: string
    status: "ordered" | "in_process" | "completed"
    created_at: Timestamp
    updated_at: Timestamp

po_items/
  {poItemId}/
    po_id: string                # FK → purchase_orders
    product_id: string           # FK → products
    brand_id: string             # denormalized for brand-wise grouping
    quantity: number
    unit_price: number           # price at time of order
```

> **Why denormalize `brand_id` in `po_items`?**
> Grouping order items by brand (for the brand-wise display in Order Detail and Cart)
> requires knowing each item's brand. Without denormalization, every item would need
> an extra Firestore read through `products → brands`. Storing `brand_id` directly
> in `po_items` makes the grouping a pure client-side operation.

---

## Styling

| Package | Version | Purpose |
|---|---|---|
| `nativewind` | `^4.2.3` | Tailwind CSS for React Native |
| `tailwindcss` | `^4.2.2` | Tailwind CSS core |

---

## Forms

| Package | Version | Purpose |
|---|---|---|
| `react-hook-form` | `^7.72.0` | Distributor number entry form, validation |

---

## UI & Assets

| Package | Version | Purpose |
|---|---|---|
| `expo-image` | `~55.0.6` | Optimised image component (brand logos, products) |
| `expo-font` | `~55.0.4` | Custom font loading |
| `expo-status-bar` | `~55.0.4` | Status bar control |
| `expo-constants` | `~18.0.13` | App config, environment values |
| `@expo/vector-icons` | `^14.0.0` | Ionicons and other icon sets (bundled with Expo) |

---

## Dev & Tooling

| Package | Version | Purpose |
|---|---|---|
| `eslint` | `^9.0.0` | Linting |
| `eslint-config-expo` | `^9.0.0` | Expo ESLint config |
| `prettier` | `^3.5.0` | Code formatting |
| `jest` | `^29.7.0` | Unit testing |
| `jest-expo` | `~54.0.0` | Expo Jest preset |

---

## Full `package.json` Dependencies Reference

```json
{
  "dependencies": {
    "expo": "~54.0.0",
    "react": "19.1.0",
    "react-native": "0.81.0",
    "expo-router": "~6.0.0",
    "react-native-screens": "^4.24.0",
    "react-native-safe-area-context": "^5.7.0",
    "react-native-gesture-handler": "^3.0.0",
    "@reduxjs/toolkit": "^2.11.2",
    "react-redux": "^9.2.0",
    "redux-persist": "^6.0.0",
    "@react-native-async-storage/async-storage": "^3.0.2",
    "firebase": "^12.11.0",
    "nativewind": "^4.2.3",
    "tailwindcss": "^4.2.2",
    "react-hook-form": "^7.72.0",
    "expo-image": "~55.0.6",
    "expo-font": "~55.0.4",
    "expo-status-bar": "~55.0.4",
    "expo-constants": "~18.0.13",
    "@expo/vector-icons": "^14.0.0"
  },
  "devDependencies": {
    "typescript": "^5.8.0",
    "eslint": "^9.0.0",
    "eslint-config-expo": "^9.0.0",
    "prettier": "^3.5.0",
    "jest": "^29.7.0",
    "jest-expo": "~54.0.0",
    "@types/react": "^19.1.0"
  }
}
```

---

## Architecture Summary

```
User Input
    │
    ▼
React Hook Form ──► Redux Thunk ──► Firebase Firestore
                         │
                         ▼
                   Redux Store
                   ├── sessionSlice   (current distributor)
                   ├── cartSlice      (cart items — persisted)
                   └── uiSlice        (loading/error states)
                         │
                         ▼
                  React Components
                  (Expo Router screens + NativeWind)
```

---

## Minimum Requirements

- **Node.js**: `>=20.0.0`
- **Expo CLI**: `latest` (`npx expo`)
- **EAS CLI**: `latest` (for production builds)
- **iOS Simulator / Android Emulator** or physical device with Expo Go (SDK 54)
