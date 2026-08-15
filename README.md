# KuotaKita

KuotaKita adalah platform PPOB dan operasional kredit saldo agent yang menghubungkan aplikasi pelanggan, Agent, Marketing, Operator, Super Admin, PostgreSQL, dan provider H2H Pulsa24Jam dalam satu sistem.

Data operasional disimpan di server agar akun, pengajuan kredit, saldo, transaksi, keputusan, dan pelunasan tetap sama ketika dibuka dari HP atau komputer berbeda. Penyimpanan browser hanya digunakan sebagai cache dan migrasi data lama, bukan sumber utama.

## Komponen Utama

| Komponen | Teknologi | Fungsi |
|---|---|---|
| Frontend | React + Vite | Aplikasi pelanggan dan panel internal responsif |
| Backend | Go REST API | Autentikasi, transaksi, kredit, akun, dan integrasi provider |
| Database | PostgreSQL 16 | Penyimpanan permanen data aplikasi |
| Provider | Pulsa24Jam H2H | Produk, saldo provider, transaksi, status, dan callback |
| Deployment | Docker Compose + Nginx | Menjalankan frontend, backend, dan database |

## Role dan Wewenang

### User

- Membeli pulsa, paket data, e-wallet, PLN, voucher, dan layanan PPOB lain.
- Memakai saldo utama dan melihat riwayat transaksi sendiri.
- Mengelola profil serta keamanan akun.
- Tidak memiliki akses saldo kredit Agent.

### Agent

- Memiliki kemampuan User dan halaman Kredit Agent.
- Melihat pengajuan, limit, saldo kredit, tagihan, dan pelunasan sendiri.
- Memakai saldo kredit hanya setelah disetujui Operator.
- Hanya boleh memiliki satu kredit berjalan pada satu waktu.

### Marketing

- Mendaftarkan akun Agent resmi.
- Membuat pengajuan untuk Agent binaannya.
- Menjalankan survei dan mengunggah empat foto wajib.
- Mengirim berkas lengkap kepada Operator.
- Melihat dan menghubungi Agent yang didaftarkannya sendiri.
- Menangani tugas lapangan dan tindak lanjut pelunasan.
- Tidak dapat menyetujui kredit atau mengubah limit.

### Operator

- Memeriksa berkas hasil survei Marketing.
- Menyetujui, meminta revisi, atau menolak pengajuan.
- Menentukan dan menyesuaikan limit kredit.
- Memantau kredit berjalan, jatuh tempo, tagihan, dan risiko.
- Memverifikasi bukti pembayaran dan membekukan akses kredit bermasalah.
- Memberikan penugasan lapangan kepada Marketing.
- Tidak memiliki akses rahasia provider H2H.

### Super Admin / Owner

- Memantau seluruh bisnis dan sistem KuotaKita.
- Mengelola akun, role, produk, harga, pembayaran, dan keamanan.
- Memantau transaksi User dan Agent, kredit, tim, komplain, dan refund.
- Memantau saldo serta transaksi provider H2H.
- Menonaktifkan atau menghapus akun sesuai kewenangan.
- Mengawasi Marketing dan Operator tanpa mencampur pekerjaan hariannya.

## Alur Kredit Agent

```text
Marketing mendaftarkan Agent
        ↓
Marketing membuat pengajuan kredit
        ↓
Pengajuan langsung terlihat di akun Agent
        ↓
Marketing melakukan survei dan melengkapi 4 foto
        ↓
Berkas dikirim ke Operator
        ↓
Operator menyetujui, meminta revisi, atau menolak
        ↓
Jika disetujui, limit dan saldo kredit aktif
        ↓
Agent memakai saldo kredit untuk transaksi
        ↓
Tagihan dan jatuh tempo dipantau
        ↓
Agent mengirim pembayaran dan bukti
        ↓
Operator memverifikasi pembayaran
        ↓
Kredit ditutup sebagai Lunas
        ↓
Agent dapat mengajukan kredit baru
```

### Dokumen survei wajib

