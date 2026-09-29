import { COVERAGE_LABEL, formatCents, formatDate } from "@/lib/riskLedgerDisplay";
import type { InsurancePolicy } from "@/lib/types/riskLedger";

/**
 * The policies behind the ledger. Each row is one policy as the agency system
 * reported it; a policy carrying two lines appears once with both named.
 */
export default function InsurancePolicyTable({ policies }: { policies: InsurancePolicy[] }) {
  if (policies.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-surface-900/40 p-6">
        <p className="text-sm text-surface-300">
          No policies on file for this company yet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface-900/40">
      <div className="border-b border-white/10 px-6 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-surface-300">
          Policies On File ({policies.length})
        </h2>
      </div>

      <ul className="divide-y divide-white/5">
        {policies.map((policy) => (
          <li key={policy.id} className="grid grid-cols-1 gap-3 px-6 py-5 lg:grid-cols-12 lg:gap-4">
            <div className="lg:col-span-4">
              <div className="text-sm font-medium text-white">{policy.carrier}</div>
              <div className="mt-1 font-mono text-xs text-surface-500">{policy.policyNumber}</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {policy.lines.map((line) => (
                  <span
                    key={line}
                    className="inline-flex items-center rounded-full border border-brand-400/25 bg-brand-500/10 px-2.5 py-0.5 text-[11px] font-medium text-brand-100"
                  >
                    {COVERAGE_LABEL[line]}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 lg:col-span-8">
              <Field label="Limit" value={formatCents(policy.limitCents)} />
              <Field label="Deductible" value={formatCents(policy.deductibleCents)} />
              <Field label="Annual premium" value={formatCents(policy.annualPremiumCents)} />
              <Field label="Effective" value={formatDate(policy.effectiveDate)} />
              <Field label="Expires" value={formatDate(policy.expirationDate)} />
              <Field
                label="Additional insureds"
                value={policy.additionalInsureds.length === 0 ? "None" : String(policy.additionalInsureds.length)}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-surface-500">{label}</div>
      <div className="mt-1 font-mono text-sm text-surface-200">{value}</div>
    </div>
  );
}
