# TECHSTACK — Suvidha PO
## Technology Stack Document

**Product:** Suvidha PO — Purchase Order App
**Version:** 1.0
**Date:** 31 March 2026

---

## 1. Platform Decision

**React Native (Expo SDK 54) — Mobile First**

Mart owners order products from the shop floor or counter. The ordering experience
must be fast, touch-friendly, and available on personal Android/iOS devices without
sideloading or a custom device profile.

| Factor | Decision |
|---|---|
| Platform | iOS + Android from a single codebase |
| Workflow | Expo Managed Workflow (EAS Build for production) |
| Min Android | Android 10 (API 29) |
| Min iOS | iOS 14 |

---

## 2. Core Framework

| Package | Version | Purpose |
|---|---|---|
| `expo` | `~54.0.0` | SDK, managed build tooling, config plugins |
| `react-native` | `0.81.0` | Core mobile UI framework |
| `react` | `19.1.0` | Component model |
| `typescript` | `^5.8.0` | Static type checking across all source files |

> **Expo SDK 54** is the last SDK to support the Old (Legacy) Architecture.
> New Architecture (JSI, Fabric, TurboModules) is enabled by default and recommended.

---

## 3. Navigation

File-based routing via Expo Router. Stack and Tab navigators are declared as
filesystem directories, not imperative `createNavigator` calls.

| Package | Version | Purpose |
|---|---|---|
| `expo-router` | `~6.0.0` | File-based routing (tabs + stacks) |
| `react-native-screens` | `^4.24.0` | Native screen containers (required by Expo Router) |
| `react-native-safe-area-context` | `^5.7.0` | Safe area insets on notched devices |
| `react-native-gesture-handler` | `^3.0.0` | Gesture support for swipe-back, modals |

---

## 4. State Management — Redux Toolkit

All application state is managed through Redux Toolkit. Client state (cart, session)
lives in Redux slices. Server data (Firestore reads) is fetched via async thunks and
stored in Redux slices. `redux-persist` serialises the cart slice to AsyncStorage so
in-progress carts survive app restarts and crashes.

| Package | Version | Purpose |
|---|---|---|
| `@reduxjs/toolkit` | `^2.11.2` | Slices, createAsyncThunk, configureStore |
| `react-redux` | `^9.2.0` | `useSelector`, `useDispatch`, `<Provider>` |
| `redux-persist` | `^6.0.0` | Persist cart slice to AsyncStorage |
| `@react-native-async-storage/async-storage` | `^3.0.2` | Storage adapter for redux-persist |

### 4.1 Redux Slice Overview

| Slice | Persisted | State Held |
|---|---|---|
| `cartSlice` | Yes (AsyncStorage) | Cart items, current distributor ID |
| `sessionSlice` | No | Current distributor, fetched brands, fetched products |
| `uiSlice` | No | Loading flags, error messages per domain |

### 4.2 Async Thunk Pattern

```
createAsyncThunk
    └── calls service function (Firestore query)
          └── dispatches to slice via extraReducers
                ├── pending   → uiSlice.loading.* = true
                ├── fulfilled → sessionSlice.* = payload
                └── rejected  → uiSlice.errors.* = message
```

> **Why not RTK Query?**
> RTK Query is optimised for REST request/response cycles. Firestore uses real-time
> `onSnapshot` subscriptions and one-shot `getDocs` queries. Async thunks dispatch
> directly from Firestore callbacks — this is the idiomatic Firestore + Redux pattern
> and allows real-time listeners to be added later without architectural changes.

---

## 5. Backend & Database — Firebase Firestore

| Package | Version | Purpose |
|---|---|---|
| `firebase` | `^12.11.0` | Firebase JS SDK — Firestore, Auth |

### 5.1 Firestore Collections

```
distributors/{id}
  dist_number   : string       ← the code the mart enters
  name          : string
  phone         : string

brands/{id}
  distributor_id: string       ← FK → distributors
  name          : string
  logo_url      : string

products/{id}
  brand_id      : string       ← FK → brands (each product belongs to one brand)
  name          : string
  sku           : string
  unit          : string       ← "carton" | "box" | "piece"
  price         : number
  is_active     : boolean

purchase_orders/{id}
  distributor_id: string
  mart_id       : string
  status        : "ordered" | "in_process" | "completed"
  created_at    : Timestamp
  updated_at    : Timestamp

po_items/{id}
  po_id         : string       ← FK → purchase_orders
  product_id    : string       ← FK → products
  brand_id      : string       ← denormalised for brand-wise grouping
  quantity      : number
  unit_price    : number       ← price locked at time of order
```

### 5.2 Key Query Patterns

| Use Case | Firestore Query |
|---|---|
| Distributor lookup | `where('dist_number', '==', input)` |
| Brands for distributor | `where('distributor_id', '==', id)` |
| Products for brand | `where('brand_id', '==', id), where('is_active', '==', true)` |
| All POs for mart | `where('mart_id', '==', martId), orderBy('created_at', 'desc')` |
| Items for a PO | `where('po_id', '==', poId)` |

### 5.3 Firebase Configuration

Firebase config keys are loaded from environment variables and **never committed
to version control**.

```typescript
// services/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import Constants from 'expo-constants';

const firebaseConfig = {
  apiKey:            Constants.expoConfig?.extra?.firebaseApiKey,
  authDomain:        Constants.expoConfig?.extra?.firebaseAuthDomain,
  projectId:         Constants.expoConfig?.extra?.firebaseProjectId,
  storageBucket:     Constants.expoConfig?.extra?.firebaseStorageBucket,
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId,
  appId:             Constants.expoConfig?.extra?.firebaseAppId,
};

export const app = initializeApp(firebaseConfig);
export const db  = getFirestore(app);
```

---

