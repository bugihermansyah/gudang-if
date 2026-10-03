# Rencana Implementasi Sistem Gudang

Dokumen ini adalah checklist hidup untuk implementasi [PRD.md](PRD.md). Setiap item hanya ditandai selesai setelah kode, pengujian yang relevan, dan pemeriksaan UI berhasil. Bukti verifikasi dicatat di bawah setiap tahap.

## Status

- `[x]` selesai dan terverifikasi
- `[-]` sedang dikerjakan
- `[ ]` belum dikerjakan
- `[!]` menunggu keputusan/lingkungan eksternal

## Tahap 0 — Fondasi proyek

- [x] Membuat Laravel React Starter Kit resmi dengan TypeScript, Inertia, Pest, dan konfigurasi PostgreSQL.
- [x] Mengaktifkan komponen shadcn/ui lokal dengan Tailwind CSS v4, Radix UI, dan Lucide.
- [x] Menambahkan komponen shadcn untuk tabel, field, empty state, input group, textarea, alert dialog, dan pagination.
- [x] Menetapkan Bahasa Indonesia, zona waktu `Asia/Bangkok`, dan nama aplikasi.
- [x] Membuat `DESIGN.md`, `UX-CONTRACT.md`, dan manifest audit UI.
- [x] Menyiapkan role `petugas_gudang`, `supervisor`, dan `admin` beserta pembatasan route di server.
- [x] Menonaktifkan registrasi publik dan menyediakan akun admin awal melalui seeder aman.
- [x] Menambahkan banner koneksi/degraded state dan aturan revalidasi data.

**Bukti:** starter kit dan dependensi berhasil dipasang; `components.json` terbaca oleh CLI shadcn sebagai Laravel + React + Radix + Tailwind v4. Feature test memastikan petugas gudang menerima HTTP 403 pada master produk dan endpoint registrasi publik mengembalikan 404. Seeder admin membaca kredensial dari konfigurasi agar aman saat config cache aktif.

## Tahap 1 — Master dan penerimaan

### 1A. Model data dan master

- [x] Migrasi dan model produk/SKU dengan `maks_karton_per_valet` positif serta status aktif.
- [x] Migrasi dan model perusahaan asal/tujuan dengan kode unik serta status aktif.
- [x] Migrasi dan model row dengan kode unik tanpa nomor slot.
- [x] Migrasi dan model valet berkode permanen yang selalu berada pada satu row aktif.
- [x] Migrasi dan model batch dengan tanggal kedaluwarsa konsisten per SKU + nomor batch.
- [x] Migrasi saldo `valet_stock` dengan constraint stok, reservasi, dan hold.
- [x] CRUD master produk, perusahaan, row, valet, dan akun pengguna sesuai role.
  - [x] Produk: tambah, lihat daftar, ubah, aktif/nonaktif, otorisasi admin, dan feedback.
  - [x] Perusahaan dan row: tambah, daftar, ubah, filter, pagination, aktif/nonaktif, otorisasi admin, dan feedback.
  - [x] Valet: tambah, daftar, ubah, row aktif, status, saldo agregat, otorisasi admin, dan feedback.
  - [x] Akun pengguna: tambah, daftar, ubah, reset kata sandi opsional, filter role/status, aktif/nonaktif, dan otorisasi admin.
- [x] Validasi perubahan kapasitas SKU terhadap seluruh valet yang sudah berisi.
- [-] Pencarian, filter status, pagination server, empty/no-result/error state, dan URL state.
  - [x] Produk: debounce 300 ms, aman untuk IME, clear action, filter authored Select, URL state, pagination, empty, dan no-result.
  - [x] Master perusahaan dan row: debounce 300 ms, clear action, filter authored Select, URL state, pagination, empty, dan no-result.
  - [x] Master valet: daftar, filter status, pagination, empty state, dan form Select row/status.
  - [x] Pengguna: debounce 300 ms, clear action, filter role/status authored Select, URL state, pagination, empty, dan no-result.
  - [x] Degraded/error state global.
- [x] Peta gudang row/valet dengan kartu, muatan, reservasi, batch, dan detail.

**Bukti increment 1A — produk dan master lokasi:**

- `composer test`: Pint lulus, PHPStan 0 error; Pest 50 test, 48 lulus, 2 dilewati, 196 assertion.
- `npm run check`: 82 file terformat dan 81 file tanpa warning/error; `npm run types:check`: lulus; `npm run build`: lulus.
- `designmd lint DESIGN.md`: 0 error dan 0 warning.
- Audit UI strict: 0 error, 0 warning, 0 unresolved.
- Browser smoke test: landing, dashboard admin, daftar produk kosong, Select status, pencarian no-result + clear, dan form tambah berhasil dirender dengan judul dokumen serta label aksesibel.
- Uji kapasitas campuran memakai aritmetika rasional tepat: 16/32 + 24/48 diterima sebagai penuh, lalu perubahan kapasitas SKU pertama ke 31 ditolak tanpa mengubah data.
- Feature test mencakup CRUD perusahaan/row/valet, validasi row aktif, pencegahan menonaktifkan row berisi valet, dan otorisasi non-admin.
- Browser smoke master: daftar perusahaan, row, valet, form valet dengan Select row aktif, serta dialog konfirmasi perubahan status ter-render dengan judul halaman dan label aksesibel.
- Audit premium UI strict: 0 error, 0 warning, 0 unresolved; `designmd lint DESIGN.md`: 0 error dan 0 warning.

