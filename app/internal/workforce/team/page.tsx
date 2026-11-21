"use client";
import { useCallback, useEffect, useState } from "react";
import { fetchJson } from "@/lib/api/client";

/**
 * Team administration for Ledgera Global staff.
 *
 * Lives inside the workforce frame, so it inherits the access gate, the header,
 * and the rail. The page does not gate itself: `WorkforceShell` already asked
 * the server who this is, and `/api/admin/team` re-checks employment on every
 * request rather than trusting anything the browser sends.
 */

const ROLES = ["admin", "exec", "staff"] as const;

type TeamUser = {
  id: string;
  email: string;
  role: string;
  lastName?: string;
  createdAt?: string;
  inviteLink?: string;
  disabled?: boolean;
};

type TeamResponse =
  | { users: TeamUser[] }
  | { user: TeamUser; inviteLink: string }
  | TeamUser[];

export default function WorkforceTeamPage() {
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
      setNotice(`Invite link: ${data?.inviteUrl || ""}`);
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

  async function setStatus(u: TeamUser, action: "offboard" | "restore") {
    setError("");
    setNotice("");
    try {
      const res = await fetch(`/api/admin/team/${u.id}/${action}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || `Failed to ${action} user.`);
        return;
      }
      setNotice(`${u.email} ${action === "offboard" ? "offboarded" : "restored"}.`);
      load();
    } catch {
      setError("Something went wrong.");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white lg:text-3xl">Team</h1>
        <p className="mt-1 max-w-2xl text-sm text-surface-400">
          Invite Ledgera Global staff and executives. Each invite generates a one-time link the person
          uses to set a password and sign in. Offboarding disables the account and ends its sessions;
          it does not delete the person's history.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}
      {notice && (
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
          {notice}
        </div>
      )}

      <form
        onSubmit={handleCreate}
        className="grid gap-3 rounded-[2rem] border border-white/10 bg-surface-950/60 p-6 sm:grid-cols-2"
      >
        <div>
          <label htmlFor="team-email" className="block text-xs font-medium text-surface-400">
            Email
          </label>
          <input
            id="team-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-surface-900 px-3 py-2 text-sm text-white outline-none focus:border-brand-400"
          />
        </div>
        <div>
          <label htmlFor="team-role" className="block text-xs font-medium text-surface-400">
            Role
          </label>
          <select
            id="team-role"
            value={role}
            onChange={(e) => setRole(e.target.value as (typeof ROLES)[number])}
            className="mt-1 w-full rounded-xl border border-white/10 bg-surface-900 px-3 py-2 text-sm text-white outline-none focus:border-brand-400"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="team-first" className="block text-xs font-medium text-surface-400">
            First name
          </label>
          <input
            id="team-first"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-surface-900 px-3 py-2 text-sm text-white outline-none focus:border-brand-400"
          />
        </div>
        <div>
          <label htmlFor="team-last" className="block text-xs font-medium text-surface-400">
            Last name
          </label>
          <input
            id="team-last"
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

      <div>
        <h2 className="mb-3 text-xl font-semibold text-white">People</h2>
        <div className="overflow-x-auto rounded-[2rem] border border-white/10 bg-surface-950/40">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-surface-400">
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Invite link</th>
              </tr>
            </thead>
            <tbody>
              {team.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-sm text-surface-500">
                    No internal users yet.
                  </td>
                </tr>
              ) : (
                team.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 last:border-0">
                    <td className="px-5 py-3 text-white">{u.email}</td>
                    <td className="px-5 py-3 text-surface-300">{(u.lastName || "").trim() || "—"}</td>
                    <td className="px-5 py-3 text-surface-300">{u.role}</td>
                    <td className="px-5 py-3">
                      {u.disabled ? (
                        <span className="inline-flex items-center rounded-full border border-red-400/30 bg-red-400/10 px-2.5 py-0.5 text-xs font-medium text-red-200">
                          Disabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-xs font-medium text-emerald-200">
                          Active
                        </span>
                      )}
                      <button
                        onClick={() => setStatus(u, u.disabled ? "restore" : "offboard")}
                        className="ml-2 rounded-lg border border-white/10 bg-surface-900 px-2.5 py-1 text-xs text-surface-300 hover:bg-surface-800"
                      >
                        {u.disabled ? "Restore" : "Offboard"}
                      </button>
                    </td>
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
  );
}
