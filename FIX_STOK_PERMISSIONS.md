# 🔧 FIX: Permission Error Saat Simpan Stok

## ✅ Yang Sudah Dilakukan:

1. ✅ **Firestore rules sudah di-deploy** ke Firebase
2. ✅ **firebase.json sudah di-update** untuk include firestore
3. ✅ **stockService.js sudah diperbaiki** untuk handle dokumen baru
4. ✅ **Admin.jsx sudah diperbaiki** dengan error handling lebih baik

---

## 🎯 Langkah Selanjutnya (PILIH SALAH SATU):

### **Opsi 1: Cek UID Kamu (RECOMMENDED)** ⭐

**Kemungkinan besar UID kamu bukan admin!**

#### Cara Cek:

1. **Buka browser** dan akses:
   ```
   http://localhost:5173/check-uid.html
   ```
   
   Atau setelah deploy:
   ```
   https://[your-firebase-url].web.app/check-uid.html
   ```

2. **Login dengan Google** (akun yang sama dengan yang kamu pakai di admin panel)

3. **Lihat hasilnya**:
   - ✅ **Jika "Kamu sudah terdaftar sebagai admin"** → Lanjut ke Opsi 2
   - ❌ **Jika "Kamu BUKAN admin"** → Lanjut ke langkah 4

4. **Copy UID kamu** (klik tombol "Copy UID")

5. **Buka file**: `src/utils/constants.js`

6. **Tambahkan UID kamu** ke array `ADMIN_UIDS`:
   ```javascript
   export const ADMIN_UIDS = [
     'QHS8fA0mGEYV4aayfJ0DFVVRshT2',
     'QHS0fA0mGEYV4aayfJ0DFVVRshT2',
     'UID_KAMU_YANG_BARU_DI_COPY', // ← TAMBAHKAN DI SINI
   ];
   ```

7. **Buka file**: `firestore.rules`

8. **Tambahkan UID kamu** di function `isAdmin()`:
   ```javascript
   function isAdmin() {
     return request.auth != null && request.auth.uid in [
       'QHS8fA0mGEYV4aayfJ0DFVVRshT2',
       'QHS0fA0mGEYV4aayfJ0DFVVRshT2',
       'UID_KAMU_YANG_BARU_DI_COPY' // ← TAMBAHKAN DI SINI JUGA
     ];
   }
   ```

9. **Deploy ulang**:
   ```bash
   # Deploy rules
   firebase deploy --only firestore:rules
   
   # Deploy hosting (optional, tapi recommended)
   npm run build
   firebase deploy --only hosting
   ```

10. **Hard refresh browser**: `Ctrl + Shift + R`

11. **Test simpan stok lagi**

---

### **Opsi 2: Tunggu Rules Cache Clear** ⏱️

Rules Firebase kadang perlu waktu beberapa menit untuk apply.

1. **Tunggu 2-3 menit**
2. **Hard refresh browser**: `Ctrl + Shift + R`
3. **Logout** dari admin panel
4. **Login lagi**
5. **Test simpan stok**

---

### **Opsi 3: Manual Create Document di Firebase Console** 🔨

Jika masih gagal, buat dokumen stok manual:

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project **rn-donat-shop**
3. Klik **Firestore Database** di sidebar
4. Klik **Start collection** atau **+ Start collection**
5. Collection ID: `stock`
6. Document ID: `plain_donut`
7. Tambahkan fields:
   - `current` (number): `0`
   - `threshold` (number): `30`
   - `updatedAt` (timestamp): klik "timestamp" lalu pilih waktu sekarang
8. Klik **Save**
9. Kembali ke admin panel dan coba set stok

---

## 🔍 Debug Info:

### Error yang Muncul:
```
Gagal menyimpan stok: Missing or insufficient permissions
```

### Penyebab Kemungkinan:
1. ❌ **UID kamu bukan admin** (PALING SERING)
2. ⏱️ Rules cache belum clear
3. 🔐 Belum login atau session expired
4. 📄 Dokumen `stock/plain_donut` belum ada (tapi seharusnya auto-create sekarang)

### Yang Sudah Benar:
- ✅ `firestore.rules` sudah benar
- ✅ `firebase.json` sudah include firestore
- ✅ Rules sudah di-deploy
- ✅ `stockService.js` sudah support auto-create document

---

## 📊 Current Firestore Rules (Stock Collection):

```javascript
match /stock/{docId} {
  allow read: if true;                    // Semua bisa baca
  allow write: if isAdmin();              // Admin bisa create/update/delete
  allow update: if request.auth != null;  // Authenticated user bisa update (reduceStock)
}
```

**Admin = user yang UID-nya ada di array `isAdmin()` function**

---

## 🆘 Jika Masih Gagal:

Kirim info ini:

1. **Screenshot dari** `http://localhost:5173/check-uid.html` setelah login
2. **Screenshot error** di Console browser (F12 → Console tab)
3. **Screenshot Network tab** (F12 → Network → filter "firestore" → klik request yang gagal → screenshot Response)

---

## 🚀 Quick Commands:

```bash
# Deploy rules saja
firebase deploy --only firestore:rules

# Build + deploy semua
npm run build
firebase deploy

# Check firebase project
firebase projects:list

# Check current project
firebase use
```

---

**TLDR**: **99% kemungkinan UID kamu bukan admin**. Buka `check-uid.html`, copy UID kamu, tambahkan ke `constants.js` dan `firestore.rules`, lalu deploy ulang. 🎯
