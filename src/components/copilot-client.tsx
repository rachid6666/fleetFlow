"use client";

import { FormEvent, useRef, useState } from "react";
import type { CopilotSnapshot } from "@/lib/types";

type Message = { role: "user" | "assistant"; content: string; model?: string; databaseAvailable?: boolean };

const suggestions = [
  "What needs immediate attention right now?",
  "Which active shipments have stale GPS feeds?",
  "Summarize delivery reliability and safety risk.",
  "What are the highest-cost route and capacity risks?",
];

export function CopilotClient({ snapshot }: { snapshot: CopilotSnapshot }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "I can analyze the current FleetFlow snapshot. Ask about live exceptions, route progress, delivery reliability, fleet capacity, or safety.",
    },
  ]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  async function ask(value: string) {
    const clean = value.trim();
    if (!clean || loading) return;
    setMessages((current) => [...current, { role: "user", content: clean }]);
    setQuestion("");
    setLoading(true);
    try {
      const response = await fetch("/api/copilot", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: clean }),
      });
      const data = await response.json() as { answer?: string; model?: string; error?: string; databaseAvailable?: boolean };
      if (!response.ok || !data.answer) throw new Error(data.error || "Copilot request failed");
      setMessages((current) => [...current, { role: "assistant", content: data.answer!, model: data.model, databaseAvailable: data.databaseAvailable }]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: "The copilot could not answer right now. Start Ollama and confirm qwen3:4b is installed, then retry.", model: "error" }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void ask(question);
  }

  return (
    <div className="copilot-layout">
      <section className="panel copilot-context">
        <div className="eyebrow">Current context</div>
        <h2>Control-tower snapshot</h2>
        <div className={`copilot-db-status${snapshot.databaseAvailable ? "" : " is-offline"}`}>{snapshot.databaseAvailable ? "Live database connected" : "Offline snapshot"}</div>
        {!snapshot.databaseAvailable && snapshot.dataNotice ? <p className="copilot-context-note">{snapshot.dataNotice}</p> : null}
        <div className="copilot-context-grid">
          <div><strong>{snapshot.live.inTransit}</strong><span>in transit</span></div>
          <div><strong>{snapshot.live.exceptions}</strong><span>exceptions</span></div>
          <div><strong>{snapshot.live.stale}</strong><span>stale GPS</span></div>
          <div><strong>{snapshot.historical.onTimeRate.toFixed(1)}%</strong><span>on-time</span></div>
        </div>
        <p className="copilot-context-note">The model receives only server-built aggregates and live shipment summaries. It does not receive database credentials or customer contact data.</p>
        <div className="copilot-suggestions">
          {suggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => void ask(suggestion)} disabled={loading}>{suggestion}</button>)}
        </div>
      </section>

      <section className="panel copilot-chat">
        <div className="copilot-messages" aria-live="polite">
          {messages.map((message, index) => (
            <article key={`${message.role}-${index}`} className={`copilot-message is-${message.role}`}>
              <div className="copilot-message-label">{message.role === "user" ? "You" : "FleetFlow Copilot"}{message.model ? <small>{message.model}</small> : null}{message.databaseAvailable === false ? <small>offline data</small> : null}</div>
              <div className="copilot-message-content">{message.content}</div>
            </article>
          ))}
          {loading ? <article className="copilot-message is-assistant"><div className="copilot-message-label">FleetFlow Copilot</div><div className="copilot-message-content copilot-thinking">Analyzing live operations…</div></article> : null}
        </div>

        <form className="copilot-input" onSubmit={submit}>
          <textarea ref={inputRef} value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask about shipments, routes, service, fleet, or safety…" rows={3} maxLength={1000} disabled={loading} />
          <button className="button" type="submit" disabled={loading || question.trim().length < 2}>Ask copilot</button>
        </form>
      </section>
    </div>
  );
}
