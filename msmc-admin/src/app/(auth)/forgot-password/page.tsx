import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="mb-2 text-3xl font-bold">Forgot Password</h1>

      <p className="mb-8 text-slate-500">
        Password resets for MSMC Admin accounts are handled by your system administrator. Contact them directly, or
        return to <Link href="/login" className="text-blue-600 underline">Login</Link>.
      </p>
    </>
  );
}
