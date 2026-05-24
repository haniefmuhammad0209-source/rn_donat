# Requirements Document

## Introduction

Fitur ini menambahkan modal pemilihan jumlah kotak untuk produk kategori "Mix" pada aplikasi toko donat RN Donat. Saat ini, produk Mix langsung mengarahkan pengguna ke WhatsApp tanpa memberikan kesempatan memilih jumlah kotak. Fitur ini menyamakan pengalaman pemesanan produk Mix dengan produk biasa — menampilkan modal terlebih dahulu — namun tanpa pilihan topping karena produk Mix sudah berisi campuran semua rasa.

## Glossary

- **ProductCard**: Komponen React yang menampilkan informasi produk dan menangani alur pemesanan.
- **Modal_Mix**: Modal dialog khusus produk Mix yang memungkinkan pengguna memilih jumlah kotak sebelum diarahkan ke WhatsApp.
- **Modal_Topping**: Modal dialog yang sudah ada untuk produk non-Mix, berisi pilihan topping dan jumlah kotak.
- **Produk_Mix**: Produk dengan `category === 'Mix'` dalam data produk, berisi campuran semua rasa donat.
- **Produk_Biasa**: Produk dengan kategori selain Mix (Coklat, Matcha, Cappuccino, Red Velvet, Tiramisu).
- **WhatsApp_Order**: Pesan pemesanan yang dikirim ke nomor WhatsApp toko melalui `wa.me` link.
- **Quantity**: Jumlah kotak yang dipilih pengguna, dengan nilai minimum 1 dan maksimum 20.

## Requirements

### Requirement 1: Tampilkan Modal Pemilihan Jumlah Kotak untuk Produk Mix

**User Story:** Sebagai pelanggan, saya ingin memilih jumlah kotak saat memesan produk Mix, agar saya bisa memesan lebih dari satu kotak sesuai kebutuhan saya.

#### Acceptance Criteria

1. WHEN pengguna mengklik tombol "Pesan" pada Produk_Mix, THE ProductCard SHALL menampilkan Modal_Mix alih-alih langsung membuka WhatsApp.
2. THE Modal_Mix SHALL menampilkan kontrol penambah dan pengurang jumlah kotak (tombol `+` dan `-`).
3. WHILE nilai Quantity sama dengan 1, THE Modal_Mix SHALL menonaktifkan tombol pengurang (`-`).
4. WHILE nilai Quantity sama dengan 20, THE Modal_Mix SHALL menonaktifkan tombol penambah (`+`).
5. THE Modal_Mix SHALL menampilkan ringkasan pesanan yang mencakup jumlah kotak, total donat, dan total harga secara real-time sesuai Quantity yang dipilih.

### Requirement 2: Kirim Pesan WhatsApp dengan Data Jumlah Kotak yang Dipilih

**User Story:** Sebagai pelanggan, saya ingin pesan WhatsApp yang dikirim menyertakan jumlah kotak dan total harga yang saya pilih, agar toko dapat memproses pesanan saya dengan benar.

#### Acceptance Criteria

1. WHEN pengguna mengklik tombol "Kirim ke WhatsApp" pada Modal_Mix, THE ProductCard SHALL membuka WhatsApp dengan pesan yang menyertakan nama produk, jumlah kotak, total donat, dan total harga.
2. THE WhatsApp_Order untuk Produk_Mix SHALL menyertakan keterangan "Campuran semua rasa" sebagai pengganti pilihan topping.
3. WHEN pengguna mengklik tombol "Kirim ke WhatsApp" pada Modal_Mix, THE ProductCard SHALL menutup Modal_Mix dan mereset Quantity ke nilai 1.

### Requirement 3: Tutup Modal Mix

**User Story:** Sebagai pelanggan, saya ingin bisa menutup modal tanpa melanjutkan pemesanan, agar saya bisa membatalkan jika berubah pikiran.

#### Acceptance Criteria

1. THE Modal_Mix SHALL menampilkan tombol tutup (X) di sudut kanan atas.
2. WHEN pengguna mengklik tombol tutup (X) pada Modal_Mix, THE ProductCard SHALL menutup Modal_Mix dan mereset Quantity ke nilai 1.
3. WHEN pengguna mengklik area latar belakang (overlay) di luar Modal_Mix, THE ProductCard SHALL menutup Modal_Mix dan mereset Quantity ke nilai 1.

### Requirement 4: Konsistensi Alur Pemesanan Produk Biasa

**User Story:** Sebagai pelanggan, saya ingin alur pemesanan produk biasa (non-Mix) tetap berjalan seperti semula, agar pengalaman yang sudah saya kenal tidak berubah.

#### Acceptance Criteria

1. WHEN pengguna mengklik tombol "Pesan" pada Produk_Biasa, THE ProductCard SHALL menampilkan Modal_Topping seperti sebelumnya.
2. THE Modal_Topping SHALL tetap menampilkan pilihan topping dan jumlah kotak untuk Produk_Biasa.
3. WHEN pengguna mengklik tombol "Pesan" pada produk dengan `category === 'Mix'`, THE ProductCard SHALL selalu menampilkan Modal_Mix tanpa pengecualian.
