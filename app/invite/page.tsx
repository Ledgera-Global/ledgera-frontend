"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function InviteForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) setError("Missing invite token. Ask an admin for a fresh invite link.");
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!token) return setError("Missing invite token.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to set password. The invite may be expired.");
        return;
      }
      setSuccess("Password set. You can now log in.");
      setTimeout(() => router.push("/login"), 1200);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-[2rem] border border-white/10 bg-surface-950/60 p-8 shadow-xl shadow-black/20">
      <h1 className="text-2xl font-semibold text-white">Claim your Ledgera internal access</h1>
      <p className="mt-2 text-sm text-surface-400">
        Set a password for your Ledgera Global account, then sign in to access the internal console.
      </p>

      {success && (
        <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
          {success}
        </div>
      )}
      {error && (
        <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-surface-300">New password</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="mt-1 w-full rounded-xl border border-white/10 bg-surface-900 px-4 py-2.5 text-sm text-white outline-none focus:border-brand-400"
          />
        </div>
        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-surface-300">Confirm password</label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
            className="mt-1 w-full rounded-xl border border-white/10 bg-surface-900 px-4 py-2.5 text-sm text-white outline-none focus:border-brand-400"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand-400 px-4 py-2.5 text-sm font-semibold text-surface-950 hover:bg-brand-300 disabled:opacity-50"
        >
          {loading ? "Setting password…" : "Set password & continue"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-surface-500">
        Already set up? <Link href="/login" className="text-brand-300 hover:underline">Sign in</Link>
      </p>
    </div>
  );
}

export default function InvitePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-950 px-6">
      <Suspense fallback={<div className="text-sm text-surface-400">Loading…</div>}>
        <InviteForm />
      </Suspense>
    </div>
  );
}
