# Implementation Plan: RN Donat Admin Features

## Overview

Implementasi 7 fitur tambahan pada admin panel RN Donat secara inkremental, dimulai dari pondasi (constants + waNotification) hingga UI polishing. Setiap task mereferensikan requirement yang spesifik dan dapat dieksekusi secara mandiri oleh coding agent.

Stack: React 19 + Vite + Firebase Firestore + Tailwind CSS + Framer Motion. Library baru: `xlsx` (SheetJS), `jspdf`, `jspdf-autotable`, `fast-check` (testing).

---

## Tasks

- [x] 1. Foundation — constants update dan waNotification extension
  - [x] 1.1 Tambah konstanta `PICKUP_SCHEDULE_TYPES` dan `PICKUP_SCHEDULE_LABEL` ke `src/utils/constants.js`
    - Tambah export: `PICKUP_SCHEDULE_TYPES = { NOW: 'now', TODAY: 'today', TOMORROW: 'tomorrow' }`
    - Tambah export: `PICKUP_SCHEDULE_LABEL = { now: 'Ambil Sekarang', today: 'Ambil Hari Ini', tomorrow: 'Ambil Besok' }`
    - Tidak ada perubahan pada konstanta yang sudah ada
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 1.2 Tambah fungsi `formatPickupSchedule(pickupSchedule)` ke `src/utils/waNotification.js`
    - Return string human-readable, contoh: `"🕐 Jadwal Ambil: Hari Ini pukul 14:00"`, `"🕐 Jadwal Ambil: Sekarang"`, `"🕐 Jadwal Ambil: Besok pukul 09:00"`
    - Return string kosong jika `pickupSchedule` null/undefined
    - _Requirements: 5.6_

  - [x] 1.3 Tambah fungsi `sendAdminNotification(order)` ke `src/utils/waNotification.js`
    - Buka WhatsApp ke `WA_NUMBER` dari `constants.js`
    - Pesan harus mengandung: nama pelanggan, daftar item pesanan, total harga, metode pembayaran
    - Format pesan: `"🔔 *Pesanan Baru!* ..."` dengan semua field order
    - _Requirements: 6.4_

  - [ ]* 1.4 Tulis property test untuk `formatPickupSchedule`
    - **Property 11: Pesan WA mengandung informasi pickup schedule**
    - For any order dengan field `pickupSchedule`, `formatPickupSchedule()` harus mengandung representasi teks yang terbaca dari jadwal ambil
    - File: `src/utils/__tests__/waNotification.test.js`
    - **Validates: Requirements 5.6**

  - [ ]* 1.5 Tulis property test untuk `sendAdminNotification` — verifikasi semua field wajib ada
    - **Property 12: Pesan WA admin mengandung semua field wajib order baru**
    - For any order baru, `buildAdminNewOrderMessage(order)` harus mengandung nama pelanggan, daftar item, total harga, metode pembayaran
    - File: `src/utils/__tests__/waNotification.test.js`
    - **Validates: Requirements 6.4**

- [ ] 2. Stock Service — Firestore stock management
  - [x] 2.1 Buat file `src/services/stockService.js` dengan interface lengkap
    - Implementasi `getStock()` → `Promise<{ current, threshold }>`
    - Implementasi `setStock(value)` → simpan ke `stock/plain_donut` dengan `updatedAt: serverTimestamp()`
    - Implementasi `setThreshold(value)` → update field `threshold` di `stock/plain_donut`
    - Implementasi `reduceStock(qty)` → gunakan `increment(-qty)` secara atomik
    - Implementasi `subscribeStock(cb)` → `onSnapshot` ke dokumen `stock/plain_donut`, return unsubscribeFn
    - Default threshold: 30 pcs
    - _Requirements: 4.2, 4.3, 4.5_

  - [~] 2.2 Buat hook `src/hooks/useStockStatus.js`
    - Gunakan `stockService.subscribeStock()` di dalam `useEffect`
    - Return `{ stock, threshold, isLow, loading }` di mana `isLow = stock < threshold`
    - Cleanup unsubscribe pada unmount
    - _Requirements: 4.4, 4.6_

  - [ ]* 2.3 Tulis property test untuk `isLowStock` dan kalkulasi pengurangan stok
    - **Property 8: Pengurangan stok sesuai dengan totalBoxes × DONAT_PER_BOX**
    - For any `totalBoxes` positif, `totalBoxes * DONAT_PER_BOX` harus `= totalBoxes * 6`
    - **Property 9: isLowStock(s, t) = (s < t) untuk semua s dan t**
    - File: `src/services/__tests__/stockService.test.js`
    - **Validates: Requirements 4.3, 4.4, 4.7**

