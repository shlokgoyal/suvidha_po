# DESIGN — Suvidha PO
## Design Document

**Product:** Suvidha PO — Purchase Order App
**Version:** 1.0
**Date:** 31 March 2026

---

## 1. Design Principles

1. **Speed over richness** — Mart owners are ordering from the counter. Every extra tap is a cost. Favour direct paths.
2. **Clarity at a glance** — Order status, brand names, quantities and totals must be legible without zooming.
3. **Brand consistency** — Colours, type and iconography extend the Suvidha Supermarket brand identity.
4. **One-handed usability** — Primary actions (quantity stepper, place order, cart FAB) sit in the thumb zone (bottom half of screen).
5. **Forgiveness** — Cart persists across restarts. Destructive actions (clear cart, cancel order) require confirmation.

---

## 2. Colour Palette

Colours are extracted directly from the **Suvidha Supermarket logo**.

### 2.1 Primary Colours

| Token | Name | Hex | Usage |
|---|---|---|---|
| `--color-primary` | Suvidha Orange | `#F26522` | Primary buttons, active tabs, CartFAB, highlights |
| `--color-on-primary` | White | `#FFFFFF` | Text/icons on orange backgrounds |
| `--color-secondary` | Suvidha Blue | `#1B3A9E` | Screen headers, brand section headers, links |
| `--color-on-secondary` | White | `#FFFFFF` | Text/icons on blue backgrounds |

### 2.2 Background & Surface

| Token | Name | Hex | Usage |
|---|---|---|---|
| `--color-background` | Off White | `#F8F8F8` | Screen backgrounds |
| `--color-surface` | White | `#FFFFFF` | Cards, modals, bottom sheets |
| `--color-surface-variant` | Light Grey | `#EFEFEF` | Inactive tab bar, skeleton loaders |
| `--color-border` | Border Grey | `#E0E0E0` | Card borders, dividers |

### 2.3 Text

| Token | Name | Hex | Usage |
|---|---|---|---|
| `--color-text-primary` | Near Black | `#1A1A1A` | Body text, product names |
| `--color-text-secondary` | Medium Grey | `#6B6B6B` | SKU, unit labels, secondary info |
| `--color-text-disabled` | Light Grey | `#ABABAB` | Placeholder text, disabled states |

### 2.4 Status Colours

| Token | Status | Hex | Light Background |
|---|---|---|---|
| `--color-status-ordered` | Ordered | `#F59E0B` | `#FEF3C7` |
| `--color-status-in-process` | In Process | `#1B3A9E` | `#DBEAFE` |
| `--color-status-completed` | Completed | `#16A34A` | `#DCFCE7` |

> **Why these status colours?**
> `ordered` uses amber — neutral, "waiting" state. `in_process` reuses Suvidha Blue —
> active, brand-aligned. `completed` uses green — universal positive completion signal.

### 2.5 Feedback Colours

| Token | Name | Hex | Usage |
|---|---|---|---|
| `--color-error` | Error Red | `#DC2626` | Error messages, failed states |
| `--color-error-bg` | Error Light | `#FEE2E2` | Error banners |
| `--color-success` | Success Green | `#16A34A` | Order placed confirmation |
| `--color-success-bg` | Success Light | `#DCFCE7` | Success banners |

### 2.6 Colour Swatch Summary

```
Suvidha Orange  ████  #F26522
Suvidha Blue    ████  #1B3A9E
White           ████  #FFFFFF
Off White       ████  #F8F8F8
Surface Variant ████  #EFEFEF
Border          ████  #E0E0E0
Text Primary    ████  #1A1A1A
Text Secondary  ████  #6B6B6B
Ordered Amber   ████  #F59E0B
Completed Green ████  #16A34A
Error Red       ████  #DC2626
```

---

## 3. Typography

Font stack uses system fonts for performance — no custom font loading required.

| Token | Font | Weight | Size | Line Height | Usage |
|---|---|---|---|---|---|
| `--text-heading-xl` | System Default | 700 | 24px | 32px | Screen titles |
| `--text-heading-lg` | System Default | 700 | 20px | 28px | Section headers, brand names |
| `--text-heading-md` | System Default | 600 | 17px | 24px | Card titles, PO distributor name |
| `--text-body-lg` | System Default | 400 | 16px | 24px | Product names, body text |
| `--text-body-md` | System Default | 400 | 14px | 20px | SKU, unit labels, descriptions |
| `--text-body-sm` | System Default | 400 | 12px | 16px | Timestamps, meta info |
| `--text-label` | System Default | 600 | 13px | 18px | Buttons, status badges, tab labels |
| `--text-price` | System Default | 700 | 16px | 20px | Prices, totals |