1. Foto KTP Agent.
2. Foto toko atau tempat usaha.
3. Selfie Agent memegang KTP.
4. Selfie Agent bersama Marketing.

### Status pengajuan

| Status | Arti |
|---|---|
| Menunggu verifikasi Marketing | Pengajuan belum selesai disurvei |
| Sedang diverifikasi Marketing | Data dan dokumen sedang dilengkapi |
| Perlu revisi Marketing | Operator mengembalikan berkas untuk diperbaiki |
| Menunggu keputusan Operator | Berkas lengkap dan siap diperiksa |
| Disetujui | Limit dan saldo kredit sudah diaktifkan |
| Ditolak | Pengajuan tidak dapat dilanjutkan |
| Lunas | Seluruh kewajiban sudah diverifikasi selesai |

### Aturan saldo kredit

- Saldo utama dan saldo kredit selalu dipisahkan.
- User biasa hanya memiliki saldo utama.
- Saldo kredit hanya tersedia untuk akun ber-role Agent.
- Limit tidak aktif sebelum keputusan Operator.
- Satu Agent hanya dapat memiliki satu kredit aktif.
- Pemakaian saldo kredit menambah tagihan Agent.
- Transaksi gagal dikembalikan setelah status gagal final dari provider.
- Transaksi pending tidak boleh direfund sebelum hasil akhirnya diketahui.
- Pelunasan harus diverifikasi sebelum status berubah menjadi Lunas.

## Menu Panel Marketing

### Operasional Lapangan

- **Ringkasan Hari Ini**: prioritas kerja, status Agent binaan, survei, dan kredit aktif.
- **Daftarkan Agent**: membuat akun login Agent yang tersimpan di server.
- **Buat Pengajuan Kredit**: memilih Agent binaan dan membuat pengajuan resmi.

### Survei dan Validasi

- **Antrean Survei Agent**: melengkapi data, dokumen, persetujuan, dan tanda tangan.
- **Agenda Kunjungan**: mengatur survei, revisi, kunjungan ulang, dan penagihan lapangan.

### Portofolio Agent

- **Pantau Agent Binaan**: melihat pengajuan, kredit, tagihan, dan pelunasan.
- **Hubungi Agent**: akses cepat ke WhatsApp atau telepon Agent binaan.

### Bantuan Kerja

- **SOP Marketing**: panduan pendaftaran, survei, foto, pengiriman berkas, dan tindak lanjut.

## Menu Panel Operator

### Keputusan Kredit

- **Ringkasan Operasional**: antrean keputusan, kredit aktif, pembayaran, dan risiko harian.
- **Antrean Keputusan**: pemeriksaan akhir data, dokumen, tanda tangan, dan limit.

### Monitor Kredit

- **Kredit Berjalan**: fasilitas aktif, saldo, tagihan, limit, dan akses Agent.
- **Jatuh Tempo & Tagihan**: prioritas penagihan berdasarkan tanggal terdekat.
- **Verifikasi Pembayaran**: mencocokkan nominal, metode, referensi, dan bukti.
- **Risiko & Akses Agent**: suspend, aktivasi kembali, dan catatan risiko.

### Koordinasi Lapangan

- **Penugasan Marketing**: mengirim kunjungan ulang, revisi, atau penagihan.
- **Performa Marketing**: mengukur pendaftaran, survei, approval, kredit aktif, dan risiko.

Kelompok menu dapat dibuka atau ditutup secara mandiri. Membuka satu kelompok tidak menutup kelompok lain.

## Menu Super Admin

### Ringkasan

- Dashboard kondisi bisnis, transaksi, pengguna, kredit, provider, dan risiko.

### Bisnis Aplikasi

- Monitor transaksi User.
- Kelola produk dan harga.
- Kelola seluruh akun dan role.

### Keuangan

- Arus keuangan, invoice, refund, dan kanal pembayaran.
- Saldo serta transaksi provider H2H.

### Tim dan Kredit

- Monitor kredit Agent, tagihan, risiko, pelunasan, dan kinerja tim.