- [ ] 3. Pickup Schedule di PaymentModal + orderService.create()
  - [~] 3.1 Modifikasi `src/components/PaymentModal.jsx` — tambah seksi Jadwal Pengambilan
    - Tambah state: `pickupType` (default `'now'`), `pickupTime` (string HH:MM)
    - Tambah UI radio buttons: "Ambil Sekarang", "Ambil Hari Ini", "Ambil Besok" — muncul di antara pilihan COD/QRIS dan tombol konfirmasi
    - Tampilkan input waktu `<input type="time">` saat `pickupType` adalah `'today'` atau `'tomorrow'`
    - Input waktu harus memiliki `<label htmlFor="...">` dan `aria-required="true"`
    - Validasi: jika `pickupType !== 'now'` dan `pickupTime` kosong, disable tombol konfirmasi dan tampilkan pesan validasi
    - Reset state pickup saat modal ditutup (di `useEffect` yang sudah ada)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.8_

  - [~] 3.2 Modifikasi `buildWAMessage()` di `PaymentModal.jsx` — sertakan jadwal ambil
    - Panggil `formatPickupSchedule(pickupSchedule)` dari `waNotification.js`
    - Tambahkan baris jadwal ambil ke pesan WA jika hasil `formatPickupSchedule` tidak kosong
    - _Requirements: 5.6_

  - [~] 3.3 Modifikasi `orderService.create()` di `src/services/orderService.js` — tambah `pickupSchedule` + kurangi stok
    - Tambah parameter `pickupSchedule` ke fungsi `create()`
    - Sertakan field `pickupSchedule` di payload `addDoc`
    - Setelah `addDoc` berhasil, panggil `stockService.reduceStock(totalBoxes * DONAT_PER_BOX)` sebagai fire-and-forget (`.catch(err => console.error(...))`)
    - _Requirements: 4.3, 5.5_

  - [~] 3.4 Modifikasi semua pemanggil `orderService.create()` — teruskan `pickupSchedule`
    - Cari semua tempat di codebase yang memanggil `orderService.create()` (kemungkinan di Cart.jsx atau PaymentModal.jsx)
    - Pastikan `pickupSchedule` yang dibangun dari state modal diteruskan ke service
    - _Requirements: 5.5_

  - [ ]* 3.5 Tulis property test untuk pickup schedule round-trip
    - **Property 10: Pickup schedule tersimpan sesuai pilihan pengguna (round-trip)**
    - For any kombinasi pickup type dan waktu opsional, `pickupSchedule` yang dibangun harus identik secara struktur dengan nilai yang dikirim
    - File: `src/components/__tests__/PaymentModal.test.js`
    - **Validates: Requirements 5.2, 5.3, 5.4, 5.5**

