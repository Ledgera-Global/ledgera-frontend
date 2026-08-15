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
  login: (email: string, password: string) => Promise<void>;
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

      fetch(`/api/auth/set-session-cookie`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      }).catch(() => {
        /* non-critical */
      });
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

      fetch(`/api/auth/set-session-cookie`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      }).catch(() => {
        /* non-critical */
      });
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
      if (json.company && json.onboarding) {
        setState((prev) => ({
          ...prev,
          company: json.company,
          onboarding: json.onboarding,
        }));
      }
    } catch {
      /* silent - polling can retry */
    }
  }

  function logout() {
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
    router.push("/login");
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
