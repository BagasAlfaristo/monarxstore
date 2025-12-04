//home/zyan/Coding/monarxstore/monarxstore/app/register/page.tsx
import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
        <h1 className="text-lg font-semibold text-slate-900">Create account</h1>
        <p className="mt-1 text-xs text-slate-600">
          Buat akun untuk belanja di Monarx AI Store.
        </p>

        <form
          action="/api/auth/register"
          method="POST"
          className="mt-4 space-y-3 text-xs"
        >
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-800">
              Name
            </label>
            <input
              name="name"
              className="w-full rounded-full border border-slate-300 px-3 py-2 text-xs outline-none focus:border-red-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-800">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-full border border-slate-300 px-3 py-2 text-xs outline-none focus:border-red-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-800">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full rounded-full border border-slate-300 px-3 py-2 text-xs outline-none focus:border-red-500"
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-full bg-slate-900 px-4 py-2 text-[11px] font-semibold text-white hover:bg-black"
          >
            Register
          </button>
        </form>

        <p className="mt-4 text-[11px] text-slate-500">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-red-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
