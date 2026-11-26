"use client";
import { useRouter } from "next/navigation";
import { SESSION_HINT_COOKIE_NAME } from "./sessionCookieNames";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";


type User = {
  id: string;
  email: string;
  role: string;
  companyId: string;
  /**
   * Ledgera Global employment, as reported by the server. Used only to choose
   * which surface to render - every internal endpoint re-checks it against the
   * database, so this value is never the access-control decision.
   */
  isInternal?: boolean;
};

type Company = {
  id: string;
  name: string;
  accountingSystem: string;
  onboardingStatus: string;
};

type Subscription = {
  status: string;
  checkoutUrl?: string;
};

type Onboarding = {
  status: string;
  contractId?: string;
  signingUrl?: string;
};

type AuthState = {
  user: User | null;
  company: Company | null;
  subscription: Subscription | null;
  onboarding: Onboarding | null;
  token: string | null;
  loading: boolean;
  error: string | null;
};

type AuthActions = {
  /**
   * Signs in and resolves with the server's own view of the account, including
   * `isInternal`.
   *
   * The caller needs that identity to decide which surface to open, and it must
   * not be fetched separately: a follow-up `/auth/me` would race the session
   * cookie, and the caller's `token` from context is still stale in the same
   * tick because React has not re-rendered yet. Returning the login response
   * gives callers the authoritative user with no second round-trip.
   */
  login: (email: string, password: string) => Promise<{ user: User; token: string }>;
  register: (
    email: string,
    password: string,
    companyName: string,
    eulaAccepted?: boolean,
    name?: string
  ) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  refreshOnboarding: () => Promise<void>;
};

type AuthContextValue = AuthState & AuthActions;

const AUTH_STORAGE_KEY = "ledgera_auth";

const EMPLOYEE_ROLES: ReadonlySet<string> = new Set([
  "admin",
  "staff",
  "exec",
  "executive",
  "internal",
  "ceo",
  "superadmin",
  "root",
  "operator",
  "owner",
]);

/**
 * What this tab remembers between renders.
 *
 * Only the identity and its company context, never the token: the token lives
 * in the httpOnly cookie, and a copy in `sessionStorage` would be readable by
 * any script on the page for no benefit.
 *
 * Every field except `user` is optional because a session can be restored from
 * `/auth/me` with less than the login response carries.
 */
type PersistedAuth = {
  user: User;
  company: Company | null;
  subscription: Subscription | null;
  onboarding: Onboarding | null;
};

function persistAuth({ user, company, subscription, onboarding }: PersistedAuth) {
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ user, company, subscription, onboarding })
      );
    } catch {
      /* ignore quota errors */
    }
  }
}

function clearPersistedAuth() {
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
}

function loadPersistedAuth(): PersistedAuth | null {
  if (typeof window !== "undefined") {
    try {
      const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (!parsed?.user) return null;
        return {
          user: parsed.user,
          company: parsed.company ?? null,
          subscription: parsed.subscription ?? null,
          onboarding: parsed.onboarding ?? null,
        };
      }
    } catch {
      /* ignore */
    }
  }
  return null;
}

/**
 * Whether this browser is carrying a session cookie.
 *
 * Reads the non-secret marker written beside the httpOnly cookie. A false
 * negative costs one unnecessary trip to the sign-in screen; a false positive
 * costs one 401. Neither can grant access - the backend decides that from the
 * real token - so this is only used to decide whether asking is worthwhile.
 */
function hasSessionHint(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .some((entry) => entry.trim().startsWith(`${SESSION_HINT_COOKIE_NAME}=`));
}

/**
 * Writes the session cookie the server-side proxies read.
 *
 * This must be awaited before any navigation. `/api/auth/me` - which
 * `InternalGuard` calls the instant it mounts - authenticates from this cookie
 * alone, so returning from `login()` while the write is still in flight let the
 * guard's first verification arrive with no session and bounce a legitimate
 * employee straight back to the sign-in screen.
 *
 * A failed write is still not fatal: the caller holds the bearer token for this
 * page's lifetime and only reload-survival depends on the cookie. It is logged
 * rather than swallowed so a genuine cookie problem stays visible.
 */
async function storeSessionCookie(token: string): Promise<void> {
  try {
    const res = await fetch(`/api/auth/set-session-cookie`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) {
      console.error(`[auth] session cookie rejected with ${res.status}`);
    }
  } catch (err) {
    console.error("[auth] could not store session cookie:", err);
  }
}

