import type { ReactNode } from "react";
import { Header } from "./header/Header";
import { Checkout } from "../cart/Checkout";

type LayoutProps = {
  readonly children: ReactNode;
};

export const Layout = ({ children }: LayoutProps) => (
  <>
    <Header />
    <Checkout />
    <main className="min-h-screen w-full bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-10 shadow-sm">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
              Toko Laptop Gaming
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Katalog produk, keranjang, dan checkout.
            </p>
          </div>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </main>
  </>
);