- [ ] 4. Dashboard Statistik Lengkap
  - [-] 4.1 Buat fungsi kalkulasi murni di `src/utils/statsUtils.js` (file baru)
    - `calculateTodayStats(orders)` → `{ todayRevenue, todayOrderCount }` — filter `createdAt` = hari ini kalender; revenue hanya paid/completed
    - `calculateMonthStats(orders)` → `{ monthRevenue }` — filter `createdAt` = bulan+tahun ini; hanya paid/completed
    - `getBestSellingProduct(orders)` → nama produk dengan akumulasi `quantity` tertinggi dari orders paid/completed; return `null` jika kosong
    - `countUniqueCustomers(orders)` → jumlah `customerPhone` unik yang tidak null
    - Semua fungsi harus pure (tidak ada side effect, tidak ada import Firebase)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 4.2 Tulis property test untuk `calculateTodayStats`
    - **Property 4: Kalkulasi statistik hari ini hanya mencakup tanggal hari ini**
    - For any daftar orders dengan distribusi tanggal acak, `calculateTodayStats()` harus hanya menghitung orders dari hari ini
    - File: `src/utils/__tests__/statsUtils.test.js`
    - **Validates: Requirements 2.1, 2.3**

  - [ ]* 4.3 Tulis property test untuk `calculateMonthStats`
    - **Property 5: Kalkulasi statistik bulan ini hanya mencakup bulan berjalan**
    - For any daftar orders dengan distribusi bulan acak, `calculateMonthStats()` harus hanya menghitung bulan+tahun yang sama dengan sekarang
    - File: `src/utils/__tests__/statsUtils.test.js`
    - **Validates: Requirements 2.2**

  - [ ]* 4.4 Tulis property test untuk `getBestSellingProduct`
    - **Property 6: Produk terlaris adalah produk dengan total quantity tertinggi**
    - For any daftar orders paid/completed, `getBestSellingProduct()` harus mengembalikan nama produk dengan akumulasi quantity tertinggi
    - File: `src/utils/__tests__/statsUtils.test.js`
    - **Validates: Requirements 2.4**

  - [ ]* 4.5 Tulis property test untuk `countUniqueCustomers`
    - **Property 7: Jumlah pelanggan unik adalah kardinalitas set nomor telepon**
    - For any daftar orders, hasilnya harus = ukuran Set dari semua customerPhone non-null
    - File: `src/utils/__tests__/statsUtils.test.js`
    - **Validates: Requirements 2.5**

  - [~] 4.6 Integrasikan statistik baru ke tab Statistik di `src/pages/Admin.jsx`
    - Import dan gunakan `calculateTodayStats`, `calculateMonthStats`, `getBestSellingProduct`, `countUniqueCustomers` dari `statsUtils.js`
    - Bungkus semua kalkulasi baru dalam `useMemo([orders])` untuk efisiensi
    - Tampilkan kartu stat baru: Pendapatan Hari Ini, Pendapatan Bulan Ini, Pesanan Hari Ini, Produk Terlaris, Pelanggan Unik
    - Integrasikan `useStockStatus()` → tampilkan kartu Stok Donat Polos di Dashboard
    - Tampilkan banner/peringatan merah jika `isLow === true` dengan teks "⚠️ Stok rendah: N pcs (batas: T pcs)"
    - Jika stok negatif, tampilkan peringatan "🚨 Stok Habis: N pcs"
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 4.4, 4.6, 4.7_

