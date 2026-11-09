import { NextResponse } from "next/server";

/**
 * Build provenance for the running deployment.
 *
 * Vercel injects these variables into every build, so this endpoint answers the
 * one question a deploy check actually needs: which commit is serving traffic?
 * A deployment that looks live but reports an older commit is a failed rollout,
 * and without this there is no way to tell that apart from a slow cache.
 *
 * Every value falls back to "unknown" so the endpoint still answers when run
 * outside Vercel (local build, preview container, CI).
 */
const DEPLOYMENT_ENV = process.env.VERCEL_ENV ?? "unknown";
const COMMIT_SHA = process.env.VERCEL_GIT_COMMIT_SHA ?? "unknown";
const COMMIT_REF = process.env.VERCEL_GIT_COMMIT_REF ?? "unknown";
const COMMIT_MESSAGE = process.env.VERCEL_GIT_COMMIT_MESSAGE ?? "";
const REPO_SLUG = process.env.VERCEL_GIT_REPO_SLUG ?? "unknown";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      deployment: {
        environment: DEPLOYMENT_ENV,
        commit: COMMIT_SHA,
        commitShort: COMMIT_SHA === "unknown" ? "unknown" : COMMIT_SHA.slice(0, 7),
        ref: COMMIT_REF,
        repo: REPO_SLUG,
        message: COMMIT_MESSAGE,
      },
    },
    {
      // Provenance is only useful if it is never stale: a cached copy of this
      // response could describe a deployment that has already been replaced.
      headers: { "Cache-Control": "no-store, must-revalidate" },
    },
  );
}
