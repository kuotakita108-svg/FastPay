# KuotaKita sebagai modul anak aplikasi

Dokumen ini dipakai saat KuotaKita mau digabung/head ke aplikasi besar sebagai modul PPOB.

## Mode standalone

Default saat ini:

```env
VITE_APP_BASE_PATH=/
VITE_API_URL=/api/v1
```

URL aplikasi berjalan dari root domain, contoh:

```text
https://kuotakita-app.pages.dev/
```

## Mode anak/sub-app

Kalau nanti aplikasi besar memasang KuotaKita di path khusus, misalnya:

```text
https://domain-apk-besar.com/kuotakita
```

atur environment frontend:

```env
VITE_APP_BASE_PATH=/kuotakita
VITE_API_URL=https://domain-api-besar.com/api/v1
```

Lalu build:

```powershell
cd frontend
npm run build
```

Hasil `frontend/dist` bisa ditempel di server/aplikasi besar pada path `/kuotakita`.

## Hal yang harus disambungkan dari aplikasi besar

- Auth/session pengguna.
- API produk, saldo, transaksi, kredit saldo, dan riwayat.
- Google OAuth redirect sesuai domain aplikasi besar.
- Printer thermal jika APK besar memakai native Bluetooth.

## Kontrak integrasi utama

KuotaKita membaca konfigurasi dari:

- `VITE_APP_NAME`
- `VITE_API_URL`
- `VITE_APP_BASE_PATH`

KuotaKita menyimpan sesi pengguna di:

```text
localStorage.kuotakita_session
```

Format umum:

```json
{
  "token": "TOKEN",
  "user": {
    "id": "USER_ID",
    "username": "username",
    "name": "Nama Pengguna",
    "role": "user",
    "balance": 0,
    "phone": "",
    "email": ""
  }
}
```

Kalau aplikasi besar sudah punya login sendiri, parent app bisa mengisi session ini sebelum membuka `/kuotakita/app`.

## Catatan penting

- Jangan hardcode akun master atau saldo testing di source code production.
- Untuk printer Bluetooth terbaik di APK besar, pakai native bridge/Capacitor plugin agar printer Bluetooth klasik/SPP bisa terbaca.
- Untuk web browser, fitur printer memakai Web Bluetooth dan tergantung dukungan perangkat/printer.