---

## 4. Spacing & Grid

| Token | Value | Usage |
|---|---|---|
| `--space-xs` | 4px | Icon gaps, tight padding |
| `--space-sm` | 8px | Inner card padding, stepper spacing |
| `--space-md` | 12px | List item vertical padding |
| `--space-lg` | 16px | Card padding, screen horizontal margin |
| `--space-xl` | 24px | Section spacing |
| `--space-2xl` | 32px | Screen top padding |

**Screen horizontal margin:** 16px on all sides.
**Card border radius:** 12px.
**Button border radius:** 8px.
**Badge border radius:** 100px (pill).

---

## 5. Iconography

Icons from `@expo/vector-icons` — **Ionicons** set. Consistent with iOS/Android system conventions.

| Icon Name | Ionicons Key | Usage |
|---|---|---|
| Cart | `cart-outline` / `cart` (filled when active) | CartFAB, tab bar |
| Orders / PO | `receipt-outline` | Orders tab |
| Home | `home-outline` | Home tab |
| Brand / Store | `storefront-outline` | Brand cards |
| Product | `cube-outline` | Product rows |
| Search | `search-outline` | Distributor search |
| Add | `add-circle-outline` | Quantity stepper + |
| Remove | `remove-circle-outline` | Quantity stepper – |
| Chevron Right | `chevron-forward` | Card navigation arrow |
| Check | `checkmark-circle` | Completed status |
| Time | `time-outline` | Ordered/In Process status |
| Back | `arrow-back` | Stack navigation back button |
| Error | `alert-circle-outline` | Error states |

---

## 6. Component Specifications

### 6.1 StatusBadge

Pill-shaped label. Used on PO cards and Order Detail header.

```
┌─────────────────┐
│  ●  In Process  │   ← dot + label
└─────────────────┘

Ordered:    bg #FEF3C7  text #B45309  dot #F59E0B
In Process: bg #DBEAFE  text #1B3A9E  dot #1B3A9E
Completed:  bg #DCFCE7  text #15803D  dot #16A34A

Height: 24px
Padding: 4px 10px
Border radius: 100px
Font: --text-label (600, 13px)
```

---

### 6.2 QuantitySelector

The most-used interaction component. Lives in every ProductRow.

```
Quantity = 0 (not in cart):
┌───┐         ┌───┐
│ – │   0     │ + │
└───┘         └───┘
Minus button: dimmed (#ABABAB), disabled
Count: --text-body-md, #ABABAB

Quantity ≥ 1 (in cart):
┌───┐         ┌───┐
│ – │   2     │ + │
└───┘         └───┘
Minus button: active, #F26522
Count: --text-price (bold), #1A1A1A
Plus button: active, #F26522

Button size: 32×32px, border radius 16px
Button bg: transparent; icon-only
Active icon colour: #F26522 (Suvidha Orange)
```

---

### 6.3 CartFAB (Floating Action Button)

Fixed position, bottom-right. Visible on Brand Listing and Product screens.

```
        ┌──────────────┐
        │  🛒  3 items │
        └──────────────┘

Position: bottom: 24px, right: 16px
Size: auto width, height 48px, border radius 24px
Background: #F26522 (Suvidha Orange)
Text: #FFFFFF, --text-label
Padding: 0 20px
Shadow: 0 4px 12px rgba(242,101,34,0.35)
Badge: small white circle with count, top-right of button
```

---

### 6.4 BrandCard

Used in the Brand Listing screen.

```
┌─────────────────────────────────────┐
│  [Logo]  Brand Name            ›   │
│          12 products               │
└─────────────────────────────────────┘

Height: 72px
Padding: 12px 16px
Logo: 44×44px, border radius 8px, bg #EFEFEF if no logo
Brand Name: --text-heading-md, #1A1A1A
Product count: --text-body-sm, #6B6B6B
Chevron: Ionicons chevron-forward, #ABABAB
Background: #FFFFFF
Border: 1px solid #E0E0E0
Border radius: 12px
Margin bottom: 8px
```

