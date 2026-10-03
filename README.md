# Gudang Indofood

Aplikasi manajemen gudang berbasis Laravel, Inertia.js, React, dan PostgreSQL.

## Persyaratan

- PHP 8.3 atau lebih baru beserta ekstensi yang dibutuhkan Laravel
- Composer
- Node.js dan npm (versi npm proyek: 11.6.2)
- PostgreSQL

## Instalasi lokal

1. Clone repositori dan masuk ke folder proyek:

   ```bash
   git clone https://github.com/bugihermansyah/gudang-if.git
   cd gudang-if
   ```

2. Buat file konfigurasi lokal dari contoh:

   ```bash
   cp .env.example .env
   ```

   Di PowerShell, gunakan `Copy-Item .env.example .env`.

3. Pasang dependensi PHP:

   ```bash
   composer install
   ```

4. Buat database PostgreSQL, misalnya `gudang_indofood`, lalu sesuaikan koneksi pada `.env`:

   ```dotenv
   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=gudang_indofood
   DB_USERNAME=postgres
   DB_PASSWORD=password_database_anda
   ```

   Pastikan pengguna database memiliki izin untuk membuat dan mengubah tabel.

5. Atur akun administrator awal pada `.env` sebelum menjalankan seeder:

   ```dotenv
   INITIAL_ADMIN_NAME="Administrator"
   INITIAL_ADMIN_EMAIL="admin@example.com"
   INITIAL_ADMIN_PASSWORD="ganti-dengan-password-kuat"
   ```

   Jika ketiga nilai tersebut belum diisi, aplikasi tetap dapat dimigrasikan, tetapi akun admin tidak dibuat.

6. Buat application key, jalankan migrasi dan seeder, lalu pasang dependensi frontend:

   ```bash
   php artisan key:generate
   php artisan migrate --seed
   npm ci
   ```

7. Jalankan aplikasi untuk pengembangan. Buka dua terminal dari folder proyek:

   ```bash
   php artisan serve
   ```

   ```bash
   npm run dev
   ```

   Buka [http://localhost:8000](http://localhost:8000) di browser.

## Build aset frontend

Untuk membuat aset frontend siap pakai:

```bash
npm run build
```

## Menjalankan pemeriksaan

```bash
composer test
```

Perintah tersebut menjalankan pemeriksaan format PHP, analisis statis, dan test suite. Pemeriksaan frontend tersedia melalui:

```bash
npm run check
npm run types:check
```