- [~] 5. Checkpoint — Pastikan semua tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Notifikasi Pesanan Baru untuk Admin
  - [~] 6.1 Buat hook `src/hooks/useAdminOrdersListener.js`
    - Terima prop `{ onNewOrder: (order) => void }`
    - Simpan `lastSeenOrderIds` di `useRef` (tidak di localStorage untuk kesederhanaan awal) — inisialisasi dengan semua order yang sudah ada saat pertama mount
    - Setiap kali `onSnapshot` fires dengan orders baru, bandingkan dengan `lastSeenOrderIds`; panggil `onNewOrder(order)` hanya untuk order yang benar-benar baru (tidak ada di `lastSeenOrderIds` sebelumnya)
    - Update `lastSeenOrderIds` setelah setiap snapshot
    - _Requirements: 6.1, 6.6_

  - [~] 6.2 Implementasi browser push notification di `src/pages/Admin.jsx`
    - Saat Admin mount dan `isAdmin === true`, periksa `Notification.permission`
    - Jika `'default'`, panggil `Notification.requestPermission()`; simpan hasil ke `localStorage` key `rn_donat_admin_notif_asked`
    - Jika sudah pernah ditolak (permission `'denied'` atau flag di localStorage), jangan minta lagi
    - Saat `onNewOrder(order)` dipanggil dan permission `'granted'`, tampilkan `new Notification(...)` dengan judul "Pesanan Baru 🍩" dan body berisi nama + total harga
    - _Requirements: 6.1, 6.2, 6.3_

  - [~] 6.3 Integrasikan `sendAdminNotification` ke callback `onNewOrder`
    - Saat `onNewOrder(order)` dipanggil, panggil `sendAdminNotification(order)` dari `waNotification.js`
    - Gunakan `useAdminOrdersListener({ onNewOrder })` di dalam Admin.jsx
    - _Requirements: 6.4_

  - [~] 6.4 Tambah badge pending ke tab Pesanan di Admin.jsx
    - Hitung `pendingCount = orders.filter(o => o.status === 'pending').length`
    - Tampilkan badge angka di label tab "Pesanan" jika `pendingCount > 0`
    - Badge menggunakan `aria-label={`${pendingCount} pesanan pending`}`
    - _Requirements: 6.5_

  - [ ]* 6.5 Tulis property test untuk `pendingBadgeCount`
    - **Property 13: Badge pending selalu mencerminkan jumlah order pending**
    - For any daftar orders, `pendingCount` harus = jumlah orders dengan `status === 'pending'`
    - File: `src/utils/__tests__/statsUtils.test.js`
    - **Validates: Requirements 6.5**

- [ ] 7. Laporan Penjualan + Export Excel/PDF
  - [~] 7.1 Install library ekspor dan buat `src/services/reportService.js`
    - Install dependencies: `npm install xlsx jspdf jspdf-autotable`
    - Implementasi `filterByDateRange(orders, startDate, endDate)` → filter `createdAt` dalam rentang inklusif
    - Implementasi `filterByMonth(orders, year, month)` → filter bulan+tahun tertentu
    - Implementasi `groupByDay(orders)` → return array `{ date: string, count: number, revenue: number }[]` diurut ascending by date; revenue hanya paid/completed
    - Implementasi `calculateRevenue(orders)` → jumlah `totalPrice` dari orders paid/completed
    - Implementasi `exportToExcel(rows, filename)` → lazy import `xlsx`, buat workbook, trigger download `.xlsx`
    - Implementasi `exportToPDF(rows, filename)` → lazy import `jspdf` + `jspdf-autotable`, buat tabel, trigger download `.pdf`
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ]* 7.2 Tulis property test untuk `filterByDateRange`
    - **Property 2: Filter laporan berdasarkan rentang tanggal**
    - For any daftar orders dan rentang `[startDate, endDate]`, semua hasil harus memiliki `createdAt` dalam rentang tersebut dan tidak ada order dalam rentang yang hilang
    - File: `src/services/__tests__/reportService.test.js`
    - **Validates: Requirements 3.3, 3.7**

  - [ ]* 7.3 Tulis property test untuk `groupByDay`
    - **Property 3: Grouping laporan per hari mencakup semua hari**
    - For any daftar orders, `groupByDay()` harus mengandung entry untuk setiap tanggal unik yang ada, dan total count + revenue di semua entries harus sama dengan total dari orders asli (paid/completed)
    - File: `src/services/__tests__/reportService.test.js`
    - **Validates: Requirements 3.4, 3.7**

  - [~] 7.4 Buat hook `src/hooks/useSalesReport.js`
    - State: `filterMode` (`'range'` | `'month'`), `startDate`, `endDate`, `selectedMonth` (format `"YYYY-MM"`)
    - Derived: `rows` (hasil `groupByDay` dari orders yang sudah difilter), `totalRevenue`, `totalOrders`
    - Gunakan `useMemo` dengan dependency pada `orders`, filter states
    - _Requirements: 3.3, 3.4, 3.7, 3.8_

  - [~] 7.5 Buat tab Laporan di `src/pages/Admin.jsx`
    - Tambah tab "Laporan" (ikon `FiFileText`) di antara Statistik dan Pesanan dalam array `TABS`
    - Render komponen laporan dengan filter mode toggle (Rentang Tanggal / Per Bulan)
    - Tampilkan tabel dengan kolom: Tanggal, Jumlah Pesanan, Total Pendapatan
    - Tambah tombol "Export Excel" dan "Export PDF" yang memanggil `reportService.exportToExcel()` / `reportService.exportToPDF()` dengan nama file menyertakan rentang tanggal
    - Tampilkan pesan informatif jika `rows.length === 0`: "Tidak ada data untuk periode yang dipilih."
    - Akses hanya untuk `isAdmin` (sudah ter-handle oleh guard di Admin.jsx)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.8_

