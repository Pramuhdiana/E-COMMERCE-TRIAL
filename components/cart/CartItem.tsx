import { useCart } from "./hooks/useCart";
import { useStock } from "../products/context/stockContext";
import { useToast } from "../ui/toast/ToastContext";
import type { CartItem as CartItemType } from "./context/types";

export const CartItem = ({ item }: { readonly item: CartItemType }) => {
  const product = item.product;
  const { id, name, price, image, stock } = product;
  const qty = item.qty;
  const { dispatch } = useCart();
  const { restoreOne } = useStock();
  const { getStock, consume } = useStock();
  const { pushToast } = useToast();

  const currentStock = getStock(id, stock);
  const stockColor =
    currentStock <= 0
      ? "text-red-700"
      : currentStock <= 3
        ? "text-amber-700"
        : "text-gray-700";

  return (
    <li className="py-6 flex">
      <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
        <img
          src={image}
          alt=""
          className="w-full h-full object-center object-cover"
        />
      </div>
      <div className="ml-4 flex-1 flex flex-col">
        <div className="flex justify-between text-base font-medium text-gray-900">
          <div className="min-w-0 pr-2">
            <h3 className="truncate">{name}</h3>
            <div className="mt-1 text-xs text-gray-500">
              Stok tersisa: <span className={["font-semibold", stockColor].join(" ")}>{currentStock}</span>
            </div>
          </div>
          <p className="ml-4">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              maximumFractionDigits: 0,
            }).format(price)}
          </p>
        </div>
        <div className="flex-1 mt-3 flex items-end justify-between text-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white">
              <button
                type="button"
                onClick={() => {
                  restoreOne(product);
                  dispatch({ type: "decreaseQty", payload: { productId: id } });
                }}
                className="px-3 py-1.5 text-gray-700 hover:bg-gray-50"
                aria-label="Kurangi"
              >
                −
              </button>
              <div className="min-w-[42px] px-3 py-1.5 text-center font-semibold text-gray-900">
                {qty}
              </div>
              <button
                type="button"
                disabled={currentStock <= 0}
                onClick={() => {
                  const ok = consume(id, stock);
                  if (!ok) {
                    pushToast(`Stok ${name} habis.`);
                    return;
                  }
                  dispatch({ type: "increaseQty", payload: { productId: id } });
                }}
                className="px-3 py-1.5 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Tambah"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                // restore stok sebanyak qty
                for (let i = 0; i < qty; i++) restoreOne(product);
                dispatch({ type: "removeProduct", payload: { productId: id } });
                pushToast(`Barang ${name} dihapus dari keranjang.`);
              }}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
    </li>
  );
};
