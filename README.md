# KuotaKita

KuotaKita kini terdiri dari dua aplikasi terpisah:

- `frontend/` â€” React + Vite, dijalankan pada port `5173`
- `backend/` â€” REST API Go, dijalankan pada port `8080`

## Struktur frontend

```text
frontend/
â”œâ”€â”€ src/components/       # Layout, komponen umum, dashboard, transaksi
â”œâ”€â”€ src/pages/            # Halaman aplikasi
â”œâ”€â”€ src/services/         # Komunikasi REST API
â”œâ”€â”€ src/context/          # Theme dan toast state
â”œâ”€â”€ src/hooks/            # Reusable React hooks
â”œâ”€â”€ src/utils/            # Currency, tanggal, nama
â”œâ”€â”€ src/constants/        # Navigasi aplikasi
â”œâ”€â”€ src/config/           # Environment frontend
â””â”€â”€ src/styles/           # CSS modular
```

## Struktur backend

```text
backend/
â”œâ”€â”€ cmd/api/              # Entrypoint server
â””â”€â”€ internal/
    â”œâ”€â”€ app/              # Bootstrap aplikasi
    â”œâ”€â”€ config/           # Environment/configuration
    â”œâ”€â”€ domain/           # Model bisnis
    â”œâ”€â”€ repository/       # Kontrak dan penyimpanan data
    â”œâ”€â”€ service/          # Logika bisnis
    â””â”€â”€ http/             # Handler, router, middleware, response
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

## Integrasi ke aplikasi besar

KuotaKita sudah disiapkan agar bisa berjalan sebagai aplikasi mandiri atau sebagai modul anak pada aplikasi besar melalui `VITE_APP_BASE_PATH`.

Panduan lengkap ada di [INTEGRATION.md](./INTEGRATION.md).
