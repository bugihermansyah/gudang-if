---
version: alpha
name: "Gudang Indofood"
description: "Antarmuka operasional gudang bergaya manifest kargo yang padat, tenang, dan cepat dipindai."
colors:
  background: "#F3F5F4"
  foreground: "#14211F"
  primary: "#173F3A"
  primary-foreground: "#F8FCFA"
  accent: "#E7B94C"
  accent-foreground: "#29200C"
  surface: "#FFFFFF"
  muted: "#E7ECE9"
  muted-foreground: "#596762"
  border: "#CBD4CF"
  success: "#257A50"
  warning: "#955408"
  danger: "#B73A35"
  focus: "#2B7E75"
typography:
  display:
    fontFamily: "Bahnschrift SemiCondensed, Arial Narrow, sans-serif"
    lineHeight: "1.05"
  body:
    fontFamily: "Aptos, Segoe UI, system-ui, sans-serif"
    lineHeight: "1.5"
  data:
    fontFamily: "Cascadia Mono, Consolas, monospace"
    lineHeight: "1.35"
rounded:
  DEFAULT: "0.5rem"
  sm: "0.25rem"
  md: "0.5rem"
  lg: "0.75rem"
spacing:
  control: "2.25rem"
  card: "1.25rem"
  section-gap: "1.5rem"
  page-gutter: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    height: "{spacing.control}"
  location-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-foreground}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card}"
  muted-panel:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.muted-foreground}"
  divider:
    backgroundColor: "{colors.border}"
    height: "1px"
  status-success:
    backgroundColor: "{colors.success}"
    textColor: "{colors.primary-foreground}"
  status-warning:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.primary-foreground}"
  status-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.primary-foreground}"
  focus-ring:
    backgroundColor: "{colors.focus}"
---

# Gudang Indofood Design System

## Overview

### Creative North Star

Antarmuka terasa seperti **manifest kargo yang hidup**: struktur data setegas label palet, angka mudah dipindai dari jarak monitor kerja, dan pita lokasi kuning membantu mata menemukan row/valet. Ini produk operasional untuk petugas gudang, supervisor, dan admin yang bekerja berulang kali pada PC intranet—bukan halaman pemasaran.

- **Audience and primary job:** petugas mencatat dan menemukan stok dengan cepat; supervisor menilai konflik/selisih; admin menjaga master dan layanan.
- **Target market and evidence:** gudang di Indonesia berdasarkan bahasa PRD, istilah PT/nopol/surat jalan, dan zona waktu yang diberikan lingkungan proyek.
- **Locale and language policy:** `id-ID`; istilah eksternal yang sudah lazim seperti SKU, batch, FEFO, DO dipertahankan dan dijelaskan melalui konteks.
- **Usage scene:** monitor desktop/laptop pada lingkungan gudang, penggunaan keyboard dan barcode scanner USB, kepadatan informasi menengah–tinggi.
- **Register:** product/admin.
- **Memorable signature:** pita locator kuning pada heading row dan detail valet, menyerupai label rak tanpa mengklaim posisi slot fisik.
- **Restraint:** form, tabel, dialog, dan tindakan stok tetap memakai pola shadcn yang familiar; animasi hanya untuk status/overlay.
- **Anti-references:** dashboard kartu statistik generik dengan gradient; estetika e-commerce; layout editorial longgar yang mengorbankan jumlah data terlihat.
- **Token ownership/runtime mapping:** `resources/css/app.css` adalah canonical runtime Tailwind v4. File ini mencerminkan nilai yang sama dan menjelaskan maksudnya. Perubahan token harus dilakukan pada keduanya dan diperiksa oleh audit/lint.

## Colors

Palet memakai hijau tinta gelap untuk navigasi dan tindakan utama, abu dingin untuk permukaan kerja, serta kuning label sebagai aksen lokasi. `success`, `warning`, dan `danger` hanya menyatakan status semantik dan selalu disertai teks/ikon. Fokus memakai teal terang yang tetap kontras pada permukaan terang maupun gelap.

