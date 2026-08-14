import * as http from "node:http";
import * as https from "node:https";
import { URL } from "node:url";

export const DEFAULT_URL = "https://mesh.x402.wtf";
export const DEFAULT_MODEL = "qwen2.5:1.5b";

type Json = Record<string, unknown>;

interface RequestResult {
  status: number;
  type: string;
  raw: string;
  json: Json | null;
}

interface ChatOptions {
  model?: string;
  messages?: Array<{ role: string; content: string }>;
  prompt?: string;
  maxTokens?: number;
}

export interface ChatResult {
  ok: boolean;
  endpoint: string;
  model: string;
  text: string;
  raw: Json;
}

function normalizeBase(url: string): string {
  const raw = String(url || DEFAULT_URL).trim() || DEFAULT_URL;
  return raw.replace(/\/+$/, "");
}

function requestJson(
  target: string,
  options: { method?: string; body?: unknown; timeoutMs?: number } = {}
): Promise<RequestResult> {
  const parsed = new URL(target);
  const payload = options.body == null ? null : JSON.stringify(options.body);
  const transport = parsed.protocol === "http:" ? http : https;
  const timeoutMs = options.timeoutMs ?? 60000;

  return new Promise((resolve, reject) => {
    const req = transport.request(
      parsed,
      {
        method: options.method ?? "GET",
        headers: {
          Accept: "application/json, text/event-stream",
          ...(payload
            ? {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(payload),
              }
            : {}),
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(chunk as Buffer));
        res.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf8");
          const type = String(res.headers["content-type"] || "");
          resolve({
            status: res.statusCode || 0,
            type,
            raw,
            json: tryParseBody(raw, type),
          });
        });
      }
    );
    req.on("error", reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error(`Mesh request timed out after ${timeoutMs}ms`));
    });
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

function tryParseBody(raw: string, type: string): Json | null {
  if (type.includes("text/event-stream")) {
    return parseSse(raw);
  }
  try {
    return JSON.parse(raw) as Json;
  } catch {
    return null;
  }
}

function parseSse(raw: string): Json {
  let content = "";
  let model = "";
  for (const line of raw.split(/\r?\n/)) {
    if (!line.startsWith("data:")) {
      continue;
    }
    const data = line.slice(5).trim();
    if (!data || data === "[DONE]") {
      continue;
    }
    try {
      const parsed = JSON.parse(data) as Json;
      model = (parsed.model as string) || model;
      const choices = parsed.choices as Array<Json> | undefined;
      const choice = choices?.[0];
      const delta = (choice?.delta as Json | undefined)?.content;
      const message = (choice?.message as Json | undefined)?.content;
      if (typeof delta === "string") {
        content += delta;
      } else if (typeof message === "string") {
        content += message;
      }
    } catch {
      content += data;
    }
  }
  return {
    id: "chatcmpl-sse",
    object: "chat.completion",
    model,
    choices: [{ index: 0, message: { role: "assistant", content }, finish_reason: "stop" }],
  };
}

function messageText(completion: Json | null): string {
  if (!completion) {
    return "";
  }
  if (completion.error) {
    const err = completion.error;
    return typeof err === "string" ? err : String((err as Json).message || JSON.stringify(err));
  }
  const choices = completion.choices as Array<Json> | undefined;
  const choice = choices?.[0];
  const message = choice?.message as Json | undefined;
  const delta = choice?.delta as Json | undefined;
  return String(message?.content || delta?.content || completion.response || "");
}

function errorMessage(value: unknown): string {
  if (!value) {
    return "Mesh request failed";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "object" && value && "message" in value) {
    return String((value as Json).message);
  }
  return JSON.stringify(value);
}

export async function health(baseUrl = DEFAULT_URL): Promise<{
  ok: boolean;
  status: number;
  body: Json;
}> {
  const res = await requestJson(`${normalizeBase(baseUrl)}/health`, { timeoutMs: 10000 });
  return {
    ok: res.status === 200 && res.json?.ok === true,
    status: res.status,
    body: res.json || { raw: res.raw },
  };
}

export async function listModels(baseUrl = DEFAULT_URL): Promise<string[]> {
  const res = await requestJson(`${normalizeBase(baseUrl)}/models`, { timeoutMs: 15000 });
  const models = res.json?.models;
  return Array.isArray(models) ? (models as string[]) : [];
}

export async function chat(baseUrl: string, options: ChatOptions = {}): Promise<ChatResult> {
  const url = normalizeBase(baseUrl);
  const model = options.model || DEFAULT_MODEL;
  const payloadMessages =
    Array.isArray(options.messages) && options.messages.length
      ? options.messages
      : [{ role: "user", content: String(options.prompt || "") }];

  const primary = await requestJson(`${url}/v1/chat/completions`, {
    method: "POST",
    timeoutMs: 90000,
    body: {
      model,
      messages: payloadMessages,
      max_tokens: options.maxTokens ?? 512,
      stream: false,
    },
  });

  if (primary.status >= 200 && primary.status < 300 && primary.json && !primary.json.error) {
    return {
      ok: true,
      endpoint: `${url}/v1/chat/completions`,
      model: String(primary.json.model || model),
      text: messageText(primary.json),
      raw: primary.json,
    };
  }

  const fallback = await requestJson(`${url}/api/sol-gpt/chat`, {
    method: "POST",
    timeoutMs: 90000,
    body: {
      model,
      messages: payloadMessages,
      prompt: payloadMessages.map((item) => item.content).join("\n"),
    },
  });

  if (fallback.status >= 200 && fallback.status < 300 && fallback.json && !fallback.json.error) {
    return {
      ok: true,
      endpoint: `${url}/api/sol-gpt/chat`,
      model: String(fallback.json.model || model),
      text: messageText(fallback.json),
      raw: fallback.json,
    };
  }

  throw new Error(
    errorMessage(primary.json?.error || fallback.json?.error || fallback.raw || primary.raw)
  );
}
