"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../lib/auth-context";

type StepState = "pending" | "active" | "completed" | "error";

const STATUS_ORDER = ["pending_eula", "pending_esign", "pending_payment", "active"] as const;

type OnboardingStatus = (typeof STATUS_ORDER)[number];

function statusIndex(s: string): number {
  return STATUS_ORDER.indexOf(s as OnboardingStatus);
}

function isCompleted(current: string, target: OnboardingStatus): boolean {
  return statusIndex(current) > statusIndex(target);
}

function isActive(current: string, target: OnboardingStatus): boolean {
  return current === target;
}

function StepIndicator({
  step,
  label,
  description,
  state,
  action,
}: {
  step: string;
  label: string;
  description: string;
  state: StepState;
  action?: React.ReactNode;
}) {
  const icons: Record<StepState, string> = {
    pending: "○",
    active: "◎",
    completed: "●",
    error: "✕",
  };

  const colors: Record<StepState, string> = {
    pending: "border-surface-600 text-surface-500",
    active: "border-brand-400 text-brand-300 animate-pulse",
    completed: "border-emerald-500 text-emerald-400",
    error: "border-red-500 text-red-400",
  };

  return (
    <div className="flex gap-5">
      <div className="flex flex-col items-center">
        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full border-2 text-lg font-bold transition-colors ${colors[state]}`}
        >
          {icons[state]}
        </span>
        {step !== "4" && <div className="w-px flex-1 bg-white/10 min-h-[2rem]" />}
      </div>
      <div className="flex-1 pb-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3
              className={`text-lg font-semibold transition-colors ${
                state === "completed"
                  ? "text-emerald-300"
                  : state === "active"
                    ? "text-white"
                    : "text-surface-400"
              }`}
            >
              {label}
            </h3>
            <p className="mt-1 text-sm text-surface-500">{description}</p>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const {
    user,
    company,
    onboarding,
    loading: authLoading,
    error: authError,
    refreshOnboarding,
  } = useAuth();
  const router = useRouter();

  const [creatingCheckout, setCreatingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [restoringSigned, setRestoringSigned] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Redirect to dashboard if already active
  useEffect(() => {
    if (!authLoading && company?.onboardingStatus === "active") {
      router.push("/dashboard");
    }
  }, [authLoading, company?.onboardingStatus, router]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // Poll for onboarding status changes every 15 seconds
  useEffect(() => {
    if (company?.onboardingStatus === "active") {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }

    pollRef.current = setInterval(() => {
      refreshOnboarding();
    }, 15000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [company?.onboardingStatus, refreshOnboarding]);

  const handleCreateCheckout = useCallback(async () => {
    setCreatingCheckout(true);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/auth/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create checkout");
      if (json.checkoutUrl) {
        window.location.href = json.checkoutUrl;
      }
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setCreatingCheckout(false);
    }
  }, []);

  // If a contract was already sent but no signingUrl was captured, offer a manual resolve
  const handleResendContract = useCallback(async () => {
    setRestoringSigned(true);
    setCheckoutError(null);
    try {
      // Re-send the MSA via the existing contract route
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"}/contracts/firma/send`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientName: company?.name || "Client",
            clientContact: user?.email || "Client",
            clientEmail: user?.email || "",
            state: "Delaware",
            locationCount: 1,
            monthlyFee: 1250,
            setupFee: 2500,
            documentType: "msa",
            documentLabel: "Master Service Agreement",
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      await refreshOnboarding();
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Failed to resend contract");
    } finally {
      setRestoringSigned(false);
    }
  }, [company, user, refreshOnboarding]);

  if (authLoading) {
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

  if (!user || !company) {
    return null;
  }

  const current = company.onboardingStatus || "pending_eula";
  const steps: Array<{
    step: string;
    label: string;
    description: string;
    state: StepState;
    action?: React.ReactNode;
  }> = [
    {
      step: "1",
      label: "End-User License Agreement",
      description: "Review and accept the Ledgera EULA and Privacy Policy.",
      state: isCompleted(current, "pending_eula")
        ? "completed"
        : isActive(current, "pending_eula")
          ? "active"
          : "pending",
      action: (
        <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
          Accepted
        </span>
      ),
    },
    {
      step: "2",
      label: "Sign Your Service Agreement",
      description:
        "Ledgera has sent a Master Service Agreement to your email via Firma.dev for legally binding e-signature. Check your inbox and sign to continue.",
      state: isCompleted(current, "pending_esign")
        ? "completed"
        : isActive(current, "pending_esign")
          ? "active"
          : "pending",
      action: (() => {
        if (isCompleted(current, "pending_esign")) {
          return (
            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
              Signed
            </span>
          );
        }
        if (onboarding?.signingUrl) {
          return (
            <a
              href={onboarding.signingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold text-surface-950 hover:bg-brand-400 transition-colors"
            >
              Open Signing Link
            </a>
          );
        }
        return (
          <button
            onClick={handleResendContract}
            disabled={restoringSigned}
            className="rounded-full border border-white/20 px-4 py-2 text-xs font-medium text-surface-300 hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            {restoringSigned ? "Sending..." : "Resend Contract"}
          </button>
        );
      })(),
    },
    {
      step: "3",
      label: "Payment & Subscription",
      description:
        "Complete payment to activate your Ledgera subscription. Your contract has been signed - proceed to checkout.",
      state: isCompleted(current, "pending_payment")
        ? "completed"
        : isActive(current, "pending_payment")
          ? "active"
          : "pending",
      action: (() => {
        if (isCompleted(current, "pending_payment")) {
          return (
            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
              Paid
            </span>
          );
        }
        if (current === "pending_payment") {
          return (
            <button
              onClick={handleCreateCheckout}
              disabled={creatingCheckout}
              className="rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold text-surface-950 hover:bg-brand-400 transition-colors disabled:opacity-50"
            >
              {creatingCheckout ? "Redirecting..." : "Pay Now →"}
            </button>
          );
        }
        return null;
      })(),
    },
    {
      step: "4",
      label: "Dashboard Access",
      description:
        "Your account is fully active. Access real-time financial intelligence, profit alerts, and recovery automation.",
      state: isCompleted(current, "active") ? "completed" : "pending",
      action: (() => {
        if (isCompleted(current, "active")) {
          return (
            <Link
              href="/dashboard"
              className="rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold text-surface-950 hover:bg-brand-400 transition-colors"
            >
              Go to Dashboard →
            </Link>
          );
        }
        return (
          <span className="rounded-full border border-surface-600 px-3 py-1 text-xs font-medium text-surface-500">
            Locked
          </span>
        );
      })(),
    },
  ];

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 bg-surface-950/90">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-surface-950">
              L
            </span>
            <span className="text-lg font-semibold text-white">Ledgera Global</span>
          </Link>
          <span className="text-sm text-surface-400">{company.name}</span>
        </nav>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-2xl">
          <div className="rounded-[2rem] border border-white/10 bg-surface-900/60 p-8 shadow-xl shadow-black/20">
            {/* Title */}
            <div className="mb-10 text-center">
              <h1 className="text-3xl font-semibold text-white">
                {current === "active"
                  ? "🎉 Onboarding Complete"
                  : "Complete Your Onboarding"}
              </h1>
              <p className="mt-2 text-sm text-surface-400">
                {current === "active"
                  ? "Your account is fully active. Start using Ledgera."
                  : "Follow the steps below to activate your account."}
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-0">
              {steps.map((step) => (
                <StepIndicator key={step.step} {...step} />
              ))}
            </div>

            {/* Error */}
            {(authError || checkoutError) && (
              <div className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
                {authError || checkoutError}
              </div>
            )}

            {/* Help */}
            <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-surface-400">
              <p className="font-medium text-surface-300 mb-1">
                Need help with onboarding?
              </p>
              <p>
                Contact us at{" "}
                <a
                  href="mailto:hello@ledgeraglobal.com"
                  className="text-brand-300 hover:text-brand-200 underline underline-offset-2"
                >
                  hello@ledgeraglobal.com
                </a>{" "}
                or book a walkthrough via{" "}
                <a
                  href="https://calendly.com/hello-ledgeraglobal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-300 hover:text-brand-200 underline underline-offset-2"
                >
                  Calendly
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
