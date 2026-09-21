"use client";
import { useState } from "react";
import { Field, GhostButton, Notice, PrimaryButton, TextArea } from "./ui";
import { workforcePost } from "@/lib/internal/workforceClient";
import type { CopilotAnswer } from "@/lib/internal/workforceTypes";

/**
 * Ask the internal copilot.
 *
 * Answers come back with the sources they were read from, and those sources are
 * shown. That is the whole value: the reader can check the answer rather than
 * having to trust it.
 *
 * The copilot is deterministic - it reads tasks, goals, documents, decisions,
 * the directory, the learning catalogue, and the agent signal tables. It does
 * not call a language model, so it cannot produce a confident sentence about
 * something the workspace does not actually know.
 */

const EXAMPLE_QUESTIONS = [
    "What is due today?",
    "How are my goals tracking?",
    "What required training is outstanding?",
    "Who reports to me?",
    "Find the reimbursement policy",
    "What is still waiting on a decision?",
];

function AnswerBlock({ answer }: { answer: CopilotAnswer }) {
    return (
        <div className="rounded-2xl border border-brand-400/20 bg-brand-400/5 p-5">
            <p className="text-sm leading-relaxed text-white">{answer.answer}</p>

            {answer.lines.length > 0 ? (
                <ul className="mt-4 space-y-1.5 border-t border-white/10 pt-4">
                    {answer.lines.map((line, index) => (
                        <li key={index} className="text-sm text-surface-300">
                            {line}
                        </li>
                    ))}
                </ul>
            ) : null}

            <p className="mt-4 text-xs text-surface-500">
                Read from: {answer.sources.join(", ")}
            </p>
        </div>
    );
}

export default function CopilotPanel({ compact = false }: { compact?: boolean }) {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState<CopilotAnswer | null>(null);
    const [asking, setAsking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function ask(text: string) {
        const trimmed = text.trim();
        if (!trimmed || asking) return;

        setAsking(true);
        setError(null);
        try {
            const result = await workforcePost<CopilotAnswer>("copilot", { question: trimmed });
            setAnswer(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not reach the copilot.");
        } finally {
            setAsking(false);
        }
    }

    return (
        <div className="space-y-4">
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    void ask(question);
                }}
                className="space-y-3"
            >
                <Field
                    label="Ask a question"
                    hint="Answers are read from this workspace's own records."
                >
                    <TextArea
                        value={question}
                        onChange={(event) => setQuestion(event.target.value)}
                        rows={compact ? 2 : 3}
                        placeholder="e.g. what is due today?"
                    />
                </Field>

                <div className="flex items-center gap-2">
                    <PrimaryButton type="submit" disabled={asking || !question.trim()}>
                        {asking ? "Reading\u2026" : "Ask"}
                    </PrimaryButton>
                    {answer ? (
                        <GhostButton
                            type="button"
                            onClick={() => {
                                setAnswer(null);
                                setQuestion("");
                            }}
                        >
                            Clear
                        </GhostButton>
                    ) : null}
                </div>
            </form>

            {!compact && !answer ? (
                <div className="flex flex-wrap gap-2">
                    {EXAMPLE_QUESTIONS.map((example) => (
                        <button
                            key={example}
                            type="button"
                            onClick={() => {
                                setQuestion(example);
                                void ask(example);
                            }}
                            className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-surface-300 transition-colors hover:border-brand-400/30 hover:text-white"
                        >
                            {example}
                        </button>
                    ))}
                </div>
            ) : null}

            {error ? <Notice tone="error">{error}</Notice> : null}
            {answer ? <AnswerBlock answer={answer} /> : null}
        </div>
    );
}
