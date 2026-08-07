# Integrasi H2H Pulsa24Jam

KuotaKita mengirim semua transaksi H2H dari backend. Browser atau aplikasi agen **tidak pernah** menerima API key maupun PIN Pulsa24Jam.

## Pengaturan akun Pulsa24Jam

1. Tambahkan IP publik server KuotaKita ke IP Whitelist Pulsa24Jam.
2. Daftarkan webhook berikut pada pengaturan whitelist:

   ```text
   https://kuotakita.com/api/v1/webhooks/pulsa24jam
   ```

3. Di server, isi `backend/.env` (jangan commit file ini):

   ```dotenv
   P24_BASE_URL=https://api.pulsa24jam.net
   P24_API_KEY=isi_api_key_h2h
   P24_PIN=isi_pin_transaksi_h2h
   P24_REQUEST_TIMEOUT_SECONDS=15
   ```

4. Restart backend setelah mengubah environment:

   ```bash
   cd /root/web
   docker compose up -d --force-recreate backend
   docker compose logs --tail=50 backend
   ```

## Alur transaksi yang dipakai aplikasi

1. Agen memilih SKU produk H2H dan memasukkan tujuan.
2. Backend membuat `refid` unik (`KKT-...`) dan menyimpan order sebagai `pending`.
3. Backend mengirim `PAY` ke `https://api.pulsa24jam.net/v1/trx` memakai header `X-Api-Key` dan PIN server.
4. Jika respons masih pending, saldo tidak dianggap sukses oleh aplikasi. Status akhir menunggu callback P24 atau pengecekan `STATUS-PAY` dari backend.
5. Callback masuk ke `/api/v1/webhooks/pulsa24jam`; backend tetap memverifikasi `STATUS-PAY` ke P24 sebelum menetapkan sukses/gagal agar callback palsu tidak dapat mengubah transaksi.
6. Jika final gagal, saldo yang sebelumnya dicadangkan dikembalikan satu kali.

Untuk layanan pascabayar, aplikasi melakukan `INQ` dahulu. Jumlah yang keluar dari inquiry P24 adalah jumlah yang diteruskan ke pembayaran.

## Endpoint backend

Semua endpoint berikut membutuhkan sesi pengguna, kecuali webhook:

| Method | Endpoint | Fungsi |
| --- | --- | --- |
| `POST` | `/api/v1/transactions/pay` | Membuat transaksi H2H `PAY` |
| `POST` | `/api/v1/h2h/pulsa24jam/inquiry` | Inquiry tagihan postpaid `INQ` |
| `GET` | `/api/v1/h2h/pulsa24jam/status?refid=...` | Verifikasi `STATUS-PAY` |
| `GET` | `/api/v1/h2h/pulsa24jam/balance` | Cek saldo induk H2H (`SALDO`) |
| `GET` | `/api/v1/h2h/pulsa24jam/products` | Ambil katalog H2H (`PRODUK`) |
| `POST` | `/api/v1/webhooks/pulsa24jam` | Callback status provider |

## Catatan keamanan

- Jangan menyimpan `P24_API_KEY` atau `P24_PIN` di file frontend, GitHub, browser, atau aplikasi Android.
- Pastikan setiap transaksi baru mempunyai `refid` yang berbeda.
- Saat pindah server, whitelist IP baru dan ubah webhook sebelum transaksi dibuka kembali.
- Ganti API key/PIN bila pernah terkirim ke percakapan, screenshot, atau repositori.
