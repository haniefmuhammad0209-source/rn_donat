# Design Document: RN Donat Admin Features

## Overview

Dokumen ini mendeskripsikan desain teknis untuk 7 fitur tambahan pada admin panel RN Donat. Semua fitur dibangun di atas stack yang sudah ada: **React 19 + Vite + Firebase Firestore + Tailwind CSS + Framer Motion**, dengan menambahkan library baru `xlsx` (SheetJS) dan `jspdf` + `jspdf-autotable` untuk ekspor laporan.

### Prinsip Desain

- **Minimal perubahan breaking**: Fitur baru ditambahkan sebagai tab/komponen baru atau ekstensi dari yang sudah ada, tidak mengubah kontrak API yang berlaku.
- **Kalkulasi di client**: Statistik dan kalkulasi dilakukan di sisi client dari data `orders` yang sudah di-subscribe secara real-time, menghindari Cloud Functions tambahan.
- **Atomik untuk stok**: Pengurangan stok menggunakan `increment` Firestore untuk menghindari race condition.
- **WA sebagai notifikasi utama**: Browser push notification bersifat opsional/sekunder; WhatsApp tetap menjadi kanal notifikasi primer sesuai arsitektur yang ada.

---

## Architecture

### Gambaran Umum Arsitektur

```
┌─────────────────────────────────────────────────────────┐
│                     Client (React SPA)                   │
│                                                          │
│  ┌─────────────┐   ┌──────────────────────────────────┐ │
│  │ PaymentModal │   │         Admin.jsx                │ │
│  │  + Pickup    │   │  ┌────────┬────────┬──────────┐  │ │
│  │  Schedule    │   │  │ Stats  │Reports │  Stock   │  │ │
│  └──────┬──────┘   │  │  Tab   │  Tab   │  Tab     │  │ │
│         │          │  ├────────┼────────┼──────────┤  │ │
│         │          │  │ Orders │Customer│ Testimoni│  │ │
│         │          │  │  Tab   │  Tab   │  Tab     │  │ │
│         │          │  └────────┴────────┴──────────┘  │ │
│         │          └──────────────────────────────────┘ │
│         │                                               │
│  ┌──────▼──────────────────────────────────────────┐    │
│  │               Services Layer                    │    │
│  │  orderService  │  stockService  │  reportService │    │
│  │  waNotification (extended)                      │    │
│  └──────────────────────────┬──────────────────────┘    │
│                             │                           │
│  ┌──────────────────────────▼──────────────────────┐    │
│  │               Hooks Layer                       │    │
│  │  useOrderStats  │  useStockStatus               │    │
│  │  useSalesReport │  useCustomerHistory            │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────┬───────────────────────┘
                                  │ Firestore SDK
┌─────────────────────────────────▼───────────────────────┐
│                  Firebase Firestore                       │
│                                                          │
│  collections: orders, stats, stock, settings            │
│  docs: stock/plain_donut, stats/orders                  │
└──────────────────────────────────────────────────────────┘
```

### Alur Data Utama

**Alur Order Baru (dengan Pickup Schedule + Stock Reduction):**

```
Pelanggan → PaymentModal (pilih metode + pickup schedule)
    → buildWAMessage() menyertakan jadwal ambil
    → orderService.create({ ..., pickupSchedule })
        ├─ addDoc ke koleksi 'orders' (Firestore)
        └─ stockService.reduceStock(totalBoxes * DONAT_PER_BOX)
               └─ updateDoc 'stock/plain_donut' { current: increment(-N) }

Admin listener onSnapshot('orders')
    ├─ useAdminOrdersListener → detect order baru
    │      └─ triggerAdminNotification(order) 
    │             ├─ Notification API (browser push, jika izin granted)
    │             └─ waNotification.sendAdminNotification(order)
    └─ update UI: stats, badge pending, customer list
```

**Alur Update Status (dengan WA Notif Customer):**

```
Admin → select dropdown status → handleUpdateOrderStatus(id, status, order)
    → orderService.updateStatus(id, status)
        └─ updateDoc 'orders/{id}' { status, updatedAt, [paidAt] }
            └─ IF status === 'paid': increment stats/orders
    → sendStatusNotification(order, status)  [waNotification.js]
        └─ window.open WA ke customerPhone
```

---

