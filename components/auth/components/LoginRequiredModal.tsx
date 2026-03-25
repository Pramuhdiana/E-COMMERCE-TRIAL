import Link from "next/link";
import { Modal } from "../../ui/modal/Modal";

export function LoginRequiredModal({
  open,
  onClose,
}: {
  readonly open: boolean;
  readonly onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Anda belum login">
      <p className="text-sm text-gray-700">
        Untuk melanjutkan, silakan login. Jika belum punya akun, silakan daftar.
      </p>
      <div className="mt-5 flex gap-3">
        <Link
          href="/masuk"
          className="inline-flex flex-1 items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          onClick={onClose}
        >
          Login
        </Link>
        <Link
          href="/daftar"
          className="inline-flex flex-1 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
          onClick={onClose}
        >
          Daftar
        </Link>
      </div>
    </Modal>
  );
}

