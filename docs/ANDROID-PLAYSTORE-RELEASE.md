# KuotaKita Android dan Play Store

Project Android Capacitor sudah tersedia di `frontend/android` dengan application ID `id.kuotakita.app`.

## Arsitektur yang direkomendasikan

Versi pertama dapat memakai aplikasi Capacitor yang membundel hasil build React. Seluruh data tetap berasal dari backend KuotaKita melalui HTTPS. Dengan pola ini tampilan web yang sudah aktif tetap sama di Android, sementara akses kamera, biometrik, notifikasi, dan deep link dapat ditambahkan melalui plugin native.

```text
Android (Capacitor/React)
        |
        | HTTPS + Bearer session
        v
https://kuotakita.com/api/v1
        |
        +-- PostgreSQL/state backend
        +-- Pulsa24Jam H2H (server only)
```

## Konfigurasi produksi

`frontend/.env.production`:

```env
VITE_APP_NAME=KuotaKita
VITE_API_URL=https://kuotakita.com/api/v1
VITE_APP_BASE_PATH=/
```

Untuk bundle native, URL absolut lebih aman daripada `/api/v1`, karena origin WebView bukan domain produksi.

`frontend/android/app/src/main/AndroidManifest.xml` sudah mempunyai permission internet. Untuk produksi tambahkan kebijakan backup/data extraction dan pertimbangkan `android:usesCleartextTraffic="false"`.

## Build Android

Jalankan dari folder `frontend`:

```bash
npm ci
npm run build
npx cap sync android
cd android
./gradlew test
./gradlew bundleRelease
```

Windows:

```powershell
npm.cmd ci
npm.cmd run build
npx.cmd cap sync android
cd android
.\gradlew.bat test
.\gradlew.bat bundleRelease
```

Hasil Play Store berupa AAB di:

```text
frontend/android/app/build/outputs/bundle/release/app-release.aab
```

## Signing

Buat upload key sekali dan simpan di password manager/penyimpanan terenkripsi. Jangan commit `.jks`, password, atau `key.properties`.

```bash
keytool -genkeypair -v -keystore kuotakita-upload.jks -keyalg RSA -keysize 2048 -validity 10000 -alias kuotakita-upload
```

Gunakan Play App Signing. Simpan backup upload key di lokasi terpisah.

## Login Google pada Android

Alur Google saat ini dirancang untuk browser web dan callback menulis sesi ke `sessionStorage`. Sebelum rilis native dengan Google Login, lakukan salah satu:

1. Buka OAuth melalui Capacitor Browser dan tambahkan App Link `https://kuotakita.com/...` yang kembali ke aplikasi; atau
2. Implementasikan Google Identity native, kirim ID token ke endpoint backend khusus, lalu backend memverifikasi token dan menerbitkan sesi KuotaKita.

Opsi kedua lebih rapi untuk Play Store, tetapi endpoint pertukaran ID token belum ada pada backend saat ini. Jangan memasukkan Google client secret ke aplikasi.

## Checklist Play Store

- Nama aplikasi: KuotaKita.
- Package/application ID final: `id.kuotakita.app`.
- Version code selalu naik pada setiap rilis.
- Target SDK mengikuti persyaratan Play Store terbaru saat pengiriman.
- Ikon adaptif, splash screen, screenshot ponsel, feature graphic.
- Privacy Policy publik melalui HTTPS.
- Form Data Safety sesuai data akun, kontak, transaksi, dan dokumen kredit yang benar-benar dikumpulkan.
- Deklarasi akses kontak hanya jika Contact Picker digunakan; jangan meminta permission kontak luas jika tidak diperlukan.
- Akun demo/reviewer Play Console tanpa akses Super Admin.
- Mekanisme penghapusan akun dan data harus tersedia serta dijelaskan.
- Uji login, logout, token kedaluwarsa, jaringan lambat, rotasi layar, background/foreground, dan retry transaksi.
- Uji AAB release pada Internal Testing sebelum Production.

## Yang belum boleh dianggap aktif

- Top-up saldo nyata: endpoint masih mengembalikan `503`.
- Verifikasi nama rekening/e-wallet: endpoint masih mengembalikan `503`.
- Pembayaran PLN pascabayar final: backend masih menahan payment sampai verifikasi nominal inquiry selesai.
- Refresh token: belum tersedia; sesi berlaku 7 hari lalu login ulang.
- Google Login native: perlu deep link atau endpoint verifikasi ID token.

Fitur yang belum aktif harus disembunyikan atau diberi keterangan jelas di aplikasi Play Store agar tidak menyesatkan pengguna.