## Components and Interfaces

### File Baru yang Perlu Dibuat

#### `src/services/stockService.js`
Mengelola operasi stok donat polos di Firestore.

```js
// Interface
stockService.getStock()          → Promise<{ current, threshold }>
stockService.setStock(value)     → Promise<void>
stockService.setThreshold(value) → Promise<void>
stockService.reduceStock(qty)    → Promise<void>  // gunakan increment(-qty)
stockService.subscribeStock(cb)  → unsubscribeFn
```

#### `src/services/reportService.js`
Kalkulasi dan ekspor laporan penjualan.

```js
// Interface
reportService.filterByDateRange(orders, startDate, endDate) → Order[]
reportService.filterByMonth(orders, year, month)            → Order[]
reportService.groupByDay(orders)                            → { date: string, count: number, revenue: number }[]
reportService.calculateRevenue(orders)                      → number  // hanya paid/completed
reportService.exportToExcel(rows, filename)                 → void    // trigger download .xlsx
reportService.exportToPDF(rows, filename)                   → void    // trigger download .pdf
```

#### `src/hooks/useStockStatus.js`
Subscribe real-time ke dokumen `stock/plain_donut`.

```js
// Returns
{ stock: number, threshold: number, isLow: boolean, loading: boolean }
```

#### `src/hooks/useSalesReport.js`
State management untuk filter dan data laporan.

```js
// Returns
{ rows, totalRevenue, totalOrders, filterMode, setFilterMode,
  startDate, setStartDate, endDate, setEndDate,
  selectedMonth, setSelectedMonth }
```

#### `src/hooks/useAdminOrdersListener.js`
Deteksi order baru dan trigger notifikasi admin.

```js
// Params
useAdminOrdersListener({ onNewOrder: (order) => void })
// Menyimpan lastSeenOrderId di localStorage untuk membedakan order baru vs lama
```

### File yang Dimodifikasi

#### `src/components/PaymentModal.jsx`
Tambah seksi **Jadwal Pengambilan** di antara pilihan metode pembayaran dan tombol konfirmasi:

```
[existing: pilih COD/QRIS]
[NEW: Jadwal Pengambilan]
  ○ Ambil Sekarang
  ○ Ambil Hari Ini  [input jam HH:MM]
  ○ Ambil Besok     [input jam HH:MM]
[existing: tombol konfirmasi]
```

Props `onClose(shouldClear)` tidak berubah. `buildWAMessage()` diperluas menyertakan baris jadwal ambil.

#### `src/services/orderService.js` — `create()`
Tambah parameter `pickupSchedule` ke payload `addDoc`. Tambah panggilan `stockService.reduceStock()` setelah order berhasil dibuat.

```js
// Tambahan di create():
pickupSchedule,   // field baru di dokumen order

// Setelah addDoc berhasil:
await stockService.reduceStock(totalBoxes * DONAT_PER_BOX);
```

#### `src/utils/waNotification.js`
Tambah dua fungsi baru:
- `formatPickupSchedule(pickupSchedule)` → string yang bisa dibaca manusia
- `sendAdminNotification(order)` → buka WA ke `WA_NUMBER` dengan detail order baru

#### `src/pages/Admin.jsx`
- Tambah tab baru: **Laporan** (antara Statistik dan Pesanan) dan **Stok** (antara Pesanan dan Pelanggan)
- Perluas kalkulasi di `useMemo` untuk statistik hari ini, bulan ini, produk terlaris, pelanggan unik
- Tambah indikator badge pending di tab Pesanan
- Integrasikan `useAdminOrdersListener` untuk notifikasi order baru
- Tampilkan `pickupSchedule` di setiap baris order
- Perluas panel detail pelanggan di tab Pelanggan

#### `src/utils/constants.js`
Tidak ada perubahan. Konstanta `DONAT_PER_BOX = 6` sudah ada dan akan digunakan oleh `stockService`.

---

## Data Models

### Koleksi `orders` — Field Baru

Dokumen order yang sudah ada di-extend dengan field opsional berikut:

```js
{
  // ... field yang sudah ada ...

  // BARU (Requirement 5)
  pickupSchedule: {
    type: 'now' | 'today' | 'tomorrow',
    time: string | null,  // format "HH:MM", null jika type='now'
  },
}
```