- [ ] 8. Riwayat Pelanggan Detail
  - [-] 8.1 Buat fungsi `computeCustomerList` dan `getCustomerHistory` di `src/utils/customerUtils.js` (file baru)
    - `computeCustomerList(orders)` → array pelanggan unik `{ phone, name, orderCount, totalSpent, lastOrder }` diurutkan descending by `totalSpent`
    - `getCustomerHistory(phone, orders)` → filter orders dengan `customerPhone === phone`, diurutkan descending by `createdAt`; sertakan computed `avgOrderValue = totalSpent / orderCount`
    - Kedua fungsi harus pure
    - _Requirements: 7.1, 7.2, 7.4, 7.6_

  - [ ]* 8.2 Tulis property test untuk `computeCustomerList`
    - **Property 14: Daftar pelanggan unik terurut descending by total belanja**
    - For any daftar orders, hasil harus memiliki tepat satu entry per `customerPhone` unik, `orderCount` dan `totalSpent` akurat, diurutkan `totalSpent[i] >= totalSpent[i+1]`
    - File: `src/utils/__tests__/customerUtils.test.js`
    - **Validates: Requirements 7.1, 7.2**

  - [ ]* 8.3 Tulis property test untuk `getCustomerHistory`
    - **Property 15: Riwayat pelanggan mengembalikan orders yang benar dengan summary akurat**
    - For any nomor telepon dan daftar orders, hasilnya hanya mengandung orders dengan `customerPhone` yang cocok, diurut descending by `createdAt`, `avgOrderValue` akurat
    - File: `src/utils/__tests__/customerUtils.test.js`
    - **Validates: Requirements 7.4, 7.6**

  - [~] 8.4 Perluas tab Pelanggan di `src/pages/Admin.jsx` — panel detail riwayat
    - Tambah state `selectedCustomerPhone` (null = tampilkan daftar, string = tampilkan panel detail)
    - Gunakan `computeCustomerList(orders)` dari `customerUtils.js` (gantikan `useMemo` `customers` yang sudah ada)
    - Saat baris pelanggan diklik, set `selectedCustomerPhone`
    - Render panel detail: ringkasan (total pesanan, total belanja, rata-rata nilai pesanan) + tabel riwayat order (tanggal, items, total, metode bayar, status)
    - Tombol tutup panel dengan `onClick` dan `onKeyDown` (handle `Escape`) untuk aksesibilitas
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

