import LedgeraConsolePanel from "@/components/internal/LedgeraConsolePanel";

/**
 * The operating console, inside the employee workspace.
 *
 * It used to sit beside the workspace at `/internal/ledgera-console`, reachable
 * only from a footer link, so staff had two separate internal destinations with
 * two different frames. It is now a normal page in the rail like every other
 * internal screen. The old path redirects here.
 */
export default function WorkforceConsolePage() {
  return <LedgeraConsolePanel />;
}
