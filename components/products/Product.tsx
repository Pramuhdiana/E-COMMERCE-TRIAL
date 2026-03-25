import type { Product as ProductType } from '../../types/product';
import { useBuyProduct } from './hooks/useBuyProduct';
import { useCart } from '../cart/hooks/useCart';
import { useToast } from '../ui/toast/ToastContext';
import { useAuth } from '../auth/hooks/useAuth';
import { useRouter } from 'next/router';
import { useStock } from './context/stockContext';
import Link from 'next/link';
import {
  categoryBadgeClass,
  categoryLabel,
  stockBadgeClass,
  truncate,
} from '../../utils/productLabels';

type ProductProps = Readonly<ProductType>;

type ProductCardProps = ProductProps & {
  readonly onUploadImage?: (productId: string, file: File) => void;
};

export const Product = (product: ProductCardProps) => {
  const { id, image, name, price, stock, category, description } = product;
  const { mutate } = useBuyProduct();
  const {
    dispatch,
    state: { isOpen: _isCartOpen },
  } = useCart();
  const { pushToast } = useToast();
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const { getStock, consume } = useStock();
  const currentStock = getStock(id, stock);
  const isNoImage =
    image === "/assets/products/no-image.png" ||
    image.endsWith("/assets/products/no-image.png") ||
    image.endsWith("/no-image.png");

  const buyProduct = () => {
    if (!isLoggedIn) {
      pushToast("Anda belum login. Silakan masuk.");
      router.push("/masuk");
      return;
    }
    mutate(product);
  };

  const addToCart = () => {
    if (currentStock <= 0) {
      pushToast(`Stok ${name} habis.`);
      return;
    }
    const ok = consume(id, stock);
    if (!ok) {
      pushToast(`Stok ${name} habis.`);
      return;
    }
    dispatch({ type: 'addProduct', payload: product });
    pushToast(`Barang ${name} masuk keranjang.`);
  };

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-gray-300 bg-gray-50 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="w-full overflow-hidden bg-white">
        {/* Mobile badges (1 baris, di atas gambar) */}
        <div className="flex flex-nowrap items-center justify-between gap-2 px-3 pt-3 pb-2 sm:hidden">
          <span
            className={[
              "max-w-[60%] truncate rounded-full px-3 py-1 text-xs font-semibold ring-1 shadow-sm",
              categoryBadgeClass(category),
            ].join(" ")}
            title={categoryLabel(category)}
          >
            {categoryLabel(category)}
          </span>
          <span
            className={[
              "shrink-0 rounded-full px-3 py-1 text-xs font-semibold ring-1 shadow-sm",
              stockBadgeClass(currentStock),
            ].join(" ")}
          >
            Stok: {currentStock}
          </span>
        </div>

        <div className="relative h-56 w-full sm:h-64 lg:h-72 bg-white">
          <img
            className="block h-full w-full object-contain p-3"
            src={image}
            alt={name}
          />
          <div className="absolute bottom-3 right-3 z-0 rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white shadow-sm">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              maximumFractionDigits: 0,
            }).format(price)}
          </div>
          <div className="absolute left-3 top-3 z-0 hidden items-center gap-2 sm:flex">
            <span
              className={[
                "rounded-full px-3 py-1 text-xs font-semibold ring-1 shadow-sm",
                categoryBadgeClass(category),
              ].join(" ")}
            >
              {categoryLabel(category)}
            </span>
            <span
              className={[
                "rounded-full px-3 py-1 text-xs font-semibold ring-1 shadow-sm",
                stockBadgeClass(currentStock),
              ].join(" ")}
            >
              Stok: {currentStock}
            </span>
          </div>
          {product.onUploadImage && isNoImage ? (
            <label className="absolute inset-0 z-0 hidden cursor-pointer items-center justify-center group-hover:flex">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  product.onUploadImage?.(id, file);
                  e.currentTarget.value = "";
                }}
              />
              <span className="inline-flex items-center gap-2 rounded-full bg-gray-900/80 px-4 py-2 text-xs font-semibold text-white shadow-sm ring-1 ring-white/20 backdrop-blur">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M9 3h6l1.5 2H20a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3.5L9 3Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 18a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                Unggah gambar
              </span>
            </label>
          ) : null}
        </div>
      </div>

      <div className="flex h-[232px] flex-col bg-gray-50 p-4">
        <div className="min-h-[20px]">
          <h3 className="truncate text-sm font-semibold leading-5 text-gray-900">{name}</h3>
        </div>

        <div className="mt-2 min-h-[48px]">
          <p className="line-clamp-2 text-sm leading-6 text-gray-600">
            {truncate(description, 95)}
          </p>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
          <button
            onClick={addToCart}
            disabled={currentStock <= 0}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-gray-900 px-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
          >
            {currentStock <= 0 ? "Stok habis" : "Tambah"}
          </button>

          <button
            onClick={buyProduct}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-indigo-600 px-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Beli
          </button>
        </div>

        <Link
          href={`/produk/${id}`}
          className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
        >
          Lihat detail
        </Link>
      </div>
    </article>
  );
};