- [ ] 9. Stok Management Tab di Admin Panel
  - [~] 9.1 Buat tab Stok di `src/pages/Admin.jsx`
    - Tambah tab "Stok" (ikon `FiBox`) setelah Pesanan dalam array `TABS`
    - Render form input stok awal dengan label "Stok Donat Polos (pcs)" dan `aria-required`
    - Render input threshold dengan label "Batas Minimum Peringatan (pcs)"
    - Tombol "Simpan Stok" memanggil `stockService.setStock(value)`
    - Tombol "Simpan Threshold" memanggil `stockService.setThreshold(value)`
    - Tampilkan nilai stok saat ini dari `useStockStatus()` secara real-time
    - _Requirements: 4.1, 4.2, 4.5, 4.6_

  - [~] 9.2 Tampilkan `pickupSchedule` pada setiap baris order di tab Pesanan
    - Di komponen `AdminOrdersTab`, setelah menampilkan `order.notes`, tambah baris jadwal ambil
    - Import dan gunakan `formatPickupSchedule(order.pickupSchedule)` dari `waNotification.js`
    - Tampilkan hanya jika `order.pickupSchedule` tidak null/undefined
    - _Requirements: 5.7_

  - [ ]* 9.3 Tulis property test untuk `ORDER_STATUS_LABEL` — konsistensi label status
    - **Property 1: Status label selalu konsisten dengan konstanta**
    - For any `status` yang valid di `ORDER_STATUS`, `ORDER_STATUS_LABEL[status]` harus selalu terdefinisi dan bukan string kosong
    - File: `src/utils/__tests__/constants.test.js`
    - **Validates: Requirements 1.7**

- [ ] 10. Checkpoint Final — Integrasi & Polishing
  - [~] 10.1 Update Firestore rules untuk koleksi `stock`
    - Edit `firestore.rules` — tambah rule `match /stock/{docId}`: allow read/write update untuk unauthenticated (untuk `reduceStock` dari order creation pelanggan); allow write setStock/setThreshold hanya untuk `isAdmin()`
    - Verifikasi rule tidak memblokir operasi yang ada (`orders`, `stats`, `settings`, `products`, `testimonials`)
    - _Requirements: 4.2, 4.3_

  - [~] 10.2 Pastikan semua imports baru ditambahkan dengan benar di `Admin.jsx`
    - Import `useAdminOrdersListener`, `useStockStatus`, `useSalesReport`
    - Import `computeCustomerList`, `getCustomerHistory` dari `customerUtils.js`
    - Import `calculateTodayStats`, `calculateMonthStats`, `getBestSellingProduct`, `countUniqueCustomers` dari `statsUtils.js`
    - Import `reportService` dari `reportService.js`
    - Import icon baru: `FiFileText` (untuk tab Laporan)
    - _Requirements: semua requirement_

  - [~] 10.3 Verifikasi aksesibilitas semua UI baru
    - Pastikan semua `<input>` dan `<select>` baru memiliki `<label>` atau `aria-label`
    - Badge pending menggunakan `aria-label="N pesanan pending"`
    - Panel detail pelanggan dapat ditutup dengan tombol Escape
    - Input jadwal pengambilan memiliki `aria-required="true"`
    - _Requirements: 5.1, 5.8, 6.5, 7.3, 7.7_

- [~] 11. Final Checkpoint — Pastikan semua tests pass
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks bertanda `*` bersifat opsional dan dapat dilewati untuk MVP yang lebih cepat
- Setiap task mereferensikan requirement spesifik untuk traceabilitas
- Property tests menggunakan library **fast-check** (`npm install -D fast-check`) — install sebelum mengerjakan task test
- Checkpoint di task 5 dan 11 untuk validasi inkremental
- `stockService.reduceStock()` dipanggil secara fire-and-forget — kegagalan tidak memblokir order
- Library `xlsx`, `jspdf`, `jspdf-autotable` di-import dinamis saat tombol Export diklik (lazy import) untuk menjaga initial bundle size
- Fungsi kalkulasi di `statsUtils.js` dan `customerUtils.js` dibuat pure agar mudah di-test dan di-memoize

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["1.4", "1.5", "2.1", "4.1", "8.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "4.2", "4.3", "4.4", "4.5", "8.2", "8.3"] },
    { "id": 3, "tasks": ["3.1", "6.1", "7.1"] },
    { "id": 4, "tasks": ["3.2", "3.3", "3.5", "7.2", "7.3", "7.4"] },
    { "id": 5, "tasks": ["3.4", "4.6", "6.2", "6.3", "6.4", "7.5", "8.4", "9.1"] },
    { "id": 6, "tasks": ["6.5", "9.2", "9.3"] },
    { "id": 7, "tasks": ["10.1", "10.2", "10.3"] }
  ]
}
```
