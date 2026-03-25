import Link from "next/link";

export const Logo = () => (
  <div className="flex items-center justify-start shrink-0">
    <Link href="/" className="inline-flex items-center gap-3">
      {/* Mobile logo */}
      <div className="md:hidden h-10 overflow-hidden rounded-xl pl-2 pr-2 pt-1">
        <img
          className="h-full w-auto origin-center scale-110 object-contain"
          src="/assets/icons/logo-mobile.png"
          alt="Logo toko"
        />
      </div>

      {/* Desktop logo */}
      <div className="hidden md:block h-12 w-12 overflow-hidden rounded-full">
        <img className="h-full w-full object-cover" src="/assets/icons/logo.png" alt="Logo toko" />
      </div>
      <span className="hidden md:inline-flex text-sm font-semibold tracking-tight text-gray-900">
        Fakhri Store
      </span>
    </Link>
  </div>
);