**Bukti increment 1A — akun pengguna:**

- Migrasi `users.active`, middleware akun aktif, Fortify menolak login akun nonaktif, perlindungan akun sendiri, serta role admin/supervisor/petugas gudang.
- `composer test`: 53 test, 51 lulus, 2 dilewati, 233 assertion; termasuk CRUD/filter/status akun dan akses akun nonaktif.
- `npm run check`: 86 file terformat dan 85 file tanpa warning/error; `npm run types:check`: lulus; `npm run build`: lulus.
- Audit premium UI strict: 0 error, 0 warning, 0 unresolved; anti-pattern grep tidak menemukan native dialog, `space-*`, atau `<select>` pada scope akun.
- Browser smoke: sidebar admin, daftar akun, filter role/status, dialog konfirmasi nonaktifkan, dan form tambah akun dengan Select peran.

**Bukti increment 0 — koneksi dan degraded state:**

- `ConnectionStatusBanner` memakai shadcn `Alert`, `Button`, dan `Spinner` pada layout aplikasi terautentikasi; state offline menandai data lama dan menyediakan aksi `Coba lagi`.
- Revalidasi menggunakan Inertia `router.reload` dengan state/scroll dipertahankan, dipicu saat koneksi pulih dan tab kembali terlihat setelah 60 detik; event `networkError`/`httpException` menampilkan degraded state tanpa menghapus konten yang sedang dibaca.
- `npm run check:fix`: 86 file terformat dan tanpa warning/lint error; `npm run types:check`: lulus; `npm run build`: lulus.
- Audit premium UI strict: 0 error, 0 warning, 0 unresolved.
- Browser smoke: dashboard tersambung tanpa banner; setelah server dihentikan dan navigasi dicoba, banner “Data mungkin belum mutakhir” serta tombol “Coba lagi” tampil; aksi retry menampilkan state loading dan mempertahankan halaman.

**Bukti increment 1A - peta gudang row/valet:**

- Route `/warehouse-map` memuat row aktif terurut kode, valet aktif termasuk valet kosong, dan saldo stok per SKU/batch dari sumber data pusat.
- Kartu valet menampilkan fisik, tersedia, reservasi, hold, maksimal tiga SKU, jumlah SKU tambahan, dan persentase muatan rasional berdasarkan kapasitas master.
- Filter pencarian row/valet/SKU/batch dan filter valet kosong/berisi/hold berjalan di sisi klien tanpa mengubah saldo.
- Sheet detail shadcn menampilkan seluruh batch, fisik, tersedia, alasan hold, dan penanda kedaluwarsa atau <=30 hari.
- `composer test`: 59 test, 57 lulus, 2 dilewati, 298 assertion; PHPStan 0 error.
- `npm run check:fix`: 91 file terformat dan tanpa warning/lint error; `npm run types:check`: lulus; `npm run build`: lulus.
- Audit premium UI strict: 0 error, 0 warning, 0 unresolved; anti-pattern grep scope peta tidak menemukan native dialog, `space-*`, atau `<select>`.
- Browser smoke: `/warehouse-map` menampilkan row, kartu `V-0001`, muatan 25%, pencarian batch, dan sheet detail batch dengan label aksesibel.

### 1B. Barang masuk

- [x] Dokumen penerimaan draft dengan nomor internal dan referensi surat jalan eksternal.
- [x] PT asal, nopol, driver, waktu mulai/selesai bongkar.
- [x] Baris SKU, batch, expired, jumlah surat jalan, jumlah fisik, dan alasan selisih.
- [x] Alokasi fisik ke beberapa valet dengan validasi kapasitas rasional tepat.
- [x] Hold otomatis untuk batch kedaluwarsa/meragukan.
  - [x] Batch yang sudah kedaluwarsa otomatis masuk `qty_held` dan tidak menjadi stok tersedia.
  - [x] Operator atau supervisor dapat menandai batch meragukan dengan alasan sebelum finalisasi.
- [x] Finalisasi atomik: ledger + saldo + status dokumen + idempotency key.
  - [x] Ledger, saldo, dan status dokumen diperbarui atomik dalam transaksi database.
  - [x] Idempotency key tersimpan unik per dokumen dan retry dengan key sama tidak menggandakan ledger/saldo.
