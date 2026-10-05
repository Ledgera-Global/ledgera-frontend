"use client";

/**
 * Shown when the board cannot be loaded honestly.
 *
 * This component exists because the alternative - rendering the preview
 * fixture - is worse than an error for exactly one audience: a signed-in
 * visitor whose session has lapsed. They asked for their own books and would be
 * given invented figures wearing their company's name. The preview fixture is a
 * demonstration for people who have not signed in; it is not a consolation
 * prize for people whose token expired.
 *
 * So the two cases are worded differently, because the reader's next action is
 * different. A lapsed session needs to sign in again. Anything else is a
 * service problem on Ledgera's side and needs a retry.
 */

export default function LiveUnavailable({
  status,
  onRetry,
}: {
  /** HTTP status, or null when the request never reached the server. */
  status: number | null;
  onRetry: () => void;
}) {
  const sessionRefused = status === 401 || status === 403;

  return (
    <div className="rounded-2xl border border-amber-400/25 bg-amber-400/5 px-5 py-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 text-amber-300" aria-hidden="true">
          {sessionRefused ? <LockIcon /> : <WarningIcon />}
        </span>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-amber-200">
            {sessionRefused
              ? "Your session has ended, so your figures cannot be shown."
              : "Your figures could not be loaded."}
          </p>
          <p className="mt-1 text-sm text-surface-300">
            {sessionRefused
              ? "Sign in again to see your own data. Nothing is displayed here in the meantime, because the only figures we hold for an unauthenticated visit are a sample company's, and showing those as yours would be misleading."
              : "The live visibility service did not answer. Your data has not been replaced with a sample: this page shows nothing rather than something that is not yours."}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            {sessionRefused ? (
              <a
                href="/login"
                className="rounded-lg border border-amber-300/40 px-3 py-1.5 text-xs font-semibold text-amber-100 transition hover:border-amber-200 hover:text-white"
              >
                Sign in
              </a>
            ) : (
              <button
                type="button"
                onClick={onRetry}
                className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-surface-200 transition hover:border-white/30 hover:text-white"
              >
                Try again
              </button>
            )}
            {status !== null && (
              <span className="font-mono text-xs text-surface-500">
                HTTP {status}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3.5 21.5 20h-19Z" />
      <path d="M12 9.5v5" />
      <path d="M12 17.5h.01" />
    </svg>
  );
}
