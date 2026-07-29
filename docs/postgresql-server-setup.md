# PostgreSQL KuotaKita di server

Jalankan dari terminal server, bukan PowerShell Windows:

```bash
ssh root@51.77.134.139
cd /root/web
git fetch origin
git merge origin/main
```

Buat kata sandi database yang aman dan hanya terdiri dari karakter aman URL:

```bash
openssl rand -hex 24
```

Masukkan hasilnya ke `backend/.env` pada empat konfigurasi berikut. Nilai
`POSTGRES_PASSWORD` dan bagian password pada `DATABASE_URL` harus sama.

```dotenv
POSTGRES_DB=kuotakita
POSTGRES_USER=kuotakita
POSTGRES_PASSWORD=ISI_DENGAN_HASIL_OPENSSL
DATABASE_DRIVER=postgres
DATABASE_URL=postgresql://kuotakita:ISI_DENGAN_HASIL_OPENSSL@postgres:5432/kuotakita?sslmode=disable
```

Jalankan database dan cek tabelnya:

```bash
docker compose up -d postgres
docker compose ps
docker compose exec postgres psql -U kuotakita -d kuotakita -c '\dt'
```

Volume `kuotakita-postgres` menyimpan database secara permanen. Jangan
menjalankan `docker compose down -v` karena perintah itu menghapus volume.