---

### 6.5 POCard

Used in the PO List screen.

```
┌─────────────────────────────────────┐
│  Distributor Name          [badge]  │
│  31 Mar 2026  ·  5 items           │
│  ₹2,450.00                          │
└─────────────────────────────────────┘

Padding: 16px
Background: #FFFFFF
Border radius: 12px
Border: 1px solid #E0E0E0
Distributor: --text-heading-md, #1A1A1A
Date + items: --text-body-sm, #6B6B6B
Total: --text-price, #1A1A1A
Badge: top-right, StatusBadge component
```

---

### 6.6 BrandSectionHeader

Used inside SectionList in Cart and Order Detail screens.

```
────────────────────────────────────
  [Logo]  BRAND NAME
────────────────────────────────────

Height: 44px
Background: #F8F8F8 (off white, distinct from card surface)
Logo: 28×28px, border radius 6px
Brand name: --text-heading-md, #1B3A9E (Suvidha Blue)
Padding: 8px 16px
Top border: 1px solid #E0E0E0
```

---

### 6.7 Primary Button

Used for "Place Order" and "Search" CTAs.

```
┌─────────────────────────┐
│       Place Order       │
└─────────────────────────┘

Height: 52px
Background: #F26522
Text: #FFFFFF, --text-label, 15px, 600 weight
Border radius: 8px
Padding: 0 24px
Disabled: bg #ABABAB, text #FFFFFF
Full width on mobile screens
```

---

## 7. Screen Layouts

### 7.1 Home — Distributor Entry

```
┌─────────────────────────────────┐
│  [Suvidha Logo]                 │  ← header
│                                 │
│  Enter Distributor Number       │  ← heading xl
│                                 │
│  ┌─────────────────────────┐    │
│  │  e.g. DIST-001          │    │  ← text input
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │        Search           │    │  ← primary button (orange)
│  └─────────────────────────┘    │
│                                 │
│  [Error message if any]         │
│                                 │
│  ── Recent ──────────────────   │
│  DIST-001  Raj Distributors     │  ← recent lookups (optional)
│  DIST-004  Metro Agencies       │
└─────────────────────────────────┘
```

---

### 7.2 Brand Listing

```
┌─────────────────────────────────┐
│  ←  Raj Distributors     🛒 3   │  ← header (blue) + cart icon
│─────────────────────────────────│
│  ┌─────────────────────────┐    │
│  │ [Logo] Amul       12  › │    │  ← BrandCard
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │ [Logo] Haldiram's  8  › │    │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │ [Logo] Britannia   15 › │    │
│  └─────────────────────────┘    │
│                                 │
│                        ┌──────┐ │
│                        │🛒  3 │ │  ← CartFAB (orange, bottom right)
│                        └──────┘ │
└─────────────────────────────────┘
```

---

### 7.3 Product Screen (per brand)

```
┌─────────────────────────────────┐
│  ←  Amul Products        🛒 3   │  ← header (blue)
│─────────────────────────────────│
│  [Product image] Amul Butter    │
│  SKU: AMB-001 · Carton  ₹220   │
│                    [–]  0  [+]  │  ← QuantitySelector
│─────────────────────────────────│
│  [Product image] Amul Milk 1L   │
│  SKU: AML-001 · Dozen   ₹480   │
│                    [–]  2  [+]  │  ← in cart (orange digits)
│─────────────────────────────────│
│  [Product image] Amul Ghee 1kg  │
│  SKU: AMG-001 · Piece  ₹550    │
│                    [–]  0  [+]  │
│                                 │
│                        ┌──────┐ │
│                        │🛒  3 │ │
│                        └──────┘ │
└─────────────────────────────────┘
```

---

### 7.4 Cart Review

```
┌─────────────────────────────────┐
│  ←  Your Cart                   │  ← header
│─────────────────────────────────│
│  ── Amul ────────────────────   │  ← BrandSectionHeader (blue text)
│  Amul Milk 1L   ×2  ₹480  ₹960 │
│  Amul Ghee 1kg  ×1  ₹550  ₹550 │
│─────────────────────────────────│
│  ── Britannia ───────────────   │
│  Good Day       ×3  ₹120  ₹360 │
│─────────────────────────────────│
│                                 │
│  Items: 6          Total        │
│                         ₹1,870  │  ← OrderSummary
│                                 │
│  ┌─────────────────────────┐    │
│  │       Place Order       │    │  ← primary button (full width)
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```

