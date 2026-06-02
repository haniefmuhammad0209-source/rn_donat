# Requirements Document

## Introduction

Dokumen ini mendefinisikan kebutuhan untuk 7 fitur tambahan pada aplikasi toko donat **RN Donat** yang sudah berjalan. Aplikasi dibangun dengan React + Vite + Firebase Firestore + Tailwind CSS dan sudah memiliki Admin Panel dengan tab Statistik, Produk, Pesanan, Pelanggan, dan Testimoni. Fitur-fitur baru ini memperkuat kemampuan admin dalam mengelola operasional toko, memantau stok, menganalisis penjualan, dan berkomunikasi dengan pelanggan secara otomatis.

## Glossary

- **Admin_Panel**: Halaman `/admin` yang hanya dapat diakses oleh pengguna dengan UID yang terdaftar di `ADMIN_UIDS`.
- **Order**: Dokumen pesanan yang tersimpan di koleksi `orders` di Firestore.
- **Order_Status**: Status pesanan yang merepresentasikan tahap pemrosesan — `pending`, `waiting_payment`, `paid`, `processing`, `completed`, `cancelled` — didefinisikan di `ORDER_STATUS` dalam `constants.js`.
- **Status_Tracker**: Komponen/logika di Admin_Panel yang mengelola alur pergantian Order_Status.
- **WA_Notification**: Mekanisme pengiriman pesan WhatsApp yang menggunakan `waNotification.js` untuk membuka WhatsApp Web/App dengan pesan yang sudah diformat.
- **Dashboard**: Tab Statistik di Admin_Panel yang menampilkan ringkasan data penjualan dan operasional.
- **Sales_Report**: Fitur laporan penjualan dengan kemampuan filter dan ekspor di Admin_Panel.
- **Plain_Donut_Stock**: Stok donat polos (belum bertoping) yang dikelola secara terpisah karena merupakan bahan dasar semua produk.
- **Stock_Manager**: Logika/service yang mengelola Plain_Donut_Stock di Firestore.
- **Pickup_Schedule**: Informasi jadwal pengambilan pesanan yang dipilih pelanggan saat checkout.
- **Push_Notification**: Notifikasi browser yang menggunakan Web Push API melalui komponen `PushNotification.jsx` yang sudah ada.
- **Customer_History**: Riwayat pembelian per pelanggan yang dapat dilihat admin di tab Pelanggan.
- **DONAT_PER_BOX**: Konstanta berjumlah 6, merepresentasikan jumlah donat per kotak, didefinisikan di `constants.js`.
- **Threshold**: Batas minimum stok donat polos yang memicu peringatan ke admin.
- **totalBoxes**: Field di dokumen Order yang menyimpan total kotak yang dipesan.

---

## Requirements

### Requirement 1: Tracking Status Pesanan

**User Story:** Sebagai admin, saya ingin memperbarui status pesanan melalui Admin_Panel dan mengirimkan notifikasi WhatsApp otomatis ke pelanggan setiap kali status berubah, sehingga pelanggan selalu mendapat informasi terkini tentang pesanan mereka.

#### Acceptance Criteria

1. THE Admin_Panel SHALL menampilkan dropdown pemilihan Order_Status untuk setiap Order di tab Pesanan.
2. WHEN admin memilih Order_Status baru dari dropdown, THE Status_Tracker SHALL memperbarui field `status` dan `updatedAt` dokumen Order di Firestore.
3. THE Status_Tracker SHALL mendukung alur status berikut secara berurutan: `pending` → `processing` → `completed`, dengan `cancelled` dapat dipilih dari status manapun.
4. WHEN admin memperbarui Order_Status menjadi `processing`, `completed`, atau `cancelled`, THE WA_Notification SHALL membuka pesan WhatsApp ke nomor pelanggan yang menyebutkan perubahan status beserta ringkasan pesanan.
5. WHEN Order_Status diperbarui menjadi `paid`, THE WA_Notification SHALL mengirimkan konfirmasi pembayaran diterima ke nomor pelanggan.
6. IF nomor telepon pelanggan tidak tersedia di dokumen Order, THEN THE WA_Notification SHALL melewati pengiriman notifikasi tanpa menampilkan error ke admin.
7. THE Admin_Panel SHALL menampilkan label Order_Status dalam Bahasa Indonesia menggunakan `ORDER_STATUS_LABEL` yang sudah ada di `constants.js`.

---

### Requirement 2: Dashboard Statistik Lengkap

**User Story:** Sebagai admin, saya ingin melihat ringkasan statistik penjualan dan operasional di Dashboard, sehingga saya dapat memantau performa toko secara cepat.

#### Acceptance Criteria

