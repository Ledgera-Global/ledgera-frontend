"use client";
import { useRouter } from "next/navigation";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
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

function persistAuth(
  user: User,
  company: Company,
  subscription: Subscription,
  onboarding: Onboarding
) {
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

function loadPersistedAuth(): {
  user: User;
  company: Company;
  subscription: Subscription;
  onboarding: Onboarding;
} | null {
  if (typeof window !== "undefined") {
    try {
      const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          user: parsed.user,
          company: parsed.company,
          subscription: parsed.subscription,
          onboarding: parsed.onboarding,
        };
      }
    } catch {
      /* ignore */
    }
  }
  return null;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const persisted = loadPersistedAuth();
    if (persisted) {
      return {
        user: persisted.user,
        company: persisted.company,
        subscription: persisted.subscription,
        onboarding: persisted.onboarding,
        token: null,
        loading: false,
        error: null,
      };
    }
    return {
      user: null,
      company: null,
      subscription: null,
      onboarding: null,
      token: null,
      loading: false,
      error: null,
    };
  });
  const router = useRouter();

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

      persistAuth(user, company, subscription, onboarding);
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
      persistAuth(user, company, subscription, onboarding);
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
