import Link from "next/link";

export const Logo = () => (
  <div className="flex items-center justify-start shrink-0">
    <Link href="/" className="inline-flex items-center gap-3">
      <div className="h-12 w-12 overflow-hidden rounded-full ring-1 ring-gray-200 bg-white">
        <img
          className="h-full w-full object-cover"
          src="/assets/icons/logo.png"
          alt="Logo toko"
        />
      </div>
      <span className="hidden sm:inline-flex text-sm font-semibold tracking-tight text-gray-900">
        Fakhri Store
      </span>
    </Link>
  </div>
);
