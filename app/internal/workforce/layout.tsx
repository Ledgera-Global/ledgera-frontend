import WorkforceShell from "@/components/internal/WorkforceShell";
import type { ReactNode } from "react";

/**
 * The employee workspace's layout.
 *
 * Every page beneath `/internal/workforce` inherits the access gate, the header,
 * and the navigation from here, so a new page cannot be added without one - the
 * only way to reach the workspace is through this frame.
 */
export default function WorkforceLayout({ children }: { children: ReactNode }) {
    return <WorkforceShell>{children}</WorkforceShell>;
}
