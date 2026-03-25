import { useMemo } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Layout } from "../../components/layout/Layout";
import { PRODUCTS } from "../../data/products";
import type { Product } from "../../types/product";
import { categoryLabel } from "../../utils/productLabels";
import { useCart } from "../../components/cart/hooks/useCart";
import { useToast } from "../../components/ui/toast/ToastContext";
import { useStock } from "../../components/products/context/stockContext";
import { useAuth } from "../../components/auth/hooks/useAuth";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function loadLocalProducts(): Array<Product> {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("ecommerce.localProducts.v1");
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<Partial<Product>>;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((p): p is Partial<Product> & { id: string } => typeof p?.id === "string")
      .map((p) => ({
        id: p.id,
        name: String(p.name ?? "Produk"),
        description: String(p.description ?? ""),
        price: Number(p.price ?? 0),
        image: String(p.image ?? "/assets/products/no-image.png"),
        category: (p.category as Product["category"]) ?? "entry-gaming",
        stock: Number.isFinite(Number(p.stock)) ? Number(p.stock) : 10,
      }));
  } catch {
    return [];
  }
}

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const { dispatch } = useCart();
  const { pushToast } = useToast();
  const { getStock, consume } = useStock();
  const { isLoggedIn } = useAuth();

  const product = useMemo(() => {
    if (!id) return null;
    const local = loadLocalProducts().find((p) => p.id === id);
    if (local) return local;
    return PRODUCTS.find((p) => p.id === id) ?? null;
  }, [id]);

  if (!product) {
    return (
      <Layout>
        <div className="w-full">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="text-sm text-gray-700">Produk tidak ditemukan.</div>
            <Link href="/" className="mt-4 inline-flex text-sm font-semibold text-indigo-700 hover:underline">
              Kembali ke katalog
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const currentStock = getStock(product.id, product.stock);

  const addToCart = () => {
    if (currentStock <= 0) {
      pushToast(`Stok ${product.name} habis.`);
      return;
    }
    const ok = consume(product.id, product.stock);
    if (!ok) {
      pushToast(`Stok ${product.name} habis.`);
      return;
    }
    dispatch({ type: "addProduct", payload: product });
    pushToast(`Barang ${product.name} masuk keranjang.`);
  };

  const buyNow = () => {
    if (!isLoggedIn) {
      pushToast("Anda belum login. Silakan masuk.");
      router.push("/masuk");
      return;
    }
    addToCart();
    router.push("/keranjang");
  };

  return (
    <Layout>
      <div className="w-full">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-indigo-700 hover:underline">
            ← Kembali
          </Link>
          <span className="text-xs font-semibold text-gray-600">
            {categoryLabel(product.category)}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="flex h-[320px] items-center justify-center bg-white sm:h-[380px] lg:h-[420px]">
              <img
                src={product.image}
                alt={product.name}
                className="block h-full w-full object-contain p-4"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">{product.name}</h1>
            <p className="mt-2 text-sm text-gray-600">{product.description}</p>

            <div className="mt-5 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-gray-900">Harga</div>
                <div className="text-gray-700">{formatRupiah(product.price)}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">Stok tersedia</div>
                <div className="text-gray-700">{currentStock}</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={addToCart}
                disabled={currentStock <= 0}
                className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
              >
                {currentStock <= 0 ? "Stok habis" : "Tambah ke keranjang"}
              </button>
              <button
                onClick={buyNow}
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Beli sekarang
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

