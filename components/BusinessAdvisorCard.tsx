"use client";
import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
  grounded: boolean;
  error?: string;
};

const SUGGESTIONS = [
  "Can I afford another service truck?",
  "Can I hire another technician?",
  "Why did profit drop last month?",
  "How much cash should I keep in reserve?",
];

type Props = {
  companyId: string;
};

export default function BusinessAdvisorCard({ companyId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    const userMessage: Message = { role: "user", content: trimmed, grounded: false };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`/api/advisor/${encodeURIComponent(companyId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });
      const json = await res.json();
      if (!res.ok) {
        const msg =
          typeof json.error === "string" ? json.error : "The advisor could not answer right now.";
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: msg, grounded: false, error: msg },
        ]);
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: json.answer,
          grounded: json.grounded === true,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Network error. Please try again.",
          grounded: false,
          error: "Network error",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.24em] text-surface-400">
          AI Business Advisor
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          Ask about your business
        </h2>
        <p className="mt-2 text-sm text-surface-300">
          Answers grounded in your company&rsquo;s own cash flow, margin, runway, and
          stress data.
        </p>
      </div>

      <div className="rounded-[2rem] border border-white/5 bg-surface-950/60 p-6 shadow-xl shadow-black/20">
        {/* Suggestions */}
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => ask(s)}
              disabled={loading}
              className="rounded-full border border-white/10 bg-surface-900/60 px-3 py-1.5 text-xs text-surface-300 transition hover:border-white/20 hover:text-white disabled:opacity-40"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Conversation */}
        <div className="mt-5 max-h-80 space-y-3 overflow-y-auto pr-1">
          {messages.length === 0 ? (
            <p className="rounded-xl border border-white/5 bg-surface-900/40 p-4 text-sm text-surface-500">
              Ask a question like &ldquo;Can I afford another service truck?&rdquo; and
              the advisor will answer from your actual numbers.
            </p>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`rounded-xl p-4 text-sm leading-6 ${
                  m.role === "user"
                    ? "ml-8 border border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                    : "mr-8 border border-white/5 bg-surface-900/40 text-surface-200"
                }`}
              >
                {m.role === "assistant" && (
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-surface-500">
                    {m.grounded ? "Grounded in your data" : m.error ? "Error" : "Advisor"}
                  </span>
                )}
                {m.content}
              </div>
            ))
          )}
          {loading && (
            <div className="mr-8 flex items-center gap-2 rounded-xl border border-white/5 bg-surface-900/40 p-4 text-sm text-surface-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-surface-400" />
              Analyzing your numbers&hellip;
            </div>
          )}
        </div>

        {/* Input */}
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the advisor anything&hellip;"
            maxLength={500}
            disabled={loading}
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-surface-900/60 px-4 py-2.5 text-sm text-white placeholder:text-surface-500 focus:border-emerald-400/40 focus:outline-none disabled:opacity-40"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="shrink-0 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:opacity-40"
          >
            Ask
          </button>
        </form>
      </div>
    </section>
  );
}