---

### 7.5 PO Menu (Orders Tab)

```
┌─────────────────────────────────┐
│  Purchase Orders                │  ← header (blue bg)
│─────────────────────────────────│
│  All  Ordered  In Process  Done │  ← POStatusFilterTabs
│       ──────                    │    (active tab = orange underline)
│─────────────────────────────────│
│  ┌─────────────────────────┐    │
│  │ Raj Distributors [Ord.] │    │  ← POCard
│  │ 31 Mar 2026 · 6 items   │    │
│  │ ₹1,870                  │    │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │ Metro Agencies [Done ✓] │    │
│  │ 28 Mar 2026 · 12 items  │    │
│  │ ₹4,200                  │    │
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```

---

### 7.6 Order Detail

```
┌─────────────────────────────────┐
│  ←  Order Detail                │  ← header
│─────────────────────────────────│
│  Raj Distributors               │  ← distributor name
│  31 March 2026                  │  ← order date
│  [● In Process]                 │  ← StatusBadge
│─────────────────────────────────│
│  ── Amul ────────────────────   │  ← BrandSectionHeader
│  Amul Milk 1L   ×2  ₹480  ₹960 │
│  Amul Ghee 1kg  ×1  ₹550  ₹550 │
│─────────────────────────────────│
│  ── Britannia ───────────────   │
│  Good Day       ×3  ₹120  ₹360 │
│─────────────────────────────────│
│                                 │
│  Total (6 items)       ₹1,870   │
└─────────────────────────────────┘
```

---

## 8. Navigation Structure

```
Tab Bar
├── Home (Ionicons: home-outline)
│   └── Stack
│       ├── index.tsx              ← Distributor Entry
│       ├── distributor/[id]/brands.tsx
│       ├── distributor/[id]/brand/[brandId].tsx
│       └── cart.tsx
│
└── Orders (Ionicons: receipt-outline)
    └── Stack
        ├── orders.tsx             ← PO List
        └── orders/[poId].tsx      ← Order Detail
```

**Tab Bar:**
- Background: `#FFFFFF`
- Active icon + label: `#F26522` (Suvidha Orange)
- Inactive icon + label: `#6B6B6B`
- Border top: `1px solid #E0E0E0`

**Stack Header:**
- Background: `#1B3A9E` (Suvidha Blue)
- Title: `#FFFFFF`, `--text-heading-md`
- Back button: `#FFFFFF` Ionicons `arrow-back`

---

## 9. Interaction States

| State | Visual Treatment |
|---|---|
| Default | As per component spec above |
| Pressed | 10% opacity darken on press (scale 0.97) |
| Disabled | Background `#ABABAB`, text `#FFFFFF` |
| Loading | Replace content with animated skeleton (grey shimmer, `#EFEFEF` → `#E0E0E0`) |
| Error | Red border (`#DC2626`) on input; red banner at screen top |
| Empty | Centred illustration + message + optional CTA button |
| Success | Green banner (`#DCFCE7`) toast at bottom, 3s auto-dismiss |

---

## 10. Responsive Considerations

- Designed for **portrait mode only** (v1.0)
- Minimum supported screen: 5.0" (360×640dp)
- Maximum tested: 6.7" (412×915dp)
- Font sizes do **not** scale with system accessibility font size in v1.0 — to be added in v1.1
- All touch targets minimum **44×44pt** per WCAG 2.5.5

---

## 11. Empty States

| Screen | Illustration Concept | Message |
|---|---|---|
| Brand Listing — no brands | Empty shelf graphic | "No brands found for this distributor." |
| Product Screen — no products | Empty box graphic | "No products available for this brand." |
| Cart — empty | Empty cart graphic | "Your cart is empty. Browse brands to add products." |
| Orders — no POs | Receipt with dashes | "No orders yet. Start by searching for a distributor." |
| Orders — filtered empty | Filtered list icon | "No orders with this status." |

Empty state layout: vertically centred, icon (80×80px, `#ABABAB`), heading, subtext, optional button.
