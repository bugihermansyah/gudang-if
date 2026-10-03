# UX Contract

## Product context

- Audience: petugas gudang, supervisor, dan admin.
- Primary jobs: menerima, mencari, mereservasi, mengeluarkan, memindahkan, dan menghitung stok karton per valet/SKU/batch.
- Target market: gudang Indonesia.
- Active locale: `id-ID`.
- Language/content register: Bahasa Indonesia operasional, ringkas, tidak promosi.
- Timezone/calendar policy: kalender Gregorian dan zona gudang `Asia/Bangkok`; tanggal kedaluwarsa adalah date-only yang berlaku sampai akhir tanggal tercetak.
- Accessibility target: WCAG 2.2 AA.

## Business-context sources

| Domain / scope | Authoritative source | Source type | Reviewed date |
|---|---|---|---|
| Permission model | `PRD.md` §4 | PRD | 2026-09-27 |
| Stock invariants and lifecycle | `PRD.md` §3, §5, §7 | Domain specification | 2026-09-27 |
| External document references | `PRD.md` §1, §5 | PRD | 2026-09-27 |
| Multi-client consistency | `PRD.md` §8–9 | Technical/domain contract | 2026-09-27 |
| Locale/content conventions | `PRD.md` terminology | Product brief | 2026-09-27 |

## Visual contract

- Project design: `DESIGN.md`.
- Token ownership: runtime canonical.
- Runtime source: `resources/css/app.css` Tailwind v4 variables.
- Mapping: semantic variables → Tailwind theme aliases → shared shadcn components.
- Drift gate: DESIGN lint, strict premium audit, typecheck/build, browser computed-state review.
- Supported themes: light and dark; light is operational default.

## Canonical UI Map

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Table Selection | shared warehouse data table (when introduced) | this contract + PRD | page only until all-results is designed | component + feature/E2E |
| Select/Listbox | shadcn `Select` (Radix) | `components.json`, DESIGN | authored | keyboard + popup |
| Date | native date input for date-only expiry; authored datetime when loading flow is implemented | PRD date semantics | native / authored | locale + keyboard + E2E |
| Form | shadcn `Field` + Inertia form validation | this contract | create / edit | feature + validation E2E |
| Scrollbar | global `resources/css/app.css` | DESIGN | stable-gutter geometry exception | computed style |
| Toast | shared Sonner provider | this contract | success / warning / info / error | live-region test |
| CRUD | Laravel resource controller + Inertia list/form | PRD + this contract | return-to-list | full-flow feature/E2E |

## Component behavior

| Component | Default | Hover | Focus | Active | Disabled | Busy | Error |
|---|---|---|---|---|---|---|---|
| Button | intent + emphasis | semantic surface | 3px focus ring | darker surface | disabled + reason where needed | spinner, fixed geometry | persistent nearby message |
| Icon button | accessible name | semantic surface | visible ring | pressed surface | disabled | spinner | nearby status |
| Input | label + help | border emphasis | ring + border | n/a | native disabled | preserve value | inline text + aria-invalid |
| Search | 300ms debounce + clear | border emphasis | visible ring | n/a | disabled | reserved spinner slot | list-region recovery |
| Textarea | resize none | border emphasis | visible ring | n/a | disabled | preserve value | inline text |
| Table/list | server page | row highlight | target focus | selected/current | action disabled | stable overlay/spinner | retry state |

## Dataset navigation

- Admin tables: server pagination.
- Warehouse map: bounded row groups; pagination/virtualization added when field data exceeds safe bound.
- URL state: `search`, filter, sort, page, dan page size menjadi sumber kebenaran.
- Page size: 15 default untuk master; pilihan lebih besar ditambahkan berdasarkan uji lapangan.
- States: loading, empty dataset, no results, error/retry, range/total tetap memiliki footprint stabil.
- Responsive: horizontal scroll untuk tabel komparatif; peta valet berubah menjadi single-column card tanpa menyembunyikan angka.

## Flow ledger

