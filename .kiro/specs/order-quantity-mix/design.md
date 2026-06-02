# Design Document

## Overview

Fitur ini memodifikasi `ProductCard.jsx` agar produk dengan `category === 'Mix'` menampilkan modal pemilihan jumlah kotak sebelum diarahkan ke WhatsApp, alih-alih langsung membuka WhatsApp. Modal ini tidak memiliki pilihan topping karena produk Mix sudah berisi campuran semua rasa.

Implementasi sudah selesai di `ProductCard.jsx`. Design document ini mendokumentasikan arsitektur yang sudah ada dan issues yang perlu difix.

## Architecture

### Component Flow

```
ProductCard
├── openModal() → setShowModal(true)
│   ├── product.category === 'Mix'  → Modal_Mix (jumlah kotak saja)
│   └── product.category !== 'Mix' → Modal_Topping (topping + jumlah kotak)
│
├── handleAddToCart() → CartContext.addItem() → Cart drawer
└── handleCheckoutNow() → PaymentModal (pilih COD/QRIS)
```

### State Management

`ProductCard` mengelola semua state modal secara lokal:
- `showModal` — visibilitas modal
- `quantity` — jumlah kotak (1–20)
- `toppingCounts` — map topping → jumlah (hanya untuk non-Mix)
- `notes` — catatan opsional
- `showPayment` / `pendingItem` — untuk alur checkout langsung

### Conditional Rendering

```jsx
// Header modal
{product.category === 'Mix' ? 'Pilih Jumlah Kotak' : 'Pilih Topping & Jumlah'}

// Topping section — hanya untuk non-Mix
{product.category !== 'Mix' && <ToppingSection />}

// canOrder logic
const canOrder = product.category === 'Mix' || totalToppingSelected === DONAT_PER_BOX;
```

### WhatsApp Message (via PaymentModal)

Untuk produk Mix, `toppingText` di `PaymentModal.buildWAMessage()` akan fallback ke `'Mix'` karena `toppingCounts` semua bernilai 0:

```js
const toppingText = Object.entries(item.toppings || {})
  .filter(([, v]) => v > 0)
  .map(([k, v]) => `${v} ${k}`)
  .join(', ') || 'Mix';  // ← fallback untuk produk Mix
```

## Known Issues & Fixes Required

### Bug 1: `useEffect` tidak diimport di `PaymentModal.jsx`
- **File**: `src/components/PaymentModal.jsx`
- **Problem**: `useEffect` digunakan untuk reset state saat modal dibuka/tutup, tapi tidak ada di import statement
- **Fix**: Tambah `useEffect` ke import dari `'react'`

### Bug 2: `useStoreStatus` — dependency array tidak lengkap
- **File**: `src/hooks/useStoreStatus.js`
- **Problem**: `useEffect` kedua (interval) menggunakan `activeSettings` tapi dependency array hanya `[settings]`, bukan `[activeSettings]`
- **Fix**: Gunakan `activeSettings` sebagai dependency, atau gabungkan kedua `useEffect`

### Bug 3: `qrisInputRef` digunakan sebagai value ref, bukan DOM ref
- **File**: `src/pages/Admin.jsx`
- **Problem**: `const qrisInputRef = useRef('')` lalu diakses sebagai `qrisInputRef.current.value` — ini benar untuk DOM ref, tapi `useRef('')` seharusnya `useRef(null)` untuk DOM element
- **Fix**: Ubah ke `useRef(null)`

### Issue 4: `ProductGridSkeleton` wrapper div redundant di `Testimoni.jsx`
- **File**: `src/components/Testimoni.jsx`
- **Problem**: `<div className="mb-8"><TestimoniGridSkeleton /></div>` — wrapper div tidak perlu karena grid sudah ada di dalam skeleton
- **Fix**: Hapus wrapper div, pindahkan `mb-8` ke className skeleton atau gunakan langsung

### Issue 5: `useStoreStatus` — `activeSettings` tidak stabil sebagai dependency
- **File**: `src/hooks/useStoreStatus.js`
- **Problem**: `const activeSettings = settings || DEFAULT_SETTINGS` dibuat ulang setiap render, menyebabkan `useEffect` re-run tidak perlu
- **Fix**: Gunakan `useMemo` untuk memoize `activeSettings`

### Issue 6: `Cart.jsx` — `useCallback` diimport tapi tidak digunakan
- **File**: `src/components/Cart.jsx`
- **Problem**: `useCallback` ada di import tapi tidak dipakai di komponen
- **Fix**: Hapus `useCallback` dari import

### Issue 7: `waNotification.js` — `ORDER_STATUS_LABEL` diimport tapi tidak digunakan
- **File**: `src/utils/waNotification.js`
- **Problem**: `ORDER_STATUS_LABEL` ada di import tapi tidak dipakai di file ini
- **Fix**: Hapus dari import

## Component Contracts

### ProductCard Props
```ts
interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    category: 'Coklat' | 'Matcha' | 'Cappuccino' | 'Red Velvet' | 'Tiramisu' | 'Mix';
    rating: number;
    bestseller?: boolean;
    description: string;
  };
  storeIsOpen?: boolean;    // default: true
  nextOpenText?: string;    // default: ''
}
```

### PaymentModal Props
```ts
interface PaymentModalProps {
  isOpen: boolean;
  onClose: (shouldClear: boolean) => void;
  items: Array<{
    product: MinimalProduct;
    quantity: number;
    toppings: Record<string, number>;  // semua 0 untuk Mix
    notes: string;
  }>;
  totalPrice: number;
  totalBoxes: number;
}
```