/** Whether this account belongs at the internal front door rather than /login. */
function isEmployeeAccount(user: User | null): boolean {
  if (!user) return false;
  if (user.isInternal !== true) return false;
  return EMPLOYEE_ROLES.has(String(user.role || "").trim().toLowerCase());
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * The state every page starts in, on the server and in the browser alike.
 *
 * `loading` is true until the session has been restored below. Deciding it
 * during render - from `sessionStorage` or from a cookie - would make the
 * server and client markup disagree, and identity is not something to guess
 * at anyway: it is read from the server.
 */
const PENDING_AUTH_STATE: AuthState = {
  user: null,
  company: null,
  subscription: null,
  onboarding: null,
  token: null,
  loading: true,
  error: null,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(PENDING_AUTH_STATE);
  const router = useRouter();

  /**
   * Restores the session on every full page load.
   *
   * The token lives in an httpOnly cookie, so no page script can read it and
   * nothing here may trust the cached copy in `sessionStorage`. The one thing
   * that decides whether this load is signed in is `/api/auth/me`, which
   * forwards the cookie to the backend.
   *
   * Without this, a reload - or simply opening the workspace in a new tab,
   * because `sessionStorage` is per tab - began with `user: null`, and the
   * guards redirected a valid employee to the sign-in screen before anything
   * had asked the server who they were.
   *
   * Skipped when there is no session to restore, so an anonymous visit never
   * pays for a request whose only possible answer is 401.
   */
  useEffect(() => {
    let cancelled = false;

    async function rehydrate() {
      const persisted = loadPersistedAuth();

      if (!persisted && !hasSessionHint()) {
        if (!cancelled) setState((prev) => ({ ...prev, loading: false }));
        return;
      }

      try {
        const res = await fetch(`/api/auth/me`, {
          method: "GET",
          cache: "no-store",
        });

        if (cancelled) return;

        if (!res.ok) {
          // Stale, revoked, or the account was offboarded. Drop the cached
          // copy: the backend has refused this session, and the UI must not
          // keep rendering a workspace it is not allowed to read.
          clearPersistedAuth();
          setState({ ...PENDING_AUTH_STATE, loading: false });
          return;
        }

        const json = (await res.json()) as {
          user?: User;
          company?: Company;
          subscription?: Subscription;
          onboarding?: Onboarding;
        };

        if (cancelled) return;

        if (!json.user) {
          clearPersistedAuth();
          setState({ ...PENDING_AUTH_STATE, loading: false });
          return;
        }

        persistAuth({
          user: json.user,
          company: json.company ?? null,
          subscription: json.subscription ?? null,
          onboarding: json.onboarding ?? null,
        });

        setState({
          user: json.user,
          company: json.company ?? null,
          subscription: json.subscription ?? null,
          onboarding: json.onboarding ?? null,
          // The token stays in the cookie. Anything that needs it server-side
          // reads it there; the browser never held it after the reload.
          token: null,
          loading: false,
          error: null,
        });
      } catch {
        if (cancelled) return;
        // Backend unreachable. Keep whatever this tab already knew rather than
        // signing someone out over a network failure; the guards still require
        // a server-confirmed identity before showing protected content.
        setState((prev) => ({ ...prev, loading: false }));
      }
    }

    void rehydrate();

    return () => {
      cancelled = true;
    };
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  async function login(email: string, password: string) {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        const errMsg =
          typeof json.error === "string" ? json.error : "Login failed";
        throw new Error(errMsg);
      }
      const { token, user, company, subscription, onboarding } = json as {
        token: string;
        user: User;
        company: Company;
        subscription: Subscription;
        onboarding: Onboarding;
      };

      persistAuth({ user, company, subscription, onboarding });
      setState({
        user,
        company,
        subscription,
        onboarding,
        token,
        loading: false,
        error: null,
      });

      // Awaited on purpose: the caller navigates immediately after this
      // resolves, and the guard it lands on verifies through the cookie.
      await storeSessionCookie(token);

      return { user, token };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setState((prev) => ({ ...prev, loading: false, error: message }));
      throw err;
    }
  }

  async function register(
    email: string,
    password: string,
    companyName: string,
    eulaAccepted?: boolean,
    name?: string
  ) {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(`/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          companyName,
          name: name || companyName,
          eulaAccepted: eulaAccepted ?? true,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        const errMsg =
          typeof json.error === "object"
            ? Object.values(json.error).flat().join("; ")
            : json.error || "Registration failed";
        throw new Error(errMsg);
      }
      const { token, user, company, subscription, onboarding } = json as {
        token: string;
        user: User;
        company: Company;
        subscription: Subscription;
        onboarding: Onboarding;
      };
      persistAuth({ user, company, subscription, onboarding });
      setState({
        user,
        company,
        subscription,
        onboarding,
        token,
        loading: false,
        error: null,
      });

      // Onboarding is guard-protected too, so the cookie is written before the
      // caller navigates there.
      await storeSessionCookie(token);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setState((prev) => ({ ...prev, loading: false, error: message }));
      throw err;
    }
  }

  async function refreshOnboarding() {
    try {
      const res = await fetch(`/api/auth/me`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) return;
      const json = await res.json();
      // The server is the source of truth for identity as well as onboarding:
      // a role change, a promotion to internal staff, or an offboarding shows up
      // here without the user having to sign out and back in.
      setState((prev) => ({
        ...prev,
        user: json.user ?? prev.user,
        company: json.company ?? prev.company,
        onboarding: json.onboarding ?? prev.onboarding,
      }));
    } catch {
      /* silent - polling can retry */
    }
  }

  function logout() {
    // Send each account back to the door it came through: an employee dumped on
    // the customer sign-in would be told to create a company account.
    const employee = isEmployeeAccount(state.user);
    clearPersistedAuth();
    setState({
      user: null,
      company: null,
      subscription: null,
      onboarding: null,
      token: null,
      loading: false,
      error: null,
    });
    fetch(`/api/auth/clear-session-cookie`, {
      method: "POST",
    }).catch(() => {
      /* non-critical */
    });
    router.push(employee ? "/internal/login" : "/login");
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearError,
        refreshOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
