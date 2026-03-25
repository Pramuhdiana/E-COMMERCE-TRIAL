import Link from "next/link";
import { Layout } from "../components/layout/Layout";
import { useCart } from "../components/cart/hooks/useCart";
import { CartItems } from "../components/cart/CartItems";
import { useCheckout } from "../components/cart/hooks/useCheckout";
import { useAuth } from "../components/auth/hooks/useAuth";
import { useToast } from "../components/ui/toast/ToastContext";
import { useRouter } from "next/router";
import { useStock } from "../components/products/context/stockContext";
import { appendOrder, appendOrderToServer, createOrderFromCartItems } from "../components/orders/storage";

export default function KeranjangPage() {
  const {
    state: { items, totalPrice },
    dispatch,
  } = useCart();
  const { isLoggedIn, session } = useAuth();
  const { mutate } = useCheckout();
  const { pushToast } = useToast();
  const router = useRouter();
  const { restoreMany } = useStock();

  const handleCheckout = () => {
    if (!isLoggedIn) {
      pushToast("Anda belum login. Silakan masuk untuk checkout.");
      router.push("/masuk");
      return;
    }
    mutate(items.map((i) => i.product), {
      onSuccess: () => {
        if (session) {
          const order = createOrderFromCartItems({
            userId: session.userId,
            phone: session.phone,
            items,
          });
          appendOrder(order);
          void appendOrderToServer(order);
        }
        dispatch({ type: "clearCart" });
        pushToast("Checkout berhasil. Pesanan disimpan.");
      },
    });
  };

  const handleClearCart = () => {
    const toRestore = items.flatMap((i) => Array.from({ length: i.qty }).map(() => i.product));
    restoreMany(toRestore);
    dispatch({ type: "clearCart" });
    pushToast("Keranjang dikosongkan.");
  };

  return (
    <Layout>
      <div className="w-full">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">Keranjang</h2>
          <Link href="/" className="text-sm font-medium text-indigo-700 hover:underline">
            Lanjut belanja
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
            {items.length > 0 ? (
              <CartItems items={items} />
            ) : (
              <div className="text-sm text-gray-600">Keranjang masih kosong.</div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
            <div className="flex items-center justify-between text-base font-semibold text-gray-900">
              <span>Total</span>
              <span>
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  maximumFractionDigits: 0,
                }).format(totalPrice)}
              </span>
            </div>

            {!isLoggedIn ? (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Untuk checkout, silakan masuk atau daftar terlebih dahulu.
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={handleCheckout}
                disabled={items.length === 0}
                className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                Checkout
              </button>

              <button
                type="button"
                onClick={handleClearCart}
                disabled={items.length === 0}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 disabled:opacity-50"
              >
                Kosongkan keranjang
              </button>

              {!isLoggedIn ? (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/masuk"
                    className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/daftar"
                    className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
                  >
                    Daftar
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

