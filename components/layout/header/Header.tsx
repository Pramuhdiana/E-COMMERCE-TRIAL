import { useAuth } from '../../auth/hooks/useAuth';
import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from '../logo/Logo';
import { useCart } from '../../cart/hooks/useCart';

const CATEGORIES = [
  { id: "all", label: "Semua" },
  { id: "entry-gaming", label: "Entry Gaming" },
  { id: "esports", label: "Esports (FPS/MOBA)" },
  { id: "aaa", label: "AAA / High Performance" },
  { id: "creator-gaming", label: "Creator + Gaming" },
  { id: "thin-gaming", label: "Tipis & Powerful" },
] as const;

export const Header = () => {
  const { session, isLoggedIn, logout } = useAuth();
  const router = useRouter();
  const activeCategory = typeof router.query.category === "string" ? router.query.category : "all";
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [closeTimer, setCloseTimer] = useState<number | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const {
    state: { items, isOpen },
    dispatch,
  } = useCart();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const close = () => {
      setIsCategoryOpen(false);
      setIsMobileMenuOpen(false);
    };
    router.events.on("routeChangeComplete", close);
    return () => {
      router.events.off("routeChangeComplete", close);
    };
  }, [router.events]);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex items-center justify-between py-4">
          <div className="flex items-center gap-6">
            <Logo />

            <div className="hidden md:flex items-center gap-2">
              <div
                className="relative group"
                role="button"
                tabIndex={0}
                onMouseEnter={() => {
                  if (closeTimer) {
                    window.clearTimeout(closeTimer);
                    setCloseTimer(null);
                  }
                  setIsCategoryOpen(true);
                }}
                onMouseLeave={() => {
                  const t = window.setTimeout(() => setIsCategoryOpen(false), 120);
                  setCloseTimer(t);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setIsCategoryOpen(false);
                }}
              >
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={isCategoryOpen}
                  onClick={() => setIsCategoryOpen((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  Kategori
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className={[
                      "transform transition-transform duration-150 group-hover:rotate-180",
                      isCategoryOpen ? "rotate-180" : "rotate-0",
                    ].join(" ")}
                  >
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </button>
                {isCategoryOpen ? (
                  <>
                    <div
                      role="menu"
                      className="absolute left-0 top-full z-40 mt-2 w-72 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl"
                    >
                  {CATEGORIES.map((c) => (
                    <Link
                      key={c.id}
                      href={{
                        pathname: "/",
                        query: c.id === "all" ? {} : { category: c.id },
                      }}
                      onClick={() => setIsCategoryOpen(false)}
                      className={[
                        "w-full text-left block rounded-xl px-3 py-2 text-sm transition",
                        c.id === activeCategory
                          ? "text-indigo-700 font-semibold"
                          : "text-gray-800",
                        "hover:bg-gray-50",
                      ].join(" ")}
                    >
                      {c.label}
                    </Link>
                  ))}
                    </div>
                  </>
                ) : null}
              </div>

              <a
                href="#"
                className="rounded-full px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
              >
                Promo
              </a>
              <a
                href="#"
                className="rounded-full px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
              >
                Bantuan
              </a>
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <input
                className="w-full rounded-full border border-gray-200 bg-white px-4 py-2 pl-10 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Cari laptop gaming, RTX, 144Hz..."
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => dispatch({ type: isOpen ? "closeMenu" : "openMenu" })}
              className="relative inline-flex items-center justify-center rounded-full px-3 py-2 text-gray-900 hover:bg-gray-100"
              aria-label="Buka keranjang"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M6 6h15l-2 9H7L6 6Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 6 5 3H2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              {hasMounted && items.length > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[11px] font-semibold text-white">
                  {items.reduce((acc, it) => acc + it.qty, 0)}
                </span>
              ) : null}
            </button>

            {/* Mobile menu button (paling kanan) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              className="md:hidden inline-flex items-center justify-center rounded-full px-3 py-2 text-gray-900 hover:bg-gray-100"
              aria-label="Buka menu"
              aria-expanded={isMobileMenuOpen}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {/* Desktop auth */}
            <div className="hidden md:flex items-center gap-3">
              {isLoggedIn ? (
              <>
                <div className="hidden sm:block text-sm font-medium text-gray-700">
                  {session?.phone}
                </div>
                <button
                  onClick={logout}
                  className="whitespace-nowrap inline-flex items-center justify-center rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  Keluar
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/masuk"
                  className="whitespace-nowrap inline-flex items-center justify-center rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  Masuk
                </Link>
                <Link
                  href="/daftar"
                  className="whitespace-nowrap inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
                >
                  Daftar
                </Link>
              </div>
              )}
            </div>
          </div>
        </nav>

        {/* Mobile menu panel */}
        {isMobileMenuOpen ? (
          <div className="md:hidden pb-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <input
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Cari laptop gaming, RTX, 144Hz..."
                />
              </div>

              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setIsCategoryOpen((v) => !v)}
                  className="w-full inline-flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                  aria-expanded={isCategoryOpen}
                >
                  Kategori
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className={["transform transition-transform duration-150", isCategoryOpen ? "rotate-180" : "rotate-0"].join(" ")}
                  >
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </button>

                {isCategoryOpen ? (
                  <div className="mt-2 grid grid-cols-1 gap-1">
                    {CATEGORIES.map((c) => (
                      <Link
                        key={c.id}
                        href={{ pathname: "/", query: c.id === "all" ? {} : { category: c.id } }}
                        onClick={() => {
                          setIsCategoryOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                        className={[
                          "block rounded-xl px-3 py-2 text-sm",
                          c.id === activeCategory ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-gray-800",
                          "hover:bg-gray-50",
                        ].join(" ")}
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <a href="#" className="rounded-xl px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50">
                  Promo
                </a>
                <a href="#" className="rounded-xl px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50">
                  Bantuan
                </a>
              </div>

              <div className="mt-3 border-t border-gray-100 pt-3">
                {isLoggedIn ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-gray-700">{session?.phone}</div>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                    >
                      Keluar
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/masuk"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                    >
                      Masuk
                    </Link>
                    <Link
                      href="/daftar"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
                    >
                      Daftar
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
};