## 6. Styling — NativeWind + Tailwind CSS

| Package | Version | Purpose |
|---|---|---|
| `nativewind` | `^4.2.3` | Tailwind CSS utility classes for React Native |
| `tailwindcss` | `^4.2.2` | Tailwind CSS core (config + JIT compiler) |

NativeWind v4 uses the Tailwind CSS v4 compiler. Custom design tokens from the
Suvidha brand palette are defined in `tailwind.config.js`.

```js
// tailwind.config.js (token excerpt)
theme: {
  extend: {
    colors: {
      'suvidha-orange': '#F26522',
      'suvidha-blue':   '#1B3A9E',
      'status-ordered':    '#F59E0B',
      'status-in-process': '#1B3A9E',
      'status-completed':  '#16A34A',
    }
  }
}
```

---

## 7. Forms

| Package | Version | Purpose |
|---|---|---|
| `react-hook-form` | `^7.72.0` | Distributor number entry, validation, error display |

Used only on the Home screen for the distributor number input. Keeps form state
local to the component without polluting the Redux store.

---

## 8. UI & Assets

| Package | Version | Purpose |
|---|---|---|
| `expo-image` | `~55.0.6` | Performant image component for brand logos and product images |
| `expo-font` | `~55.0.4` | Custom font loading (future use) |
| `expo-status-bar` | `~55.0.4` | Status bar colour control per screen |
| `expo-constants` | `~18.0.13` | Read `app.json` extra config (Firebase keys) |
| `@expo/vector-icons` | `^14.0.0` | Ionicons icon set — bundled with Expo, no extra config |

---

## 9. Development & Tooling

| Package | Version | Purpose |
|---|---|---|
| `eslint` | `^9.0.0` | JavaScript/TypeScript linting |
| `eslint-config-expo` | `^9.0.0` | Expo-specific ESLint rules |
| `prettier` | `^3.5.0` | Opinionated code formatter |
| `jest` | `^29.7.0` | Unit and integration testing |
| `jest-expo` | `~54.0.0` | Expo preset for Jest (mocks Expo modules) |
| `@types/react` | `^19.1.0` | TypeScript types for React 19 |

---

## 10. Complete `package.json` Reference

```json
{
  "name": "suvidha-po",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "scripts": {
    "start":   "expo start",
    "android": "expo start --android",
    "ios":     "expo start --ios",
    "test":    "jest --watchAll",
    "lint":    "eslint ."
  },
  "dependencies": {
    "expo":                                      "~54.0.0",
    "react":                                     "19.1.0",
    "react-native":                              "0.81.0",
    "expo-router":                               "~6.0.0",
    "react-native-screens":                      "^4.24.0",
    "react-native-safe-area-context":            "^5.7.0",
    "react-native-gesture-handler":              "^3.0.0",
    "@reduxjs/toolkit":                          "^2.11.2",
    "react-redux":                               "^9.2.0",
    "redux-persist":                             "^6.0.0",
    "@react-native-async-storage/async-storage": "^3.0.2",
    "firebase":                                  "^12.11.0",
    "nativewind":                                "^4.2.3",
    "tailwindcss":                               "^4.2.2",
    "react-hook-form":                           "^7.72.0",
    "expo-image":                                "~55.0.6",
    "expo-font":                                 "~55.0.4",
    "expo-status-bar":                           "~55.0.4",
    "expo-constants":                            "~18.0.13",
    "@expo/vector-icons":                        "^14.0.0"
  },
  "devDependencies": {
    "typescript":          "^5.8.0",
    "eslint":              "^9.0.0",
    "eslint-config-expo":  "^9.0.0",
    "prettier":            "^3.5.0",
    "jest":                "^29.7.0",
    "jest-expo":           "~54.0.0",
    "@types/react":        "^19.1.0"
  }
}
```

---

## 11. Architecture Diagram

```
┌──────────────────────────────────────────────────────────┐
│                   React Native (Expo 54)                  │
│                                                          │
│  ┌──────────────┐    ┌───────────────────────────────┐   │
│  │  Expo Router │    │        Redux Store             │   │
│  │  (screens)   │◄──►│  cartSlice (persisted)        │   │
│  │              │    │  sessionSlice                  │   │
│  │  NativeWind  │    │  uiSlice                       │   │
│  │  (styling)   │    │                               │   │
│  └──────┬───────┘    └───────────────┬───────────────┘   │
│         │                            │                    │
│         │            ┌───────────────▼───────────────┐   │
│         │            │        Async Thunks            │   │
│         │            │  distributorThunks             │   │
│         │            │  brandThunks                   │   │
│         │            │  productThunks                 │   │
│         │            │  poThunks                      │   │
│         │            └───────────────┬───────────────┘   │
│         │                            │                    │
│         │            ┌───────────────▼───────────────┐   │
│         │            │       Service Layer            │   │
│         │            │  distributorService            │   │
│         │            │  brandService                  │   │
│         │            │  productService                │   │
│         │            │  poService                     │   │
│         │            └───────────────┬───────────────┘   │
└─────────┼────────────────────────────┼───────────────────┘
          │                            │
          │              ┌─────────────▼──────────┐
          │              │   Firebase Firestore    │
          │              │   (firebase ^12.11.0)  │
          └──────────────►   AsyncStorage          │
               redux-    │   (redux-persist)       │
               persist   └────────────────────────┘
```

---

## 12. Minimum System Requirements

| Requirement | Value |
|---|---|
| Node.js | `>= 20.0.0` |
| npm | `>= 10.0.0` |
| Expo CLI | `latest` (`npx expo`) |
| EAS CLI | `latest` (for production APK/IPA builds) |
| Android Studio | For Android emulator (optional if using Expo Go) |
| Xcode | 15+ for iOS simulator (Mac only) |
