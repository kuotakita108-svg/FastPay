# KuotaKita API — Integrasi Android

Dokumen ini menjelaskan kontrak API yang benar-benar tersedia pada backend KuotaKita saat ini. Sumber kebenaran teknisnya adalah `backend/internal/http/router/router.go` dan berkas handler terkait.

## 1. Alamat API

| Lingkungan | Base URL |
|---|---|
| Produksi | `https://kuotakita.com/api/v1` |
| Web satu domain | `/api/v1` |
| Lokal Android emulator | `http://10.0.2.2:8443/api/v1` (hanya development) |

Semua request dan response memakai JSON kecuali login Google yang memakai redirect browser.

```http
Accept: application/json
Content-Type: application/json
Authorization: Bearer <SESSION_TOKEN>
```

Error selalu berbentuk:

```json
{"error":"pesan kesalahan"}
```

## 2. Token akses

KuotaKita saat ini memakai token sesi HMAC internal, bukan JWT. Token:

- diterbitkan oleh backend setelah login/register/login Google;
- berlaku selama 7 hari;
- berisi identitas akun, role, dan waktu kedaluwarsa yang ditandatangani server;
- harus dikirim sebagai `Authorization: Bearer <token>`;
- tidak boleh dicatat ke log, dimasukkan ke Git, ditanam di APK, atau dibagikan antar pengguna;
- tidak boleh diganti dengan API key Pulsa24Jam. Secret H2H hanya boleh berada di backend.

### Mendapatkan token

```bash
curl -X POST https://kuotakita.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"akun_pengguna","password":"kata_sandi"}'
```

```json
{
  "token": "SESSION_TOKEN_DARI_SERVER",
  "user": {
    "id": "USR-...",
    "username": "akun_pengguna",
    "name": "Nama Pengguna",
    "role": "user",
    "balance": 0,
    "phone": "0812...",
    "email": "user@example.com"
  }
}
```

Android menyimpan token dengan `EncryptedSharedPreferences`, Android Keystore, atau secure storage Capacitor. Jika API mengembalikan `401` dengan `sesi berakhir`, hapus sesi lokal dan arahkan pengguna ke login. Backend belum menyediakan refresh token; login ulang adalah alur resmi.

## 3. Role

| Role | Fungsi utama |
|---|---|
| `user` | Membeli produk dan melihat transaksi sendiri |
| `agent` | Fitur user serta pengajuan/fasilitas agent |
| `marketing` | Membuat dan memantau agent yang dikelola |
| `operator` | Operasional akun, transaksi H2H, dan kredit sesuai izin handler |
| `analis` | Pemeriksaan kredit sesuai izin service |
| `admin` | Administrasi internal |
| `master` | Super Admin/Owner, termasuk saldo induk dan refund provider |

Android wajib menyembunyikan menu berdasarkan `user.role`, tetapi backend tetap menjadi otoritas izin akhir.

## 4. Endpoint autentikasi dan akun

| Method | Path | Auth | Keterangan |
|---|---|---:|---|
| POST | `/auth/login` | Tidak | Login username/nomor HP/email + password |
| POST | `/auth/register` | Tidak | Membuat akun user/agent sesuai aturan server |
| GET | `/auth/google` | Tidak | Memulai OAuth Google via browser |
| GET | `/auth/google/callback` | Cookie state | Callback OAuth Google |
| GET | `/me` | Ya | Profil dan saldo terbaru dari server |
| PATCH | `/me` | Ya | Ubah nama, telepon, dan email |
| POST | `/auth/agents` | Ya | Marketing/master membuat agent |
| GET | `/auth/agents` | Ya | Daftar agent yang boleh dilihat akun |
| PATCH | `/auth/agents/{id}/follow-up` | Ya | Simpan status/note follow-up |
| PATCH | `/auth/agents/{id}/access` | Ya | Aktif/nonaktifkan akses agent |
| POST | `/auth/downlines` | Ya | Membuat downline user/agent |
| GET | `/auth/downlines` | Ya | Daftar downline |
| POST | `/auth/marketing` | Ya | Super Admin membuat marketing |
| GET | `/auth/accounts` | Ya | Daftar akun sesuai izin |
| PATCH | `/auth/accounts/{id}/access` | Ya | Suspend/aktifkan akun |
| DELETE | `/auth/accounts/{id}` | Ya | Hapus akun sesuai izin |

Body register:

```json
{
  "name": "Nama Lengkap",
  "username": "username",
  "phone": "081234567890",
  "email": "user@example.com",
  "password": "minimal-6-karakter",
  "account_type": "user",
  "store_name": "Nama Toko",
  "province": "Sumatera Utara",
  "city": "Medan",
  "district": "Medan Kota"
}
```

Body update profil:

```json
{"name":"Nama Baru","phone":"081234567890","email":"user@example.com"}
```

## 5. Produk dan provider

| Method | Path | Auth | Keterangan |
|---|---|---:|---|
| GET | `/products` | Saat ini tidak diwajibkan handler | Semua produk aktif |
| GET | `/products?service=pulsa` | Sama | Produk satu layanan |
| GET | `/h2h/pulsa24jam/products?product=SKU` | Ya | Katalog mentah H2H, bukan untuk UI umum |

Nilai `service` yang digunakan frontend: `pulsa`, `data`, `ewallet`, `pln`, `game`, `pdam`, `bpjs`, `telkom`, `tv`, `pascabayar`, `gas`, `internet`, `bank`, `voucher`, `school`, `insurance`, `vehicle`, `multifinance`, `property`, `travel`, `qris`, `emoney`, `toll`, `streaming`, `esim`, `health`, `creditcard`, `tax`, `zakat`, `parking`, dan `delivery`.

Model produk:

```json
{
  "id": "h2hr-...",
  "sku": "SKU_PROVIDER",
  "service": "pulsa",
  "operator": "Telkomsel",
  "name": "Telkomsel 10.000",
  "group": "Pulsa",
  "category": "Pulsa",
  "nominal": 10000,
  "price": 11000,
  "stock": 999,
  "status": "FIXED"
}
```

Gunakan `sku`, `price`, `status`, dan ketersediaan terbaru dari server. Jangan mempercayai harga yang disimpan permanen di aplikasi.

## 6. Transaksi pengguna

| Method | Path | Auth | Keterangan |
|---|---|---:|---|
| GET | `/me/transactions` | Ya | Riwayat transaksi akun aktif |
| POST | `/me/payments` | Ya | Bayar produk melalui H2H |
| POST | `/me/payments/pending` | Ya | Buat invoice pending; QRIS riil belum aktif |
| GET | `/me/payments/pending/{id}` | Ya | Status invoice pending |
| GET | `/h2h/pulsa24jam/status?refid=...` | Ya | Verifikasi status order milik pengguna |
| POST | `/h2h/pulsa24jam/inquiry` | Ya | Inquiry tagihan pascabayar |
| POST | `/me/topups` | Ya | Saat ini selalu `503`; provider top-up belum aktif |

Body pembayaran:

```json
{
  "title": "Isi Pulsa",
  "target": "081234567890",
  "provider": "Telkomsel",
  "product": "Telkomsel 10.000",
  "email": "user@example.com",
  "amount": 11000,
  "sku": "SKU_PROVIDER",
  "qty": 1,
  "request_id": "UUID-UNIK-DARI-ANDROID"
}
```

`request_id` wajib dibuat unik per percobaan checkout dan dipertahankan saat retry request yang sama. Ini mencegah transaksi ganda. Untuk produk `FIXED`, backend menghitung harga dari katalog dan mengabaikan harga klien. Untuk `OPEN_AMOUNT`, `qty` adalah nominal dan total dihitung server.

Response pembayaran dapat berstatus HTTP `202 Accepted` walau transaksi masih diproses:

```json
{
  "transaction": {
    "id": "PP-...",
    "status": "Diproses",
    "order_number": "REFID-P24",
    "amount": 11000
  },
  "balance": 89000,
  "main_used": 11000,
  "credit_used": 0,
  "funding_source": "Saldo Utama"
}
```

Android harus melakukan polling `GET /h2h/pulsa24jam/status?refid=...` untuk status pending. Jangan mengulang `POST /me/payments` dengan `request_id` baru hanya karena jaringan timeout.

Body inquiry:

```json
{"sku":"SKU_INQUIRY","target":"ID_PELANGGAN"}
```

## 7. Preferensi dan data perangkat

| Method | Path | Auth | Keterangan |
|---|---|---:|---|
| GET | `/me/preferences` | Ya | Favorit dan pengaturan akun |
| PUT | `/me/preferences` | Ya | Merge preferensi akun |

Contoh:

```json
{
  "favorites": [
    {"id":"081234567890-pulsa","number":"081234567890","label":"Nomor Saya","service":"pulsa"}
  ],
  "security": {"biometric_enabled":true}
}
```

Jangan menyimpan PIN biometrik atau secret di preferences backend. Biometrik hanya membuka token yang disimpan oleh Android Keystore.

## 8. Lookup

| Method | Path | Auth | Keterangan |
|---|---|---:|---|
| POST | `/services/lookup` | Tidak diwajibkan handler | Validasi target/provider internal |
| POST | `/services/recipient-lookup` | Tidak | Saat ini selalu `503` sampai payout partner aktif |

```json
{"service":"pulsa","target":"081234567890","provider":"Telkomsel"}
```

## 9. Kredit agent dan dokumen

