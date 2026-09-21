"use client";
import CopilotPanel from "@/components/internal/CopilotPanel";
import { Card, PageHeader } from "@/components/internal/ui";

/**
 * The copilot, full width.
 *
 * The answer panel shows the records it read. That is the point of the screen:
 * a reader who can see the source can check the claim, and a claim that cannot
 * be checked should not be trusted with a decision.
 */
export default function CopilotPage() {
    return (
        <div className="max-w-3xl">
            <PageHeader
                title="Copilot"
                subtitle="Ask about this workspace. Answers are read from its own records and name the sources."
            />

            <Card
                title="Ask a question"
                subtitle="Deterministic: it reads tasks, goals, documents, decisions, the directory, learning, and agent signals. It does not invent."
            >
                <CopilotPanel />
            </Card>
        </div>
    );
}