1. THE Dashboard SHALL menampilkan total pendapatan hari ini, dihitung dari semua Order berstatus `paid` atau `completed` yang dibuat pada tanggal kalender yang sama dengan tanggal akses.
2. THE Dashboard SHALL menampilkan total pendapatan bulan ini, dihitung dari semua Order berstatus `paid` atau `completed` yang dibuat pada bulan dan tahun kalender yang sama dengan tanggal akses.
3. THE Dashboard SHALL menampilkan jumlah Order yang masuk hari ini, dihitung dari semua Order yang dibuat pada tanggal kalender yang sama dengan tanggal akses tanpa memandang status.
4. THE Dashboard SHALL menampilkan produk terlaris, yaitu nama produk dengan total `quantity` terbanyak di field `items` dari semua Order berstatus `paid` atau `completed`.
5. THE Dashboard SHALL menampilkan jumlah pelanggan unik, dihitung dari jumlah nomor telepon `customerPhone` yang berbeda di seluruh koleksi `orders`.
6. WHEN data Orders di Firestore diperbarui, THE Dashboard SHALL memperbarui semua statistik secara real-time tanpa memerlukan reload halaman.

---

### Requirement 3: Laporan Penjualan

**User Story:** Sebagai admin, saya ingin melihat laporan penjualan yang dapat difilter per tanggal atau per bulan, dan mengekspor laporan tersebut ke format Excel atau PDF, sehingga saya dapat menganalisis performa penjualan secara detail.

#### Acceptance Criteria

1. THE Sales_Report SHALL hanya dapat diakses oleh pengguna yang terautentikasi sebagai admin berdasarkan `ADMIN_UIDS`.
2. THE Sales_Report SHALL menampilkan data dalam tabel dengan kolom: tanggal, jumlah pesanan, dan total pendapatan.
3. WHEN admin memilih filter rentang tanggal (tanggal mulai dan tanggal akhir), THE Sales_Report SHALL menampilkan hanya Order yang `createdAt`-nya berada dalam rentang tersebut.
4. WHEN admin memilih filter bulan (bulan dan tahun), THE Sales_Report SHALL menampilkan data yang dikelompokkan per hari dalam bulan tersebut.
5. WHEN admin menekan tombol Export Excel, THE Sales_Report SHALL mengunduh file `.xlsx` yang berisi data tabel yang sedang ditampilkan dengan nama file yang menyertakan rentang tanggal laporan.
6. WHEN admin menekan tombol Export PDF, THE Sales_Report SHALL mengunduh file `.pdf` yang berisi data tabel yang sedang ditampilkan dengan nama file yang menyertakan rentang tanggal laporan.
7. THE Sales_Report SHALL menghitung total pendapatan hanya dari Order berstatus `paid` atau `completed`.
8. IF tidak ada Order yang cocok dengan filter yang dipilih, THEN THE Sales_Report SHALL menampilkan pesan kosong yang informatif, bukan tabel kosong tanpa keterangan.

---

### Requirement 4: Stok Donat Polos

**User Story:** Sebagai admin, saya ingin mengelola stok donat polos melalui Admin_Panel dan mendapatkan peringatan saat stok mendekati habis, sehingga saya dapat menyiapkan produksi tepat waktu.

#### Acceptance Criteria

1. THE Admin_Panel SHALL menampilkan input untuk mengatur stok awal Plain_Donut_Stock di tab yang sesuai.
2. WHEN admin menyimpan nilai stok awal, THE Stock_Manager SHALL menyimpan nilai tersebut ke dokumen `stock/plain_donut` di Firestore.
3. WHEN sebuah Order baru berhasil dibuat oleh pelanggan, THE Stock_Manager SHALL mengurangi Plain_Donut_Stock sebesar `totalBoxes × DONAT_PER_BOX` secara atomik menggunakan `increment` Firestore.
4. WHEN Plain_Donut_Stock turun di bawah nilai Threshold, THE Admin_Panel SHALL menampilkan pesan peringatan yang terlihat jelas di Dashboard dengan menyebutkan jumlah stok saat ini.
5. THE Admin_Panel SHALL menampilkan nilai Threshold default sebesar 30 pcs, dan admin dapat mengubah nilai Threshold tersebut.
6. THE Dashboard SHALL menampilkan jumlah Plain_Donut_Stock terkini secara real-time.
7. IF nilai Plain_Donut_Stock menjadi negatif akibat pengurangan, THEN THE Stock_Manager SHALL tetap mencatat nilai negatif tersebut dan THE Admin_Panel SHALL menampilkan peringatan stok habis.

---

### Requirement 5: Jadwal Pengambilan

**User Story:** Sebagai pelanggan, saya ingin memilih jadwal pengambilan pesanan saat checkout, sehingga saya dapat merencanakan kapan saya akan mengambil pesanan.

#### Acceptance Criteria

