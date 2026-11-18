import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "../../../../auth";
import { getOperationsSnapshotSafe } from "@/lib/tracking";
import type { CopilotSnapshot } from "@/lib/types";

export const dynamic = "force-dynamic";

const requestSchema = z.object({ question: z.string().trim().min(2).max(1000) });
type OllamaMessage = { role: "system" | "user" | "assistant"; content: string };

function ollamaBaseUrl() {
  return (process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434").replace(/\/$/, "");
}

async function listOllamaModels() {
  try {
    const response = await fetch(`${ollamaBaseUrl()}/api/tags`, {
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return [] as string[];
    const data = (await response.json()) as { models?: Array<{ name?: string; model?: string }> };
    return (data.models ?? []).map((model) => model.name || model.model || "").filter(Boolean);
  } catch {
    return [];
  }
}

function chooseModels(installed: string[]) {
  const configured = [process.env.OLLAMA_MODEL, process.env.OLLAMA_FALLBACK_MODEL].filter((value): value is string => Boolean(value));
  const localInstalled = installed.filter((model) => !model.endsWith(":cloud"));
  const cloudInstalled = installed.filter((model) => model.endsWith(":cloud"));
  const preferredLocal = ["qwen3:4b", "gemma4:12b", ...configured.filter((model) => !model.endsWith(":cloud")), ...localInstalled];
  const preferredCloud = [...configured.filter((model) => model.endsWith(":cloud")), "deepseek-v4.1-flash:cloud", ...cloudInstalled];
  return [...new Set([...preferredLocal, ...preferredCloud])].filter((model) => installed.length === 0 || installed.includes(model));
}

async function askOllama(model: string, messages: OllamaMessage[]) {
  const response = await fetch(`${ollamaBaseUrl()}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ model, messages, stream: false, options: { temperature: 0.2 } }),
    cache: "no-store",
    signal: AbortSignal.timeout(model.endsWith(":cloud") ? 20000 : 45000),
  });
  if (!response.ok) throw new Error(`Ollama returned ${response.status}`);
  const data = (await response.json()) as { message?: { content?: string } };
  const answer = data.message?.content?.trim();
  if (!answer) throw new Error("Ollama returned an empty answer");
  return answer;
}

function fallbackAnswer(snapshot: CopilotSnapshot) {
  const live = snapshot.live;
  const recommendations = [
    live.exceptions ? `Review ${live.exceptions} shipment exception${live.exceptions === 1 ? "" : "s"}.` : null,
    live.stale ? `Contact drivers for ${live.stale} stale GPS feed${live.stale === 1 ? "" : "s"}.` : null,
    snapshot.databaseAvailable ? `On-time delivery is ${snapshot.historical.onTimeRate.toFixed(1)}% across ${snapshot.historical.deliveryEvents.toLocaleString()} events.` : null,
  ].filter(Boolean);
  return `Local AI is unavailable. ${snapshot.dataNotice ?? ""}\n\n${recommendations.length ? recommendations.map((item) => `• ${item}`).join("\n") : "Start Ollama and confirm qwen3:4b is installed."}`;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Administrator access required" }, { status: 403 });

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid copilot request", details: parsed.error.flatten() }, { status: 400 });

  const snapshot = await getOperationsSnapshotSafe();
  const systemPrompt = [
    "You are FleetFlow Copilot, an operations analyst for a logistics control tower.",
    "Answer only from the supplied JSON snapshot. Never invent shipments, coordinates, customers, drivers, ETAs, costs, or events.",
    "If databaseAvailable is false, clearly state that live database data is unavailable and provide only general next steps.",
    "Be concise and practical. Prioritize exceptions, stale telemetry, route economics, delivery reliability, fleet capacity, and safety.",
    "Use short bullets. End with 1-3 concrete next actions when appropriate.",
    "If the data cannot answer the question, say what data is missing.",
  ].join(" ");
  const messages: OllamaMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `Operational snapshot:\n${JSON.stringify(snapshot)}\n\nQuestion: ${parsed.data.question}` },
  ];

  const installed = await listOllamaModels();
  const candidates = chooseModels(installed);
  for (const model of candidates) {
    try {
      const answer = await askOllama(model, messages);
      return NextResponse.json({ answer, model, generatedAt: snapshot.generatedAt, databaseAvailable: snapshot.databaseAvailable }, { headers: { "Cache-Control": "no-store" } });
    } catch {
      // Try the next installed model quickly. Cloud failures should not block local Qwen.
    }
  }

  return NextResponse.json({ answer: fallbackAnswer(snapshot), model: "rules-fallback", generatedAt: snapshot.generatedAt, databaseAvailable: snapshot.databaseAvailable }, { headers: { "Cache-Control": "no-store" } });
}