- [x] Cetak label valet dan bukti penerimaan tanpa mengubah stok.
- [-] Uji penerimaan prioritas PRD nomor 1, 11, 12, 14, 18, dan 23.
  - [x] Skenario selisih, kapasitas, waktu bongkar, batch kedaluwarsa, dan batch dengan expired berbeda tercakup.
  - [x] Cetak label/bukti dan idempotensi retry.

**Bukti increment 1B — barang masuk draft sampai finalisasi:**

- Migrasi/model `receiving_documents`, `receiving_lines`, `receiving_allocations`, dan `stock_movements`; route role-aware untuk petugas gudang, supervisor, dan admin.
- Validasi server menolak produk/PT/valet nonaktif, alokasi tidak sama dengan fisik, duplikasi valet pada satu baris, batch dengan expired berbeda, selisih tanpa alasan, dan muatan valet di atas 100% memakai `BigRational`.
- Finalisasi memakai transaksi database dan row lock, menambah `valet_stocks`, membuat ledger append-only, serta memisahkan stok kedaluwarsa sebagai `qty_held`.
- Idempotency key UUID unik dibuat saat draft, dikirim saat finalisasi, dan retry key yang sama bersifat no-op; retry berbeda ditolak.
- Bukti penerimaan dan label valet tersedia sebagai mode print-only dari detail selesai, tanpa endpoint mutasi stok baru.
- Batch meragukan memiliki status terpisah, alasan, pengguna, dan waktu penahanan; finalisasi tetap mencatat karton fisik ke `qty_on_hand` sekaligus `qty_held`.
- `composer test`: 58 test, 56 lulus, 2 dilewati, 266 assertion; PHPStan 0 error.
- `npm run check:fix`: 90 file terformat dan tanpa warning/lint error; `npm run types:check`: lulus; `npm run build`: lulus.
- Audit premium UI strict: 0 error, 0 warning, 0 unresolved; `designmd lint DESIGN.md`: 0 error dan 0 warning.
- Anti-pattern grep scope receiving: tidak menemukan native dialog, `space-*`, atau `<select>`.
- Browser smoke: daftar kosong, form authored Select + field tanggal + alokasi valet, pembuatan draft, mulai bongkar, selesai bongkar, konfirmasi finalisasi, toast sukses, status selesai, serta tombol Cetak bukti dan Cetak label valet aktif ter-render dengan label aksesibel; alur penandaan batch meragukan tervalidasi melalui feature test.

## Tahap 2 — Permintaan, reservasi, picking, dan mutasi

- [ ] Permintaan stok dan lifecycle status lengkap.
- [ ] Persetujuan supervisor dan pemenuhan parsial eksplisit.
- [ ] Saran alokasi FEFO per batch/valet.
- [ ] Reservasi dengan `lockForUpdate` dan pelepasan saat batal.
- [ ] Picking hasil pindai valet dan jumlah aktual.
- [ ] Barang keluar dengan DO/surat jalan eksternal, PT tujuan, kendaraan, driver, dan waktu loading.
- [ ] Finalisasi atomik/idempoten serta konflik antarklien.
- [ ] Mutasi valet antar-row tanpa mengubah stok.
- [ ] Mutasi isi antarvalet dengan validasi kapasitas dan reservasi.
- [ ] Uji prioritas PRD nomor 2–6, 8–10, 13, 17, 19–22, dan 24.

## Tahap 3 — Opname, audit, laporan, dan backup

- [ ] Sesi opname dengan snapshot dan cakupan row/valet.
- [ ] Hitung/recount per valet + SKU + batch serta pengecualian lokasi.
- [ ] Persetujuan penyesuaian dan ledger permanen.
- [ ] Audit event untuk finalisasi, persetujuan, pembalikan, dan restore.
- [ ] Laporan stok, ledger, batch kedaluwarsa/≤30 hari/>30 hari.
- [ ] Ekspor CSV terotorisasi.
- [ ] Backup `pg_dump`, retensi, restore ke database terpisah, dan rekonsiliasi saldo.
- [ ] Uji beban data 10.000 valet / 100.000 mutasi.
- [ ] Uji prioritas PRD nomor 7 dan seluruh skenario regresi tahap sebelumnya.

## Keputusan lingkungan yang masih terbuka

- [!] OS/perangkat host produksi dan alamat LAN tetap.
- [!] Lokasi executable PostgreSQL/`pg_dump` pada host produksi; CLI belum tersedia di `PATH` lokal.
- [!] Prosedur fisik dan dokumen pemusnahan batch kedaluwarsa.

## Definition of done per pekerjaan

- Aturan bisnis memiliki validasi server dan constraint database bila memungkinkan.
- Mutasi stok memiliki test happy path, validation failure, authorization, dan rollback/conflict.
- UI memakai komponen shadcn canonical, Bahasa Indonesia, keyboard focus, serta state loading/empty/no-result/error.
- Formatter, typecheck, unit/feature tests, build, audit premium UI, dan browser smoke test lulus.
- Checklist dan bukti pada dokumen ini diperbarui pada perubahan yang sama.