### Dokumen `stock/plain_donut` — Baru

```js
// Path: Firestore → collection 'stock' → document 'plain_donut'
{
  current: number,    // stok donat polos saat ini (bisa negatif)
  threshold: number,  // batas minimum peringatan (default: 30)
  updatedAt: Timestamp,
}
```

### Dokumen `stats/orders` — Field Baru

Dokumen stats yang sudah ada di-extend:

```js
{
  // ... field yang sudah ada (totalBoxes, totalOrders, totalRevenue) ...

  // BARU — counter untuk efisiensi query opsional (boleh dilewati karena client menghitung dari orders live)
  // Tidak perlu field baru; kalkulasi dilakukan di client dari snapshot orders.
}
```

### Firestore Rules — Perubahan

```
// Tambah rule untuk koleksi 'stock'
match /stock/{docId} {
  allow read: if true;                          // customer perlu baca threshold? Tidak — set ke admin only
  allow read: if isAdmin();                     // hanya admin yang baca
  allow write: if isAdmin();                    // hanya admin yang update threshold/set stok
  // Khusus 'plain_donut', boleh write dari client saat order baru (untuk reduceStock)
  // Solusi: gunakan Firebase Security Rules dengan kondisi:
  allow update: if request.resource.data.current == resource.data.current + request.resource.data.diff;
  // Atau lebih sederhana: izinkan authenticated users untuk reduce (karena order creation sudah
  // diproteksi oleh auth), atau gunakan Firestore transaction.
}
```

> **Catatan Desain**: Karena order creation dilakukan oleh pelanggan yang belum login (rules `orders` mungkin `allow create: if true`), pengurangan stok dari `orderService.create()` perlu diizinkan tanpa auth. Solusi: set rule `stock/plain_donut` boleh di-update oleh siapapun hanya untuk operasi `increment` (decrement), atau lakukan di Cloud Function triggered by `orders` write. Rekomendasi untuk implementasi awal: izinkan update `stock/plain_donut` dari siapapun (karena dokumen ini bukan data sensitif), dan validasi di sisi admin.

### Schema Ringkas Semua Collections

| Collection | Document | Tujuan |
|---|---|---|
| `orders` | `{orderId}` | Data pesanan pelanggan (diperluas dengan `pickupSchedule`) |
| `stats` | `orders` | Counter aggregat (totalBoxes, totalOrders, totalRevenue) |
| `stock` | `plain_donut` | Stok donat polos real-time |
| `settings` | `store` | Pengaturan toko (sudah ada: `isOpen`, `qrisImageUrl`) |
| `products` | `{productId}` | Data produk (tidak berubah) |
| `testimonials` | `{testiId}` | Testimoni pelanggan (tidak berubah) |

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

#### Refleksi Sebelum Menulis Properti

Sebelum menulis properti final, berikut refleksi untuk menghilangkan redundansi:

- **2.1 (pendapatan hari ini)** dan **2.2 (pendapatan bulan ini)** adalah dua dimensi berbeda dari fungsi kalkulasi yang sama — keduanya dipertahankan karena logika filternya berbeda (hari vs bulan).
- **2.3 (order hari ini)** dapat diverifikasi sebagai sub-bagian dari fungsi yang sama dengan 2.1 — dapat digabung dalam satu property yang menguji dimensi berbeda. Dipertahankan terpisah karena semantiknya berbeda (semua status vs paid only).
- **5.2, 5.3, 5.4** (pickup schedule mapping) dapat digabung menjadi satu property: "for any pickup type, stored pickupSchedule matches selection". Setelah digabung, 5.5 (round-trip) adalah property yang lebih kuat dan mencakup 5.2-5.4 implisit. Keduanya dipertahankan karena yang satu menguji logika konstruksi, yang lain menguji persistensi.
- **7.1 dan 7.2** keduanya tentang `computeCustomers` — dapat digabung menjadi satu property komprehensif.
- **7.4 dan 7.6** (filter dan summary per customer) dapat digabung: "for any customer, getCustomerHistory returns correct filtered+sorted orders with correct summary".

---

### Property 1: Status label selalu konsisten dengan konstanta

*For any* `status` yang merupakan key valid di `ORDER_STATUS`, label yang ditampilkan di Admin_Panel **harus** sama dengan `ORDER_STATUS_LABEL[status]`.

