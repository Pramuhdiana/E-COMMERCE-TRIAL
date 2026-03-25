import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Product } from "./Product";
import { useGetProducts } from "./hooks/useGetProducts";
import type { Product as ProductType } from "../../types/product";
import type { ProductCategory } from "../../types/product";
import { useAuth } from "../auth/hooks/useAuth";

const PAGE_SIZE = 8;
const LS_LOCAL_PRODUCTS = "ecommerce.localProducts.v1";
const LS_IMAGE_OVERRIDES = "ecommerce.productImageOverrides.v1";
type ImageOverrides = Record<string, string>;

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.readAsDataURL(file);
  });
}

async function uploadProductImageToServer(productId: string, file: File): Promise<string | null> {
  try {
    const fd = new FormData();
    fd.append("productId", productId);
    fd.append("file", file);
    const res = await fetch("/api/upload-product-image", { method: "POST", body: fd });
    const json = (await res.json()) as { ok: boolean; path?: string; error?: string };
    if (!res.ok || !json.ok || !json.path) return null;
    return json.path;
  } catch {
    return null;
  }
}

export const Products = () => {
  const { data: products } = useGetProducts();
  const { session } = useAuth();
  const isAdmin = session?.phone === "404";
  const router = useRouter();
  const activeCategory =
    typeof router.query.category === "string" ? router.query.category : "all";

  const [page, setPage] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [category, setCategory] = useState<ProductCategory>("entry-gaming");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [localProducts, setLocalProducts] = useState<ReadonlyArray<ProductType>>([]);
  const [imageOverrides, setImageOverrides] = useState<ImageOverrides>({});
  // stok dikelola oleh StockProvider (supaya bisa restore saat hapus/clear keranjang)

  useEffect(() => {
    try {
      const rawProducts = localStorage.getItem(LS_LOCAL_PRODUCTS);
      if (rawProducts) {
        const parsed = JSON.parse(rawProducts) as Array<Partial<ProductType>>;
        if (Array.isArray(parsed)) {
          const normalized = parsed
            .filter((p): p is Partial<ProductType> & { id: string } => typeof p?.id === "string")
            .map((p) => ({
              id: p.id,
              name: String(p.name ?? "Produk"),
              description: String(p.description ?? ""),
              price: Number(p.price ?? 0),
              image: String(p.image ?? "/assets/products/no-image.png"),
              category: (p.category as ProductCategory) ?? "entry-gaming",
              stock: Number.isFinite(Number(p.stock)) ? Number(p.stock) : 10,
            })) satisfies Array<ProductType>;
          setLocalProducts(normalized);
        }
      }
    } catch {
      // ignore
    }

    try {
      const rawImages = localStorage.getItem(LS_IMAGE_OVERRIDES);
      if (rawImages) {
        const parsed = JSON.parse(rawImages) as ImageOverrides;
        if (parsed && typeof parsed === "object") setImageOverrides(parsed);
      }
    } catch {
      // ignore
    }

    // Ambil mapping gambar dari backend (file-based) agar tetap tampil walau localStorage dihapus.
    (async () => {
      try {
        const res = await fetch("/api/product-images");
        const json = (await res.json()) as { images?: Record<string, string> };
        if (json?.images && typeof json.images === "object") {
          setImageOverrides((prev) => ({ ...json.images, ...prev }));
        }
      } catch {
        // ignore
      }
    })();

  }, []);

  const allProducts = useMemo(() => {
    const base = products ?? [];
    return [...localProducts, ...base].map((p) => ({
      ...p,
      image: imageOverrides[p.id] ?? p.image,
      stock: p.stock,
    }));
  }, [products, localProducts, imageOverrides]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") return allProducts;
    return allProducts.filter((p) => p.category === activeCategory);
  }, [allProducts, activeCategory]);

  useEffect(() => {
    setPage(1);
  }, [activeCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const paged = filteredProducts.slice(start, start + PAGE_SIZE);

  const handleAddProduct = async () => {
    if (!name.trim()) return;
    if (!description.trim()) return;
    if (!price || price < 0) return;

    const id = `local-${Date.now()}`;
    let image = "/assets/products/no-image.png";
    if (imageFile) {
      const uploaded = await uploadProductImageToServer(id, imageFile);
      image = uploaded ?? URL.createObjectURL(imageFile);
    }

    const newProduct: ProductType = {
      id,
      name: name.trim(),
      description: description.trim(),
      price,
      image,
      category,
      stock: 10,
    };

    setLocalProducts((prev) => {
      const next = [newProduct, ...prev];
      try {
        localStorage.setItem(LS_LOCAL_PRODUCTS, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    setName("");
    setDescription("");
    setPrice(0);
    setCategory("entry-gaming");
    setImageFile(null);
    setPage(1);
  };

  const handleUploadImage = async (productId: string, file: File) => {
    const uploaded = await uploadProductImageToServer(productId, file);
    const imageValue = uploaded ?? (await fileToDataUrl(file));
    setImageOverrides((prev) => {
      const next = { ...prev, [productId]: imageValue };
      try {
        localStorage.setItem(LS_IMAGE_OVERRIDES, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // consume/restore stok dilakukan langsung di kartu produk via useStock()

  return (
    <div className="bg-white max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 mt-6">
      {isAdmin ? (
        <div className="mb-8 rounded-lg border border-gray-200 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900">Tambah produk (Admin)</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <label htmlFor="admin-product-name" className="block text-sm font-medium text-gray-700">
              Nama
            </label>
            <input
              id="admin-product-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Contoh: Laptop Gaming RTX"
            />
          </div>

          <div className="lg:col-span-2">
            <label
              htmlFor="admin-product-description"
              className="block text-sm font-medium text-gray-700"
            >
              Deskripsi
            </label>
            <input
              id="admin-product-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Contoh: Layar 144Hz, cocok untuk game kompetitif."
            />
          </div>

          <div className="lg:col-span-1">
            <label htmlFor="admin-product-price" className="block text-sm font-medium text-gray-700">
              Harga (Rp)
            </label>
            <input
              id="admin-product-price"
              value={Number.isFinite(price) ? String(price) : ""}
              onChange={(e) => setPrice(Number(e.target.value))}
              type="number"
              min={0}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="19999000"
            />
            <p className="mt-1 text-xs text-gray-500">{price > 0 ? formatRupiah(price) : ""}</p>
          </div>

          <div className="lg:col-span-1">
            <label
              htmlFor="admin-product-category"
              className="block text-sm font-medium text-gray-700"
            >
              Kategori
            </label>
            <select
              id="admin-product-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory)}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="entry-gaming">Entry Gaming</option>
              <option value="esports">Esports (FPS/MOBA)</option>
              <option value="aaa">AAA / High Performance</option>
              <option value="creator-gaming">Creator + Gaming</option>
              <option value="thin-gaming">Tipis &amp; Powerful</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <label htmlFor="admin-product-image" className="block text-sm font-medium text-gray-700">
              Gambar produk
            </label>
            <input
              id="admin-product-image"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              Jika tidak upload, akan memakai `no-image.png`.
            </p>
          </div>

          <button
            onClick={handleAddProduct}
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Simpan produk
          </button>
        </div>
        </div>
      ) : null}

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Menampilkan {paged.length} dari {filteredProducts.length} produk
          {activeCategory !== "all" ? (
            <>
              {" "}
              <button
                type="button"
                onClick={() => router.push({ pathname: "/", query: {} }, undefined, { shallow: true })}
                className="ml-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Hapus filter
              </button>
            </>
          ) : null}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            disabled={safePage === 1}
          >
            Sebelumnya
          </button>
          <span className="text-sm text-gray-700">
            Halaman {safePage} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            disabled={safePage === totalPages}
          >
            Berikutnya
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
        {paged.map((product) => (
          <Product key={product.id} {...product} onUploadImage={handleUploadImage} />
        ))}
      </div>
    </div>
  );
};
