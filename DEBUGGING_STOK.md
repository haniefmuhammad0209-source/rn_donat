# Debugging: Masalah Simpan Stok

## Perubahan yang Sudah Dilakukan:

### 1. ✅ Perbaikan `stockService.js`
- **`reduceStock`** sekarang menggunakan `setDoc` dengan `merge: true` (bukan `updateDoc`)
- Ditambahkan fungsi **`initStock()`** untuk inisialisasi dokumen stok
- Sekarang bisa handle dokumen yang belum ada di Firestore

### 2. ✅ Perbaikan `Admin.jsx`
- Call `stockService.initStock()` saat component mount
- Error handling lebih detail dengan log ke console
- Toast message sekarang menampilkan error message lengkap

### 3. ✅ Perbaikan `firestore.rules`
- Rule stock collection lebih eksplisit:
  - `allow create, delete: if isAdmin()` - hanya admin
  - `allow update: if true` - semua (untuk reduceStock)
  - `allow read: if true` - public read

## Cara Deploy Firestore Rules Baru:

```bash
firebase deploy --only firestore:rules
```

## Langkah Debugging:

### 1. Cek Console Browser
Buka Chrome DevTools (F12) → Console tab → cek error message detail:
```
[Stock] Gagal menyimpan stok: [error detail akan muncul di sini]
```

### 2. Kemungkinan Error & Solusi:

#### Error: "Missing or insufficient permissions"
**Penyebab**: Firestore rules belum di-deploy
**Solusi**:
```bash
firebase deploy --only firestore:rules
```

#### Error: "Document doesn't exist"
**Penyebab**: Dokumen `stock/plain_donut` belum ada dan `initStock()` gagal
**Solusi Manual**: Buat dokumen manual di Firestore Console
1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project "rn_donat"
3. Cloud Firestore → Start collection
4. Collection ID: `stock`
5. Document ID: `plain_donut`
6. Fields:
   - `current` (number): 0
   - `threshold` (number): 30
   - `updatedAt` (timestamp): (now)

#### Error: "Not authenticated"
**Penyebab**: User belum login atau bukan admin
**Solusi**: Pastikan login dengan akun Google yang UID-nya ada di `ADMIN_UIDS`

### 3. Test Manual via Console Browser:

Jalankan ini di Console Browser (setelah login sebagai admin):
```javascript
// Test inisialisasi stok
import { stockService } from './src/services/stockService';
await stockService.initStock();
console.log('Init OK');

// Test set stok
await stockService.setStock(100);
console.log('Set stok OK');

// Test get stok
const data = await stockService.getStock();
console.log('Current stock:', data);
```

### 4. Cek UID Admin:

Jalankan ini di Console Browser untuk cek UID kamu:
```javascript
// Cek user login
console.log('User:', auth.currentUser);
console.log('UID:', auth.currentUser?.uid);

// Cek apakah UID ada di ADMIN_UIDS
import { ADMIN_UIDS } from './src/utils/constants';
console.log('Is admin?', ADMIN_UIDS.includes(auth.currentUser?.uid));
```

## Checklist Troubleshooting:

- [ ] **Deploy Firestore rules**: `firebase deploy --only firestore:rules`
- [ ] **Refresh halaman admin** setelah deploy
- [ ] **Cek console browser** untuk error message detail
- [ ] **Pastikan login sebagai admin** (UID harus ada di `ADMIN_UIDS`)
- [ ] **Cek Firestore Console** apakah dokumen `stock/plain_donut` ada
- [ ] **Clear cache browser** (Ctrl+Shift+Del)

## Jika Masih Gagal:

Kirim screenshot dari:
1. **Console Browser** (F12 → Console tab) - saat klik "Simpan Stok"
2. **Network tab** (F12 → Network tab) - filter "firestore" - klik request yang gagal
3. **Firestore Console** - screenshot collection `stock`

---

**Update terakhir**: Semua fix sudah diterapkan. Tinggal deploy rules dan test.