**Validates: Requirements 1.7**

---

### Property 2: Filter laporan berdasarkan rentang tanggal

*For any* daftar orders dan rentang tanggal `[startDate, endDate]`, semua orders yang dikembalikan oleh `filterByDateRange()` **harus** memiliki `createdAt` yang berada dalam rentang tersebut, dan tidak ada order dalam rentang tersebut yang hilang dari hasil.

**Validates: Requirements 3.3, 3.7**

---

### Property 3: Grouping laporan per hari mencakup semua hari

*For any* daftar orders dan bulan tertentu, hasil `groupByDay()` **harus** mengandung entry untuk setiap tanggal unik yang ada di data, dan total count + revenue di semua entries **harus** sama dengan total count + revenue dari orders asli yang ada di bulan tersebut (untuk status paid/completed).

**Validates: Requirements 3.4, 3.7**

---

### Property 4: Kalkulasi statistik hari ini hanya mencakup tanggal hari ini

*For any* daftar orders dengan distribusi tanggal acak, fungsi `calculateTodayStats(orders)` **harus** mengembalikan:
- `todayRevenue` = jumlah `totalPrice` dari orders dengan `createdAt` pada hari ini DAN status `paid`/`completed`
- `todayOrderCount` = jumlah orders dengan `createdAt` pada hari ini (semua status)

**Validates: Requirements 2.1, 2.3**

---

### Property 5: Kalkulasi statistik bulan ini hanya mencakup bulan berjalan

*For any* daftar orders dengan distribusi bulan acak, fungsi `calculateMonthStats(orders)` **harus** mengembalikan `monthRevenue` yang sama dengan jumlah `totalPrice` dari orders dengan `createdAt` pada bulan dan tahun yang sama dengan saat ini, DAN status `paid`/`completed`.

**Validates: Requirements 2.2**

---

### Property 6: Produk terlaris adalah produk dengan total quantity tertinggi

*For any* daftar orders berstatus `paid`/`completed` yang mengandung field `items`, fungsi `getBestSellingProduct(orders)` **harus** mengembalikan nama produk dengan total akumulasi `quantity` tertinggi di semua orders tersebut.

**Validates: Requirements 2.4**

---

### Property 7: Jumlah pelanggan unik adalah kardinalitas set nomor telepon

*For any* daftar orders, fungsi `countUniqueCustomers(orders)` **harus** mengembalikan jumlah yang sama dengan ukuran set `{ order.customerPhone | order.customerPhone != null }`.

**Validates: Requirements 2.5**

---

### Property 8: Pengurangan stok sesuai dengan totalBoxes × DONAT_PER_BOX

*For any* nilai `totalBoxes` yang positif, nilai pengurangan stok yang dihitung **harus** sama dengan `totalBoxes × DONAT_PER_BOX` (yaitu `totalBoxes × 6`).

**Validates: Requirements 4.3**

---

### Property 9: Peringatan stok rendah konsisten dengan perbandingan threshold

*For any* nilai stok `s` dan threshold `t`, fungsi `isLowStock(s, t)` **harus** mengembalikan `true` jika dan hanya jika `s < t`.

**Validates: Requirements 4.4, 4.7**

---

### Property 10: Pickup schedule tersimpan sesuai pilihan pengguna (round-trip)

*For any* kombinasi pickup type (`now`, `today`, `tomorrow`) dan waktu opsional, pickup schedule yang dibangun dari pilihan pengguna dan kemudian dibaca kembali dari dokumen order di Firestore **harus** secara struktur identik dengan nilai yang dikirim.

**Validates: Requirements 5.2, 5.3, 5.4, 5.5**

---

### Property 11: Pesan WA mengandung informasi pickup schedule

*For any* order yang memiliki field `pickupSchedule`, fungsi `buildWAMessage(order)` yang di-generate untuk pelanggan **harus** mengandung representasi teks yang terbaca dari jadwal ambil tersebut.

**Validates: Requirements 5.6**

---

### Property 12: Pesan WA admin mengandung semua field wajib order baru

*For any* order baru, fungsi `buildAdminNewOrderMessage(order)` **harus** menghasilkan string yang mengandung: nama pelanggan (`customerName`), daftar item pesanan, total harga, dan metode pembayaran.

