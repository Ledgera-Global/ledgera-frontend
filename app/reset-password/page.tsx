import Link from "next/link";
import ResetPasswordForm from "./ResetPasswordForm";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

/**
 * /reset-password — the page a password-reset email links to.
 *
 * Server component so the token is read from the URL on the server. The form
 * itself is client-side (it posts to the same-origin proxy).
 *
 * A missing or empty token is caught here rather than in the form: there is no
 * useful action to offer without one, and letting someone type a new password
 * only to be rejected is worse than saying so up front.
 */
export default async function ResetPasswordPage({ searchParams }: Props) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token.trim() : "";

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100 flex flex-col">
      <header className="border-b border-white/5 bg-surface-950/90">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-surface-950">
              L
            </span>
            <span className="text-lg font-semibold text-white">Ledgera Global</span>
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="rounded-[2rem] border border-white/10 bg-surface-900/60 p-8 shadow-xl shadow-black/20">
            {token ? (
              <ResetPasswordForm token={token} />
            ) : (
              <div className="text-center">
                <h1 className="text-2xl font-semibold text-white">This link is incomplete</h1>
                <p className="mt-3 text-sm text-surface-400">
                  The reset link is missing its token. Open the link from the email again, or
                  request a new one.
                </p>
                <Link
                  href="/forgot-password"
                  className="mt-6 inline-block rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-surface-950 transition-all hover:bg-brand-400"
                >
                  Request a new link
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
