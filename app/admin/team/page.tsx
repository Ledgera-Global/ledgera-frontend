"use client";
import AppHeader from "@/components/layouts/AppHeader";
import InternalGuard from "@/components/InternalGuard";
import { useCallback, useEffect, useState } from "react";
import { fetchJson } from "@/lib/api/client";

const ROLES = ["admin", "exec", "staff"] as const;

type TeamUser = {
  id: string;
  email: string;
  role: string;
  lastName?: string;
  createdAt?: string;
  inviteLink?: string;
};

type TeamResponse =
  | { users: TeamUser[] }
  | { user: TeamUser; inviteLink: string }
  | TeamUser[];

export default function AdminTeamPage() {
  const [email, setEmail] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [role, setRole] = useState<(typeof ROLES)[number]>("staff");
  const [team, setTeam] = useState<TeamUser[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetchJson<TeamResponse>("/api/admin/team", { users: [] });
      if (Array.isArray(res)) {
        setTeam(res);
      } else if (res && "users" in res) {
        setTeam(res.users);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load team.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: `${firstName} ${lastName}`.trim(), role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to create user.");
        return;
      }
      const link = data?.inviteLink || "";
      setNotice(`Invite link: ${link}`);
      setEmail("");
      setFirstName("");
      setLastName("");
      load();
    } catch {
      setError("Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function copyLink(link: string) {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(link);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setError("Could not copy — select and copy the link manually.");
    }
  }

  return (
    <InternalGuard>
      <div className="min-h-screen bg-surface-950 text-surface-100">
        <AppHeader currentHref="/admin/team" transparent />
        <div className="pt-24 pb-16">
          <div className="mx-auto max-w-5xl px-6 lg:px-10">
            <div className="mb-8">
              <h1 className="text-3xl font-semibold text-white">Ledgera Global Team</h1>
              <p className="mt-1 text-sm text-surface-400">
                Invite internal staff/executives. Each invite generates a one-time link they use to set a password and sign in.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</div>
            )}
            {notice && (
              <div className="mb-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">{notice}</div>
            )}

            <form onSubmit={handleCreate} className="mb-10 grid gap-3 rounded-[2rem] border border-white/10 bg-surface-950/60 p-6 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-surface-400">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-surface-900 px-3 py-2 text-sm text-white outline-none focus:border-brand-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-400">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as (typeof ROLES)[number])}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-surface-900 px-3 py-2 text-sm text-white outline-none focus:border-brand-400"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-400">First name</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-surface-900 px-3 py-2 text-sm text-white outline-none focus:border-brand-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-400">Last name</label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-surface-900 px-3 py-2 text-sm text-white outline-none focus:border-brand-400"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-xl bg-brand-400 px-5 py-2.5 text-sm font-semibold text-surface-950 hover:bg-brand-300 disabled:opacity-50"
                >
                  {busy ? "Creating…" : "Create invite"}
                </button>
              </div>
            </form>

            <h2 className="mb-3 text-xl font-semibold text-white">Team</h2>
            <div className="overflow-x-auto rounded-[2rem] border border-white/10 bg-surface-950/40">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-surface-400">
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3 text-right">Invite link</th>
                  </tr>
                </thead>
                <tbody>
                  {team.length === 0 ? (
                    <tr><td colSpan={4} className="px-5 py-6 text-center text-sm text-surface-500">No internal users yet.</td></tr>
                  ) : (
                    team.map((u) => (
                      <tr key={u.id} className="border-b border-white/5 last:border-0">
                        <td className="px-5 py-3 text-white">{u.email}</td>
                        <td className="px-5 py-3 text-surface-300">{(u.lastName || "").trim() || "—"}</td>
                        <td className="px-5 py-3 text-surface-300">{u.role}</td>
                        <td className="px-5 py-3 text-right">
                          {u.inviteLink ? (
                            <button
                              onClick={() => copyLink(u.inviteLink as string)}
                              className="rounded-lg border border-white/10 bg-surface-900 px-3 py-1.5 text-xs text-brand-300 hover:bg-surface-800"
                            >
                              {copied === u.inviteLink ? "Copied" : "Copy invite"}
                            </button>
                          ) : (
                            <span className="text-xs text-surface-600">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </InternalGuard>
  );
}
