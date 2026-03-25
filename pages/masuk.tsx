import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Layout } from "../components/layout/Layout";
import { useAuth } from "../components/auth/hooks/useAuth";
import { EyeIcon, EyeOffIcon } from "@heroicons/react/outline";

export default function MasukPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = login({ phone, password });
    if (!res.ok) {
      setError(res.message);
      return;
    }
    router.push("/");
  };

  return (
    <Layout>
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">Masuk</h2>
          <p className="mt-1 text-sm text-gray-600">Silakan masuk untuk melanjutkan.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="login-phone" className="block text-sm font-medium text-gray-700">
                Nomor telepon
              </label>
              <input
                id="login-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Contoh: 081234567890"
                inputMode="tel"
                autoComplete="tel"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Minimal 6 karakter"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <EyeIcon className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              className="w-full rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              Masuk
            </button>
          </form>

          <p className="mt-4 text-sm text-gray-600">
            Belum punya akun?{" "}
            <Link href="/daftar" className="font-semibold text-indigo-700 hover:underline">
              Daftar
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}

