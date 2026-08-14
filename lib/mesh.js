const http = require("node:http");
const https = require("node:https");
const { URL } = require("node:url");

const DEFAULT_URL = "https://mesh.x402.wtf";
const DEFAULT_MODEL = "qwen2.5:1.5b";

function normalizeBase(url) {
  const raw = String(url || DEFAULT_URL).trim() || DEFAULT_URL;
  return raw.replace(/\/+$/, "");
}

function requestJson(target, { method = "GET", body, timeoutMs = 60000 } = {}) {
  const parsed = new URL(target);
  const payload = body == null ? null : JSON.stringify(body);
  const transport = parsed.protocol === "http:" ? http : https;

  return new Promise((resolve, reject) => {
    const req = transport.request(
      parsed,
      {
        method,
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
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
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

function tryParseBody(raw, type) {
  if (type.includes("text/event-stream")) {
    return parseSse(raw);
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function parseSse(raw) {
  let content = "";
  let model = "";
  for (const line of String(raw).split(/\r?\n/)) {
    if (!line.startsWith("data:")) {
      continue;
    }
    const data = line.slice(5).trim();
    if (!data || data === "[DONE]") {
      continue;
    }
    try {
      const parsed = JSON.parse(data);
      model = parsed.model || model;
      const delta = parsed.choices?.[0]?.delta?.content;
      const message = parsed.choices?.[0]?.message?.content;
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

function messageText(completion) {
  if (!completion || typeof completion !== "object") {
    return "";
  }
  if (completion.error) {
    const err = completion.error;
    return typeof err === "string" ? err : err.message || JSON.stringify(err);
  }
  const choice = completion.choices?.[0];
  return choice?.message?.content || choice?.delta?.content || completion.response || "";
}

async function health(baseUrl = DEFAULT_URL) {
  const res = await requestJson(`${normalizeBase(baseUrl)}/health`, { timeoutMs: 10000 });
  return {
    ok: res.status === 200 && res.json?.ok === true,
    status: res.status,
    body: res.json || { raw: res.raw },
  };
}

async function listModels(baseUrl = DEFAULT_URL) {
  const res = await requestJson(`${normalizeBase(baseUrl)}/models`, { timeoutMs: 15000 });
  const models = res.json?.models;
  return Array.isArray(models) ? models : [];
}

async function chat(baseUrl, { model = DEFAULT_MODEL, messages, prompt, maxTokens = 512 } = {}) {
  const url = normalizeBase(baseUrl);
  const payloadMessages =
    Array.isArray(messages) && messages.length
      ? messages
      : [{ role: "user", content: String(prompt || "") }];

  const primary = await requestJson(`${url}/v1/chat/completions`, {
    method: "POST",
    timeoutMs: 90000,
    body: {
      model,
      messages: payloadMessages,
      max_tokens: maxTokens,
      stream: false,
    },
  });

  if (primary.status >= 200 && primary.status < 300 && primary.json && !primary.json.error) {
    return {
      ok: true,
      endpoint: `${url}/v1/chat/completions`,
      model: primary.json.model || model,
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
      model: fallback.json.model || model,
      text: messageText(fallback.json),
      raw: fallback.json,
    };
  }

  const err =
    primary.json?.error ||
    fallback.json?.error ||
    fallback.raw ||
    primary.raw ||
    `Mesh HTTP ${primary.status}`;
  throw new Error(typeof err === "string" ? err : err.message || JSON.stringify(err));
}

module.exports = {
  DEFAULT_URL,
  DEFAULT_MODEL,
  normalizeBase,
  health,
  listModels,
  chat,
  messageText,
};