1. THE Cart SHALL menampilkan pilihan Pickup_Schedule saat pelanggan melakukan checkout, dengan tiga opsi: "Ambil Sekarang", "Ambil Hari Ini", dan "Ambil Besok".
2. WHEN pelanggan memilih "Ambil Sekarang", THE Cart SHALL menyimpan Pickup_Schedule dengan nilai `{ type: 'now' }` tanpa memerlukan input tambahan.
3. WHEN pelanggan memilih "Ambil Hari Ini", THE Cart SHALL menampilkan input waktu bebas (format HH:MM) dan menyimpan Pickup_Schedule dengan nilai `{ type: 'today', time: '<waktu yang diinput>' }`.
4. WHEN pelanggan memilih "Ambil Besok", THE Cart SHALL menampilkan input waktu bebas (format HH:MM) dan menyimpan Pickup_Schedule dengan nilai `{ type: 'tomorrow', time: '<waktu yang diinput>' }`.
5. WHEN pelanggan mengirim pesanan, THE Order SHALL menyimpan field `pickupSchedule` dengan nilai Pickup_Schedule yang dipilih di dokumen Order di Firestore.
6. WHEN WA_Notification dikirim ke nomor toko setelah pelanggan checkout, THE WA_Notification SHALL menyertakan informasi Pickup_Schedule dalam pesan dengan format yang mudah dibaca, contoh: "🕐 Jadwal Ambil: Hari Ini pukul 14:00".
7. THE Admin_Panel SHALL menampilkan informasi Pickup_Schedule pada setiap Order di tab Pesanan.
8. IF pelanggan memilih "Ambil Hari Ini" atau "Ambil Besok" tanpa mengisi waktu, THEN THE Cart SHALL mencegah pengiriman pesanan dan menampilkan pesan validasi.

---

### Requirement 6: Notifikasi Pesanan Baru untuk Admin

**User Story:** Sebagai admin, saya ingin mendapatkan notifikasi segera saat ada pesanan baru masuk, baik melalui browser maupun WhatsApp, sehingga saya dapat merespons pesanan dengan cepat.

#### Acceptance Criteria

1. WHEN dokumen Order baru ditambahkan ke koleksi `orders` di Firestore, THE Push_Notification SHALL menampilkan browser push notification kepada admin yang sedang membuka Admin_Panel dengan menyebutkan nama pelanggan dan total harga.
2. WHEN admin pertama kali membuka Admin_Panel, THE Push_Notification SHALL meminta izin notifikasi browser kepada admin.
3. IF admin menolak izin notifikasi browser, THEN THE Admin_Panel SHALL tetap berfungsi normal dan menyimpan preferensi penolakan tanpa menampilkan permintaan izin berulang.
4. WHEN dokumen Order baru ditambahkan ke koleksi `orders` di Firestore, THE WA_Notification SHALL membuka pesan WhatsApp ke nomor admin (`WA_NUMBER` dari `constants.js`) dengan informasi pesanan baru termasuk nama pelanggan, daftar item, total harga, dan metode pembayaran.
5. THE Admin_Panel SHALL menampilkan indikator visual (badge atau highlight) pada tab Pesanan ketika terdapat Order berstatus `pending` yang belum ditangani.
6. WHILE Admin_Panel sedang terbuka dan admin sedang berada di tab selain Pesanan, THE Push_Notification SHALL tetap mendeteksi Order baru secara real-time melalui Firestore listener.

---

### Requirement 7: Riwayat Pelanggan

**User Story:** Sebagai admin, saya ingin melihat riwayat lengkap setiap pelanggan termasuk semua pesanan mereka, sehingga saya dapat memahami perilaku pembelian dan memberikan layanan yang lebih personal.

#### Acceptance Criteria

1. THE Admin_Panel SHALL menampilkan daftar pelanggan unik di tab Pelanggan dengan kolom: nama, nomor HP, total pesanan, total belanja, dan tanggal pesanan terakhir.
2. THE Admin_Panel SHALL mengurutkan daftar pelanggan berdasarkan total belanja tertinggi secara default.
3. WHEN admin menekan nama atau baris pelanggan di daftar, THE Admin_Panel SHALL menampilkan panel detail riwayat pesanan pelanggan tersebut.
4. THE Customer_History SHALL menampilkan semua Order milik pelanggan tersebut yang dikelompokkan dan diurutkan berdasarkan tanggal terbaru.
5. THE Customer_History SHALL menampilkan untuk setiap Order: tanggal, daftar item beserta topping, total harga, metode pembayaran, dan Order_Status.
6. THE Customer_History SHALL menampilkan ringkasan pelanggan di bagian atas panel: total pesanan, total belanja keseluruhan, dan rata-rata nilai pesanan.
7. WHEN admin menekan tombol tutup atau klik di luar panel, THE Admin_Panel SHALL menutup panel Customer_History dan kembali ke daftar pelanggan.
8. WHEN data Orders di Firestore diperbarui, THE Customer_History SHALL memperbarui data riwayat secara real-time.