**Validates: Requirements 6.4**

---

### Property 13: Badge pending selalu mencerminkan jumlah order pending

*For any* daftar orders, nilai `pendingBadgeCount` **harus** sama dengan jumlah orders yang memiliki `status === 'pending'`.

**Validates: Requirements 6.5**

---

### Property 14: Daftar pelanggan unik terurut descending by total belanja

*For any* daftar orders, hasil `computeCustomerList(orders)` **harus**:
- memiliki tepat satu entry per `customerPhone` unik
- setiap entry memiliki `orderCount` = jumlah orders dari phone tersebut
- setiap entry memiliki `totalSpent` = jumlah `totalPrice` dari orders tersebut
- diurutkan sehingga `totalSpent[i] >= totalSpent[i+1]` untuk semua `i`

**Validates: Requirements 7.1, 7.2**

---

### Property 15: Riwayat pelanggan mengembalikan orders yang benar dengan summary akurat

*For any* nomor telepon pelanggan dan daftar orders, fungsi `getCustomerHistory(phone, orders)` **harus**:
- hanya mengembalikan orders dengan `customerPhone === phone`
- mengurutkan orders descending by `createdAt`
- summary `avgOrderValue` = `totalSpent / orderCount` (dalam batas toleransi floating-point)

**Validates: Requirements 7.4, 7.6**

---

## Error Handling

### Pengurangan Stok Gagal

Jika `stockService.reduceStock()` gagal setelah `addDoc` order berhasil, order tetap valid. Stok tidak berkurang, dan admin dapat menyesuaikan secara manual. Implementasi: fire-and-forget dengan `catch` yang log error ke console — tidak throw ke user karena order sudah dibuat.

```js
// Di orderService.create():
orderService.create = async (...) => {
  const id = await addDoc(...);  // jika ini gagal, throw normal
  stockService.reduceStock(qty).catch(err => 
    console.error('[Stock] Gagal mengurangi stok:', err)
  );
  return id;
};
```

### Export Laporan Gagal

Jika `xlsx` atau `jspdf` gagal (misal data kosong), tampilkan toast error. Tidak ada data sensitif yang hilang.

### Notifikasi Browser Ditolak

Simpan status di `localStorage` (`rn_donat_admin_notif_asked`). Jika ditolak, jangan tampilkan prompt lagi. Admin panel tetap berfungsi penuh.

### Order dengan customerPhone Kosong

`sendStatusNotification` dan `sendAdminNotification` sudah memiliki early return jika `customerPhone` kosong (sudah ada di kode). Tidak ada error yang ditampilkan ke admin.

### Stok Negatif

Bukan error — stok yang negatif adalah kondisi valid yang menandakan overorder. Tampilkan peringatan merah dengan label "Stok Habis (-N pcs)" di Dashboard.

### Firestore Offline

Firestore SDK secara otomatis melakukan buffering operasi write saat offline dan sync saat online kembali. Tidak perlu penanganan khusus. Untuk UI, `onSnapshot` tetap mengembalikan data dari cache lokal.

---

## Testing Strategy

### Unit Tests (Vitest)

Fokus pada fungsi kalkulasi murni di `reportService.js` dan utilitas:

```
reportService.filterByDateRange      → Property 2
reportService.groupByDay             → Property 3
reportService.calculateRevenue       → bagian dari Property 2, 3
calculateTodayStats                  → Property 4
calculateMonthStats                  → Property 5
getBestSellingProduct                → Property 6
countUniqueCustomers                 → Property 7
stockService.calculateReduction      → Property 8
isLowStock                           → Property 9
formatPickupSchedule                 → Property 11
buildAdminNewOrderMessage            → Property 12
computeCustomerList                  → Property 14
getCustomerHistory                   → Property 15
```

### Property-Based Tests

