import { Dialog, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";
import { CartItems } from "./CartItems";
import { useCart } from "./hooks/useCart";
import { useCheckout } from "./hooks/useCheckout";
import { useAuth } from "../auth/hooks/useAuth";
import { useState } from "react";
import { useToast } from "../ui/toast/ToastContext";
import { useRouter } from "next/router";
import { useStock } from "../products/context/stockContext";
import { appendOrder, appendOrderToServer, createOrderFromCartItems } from "../orders/storage";

export const Checkout = () => {
  const {
    state: { totalPrice, items, isOpen },
    dispatch,
  } = useCart();
  const { mutate } = useCheckout();
  const { isLoggedIn, session } = useAuth();
  const { pushToast } = useToast();
  const router = useRouter();
  const { restoreMany } = useStock();

  const handleOpenMenu = () => dispatch({ type: "openMenu" });
  const handleCloseMenu = () => dispatch({ type: "closeMenu" });

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
        handleCloseMenu();
      },
    });
  };

  const handleClearCart = () => {
    // restore stok berdasarkan qty
    const toRestore = items.flatMap((i) => Array.from({ length: i.qty }).map(() => i.product));
    restoreMany(toRestore);
    dispatch({ type: "clearCart" });
    pushToast("Keranjang dikosongkan.");
  };

  return (
    <Transition.Root show={isOpen} as="div" className="fixed inset-0 z-[9999]">
      <Dialog
        as="div"
        className="fixed inset-0 z-[9999] overflow-hidden"
        onClose={handleCloseMenu}
      >
        <div className="absolute inset-0 overflow-hidden">
          <Transition.Child
            as="div"
            enter="ease-in-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay
              className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCloseMenu();
              }}
            />
          </Transition.Child>

          {/* pointer-events-none agar klik backdrop selalu menutup */}
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 pointer-events-none">
            <Transition.Child
              as="div"
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              {/* pointer-events-auto agar panel bisa diklik */}
              <div className="w-screen max-w-md pointer-events-auto">
                <div className="flex h-[100dvh] flex-col bg-white shadow-xl sm:h-full">
                  <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                    <div className="flex items-start justify-between">
                      <Dialog.Title className="text-lg font-medium text-gray-900">
                        Keranjang
                      </Dialog.Title>
                      <div className="ml-3 h-7 flex items-center">
                        <button
                          type="button"
                          className="-m-2 p-2 text-gray-400 hover:text-gray-500"
                          onClick={handleCloseMenu}
                        >
                          <span className="sr-only">Tutup</span>
                          <XIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-8 flow-root">
                      <CartItems items={items} />
                    </div>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-6 sm:px-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <p>Total:</p>
                      <p>
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          maximumFractionDigits: 0,
                        }).format(totalPrice)}
                      </p>
                    </div>

                    <div className="mt-6">
                      {items.length > 0 ? (
                        <div className="flex flex-col gap-3">
                          <button
                            onClick={handleCheckout}
                            className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                          >
                            Checkout
                          </button>
                          <button
                            type="button"
                            onClick={handleClearCart}
                            className="w-full flex justify-center items-center px-6 py-3 rounded-md border border-gray-200 bg-white text-base font-medium text-gray-900 hover:bg-gray-50"
                          >
                            Kosongkan keranjang
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