## Typography

`Bahnschrift SemiCondensed` dipakai hemat untuk judul layar, kode row, dan kode valet agar terasa seperti label logistik. Teks kerja memakai Aptos/Segoe UI. Angka stok, batch, kode, dan timestamp memakai stack monospace data agar digit sejajar dan mudah dibandingkan. Tidak ada font web eksternal karena aplikasi harus tetap utuh tanpa internet.

## Layout

Desktop memakai sidebar persistent dan area kerja dengan gutter 24px. Tabel mempunyai overflow horizontal sendiri; halaman/form tetap memakai document scroll. Pada viewport sempit, navigasi menjadi drawer dan tabel mempertahankan relasi kolom melalui horizontal scroll. Header dan toolbar menyediakan ruang tetap agar loading tidak menggeser kontrol.

## Elevation & Depth

Hierarki utama berasal dari perubahan warna permukaan dan border, bukan bayangan berat. Card statis menggunakan border; popover/dialog boleh memakai shadow canonical shadcn. Sidebar lebih gelap daripada kanvas kerja. Tidak ada glassmorphism atau blur dekoratif.

## Shapes

Kontrol dan card memakai radius sedang 8–12px; badge kode dapat lebih rapat 4px. Pita locator memiliki sudut tegas pada sisi kiri untuk mengingatkan label rak. Bentuk kapsul hanya untuk status ringkas, bukan semua tombol.

## Components

### Foundational visual states

Hover memperjelas border/permukaan, focus-visible selalu memakai ring, active terasa sedikit lebih gelap, disabled kehilangan kontras dan pointer, busy menjaga ukuran kontrol. Loading awal memakai spinner shadcn pada region stabil; skeleton hanya bila bentuk akhir sudah pasti.

### Buttons and actions

Gunakan `Button` shadcn: solid primary untuk aksi aman utama, outline/ghost untuk sekunder, destructive hanya untuk tindakan permanen. Nonaktifkan master memakai warning/outline dan dialog konfirmasi. Ikon Lucide selalu menyertai label untuk aksi penting.

### Navigation and data display

Sidebar mengelompokkan Operasional, Stok, dan Administrasi. Tabel memakai header sticky ketika panel memiliki scroll internal, kode memakai font data, status memakai `Badge`, dan pagination server selalu menampilkan rentang/total. Empty dataset dan no-result dibedakan.

### Forms and overlays

Form memakai `FieldGroup` + `Field`, `noValidate`, error inline serta ringkasan untuk form panjang. Select memakai primitive shadcn/Radix. Dialog detail boleh memakai `Sheet`; konfirmasi berisiko memakai `AlertDialog`. Toast Sonner hanya sebagai acknowledgement, bukan satu-satunya lokasi error.

### Iconography

Gunakan Lucide outline dengan ketebalan canonical komponen. Ikon tidak menggantikan label pada navigasi terbuka atau tindakan stok. Icon-only control wajib memiliki accessible name dan tooltip.

### Motion

Transisi 150–220ms untuk hover/overlay dan tidak digunakan untuk dekorasi data rutin. `prefers-reduced-motion` mematikan transform serta mempertahankan perubahan opacity singkat.

### Content and data visualization

Gunakan kalimat aktif dan istilah gudang: “Simpan produk”, “Mulai bongkar”, “Finalisasi penerimaan”. Format angka `id-ID`; tanggal tampil sebagai tanggal gudang, sementara timestamp audit selalu menyebut zona waktu. Grafik selalu memiliki ringkasan tekstual/tabel.

## Do's and Don'ts

- **Do:** pisahkan stok fisik, reservasi, hold, dan tersedia dengan label eksplisit.
- **Do:** pertahankan kode SKU/batch/row/valet sebagai teks yang dapat dipilih atau disalin.
- **Don't:** memakai warna saja untuk status stok, kedaluwarsa, atau konflik.
- **Don't:** menampilkan grid valet seolah-olah nomor slot atau posisi fisik yang tidak dicatat sistem.
