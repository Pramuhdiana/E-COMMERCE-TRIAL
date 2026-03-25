## E-Commerce Demo (Tanpa Database)

Project e-commerce yang bisa jalan **lokal tanpa database**. Data produk memakai seed di `data/products.ts`, sedangkan data dinamis (akun, session, keranjang, stok override, gambar override) tersimpan di **`localStorage`**.

## Teknologi

- Next.js (Pages Router)
- React + TypeScript
- Tailwind CSS
- React Query
- Headless UI

## Prasyarat (Wajib Install)

Sebelum menjalankan project, pastikan tools berikut sudah terinstall:

- **Node.js** (disarankan versi LTS) + **npm**
  - Cek versi:

```bash
node -v
npm -v
```

- **Git** (untuk clone repository)
  - Cek versi:

```bash
git --version
```

### Windows

- **Install Node.js (LTS)**:
  - Download dari [Node.js](https://nodejs.org/en/download) (pilih versi **LTS** untuk Windows).
  - Jalankan installer `.msi` → Next → centang opsi default (npm otomatis terinstall).
  - Tutup & buka ulang terminal (PowerShell/Windows Terminal), lalu cek:

```bash
node -v
npm -v
```

- **Install Git**:
  - Download dari [Git for Windows](https://git-scm.com/download/win)
  - Jalankan installer → gunakan pengaturan default (aman).
  - Cek:

```bash
git --version
```

- **Terminal**: disarankan pakai **Windows Terminal** atau **PowerShell**.

### macOS

- **Install Git** (biasanya sudah ada). Jika belum ada, install **Xcode Command Line Tools**:

```bash
xcode-select --install
```

- **Install Node.js (LTS)** (pilih salah satu cara):
  - Cara A (paling mudah): download dari [Node.js](https://nodejs.org/en/download) (macOS, versi **LTS**), lalu install.
  - Cara B (Homebrew):
    1. Install Homebrew (ikuti panduan resmi): [Homebrew](https://brew.sh/)
    2. Install Node:

```bash
brew install node
```

- Setelah install, cek:

```bash
node -v
npm -v
git --version
```

## Cara Menjalankan

Masuk ke root project ini, lalu jalankan:

```bash
npm install
npm run dev
```

Buka di browser:
- `http://localhost:3000`

Kalau port 3000 sedang dipakai, Next.js akan otomatis pindah port. Lihat output terminal pada bagian `Local: http://localhost:xxxx`.

## Login / Daftar (Frontend-only)

- Daftar & Masuk: `/daftar` dan `/masuk`
- Data user dan session disimpan di `localStorage`

## Admin (Tambah Produk)

Form **Tambah produk** hanya muncul untuk akun admin:
- Nomor telepon: `404`

Catatan: Seed akun admin ada di `data/users.ts`.

## Keranjang & Stok

- Keranjang disimpan di `localStorage` (tidak hilang saat login/daftar)
- Stok berkurang saat tambah ke keranjang, dan kembali saat item dihapus/keranjang dikosongkan

## Checkout & Penyimpanan Order (Backend File-based)

Checkout menyimpan order:
- Ke `localStorage` (tetap jalan walau backend error)
- Ke file JSON `data/orders.json` lewat API route:
  - `GET /api/orders`
  - `POST /api/orders`

## Panduan Developer (Tambah Halaman / Function / Backend)

### Struktur Folder (ringkas)

- `pages/`: routing halaman (Pages Router) + API route (`pages/api/*`)
- `components/`: komponen UI + context (Auth/Cart/Stock/Toast)
- `data/`: seed & file JSON sederhana (mis. `products.ts`, `orders.json`, `product-images.json`)
- `public/assets/`: gambar logo & produk
- `types/`, `utils/`: tipe dan helper

### Cara Menambahkan Page (halaman baru)

Next.js Pages Router: **1 file = 1 route**.

- Buat file di `pages/`.
  - Contoh: `pages/tentang.tsx` → route `/tentang`
  - Contoh dynamic route: `pages/produk/[id].tsx` → route `/produk/:id`

Pola umum:

```tsx
import { Layout } from "../components/layout/Layout";

export default function TentangPage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6">Halaman Tentang</div>
    </Layout>
  );
}
```

### Cara Menambahkan Function / Logic

- **Helper umum**: taruh di `utils/` (mis. formatter, label helper).
- **Logic khusus fitur**:
  - Produk: `components/products/*`
  - Keranjang: `components/cart/*`
  - Auth: `components/auth/*`
  - Toast/UI: `components/ui/*`

Contoh:
- Format / label / util kecil → `utils/...`
- Hook React Query / hook UI → `components/<fitur>/hooks/...`

### Cara Menambahkan Backend (API) di Project Ini

Backend-nya pakai **API Routes Next.js**.

- Buat file di `pages/api/`.
  - Contoh: `pages/api/hello.ts` → endpoint `GET /api/hello`

Contoh endpoint sederhana:

```ts
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ ok: true, message: "Halo" });
}
```

Contoh backend yang sudah ada:
- **Order**: `pages/api/orders.ts` → simpan ke `data/orders.json`
- **Upload gambar produk**: `pages/api/upload-product-image.ts` → simpan file ke `public/assets/products/`
- **Mapping gambar produk**: `pages/api/product-images.ts` → baca `data/product-images.json`

### Cara Menyimpan Data “JSON” di Folder `data/`

Karena ini frontend + backend Next.js di satu repo, penyimpanan file JSON dilakukan **di API route (server-side)**, bukan dari komponen React.

Pola yang dipakai:
- File JSON di `data/*.json`
- API route:
  - baca file (`fs.readFile`)
  - parse JSON
  - update data
  - tulis balik (`fs.writeFile`)


