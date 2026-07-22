# PulsaPrime

PulsaPrime kini terdiri dari dua aplikasi terpisah:

- `frontend/` — React + Vite, dijalankan pada port `5173`
- `backend/` — REST API Go, dijalankan pada port `8080`

## Struktur frontend

```text
frontend/
├── src/components/       # Layout, komponen umum, dashboard, transaksi
├── src/pages/            # Halaman aplikasi
├── src/services/         # Komunikasi REST API
├── src/context/          # Theme dan toast state
├── src/hooks/            # Reusable React hooks
├── src/utils/            # Currency, tanggal, nama
├── src/constants/        # Navigasi aplikasi
├── src/config/           # Environment frontend
└── src/styles/           # CSS modular
```

## Struktur backend

```text
backend/
├── cmd/api/              # Entrypoint server
└── internal/
    ├── app/              # Bootstrap aplikasi
    ├── config/           # Environment/configuration
    ├── domain/           # Model bisnis
    ├── repository/       # Kontrak dan penyimpanan data
    ├── service/          # Logika bisnis
    └── http/             # Handler, router, middleware, response
```

## Menjalankan aplikasi

Salin konfigurasi environment:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Terminal pertama:

```powershell
cd backend
go run ./cmd/api
```

Terminal kedua:

```powershell
cd frontend
npm install
npm run dev
```

Buka `http://localhost:5173`. Frontend akan mengakses API pada `http://localhost:8080/api/v1`.

## Endpoint

- `GET /api/v1/health`
- `GET /api/v1/dashboard`
- `GET /api/v1/transactions`
- `POST /api/v1/transactions`
- `GET /api/v1/customers`
- `GET /api/v1/products`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/google`

## Akun demo

| Jenis akun | Username | Password | Tampilan |
|---|---|---|---|
| User | `octa` | `octa11` | Aplikasi mobile PPOB |
| Master | `octa` | `octa22` | Master dashboard |
| Admin | `octa` | `octa33` | Admin dashboard |

Google OAuth memerlukan `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET` asli pada `backend/.env`.

## Modul aplikasi pulsa

- Beranda agen dan transaksi cepat
- Deteksi operator dari prefix nomor telepon
- Isi pulsa reguler dan paket data
- Top-up DANA, OVO, dan GoPay
- Token listrik PLN
- Voucher Mobile Legends dan Free Fire
- Pembayaran BPJS dan PDAM
- Katalog produk dan harga agen
- Perhitungan harga jual dan margin
- Informasi stok produk digital
- Riwayat transaksi dan status pengiriman
- Pelanggan, laporan profit, saldo, dan tagihan PPOB

Data backend masih memakai repository in-memory. Kontrak repository sudah dipisah agar berikutnya mudah diganti dengan PostgreSQL atau MySQL.
