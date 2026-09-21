"use client";
import { useCallback, useEffect, useState } from "react";
import { workforceGet } from "./workforceClient";

/**
 * Load one workspace endpoint, with a reload function.
 *
 * Errors are surfaced, never swallowed into an empty state. A page using this
 * hook either has the data the backend returned, or has a message saying why it
 * does not - there is no third outcome where it shows a plausible-looking
 * placeholder.
 *
 * `path` must be stable across renders (a literal, or built from state), or the
 * effect will refetch on every render.
 */
export function useWorkforce<T>(path: string) {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const result = await workforceGet<T>(path);
            setData(result);
            setError(null);
        } catch (err) {
            setData(null);
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }, [path]);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            setLoading(true);
            try {
                const result = await workforceGet<T>(path);
                if (cancelled) return;
                setData(result);
                setError(null);
            } catch (err) {
                if (cancelled) return;
                setData(null);
                setError(err instanceof Error ? err.message : "Something went wrong.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [path]);

    return { data, error, loading, reload: load, setData };
}
