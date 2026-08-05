"use client";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { useAuth } from "../lib/auth-context";

type AuthGuardProps = {
  children: ReactNode;
  /** When true, renders children with demo data instead of redirecting to login */
  demoMode?: boolean;
};

export default function AuthGuard({ children, demoMode = false }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && !demoMode) {
      router.push("/login");
    }
  }, [loading, user, router, demoMode]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-950">
        <div className="flex flex-col items-center gap-4">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-lg font-bold text-surface-950 animate-pulse">
            L
          </span>
          <p className="text-sm text-surface-400">Loading&hellip;</p>
        </div>
      </div>
    );
  }

  if (!user && !demoMode) {
    return null;
  }

  return <>{children}</>;
}
