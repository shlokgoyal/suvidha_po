# PRD — Suvidha PO
## Product Requirements Document

**Product:** Suvidha PO — Purchase Order App for Suvidha Supermarket
**Version:** 1.0
**Date:** 31 March 2026
**Status:** Draft

---

## 1. Overview

### 1.1 Product Summary

Suvidha PO is a mobile application that allows Suvidha Supermarket mart owners and
store managers to place purchase orders directly with distributors. The mart owner
enters a distributor number, browses that distributor's brand catalogue, selects
products brand by brand, and submits a purchase order. Past orders are accessible
from a dedicated PO section with real-time status tracking.

### 1.2 Problem Statement

Currently, mart owners place orders via phone calls or paper forms. This leads to:
- Order errors due to verbal/written miscommunication
- No visibility into order status after placing
- No history of past orders for reference or reordering
- Time lost coordinating between mart staff and distributor sales reps

### 1.3 Goal

Replace the manual ordering process with a fast, accurate mobile ordering system
that gives both the mart and the distributor a clear record of every transaction.

### 1.4 Success Metrics

| Metric | Target |
|---|---|
| Order placement time | < 3 minutes from distributor entry to submission |
| Order error rate | < 1% (vs. ~8% for phone orders) |
| PO status visibility | 100% of orders have live status |
| Reorder time | < 1 minute using past PO reference |
| Adoption | 80% of active mart accounts placing at least 1 digital PO/week within 60 days |

---

## 2. Users

### 2.1 Primary User — Mart Owner / Store Manager

- Runs a Suvidha Supermarket franchise or affiliated mart
- Places orders 2–5 times per week from multiple distributors
- Uses a smartphone (Android primary, iOS secondary)
- Comfort level: moderate; prefers simple, fast UI over feature-rich

### 2.2 Secondary User — Distributor (Future Scope)

- Receives orders and updates their status (ordered → in process → completed)
- Not in scope for v1.0; status updates will be managed via a separate admin panel

---

## 3. Scope

### 3.1 In Scope (v1.0)

- Distributor lookup by distributor number
- Brand listing per distributor
- Product listing per brand (each brand has its own product catalogue)
- Cart: add/remove/update quantities across multiple brands
- Cart review grouped by brand before placing order
- Place purchase order
- PO history list with status filter
- Order detail view with products listed brand-by-brand
- PO status: Ordered / In Process / Completed

### 3.2 Out of Scope (v1.0)

- Distributor-side app or admin panel
- Push notifications for order status changes
- Payment processing or invoicing
- Inventory management at the mart
- Multi-user accounts per mart
- Barcode/QR scanning for products
- Offline mode (requires connectivity)

---

## 4. User Stories

### US-01: Enter Distributor Number
**As a** mart owner,
**I want to** enter a distributor number,
**So that** I can see all the brands that distributor supplies.

**Acceptance Criteria:**
- A text input accepts alphanumeric distributor numbers
- On submission, the app queries Firestore for a matching distributor
- If found, the app navigates to the brand listing for that distributor
- If not found, a clear error message is displayed: "Distributor not found. Please check the number."
- The distributor name is shown in the header after a successful lookup

---

### US-02: Browse Brands
**As a** mart owner,
**I want to** see all brands sold by the distributor,
**So that** I can select which brands to order from.

**Acceptance Criteria:**
- All active brands for the distributor are listed
- Each brand card shows: brand logo (or placeholder), brand name, number of available products
- Tapping a brand navigates to that brand's product list
- A cart icon in the top-right corner shows the total number of items currently in the cart
- If no brands are available, an empty state is shown

---

### US-03: Browse Products by Brand
**As a** mart owner,
**I want to** see the products for a specific brand,
**So that** I can choose which products and quantities to order.

**Acceptance Criteria:**
- Only products belonging to the selected brand are shown
- Each product row shows: name, SKU, unit (carton/box/piece), and price
- A quantity stepper (+/–) is shown on each product row
- The stepper defaults to 0 (not in cart); incrementing it adds the product to the cart
- Decrementing to 0 removes the product from the cart
- Only active products (`is_active: true`) are shown
- The cart FAB shows the updated cart count after any quantity change

---

### US-04: Review Cart
**As a** mart owner,
**I want to** review all selected products before placing an order,
**So that** I can confirm quantities and totals are correct.

**Acceptance Criteria:**
- Cart is accessible via the floating cart button or a dedicated screen
- Items are grouped by brand, with the brand name as a section header
- Each line item shows: product name, quantity, unit, unit price, line total
- An order summary shows total number of items and the grand total price
- Individual quantities can be adjusted or removed from the cart screen
- A "Place Order" button is visible and disabled only if the cart is empty

---

### US-05: Place a Purchase Order
**As a** mart owner,
**I want to** place a purchase order,
**So that** the distributor receives my order and I have a record of it.

**Acceptance Criteria:**
- Tapping "Place Order" creates a new `purchase_order` document in Firestore with status `ordered`
- All cart items are written as `po_items` linked to the new PO
- The cart is cleared after successful order placement
- The app navigates to the Order Detail screen for the newly created PO
- A success confirmation is shown (toast or banner)
- If the submission fails, an error message is shown and the cart is preserved

