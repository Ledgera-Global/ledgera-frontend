"use client";
import { useState } from "react";
import { Badge } from "@/components/internal/indicators";
import { EmptyState, ErrorState, LoadingBlock, PageHeader, TextInput } from "@/components/internal/ui";
import { useWorkforce } from "@/lib/internal/useWorkforce";
import type { EmployeeSummary } from "@/lib/internal/workforceTypes";

/**
 * The employee directory.
 *
 * Read from the same accounts the access gate uses, so someone who is offboarded
 * disappears here at the same moment they lose access. A hand-maintained second
 * list is how a departed colleague stays on the org chart for a year.
 */

interface DirectoryResponse {
    employees: EmployeeSummary[];
    departments: { department: string; employees: EmployeeSummary[] }[];
    total: number;
}

function PersonCard({ person }: { person: EmployeeSummary }) {
    return (
        <li className="rounded-2xl border border-white/10 bg-surface-900/50 p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{person.name}</p>
                    <p className="mt-0.5 truncate text-xs text-surface-400">
                        {person.title ?? "No title recorded"}
                    </p>
                </div>
                <Badge tone="neutral">{person.employmentRole}</Badge>
            </div>
            <dl className="mt-3 space-y-1 text-xs">
                <div className="flex gap-2">
                    <dt className="text-surface-500">Email</dt>
                    <dd className="truncate text-surface-300">{person.email}</dd>
                </div>
                <div className="flex gap-2">
                    <dt className="text-surface-500">Reports to</dt>
                    <dd className="truncate text-surface-300">
                        {person.managerName ?? "No manager recorded"}
                    </dd>
                </div>
            </dl>
        </li>
    );
}

export default function DirectoryPage() {
    const { data, error, loading, reload } = useWorkforce<DirectoryResponse>("directory");
    const [query, setQuery] = useState("");

    const needle = query.trim().toLowerCase();
    const filtered =
        needle.length === 0
            ? data?.departments ?? []
            : (data?.departments ?? [])
                  .map((group) => ({
                      department: group.department,
                      employees: group.employees.filter((person) =>
                          [person.name, person.email, person.title ?? "", person.department ?? ""]
                              .join(" ")
                              .toLowerCase()
                              .includes(needle)
                      ),
                  }))
                  .filter((group) => group.employees.length > 0);

    const shown = filtered.reduce((total, group) => total + group.employees.length, 0);

    return (
        <div>
            <PageHeader
                title="Directory"
                subtitle={
                    data
                        ? `${data.total} Ledgera employees, grouped by department.`
                        : "Who works here, what they do, and who they report to."
                }
            />

            <div className="mb-6 max-w-md">
                <TextInput
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search by name, email, or title"
                    aria-label="Search the directory"
                />
            </div>

            {loading ? <LoadingBlock rows={4} /> : null}
            {error ? <ErrorState message={error} onRetry={reload} /> : null}

            {!loading && !error && shown === 0 ? (
                <EmptyState
                    title={needle ? "Nobody matches that search" : "No employees listed"}
                    body={
                        needle
                            ? "Try a shorter search, or clear it to see everyone."
                            : "Employee accounts are created by an administrator."
                    }
                />
            ) : null}

            <div className="space-y-8">
                {filtered.map((group) => (
                    <section key={group.department}>
                        <div className="mb-3 flex items-baseline gap-3">
                            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-300">
                                {group.department}
                            </h2>
                            <span className="text-xs text-surface-500">
                                {group.employees.length}
                            </span>
                        </div>
                        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {group.employees.map((person) => (
                                <PersonCard key={person.id} person={person} />
                            ))}
                        </ul>
                    </section>
                ))}
            </div>

            {data && shown > 0 ? (
                <p className="mt-8 text-xs text-surface-500">
                    Showing {shown} of {data.total}.
                </p>
            ) : null}
        </div>
    );
}