| Method | Path | Auth | Keterangan |
|---|---|---:|---|
| GET | `/me/agent-credit` | Ya | Pengajuan milik akun |
| POST | `/me/agent-credit` | Ya | Buat/perbarui pengajuan |
| GET | `/agent-credit/applications?summary=1` | Ya + role | Ringkasan pengajuan |
| GET | `/agent-credit/applications/{id}` | Ya + role | Detail pengajuan |
| PUT | `/agent-credit/applications/{id}` | Ya + role | Simpan review/perubahan |
| GET | `/agent-credit/applications/{id}/documents/{documentKey}` | Ya + role | Ambil metadata/data dokumen |
| PATCH | `/agent-credit/applications/{id}/documents/{documentKey}` | Ya + role | Review dokumen |
| POST | `/agent-credit/applications/{id}/payments` | Ya + role | Catat pembayaran kredit |

Payload pengajuan dan pembayaran saat ini berupa JSON dinamis. Dokumen dikirim di dalam JSON dan body dibatasi maksimal 16 MiB. Untuk Android, kompres foto sebelum upload, hindari base64 di atas batas, dan jangan memakai multipart karena handler saat ini belum menerimanya.

Review dokumen:

```json
{"status":"APPROVED","note":"Dokumen sesuai"}
```

## 10. Endpoint operasional/internal

| Method | Path | Role/kondisi |
|---|---|---|
| GET | `/health` | Publik |
| GET | `/h2h/pulsa24jam/balance` | `master` |
| GET | `/h2h/pulsa24jam/operations` | `master`, `operator` |
| POST | `/h2h/pulsa24jam/operations/{refid}/refund` | `master` dan order harus final gagal |
| POST | `/webhooks/pulsa24jam` | Provider callback; jangan dipanggil aplikasi |
| GET | `/dashboard` | Legacy/internal |
| GET/POST | `/transactions` | Legacy/internal |
| GET | `/customers` | Legacy/internal |

Peringatan: tiga endpoint legacy terakhir belum melakukan pemeriksaan token di handler. Jangan gunakan atau publikasikan endpoint tersebut pada aplikasi Android sebelum middleware role global ditambahkan.

## 11. Pemetaan frontend web ke Android

| Web | Fungsi | Android yang setara |
|---|---|---|
| `services/http.js` | Base URL, bearer token, timeout, retry GET | OkHttp interceptor |
| `services/authService.js` | Login/register/profil | AuthRepository |
| `services/productService.js` | Katalog, normalisasi, cache 15 menit | ProductRepository + Room/DataStore |
| `services/transactionService.js` | Payment, inquiry, polling | TransactionRepository + WorkManager |
| `services/contactFavorites.js` | Favorit backend | PreferencesRepository |
| `context/AuthContext.jsx` | State sesi dan user | ViewModel/StateFlow |

## 12. Contoh Kotlin (Retrofit)

```kotlin
data class LoginRequest(val username: String, val password: String)
data class AuthResponse(val token: String, val user: UserDto)

interface KuotaKitaApi {
    @POST("auth/login")
    suspend fun login(@Body body: LoginRequest): AuthResponse

    @GET("me")
    suspend fun me(): UserDto

    @GET("products")
    suspend fun products(@Query("service") service: String): List<ProductDto>

    @POST("me/payments")
    suspend fun pay(@Body body: PaymentRequest): PaymentResponse

    @GET("h2h/pulsa24jam/status")
    suspend fun paymentStatus(@Query("refid") refId: String): PaymentStatusResponse
}
```

```kotlin
class BearerInterceptor(private val tokenStore: TokenStore) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val token = tokenStore.read()
        val request = chain.request().newBuilder()
            .header("Accept", "application/json")
            .apply { if (!token.isNullOrBlank()) header("Authorization", "Bearer $token") }
            .build()
        return chain.proceed(request)
    }
}
```

## 13. Aturan keamanan wajib

1. Jangan masukkan `APP_SECRET`, password database, Google client secret, API key/PIN Pulsa24Jam, atau token akun ke APK.
2. Semua transaksi harus menuju backend KuotaKita; Android tidak boleh langsung memanggil provider H2H.
3. Gunakan HTTPS saja pada produksi dan nonaktifkan cleartext traffic.
4. Ambil saldo dari `GET /me`; jangan menjadikan saldo cache lokal sebagai sumber kebenaran.
5. Jangan mencatat header Authorization, password, KTP, selfie, atau dokumen kredit ke log/Crashlytics.
6. Tambahkan idempotency melalui `request_id` unik untuk setiap checkout.
7. Perlakukan `202` sebagai pending, bukan sukses final.
8. Setelah logout atau `401`, hapus token dan cache data sensitif.

Kontrak mesin lengkap tersedia di `docs/openapi.yaml`.
