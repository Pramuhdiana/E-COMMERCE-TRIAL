import type { Product } from "../types/product";

export const PRODUCTS: ReadonlyArray<Product> = [
  {
    id: "lap-1",
    name: "ASUS ROG Strix G15",
    description: "Laptop gaming 15.6\" FHD 144Hz, performa tinggi untuk esports dan AAA.",
    price: 21_999_000,
    image: "/assets/products/lap1.jpeg",
    category: "esports",
    stock: 8,
  },
  {
    id: "lap-2",
    name: "Acer Predator Helios",
    description: "Sistem pendingin agresif, cocok untuk sesi gaming panjang dan editing.",
    price: 22_499_000,
    image: "/assets/products/lap2.jpeg",
    category: "aaa",
    stock: 5,
  },
  {
    id: "lap-3",
    name: "MSI Katana 15",
    description: "Kencang untuk gaming dan kerja kreatif, desain agresif khas MSI.",
    price: 19_799_000,
    image: "/assets/products/lap3.jpeg",
    category: "entry-gaming",
    stock: 12,
  },
  {
    id: "lap-4",
    name: "Lenovo Legion 5",
    description: "Balance performa dan temperatur, keyboard nyaman untuk gaming/produktif.",
    price: 20_999_000,
    image: "/assets/products/lap4.jpeg",
    category: "creator-gaming",
    stock: 6,
  },
  {
    id: "lap-5",
    name: "HP Omen 16",
    description: "Layar besar dan audio mantap, cocok untuk gaming dan hiburan.",
    price: 23_999_000,
    image: "/assets/products/lap5.jpeg",
    category: "aaa",
    stock: 4,
  },
  {
    id: "lap-6",
    name: "Dell G15 Gaming",
    description: "Build kokoh, performa stabil untuk game kompetitif dan multitasking.",
    price: 18_999_000,
    image: "/assets/products/lap6.jpeg",
    category: "entry-gaming",
    stock: 10,
  },
  {
    id: "lap-7",
    name: "Gigabyte AORUS 15",
    description: "Performa tinggi dengan tampilan premium, siap untuk game berat.",
    price: 24_499_000,
    image: "/assets/products/lap7.jpeg",
    category: "aaa",
    stock: 3,
  },
  {
    id: "lap-8",
    name: "Razer Blade 15",
    description: "Desain tipis premium, performa gaming kelas atas untuk mobilitas.",
    price: 39_999_000,
    image: "/assets/products/lap8.jpeg",
    category: "thin-gaming",
    stock: 2,
  },
  ...Array.from({ length: 20 }).map((_, idx) => {
    const n = idx + 1;
    const categories = ["entry-gaming", "esports", "aaa", "creator-gaming", "thin-gaming"] as const;
    const category = categories[idx % categories.length];
    return {
      id: `dummy-${n}`,
      name: `Laptop Gaming Seri X ${n}`,
      description:
        "Produk dummy untuk tampilan katalog. Silakan unggah gambar agar produk terlihat lebih menarik.",
      price: 12_999_000 + n * 250_000,
      image: "/assets/products/no-image.png",
      category,
      stock: 20 - (idx % 10),
    } satisfies Product;
  }),
];

