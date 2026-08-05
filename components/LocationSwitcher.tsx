"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type Location = {
  id: string;
  name: string;
  address: string | null;
  _count?: {
    technicians: number;
    jobs: number;
  };
};

type LocationSwitcherProps = {
  companyId: string;
};

export default function LocationSwitcher({ companyId }: LocationSwitcherProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentLocationId = searchParams.get("locationId");
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (companyId === "companyA") {
        // Demo mode — show a single location
        setLocations([{ id: "", name: "All locations", address: null }]);
        setLoading(false);
        return;
      }
      try {
        const token = sessionStorage.getItem("ledgera_auth")
          ? JSON.parse(sessionStorage.getItem("ledgera_auth")!).token
          : null;
        const headers: Record<string, string> = { "content-type": "application/json" };
        if (token) headers["authorization"] = `Bearer ${token}`;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/locations/${companyId}`,
          { headers }
        );
        if (!res.ok) throw new Error("Failed to load locations");
        const json = await res.json();
        if (!cancelled) {
          setLocations([
            { id: "", name: "All locations", address: null },
            ...json.locations,
          ]);
        }
      } catch {
        if (!cancelled) {
          setLocations([{ id: "", name: "All locations", address: null }]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [companyId]);

  const activeLocation = currentLocationId
    ? locations.find((l) => l.id === currentLocationId)
    : locations[0];

  function selectLocation(locationId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (locationId) {
      params.set("locationId", locationId);
    } else {
      params.delete("locationId");
    }
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  }

  if (loading || locations.length <= 1) {
    return null; // No switcher needed if only one location (default)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-surface-950/70 px-3 py-2 text-xs text-surface-300 hover:border-white/20 hover:text-white transition-colors"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
        <span className="truncate max-w-[120px]">
          {activeLocation?.name ?? "All locations"}
        </span>
        <svg className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-xl border border-white/10 bg-surface-900 shadow-xl shadow-black/30 py-1">
            {locations.map((loc) => (
              <button
                key={loc.id}
                onClick={() => selectLocation(loc.id)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                  loc.id === currentLocationId || (!currentLocationId && !loc.id)
                    ? "bg-brand-400/10 text-brand-200"
                    : "text-surface-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <div className="min-w-0">
                  <p className="truncate">{loc.name}</p>
                  {loc._count && (
                    <p className="text-xs text-surface-500">
                      {loc._count.technicians} techs · {loc._count.jobs} jobs
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
