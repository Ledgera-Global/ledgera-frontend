import { redirect } from "next/navigation";

/**
 * The operating console moved into the employee workspace.
 *
 * It sat beside the workspace rather than inside it, so it had its own header
 * and footer and was reachable only from a link in the workspace footer. It is
 * now `/internal/workforce/console`, a normal entry in the rail. This path
 * stays as a permanent redirect so existing links keep resolving.
 */
export default function LedgeraConsoleRedirect() {
  redirect("/internal/workforce/console");
}
