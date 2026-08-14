#!/usr/bin/env node
const { chat, health, listModels, DEFAULT_URL, DEFAULT_MODEL } = require("../lib/mesh");

const BASE_URL = process.env.CLAWD_MESH_URL || DEFAULT_URL;
const MODEL = process.env.CLAWD_MESH_MODEL || DEFAULT_MODEL;

const TOOLS = [
  {
    name: "mesh_status",
    description: "Check Clawd Mesh free inference health at mesh.x402.wtf.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "mesh_models",
    description: "List local free models on Clawd Mesh.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "mesh_chat",
    description:
      "Run a free chat completion on Clawd Mesh (OpenAI-compatible, no credential). Default model is qwen2.5:1.5b.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "User prompt" },
        model: { type: "string", description: "Mesh model id" },
        max_tokens: { type: "number" },
      },
      required: ["prompt"],
    },
  },
];

function writeMessage(message) {
  const json = JSON.stringify(message);
  const payload = Buffer.from(json, "utf8");
  process.stdout.write(`Content-Length: ${payload.length}\r\n\r\n`);
  process.stdout.write(payload);
}

function textResult(text, isError = false) {
  return {
    content: [{ type: "text", text }],
    isError,
  };
}

async function handleTool(name, args) {
  if (name === "mesh_status") {
    const result = await health(BASE_URL);
    return textResult(JSON.stringify({ url: BASE_URL, ...result.body }, null, 2), !result.ok);
  }
  if (name === "mesh_models") {
    const models = await listModels(BASE_URL);
    return textResult(JSON.stringify({ url: BASE_URL, default_model: MODEL, models }, null, 2));
  }
  if (name === "mesh_chat") {
    const prompt = String(args.prompt || "").trim();
    if (!prompt) {
      return textResult("prompt is required", true);
    }
    const result = await chat(BASE_URL, {
      model: args.model || MODEL,
      prompt,
      maxTokens: Number(args.max_tokens) || 512,
    });
    return textResult(`${result.model}\n\n${result.text}`);
  }
  return textResult(`Unknown tool: ${name}`, true);
}

async function handle(message) {
  const { id, method, params } = message;
  if (method === "initialize") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "clawd-mesh", version: "1.0.1" },
      },
    };
  }
  if (method === "notifications/initialized" || method === "initialized") {
    return null;
  }
  if (method === "tools/list") {
    return { jsonrpc: "2.0", id, result: { tools: TOOLS } };
  }
  if (method === "tools/call") {
    try {
      const result = await handleTool(params?.name, params?.arguments || {});
      return { jsonrpc: "2.0", id, result };
    } catch (error) {
      return { jsonrpc: "2.0", id, result: textResult(error.message, true) };
    }
  }
  if (method === "ping") {
    return { jsonrpc: "2.0", id, result: {} };
  }
  if (id == null) {
    return null;
  }
  return {
    jsonrpc: "2.0",
    id,
    error: { code: -32601, message: `Method not found: ${method}` },
  };
}

let buffer = Buffer.alloc(0);

process.stdin.on("data", async (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);
  while (true) {
    const headerEnd = buffer.indexOf("\r\n\r\n");
    if (headerEnd === -1) {
      return;
    }
    const header = buffer.slice(0, headerEnd).toString("utf8");
    const match = header.match(/Content-Length:\s*(\d+)/i);
    if (!match) {
      buffer = buffer.slice(headerEnd + 4);
      continue;
    }
    const length = Number(match[1]);
    const start = headerEnd + 4;
    if (buffer.length < start + length) {
      return;
    }
    const body = buffer.slice(start, start + length).toString("utf8");
    buffer = buffer.slice(start + length);
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      continue;
    }
    const response = await handle(parsed);
    if (response) {
      writeMessage(response);
    }
  }
});