| Operation | Trigger | Pending | Success destination | Success feedback | Failure recovery | Focus outcome | Source ref |
|---|---|---|---|---|---|---|---|
| Create master | “Tambah …” | tombol stabil + spinner | owning list | toast “... dibuat” | nilai dipertahankan + error inline | heading/row baru | PRD F-01/F-02 |
| Edit master | “Simpan perubahan” | tombol stabil + spinner | owning list | toast “Perubahan disimpan” | nilai dipertahankan | row diperbarui | PRD F-01 |
| Nonaktifkan | “Nonaktifkan” | dialog tetap terbuka | owning list | toast status | dialog menyimpan error/retry | row terkait | PRD F-01 |
| Search | input pencarian | list tetap stabil | route/query sama | jumlah hasil | clear/retry | input/result heading | PRD F-04 |
| Finalisasi stok | “Finalisasi …” | pessimistic, idempotent | detail/bukti | hasil server saja | cek status key + reload | heading hasil | PRD §3/§8 |
| Cancel/back | “Batal” | none | originating list | none | unsaved dialog | trigger asal | this contract |

## Navigation and responsive behavior

- Document title: `{Halaman} — Gudang Indofood` melalui Inertia `Head` + template aplikasi.
- Route errors: 403 menjelaskan role yang diperlukan; 404 tidak menyamarkan 403 secara default; 5xx menawarkan retry tanpa stack trace.
- Sidebar desktop menjadi Sheet/drawer canonical starter kit pada layar sempit.
- Breadcrumb hanya untuk hierarki nyata.
- Focus tujuan route menuju heading utama dan tidak tertutup header sticky.

## Overlays and feedback

- Dialog primitive: shadcn Radix `Dialog`; konfirmasi memakai `AlertDialog`.
- Deactivate master: warning/reversible; dokumen final tidak dihapus dan koreksi memakai reversal/adjustment.
- Toast: Sonner, kanan atas/posisi canonical starter, dedup, Bahasa Indonesia.
- Unsaved changes: dialog aplikasi untuk navigasi internal; `beforeunload` hanya untuk penutupan tab.
- Layer contract: komponen overlay shadcn menjadi pemilik z-index; layar fitur tidak menambah z-index manual.

## Async and resilience

- Mutasi inventory dan permission: pessimistic.
- Duplicate submit: kontrol disabled/busy + idempotency key pada finalisasi stok.
- Offline: konten lama boleh dibaca dengan label stale; semua write diblokir dan input dipertahankan untuk retry.
- Reconnect/visibility: revalidate authoritative data; jangan menimpa form yang sedang kotor.
- Conflict: server menolak, UI menjelaskan perubahan dan menawarkan muat ulang/salin input.
- Session expiry: re-auth lalu kembali ke task, tanpa menyimpan data sensitif lokal.

## Validation

- Server Laravel Form Request adalah sumber kebenaran; constraint DB menjaga invariant dasar.
- Form memakai `noValidate`; error submit pertama mendapat focus/scroll.
- Error field dari Inertia dipasang pada `FieldError`; kegagalan umum memakai `Alert` persisten.
- Nilai non-sensitif dipertahankan; password/secret tidak masuk URL, toast, atau log.

## Permission and clipboard

- Server authorization selalu menentukan akses.
- Navigasi fitur yang tidak relevan disembunyikan; aksi yang dapat dilihat tetapi tidak diizinkan dinonaktifkan dengan alasan.
- Direct route terlarang menghasilkan 403.
- Kode panjang ditampilkan ringkas dengan tombol copy; toast tidak menyertakan nilai.

## Verification

- Static: Pint, Pest/PHPUnit, `npm run check`, `npm run types:check`, `npm run build`, premium strict audit.
- Browser: desktop sempit + lebar, keyboard, popup select terbuka, loading/empty/no-result/error, offline banner, reduced motion.
- Accessibility: semantic table/form, focus-visible, dialog focus trap/restore, live region toast, contrast WCAG AA.
- Canonical sibling: master Produk menjadi pola acuan untuk master Perusahaan dan Row.
