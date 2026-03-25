import type { User } from "../components/auth/types";
import type { Order } from "../components/orders/storage";

// File ini hanya untuk DATA AWAL (seed) seperti `data/products.ts`.
// Saat app berjalan di browser, data dinamis (register/login/checkout)
// tetap disimpan di localStorage karena frontend tidak bisa menulis file.

export const USERS: ReadonlyArray<User> = [
  // Contoh admin (opsional). Kalau tidak mau auto-ada akun admin, hapus item ini.
  {
    id: "admin-404",
    phone: "404",
    password: "admin",
    createdAt: 0,
  },
];

// Riwayat checkout awal (biasanya kosong).
export const ORDERS: ReadonlyArray<Order> = [];