### Keamanan dan Sistem

- Log transaksi Agent.
- Tiket bantuan dan komplain.
- Pengaturan sistem.

## Tiket Bantuan dan Komplain

Tiket berasal dari status transaksi server, bukan status buatan frontend.

- Ringkasan menunggu provider, perlu refund, dan selesai.
- Pencarian berdasarkan Ref ID, produk, tujuan, atau Agent.
- Filter status, detail transaksi, dan bukti cetak.
- Refund hanya aktif untuk transaksi berstatus gagal.
- Refund yang sudah dilakukan tidak dapat dijalankan dua kali.

## Integrasi Pulsa24Jam H2H

Backend berkomunikasi langsung dengan Pulsa24Jam. API key dan PIN tidak pernah dikirim ke browser.

```text
User atau Agent menekan Bayar
        ↓
Backend membuat Ref ID unik
        ↓
Backend mengirim PAY ke Pulsa24Jam
        ↓
Status pending, sukses, atau gagal disimpan
        ↓
Callback/status provider memperbarui transaksi
        ↓
Riwayat KuotaKita menampilkan status final
```

Aturan penting:

- Produk harga tetap menggunakan `qty: 1`.
- Produk nominal terbuka mengikuti ketentuan provider.
- Ref ID unik mencegah transaksi ganda.
- Transaksi sukses mengurangi saldo H2H sesuai nilai provider.
- Transaksi gagal tidak mengurangi saldo secara permanen.
- Callback harus diterima endpoint webhook KuotaKita.
- Panduan lengkap: [docs/PULSA24JAM-H2H.md](./docs/PULSA24JAM-H2H.md).

## Sinkronisasi Antarperangkat

- PostgreSQL dan backend menjadi sumber data utama.
- Agent melihat data miliknya sendiri.
- Marketing hanya melihat Agent binaannya.
- Operator melihat seluruh data kredit dalam ruang kerjanya.
- Super Admin melihat keseluruhan data sesuai kewenangan.
- Data lama di browser dimigrasikan jika belum ada di server.
- Cache lama tidak menimpa data server dengan ID yang sama.
- Sinkronisasi berjalan saat halaman dibuka, kembali aktif, dan berkala.

## Keamanan

- Password disimpan dalam bentuk hash.
- Sesi menggunakan token server.
- Hak akses diperiksa backend, bukan hanya disembunyikan di frontend.
- Marketing tidak dapat menyetujui kredit.
- Agent tidak dapat mengubah limit atau status pelunasan.
- Refund hanya dilakukan berdasarkan transaksi gagal yang sah.
- API key, PIN H2H, JWT secret, dan password database hanya berada di `backend/.env` server.
- Jangan memasukkan `.env`, password, API key, atau PIN ke Git.

## Struktur Repositori

```text
FastPay/
|-- backend/
|   |-- cmd/api/                 # Entrypoint API
|   |-- internal/app/            # Bootstrap aplikasi
|   |-- internal/config/         # Konfigurasi environment
|   |-- internal/database/       # PostgreSQL dan state store
|   |-- internal/domain/         # Model bisnis
|   |-- internal/http/           # Router, handler, middleware
|   `-- internal/service/        # Logika bisnis
|-- database/init/               # Inisialisasi database
|-- docs/                        # Dokumentasi operasional
|-- frontend/
|   |-- public/                  # Aset publik dan PWA
|   |-- src/components/          # Komponen UI
|   |-- src/context/             # Auth, tema, dan state global
|   |-- src/pages/               # Halaman aplikasi dan panel
|   |-- src/services/            # Komunikasi REST API
|   `-- src/styles/              # CSS dan responsive
|-- docker-compose.yml
`-- README.md
```

## Environment

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

| Variabel | Fungsi |
|---|---|
| `APP_ENV`, `APP_PORT` | Mode dan port backend |
| `FRONTEND_URL` | Origin frontend yang diizinkan |
| `DATABASE_URL` | Koneksi PostgreSQL |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | Kredensial database |
| `JWT_SECRET` | Kunci token autentikasi |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `GOOGLE_REDIRECT_URL` | Callback Google OAuth |
| `AGENT_INITIAL_BALANCE` | Saldo utama awal Agent, sebaiknya `0` |
| `P24_BASE_URL`, `P24_API_KEY`, `P24_PIN` | Integrasi H2H |
| `P24_REQUEST_TIMEOUT_SECONDS` | Batas waktu provider |
| `P24_TEST_USERNAME`, `P24_TEST_PASSWORD` | Akun pengujian H2H terbatas |

Gunakan nilai rahasia panjang dan berbeda untuk database, JWT, akun, dan provider.

## Menjalankan Aplikasi

### Docker Compose

```bash
docker compose up -d --build
docker compose ps
docker compose logs --tail=100 backend
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- Health API: `http://localhost:8080/api/v1/health`

