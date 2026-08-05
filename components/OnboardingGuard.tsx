"use client";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { useAuth } from "../lib/auth-context";

type OnboardingGuardProps = {
  children: ReactNode;
  /** When true, renders children even if onboarding is not complete */
  demoMode?: boolean;
};

export default function OnboardingGuard({
  children,
  demoMode = false,
}: OnboardingGuardProps) {
  const { user, company, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user && !demoMode) {
      router.push("/login");
      return;
    }

    // If the user is authenticated but onboarding is not complete,
    // redirect to the onboarding page (unless already there)
    if (
      user &&
      company &&
      company.onboardingStatus !== "active" &&
      typeof window !== "undefined"
    ) {
      const path = window.location.pathname;
      if (!path.startsWith("/onboarding") && !path.startsWith("/api/")) {
        router.push("/onboarding");
      }
    }
  }, [loading, user, company, router, demoMode]);

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
