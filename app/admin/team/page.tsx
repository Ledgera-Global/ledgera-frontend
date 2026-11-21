import { redirect } from "next/navigation";

/**
 * Team administration moved inside the internal workspace.
 *
 * Staff management was the only Ledgera-internal screen served outside
 * `/internal`, which meant it was impossible to reach from the employee rail and
 * easy to forget when auditing what the internal surface contains. The page now
 * lives at `/internal/workforce/team`, inside the same frame and the same gate.
 *
 * This path stays as a permanent redirect so existing links and bookmarks keep
 * working instead of returning a 404.
 */
export default function AdminTeamRedirect() {
  redirect("/internal/workforce/team");
}