### Mode pengembangan

Backend:

```powershell
cd backend
go run ./cmd/api
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

## Build dan Pengujian

```powershell
cd frontend
npm run build
npm run lint
```

```powershell
cd backend
go test ./...
```

## Deploy Server

Jika `docker-compose.yml` server memiliki konfigurasi lokal:

```bash
cd ~/web
git stash push -m "config server deploy" -- docker-compose.yml
git pull origin main
git stash pop
docker compose build frontend backend
docker compose up -d --force-recreate frontend backend
docker compose ps
docker compose logs --tail=100 backend
```

Jika perubahan hanya frontend:

```bash
cd ~/web
git pull origin main
docker compose build frontend
docker compose up -d --force-recreate frontend
docker compose ps
```

## Verifikasi H2H

```bash
docker compose exec backend sh -lc 'test -n "$P24_API_KEY" && test -n "$P24_PIN" && echo "P24 aktif" || echo "P24 belum terpasang"'
```

```bash
docker compose exec backend sh -lc 'wget -qO- --header="Content-Type: application/json" --header="X-Api-Key: $P24_API_KEY" --post-data="{\"commands\":\"SALDO\",\"pin\":\"$P24_PIN\"}" "$P24_BASE_URL/v1/trx"'
```

## Troubleshooting

### `no space left on device`

```bash
df -h
docker system df
docker builder prune -af
docker image prune -af
```

Perintah di atas tidak menghapus volume PostgreSQL. Jangan menjalankan `docker volume prune` pada produksi tanpa backup dan pemeriksaan target.

### Data tidak terlihat di perangkat lain

1. Pastikan frontend dan backend terbaru aktif.
2. Pastikan PostgreSQL berstatus healthy.
3. Buka panel pada perangkat lama sekali agar data lama dimigrasikan.
4. Tunggu sinkronisasi lalu buka panel pada perangkat lain.
5. Periksa log backend jika API mengembalikan `401` atau `500`.

### Halaman meminta muat ulang

- Periksa Console browser untuk `ReferenceError` atau response `401`.
- Pastikan frontend memakai image build terbaru.
- Login kembali jika sesi berakhir.
- Periksa health endpoint dan log backend.

### Login gagal `401 Unauthorized`

- Pastikan akun tersimpan di server.
- Pastikan backend membaca `backend/.env` yang benar.
- Jangan mengandalkan akun dari browser lama.

## Dokumentasi Tambahan

- [Integrasi Pulsa24Jam H2H](./docs/PULSA24JAM-H2H.md)
- [Setup PostgreSQL Server](./docs/postgresql-server-setup.md)
- [Integrasi ke aplikasi lain](./INTEGRATION.md)

## Catatan Produksi

- Backup PostgreSQL secara rutin.
- Gunakan HTTPS untuk frontend, API, OAuth callback, dan webhook.
- Jangan membuka port PostgreSQL langsung ke internet.
- Rotasi API key, PIN, JWT secret, dan password secara berkala.
- Uji transaksi dengan nominal kecil sebelum peluncuran.
- Jangan menyatakan transaksi sukses sebelum status final server/provider.