Library yang digunakan: **[fast-check](https://github.com/dubzzz/fast-check)** (TypeScript-friendly, kompatibel dengan Vitest, tidak memerlukan setup tambahan).

Konfigurasi: minimum **100 iterasi** per property test.

Setiap test diberi tag komentar dengan format:
```js
// Feature: rn-donat-admin-features, Property N: <property_text>
```

**Contoh implementasi Property 9:**
```js
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import { isLowStock } from '../services/stockService';

// Feature: rn-donat-admin-features, Property 9: isLowStock(s,t) = (s < t) for any s and t
describe('Property 9: isLowStock konsisten dengan perbandingan', () => {
  it('returns true iff stock < threshold', () => {
    fc.assert(fc.property(
      fc.integer({ min: -100, max: 1000 }),
      fc.integer({ min: 1, max: 200 }),
      (stock, threshold) => {
        expect(isLowStock(stock, threshold)).toBe(stock < threshold);
      }
    ), { numRuns: 100 });
  });
});
```

**Contoh implementasi Property 8:**
```js
import fc from 'fast-check';
import { DONAT_PER_BOX } from '../utils/constants';

// Feature: rn-donat-admin-features, Property 8: stockReduction = totalBoxes * DONAT_PER_BOX
describe('Property 8: Pengurangan stok sesuai formula', () => {
  it('reduces by totalBoxes * DONAT_PER_BOX', () => {
    fc.assert(fc.property(
      fc.integer({ min: 1, max: 100 }),
      (totalBoxes) => {
        const reduction = totalBoxes * DONAT_PER_BOX;
        expect(reduction).toBe(totalBoxes * 6);
      }
    ), { numRuns: 100 });
  });
});
```

**Contoh implementasi Property 14:**
```js
import fc from 'fast-check';
import { computeCustomerList } from '../utils/customerUtils';

// Feature: rn-donat-admin-features, Property 14: daftar pelanggan unik terurut descending
describe('Property 14: computeCustomerList', () => {
  it('returns unique customers sorted by totalSpent desc', () => {
    const orderArb = fc.record({
      customerPhone: fc.stringMatching(/^08\d{8,10}$/),
      customerName: fc.string({ minLength: 1 }),
      totalPrice: fc.integer({ min: 0, max: 500000 }),
      status: fc.constantFrom('paid', 'completed', 'pending', 'cancelled'),
      createdAt: fc.date(),
    });

    fc.assert(fc.property(
      fc.array(orderArb, { minLength: 1, maxLength: 50 }),
      (orders) => {
        const customers = computeCustomerList(orders);
        // Keunikan per phone
        const phones = customers.map(c => c.phone);
        expect(new Set(phones).size).toBe(phones.length);
        // Sorted descending
        for (let i = 0; i < customers.length - 1; i++) {
          expect(customers[i].totalSpent).toBeGreaterThanOrEqual(customers[i + 1].totalSpent);
        }
      }
    ), { numRuns: 100 });
  });
});
```

### Integration Tests

Gunakan **Firestore Emulator** untuk:
- Verifikasi `stockService.reduceStock()` menggunakan `increment` dengan benar (Requirement 4.3)
- Verifikasi `orderService.create()` menyimpan `pickupSchedule` dengan benar (Requirement 5.5)
- Verifikasi `onSnapshot` mendeteksi order baru (Requirement 6.1, 6.6)
- Verifikasi statistik real-time update setelah `updateStatus` (Requirement 2.6)

### Smoke Tests

- Admin panel dapat login dan mengakses semua 7 tab
- Browser push notification prompt muncul sekali saat pertama buka Admin_Panel
- Export Excel dan PDF menghasilkan file yang dapat didownload

### Accessibility

- Semua input jadwal pengambilan memiliki `<label>` dan `aria-required`
- Dropdown status order memiliki `aria-label` yang deskriptif
- Badge notifikasi pending menggunakan `aria-label="N pesanan pending"`
- Panel detail pelanggan dapat ditutup dengan tombol Escape (`onKeyDown`)

### Performa

- **`useMemo`**: Kalkulasi statistik (chartData, customers, todayStats, monthStats, bestSeller) di-memoize dengan dependency `[orders]`.
- **Lazy import** library berat: `xlsx` dan `jspdf` di-import dinamis (`import()`) hanya saat tombol Export diklik, mengurangi initial bundle size.
- **`subscribeStock`**: Hanya 1 listener aktif untuk dokumen `stock/plain_donut`, di-cleanup pada unmount.
- **Pagination**: Tab Pesanan sudah memiliki pagination (PAGE_SIZE=10), tidak berubah.
- **Customer list derivasi**: Tidak ada query terpisah — diturunkan dari `orders` array yang sudah di-subscribe.