---

### US-06: View PO History
**As a** mart owner,
**I want to** see all my past purchase orders,
**So that** I can track their status and refer back to them.

**Acceptance Criteria:**
- The Orders tab shows all POs for the mart, sorted by date (newest first)
- Each PO card shows: distributor name, order date, total item count, status badge
- Status badge colours: Ordered (amber), In Process (blue), Completed (green)
- Filter tabs at the top allow filtering by: All / Ordered / In Process / Completed
- Tapping a PO card navigates to the Order Detail screen

---

### US-07: View Order Detail
**As a** mart owner,
**I want to** see the full details of a specific purchase order,
**So that** I know exactly what was ordered, how much it costs, and the current status.

**Acceptance Criteria:**
- The detail screen shows: PO date, distributor name, and current status badge
- Products are listed grouped by brand (brand name as section header, same as cart review)
- Each product row shows: name, quantity, unit, unit price, and line total
- A summary at the bottom shows the grand total
- The status badge reflects the current status from Firestore

---

## 5. Functional Requirements

### 5.1 Distributor Lookup

| ID | Requirement |
|---|---|
| FR-01 | The app shall query Firestore using the exact distributor number entered |
| FR-02 | Lookup shall complete within 3 seconds on a standard 4G connection |
| FR-03 | Invalid or unknown distributor numbers shall display a user-facing error |
| FR-04 | The current distributor context shall be stored in Redux session state |

### 5.2 Brand & Product Browsing

| ID | Requirement |
|---|---|
| FR-05 | Brands shall be fetched filtered by `distributor_id` |
| FR-06 | Products shall be fetched filtered by `brand_id` and `is_active == true` |
| FR-07 | Each brand's product list is independent — no products are shared between brands |
| FR-08 | Product prices are read-only during browsing; they are locked at order placement time |

### 5.3 Cart

| ID | Requirement |
|---|---|
| FR-09 | The cart shall persist across app restarts using AsyncStorage (redux-persist) |
| FR-10 | The cart shall be cleared on successful order placement |
| FR-11 | Cart items shall store a reference to both the product and the brand |
| FR-12 | The cart shall be scoped to one distributor at a time |
| FR-13 | If the user switches to a different distributor, the existing cart shall be cleared after a confirmation prompt |

### 5.4 Purchase Orders

| ID | Requirement |
|---|---|
| FR-14 | A PO shall be created as a single Firestore transaction (order + all items atomically) |
| FR-15 | Unit price in `po_items` shall be the price at time of order, not the current catalogue price |
| FR-16 | PO status values shall be: `ordered`, `in_process`, `completed` |
| FR-17 | POs shall be listed in descending order by `created_at` |
| FR-18 | Status filter selection shall persist during the session (tab stays selected) |

---

## 6. Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-01 | Performance | Screen transitions < 300ms |
| NFR-02 | Performance | Firestore queries < 3s on 4G |
| NFR-03 | Reliability | Cart state must survive app crashes and restarts |
| NFR-04 | Usability | All interactive targets minimum 44×44 pt (WCAG touch target) |
| NFR-05 | Usability | App must be fully usable one-handed on a standard 6" screen |
| NFR-06 | Security | Firestore Security Rules must prevent cross-mart data access |
| NFR-07 | Security | Firebase config keys must not be committed to version control |
| NFR-08 | Compatibility | Support Android 10+ and iOS 14+ |
| NFR-09 | Offline | Show a clear "No internet connection" banner; do not silently fail |
| NFR-10 | Accessibility | Minimum contrast ratio 4.5:1 for all body text |

---

## 7. Firestore Data Rules (High Level)

```
distributors    — read: any authenticated user
brands          — read: any authenticated user
products        — read: any authenticated user, filter is_active on client
purchase_orders — read/write: only the mart that created the order
po_items        — read/write: tied to the parent purchase_order's mart
```

---

## 8. Out-of-Scope Decisions Logged

| Decision | Reason |
|---|---|
| No push notifications in v1.0 | Requires FCM setup + server-side trigger; adds complexity without blocking core flow |
| No barcode scanning | Nice-to-have; can be added in v1.1 using expo-camera |
| Status updates are admin-driven | Distributor panel is a separate product; v1.0 only reads status |
| No multi-user per mart | Single device / single session simplifies auth model for v1.0 |

---

## 9. Open Questions

| # | Question | Owner | Due |
|---|---|---|---|
| Q1 | Will distributors use a separate web portal to update PO status, or will this be manual in Firebase Console for v1.0? | Product | Before Phase 3 |
| Q2 | Is the mart identified by phone number, email, or a Suvidha mart code? | Product | Before Phase 4 |
| Q3 | Should cancelled orders be a 4th status, or are orders immutable once placed? | Product | Before Phase 6 |
| Q4 | Are prices in INR exclusively, or do we need multi-currency support? | Product | Before Phase 5 |
