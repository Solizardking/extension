const fs = require("node:fs");
const path = require("node:path");
const vscode = require("vscode");
const { bundledPlugins } = require("./marketplace");
const { envVars } = require("./settings");

const MCP_PROVIDER_ID = "clawd.mcp";

const LABELS = {
  helius: "Helius",
  "solana-mcp": "Solana Docs MCP",
  "pump-fun": "Pump Fun",
  "pump-mcp": "Pump MCP",
  "cheshire-site": "Cheshire Site",
  "cheshire-terminal": "Cheshire Terminal",
  "robinhood-trading": "Robinhood Trading",
  "robinhood-banking": "Robinhood Banking",
  paybox: "PayBox",
  soltrader: "Soltrader",
  markets: "Markets",
  perps: "Perps",
  risk: "Risk",
  clawd: "Clawd",
  "clawd-soltrader": "Clawd Soltrader",
  vulcan: "Vulcan",
  "clawd-code": "Clawd Code",
  "clawd-grok": "Clawd Grok",
  "phoenix-rise": "Phoenix Rise",
  dflow: "DFlow",
  zkcompression: "ZK Compression",
};

function interpolate(value, vars) {
  if (typeof value !== "string") {
    return value;
  }
  return value.replace(/\$\{([A-Z0-9_]+)\}/g, (_, key) => vars[key] || "");
}

function interpolateDeep(value, vars) {
  if (Array.isArray(value)) {
    return value.map((item) => interpolateDeep(item, vars));
  }
  if (value && typeof value === "object") {
    const next = {};
    for (const [key, nested] of Object.entries(value)) {
      next[key] = interpolateDeep(nested, vars);
    }
    return next;
  }
  return interpolate(value, vars);
}

function looksLikePath(value) {
  return (
    typeof value === "string" &&
    (value.includes("/") || value.includes("\\") || /\.(js|mjs|cjs|ts)$/.test(value))
  );
}

function missingPath(args) {
  for (const arg of args) {
    if (looksLikePath(arg) && !fs.existsSync(arg)) {
      return arg;
    }
  }
  return "";
}

function emptyBearer(headers) {
  if (!headers || typeof headers !== "object") {
    return false;
  }
  return Object.values(headers).some(
    (value) => typeof value === "string" && /Bearer\s*$/i.test(value.trim())
  );
}

function identity(kind, spec) {
  if (kind === "http") {
    return `http:${spec.url}`;
  }
  return `stdio:${spec.command} ${(spec.args || []).join(" ")}`.trim();
}

function catalogFromPlugins(extensionPath, settings) {
  const vars = envVars(settings);
  const { plugins } = bundledPlugins(extensionPath);
  const seen = new Set();
  const entries = [];

  for (const plugin of plugins) {
    const mcpPath = path.join(plugin.sourceDir, "mcp.json");
    if (!fs.existsSync(mcpPath)) {
      continue;
    }

    let parsed;
    try {
      parsed = JSON.parse(fs.readFileSync(mcpPath, "utf8"));
    } catch {
      continue;
    }

    for (const [id, spec] of Object.entries(parsed.mcpServers || {})) {
      const resolved = interpolateDeep(spec, vars);
      const kind = resolved.url ? "http" : "stdio";
      const key = identity(kind, resolved);
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);

      let ready = true;
      let reason = "";

      if (kind === "http") {
        if (!resolved.url) {
          ready = false;
          reason = "Missing URL";
        } else if (emptyBearer(resolved.headers)) {
          ready = false;
          reason = "Needs API key";
        }
      } else {
        const args = resolved.args || [];
        const missing = missingPath(args);
        if (missing) {
          ready = false;
          reason = `Missing ${missing}`;
        } else if (!resolved.command) {
          ready = false;
          reason = "Missing command";
        }
      }

      entries.push({
        id,
        label: LABELS[id] || id,
        kind,
        ready,
        reason,
        plugin: plugin.name,
        spec: resolved,
      });
    }
  }

  return entries;
}

function toVscodeServer(entry) {
  if (!entry.ready) {
    return undefined;
  }

  if (entry.kind === "http") {
    if (!vscode.McpHttpServerDefinition) {
      return undefined;
    }
    return new vscode.McpHttpServerDefinition(
      entry.label,
      vscode.Uri.parse(entry.spec.url),
      entry.spec.headers || {},
      vscode.extensions.getExtension("clawd.clawd")?.packageJSON?.version || "1.0.0"
    );
  }

  if (!vscode.McpStdioServerDefinition) {
    return undefined;
  }

  return new vscode.McpStdioServerDefinition(
    entry.label,
    entry.spec.command,
    entry.spec.args || [],
    entry.spec.env || {},
    vscode.extensions.getExtension("clawd.clawd")?.packageJSON?.version || "1.0.0"
  );
}

function buildMcpServers(extensionPath, settings) {
  return catalogFromPlugins(extensionPath, settings)
    .map(toVscodeServer)
    .filter(Boolean);
}

function registerMcpServers(context, getState) {
  const lm = vscode.lm;
  if (!lm || typeof lm.registerMcpServerDefinitionProvider !== "function") {
    return { dispose() {}, refresh() {} };
  }

  const emitter = new vscode.EventEmitter();
  const provider = {
    onDidChangeMcpServerDefinitions: emitter.event,
    provideMcpServerDefinitions: async () => {
      const { extensionPath, settings } = getState();
      return buildMcpServers(extensionPath, settings);
    },
    resolveMcpServerDefinition: async (server) => server,
  };

  context.subscriptions.push(
    lm.registerMcpServerDefinitionProvider(MCP_PROVIDER_ID, provider),
    emitter
  );

  return {
    dispose() {
      emitter.dispose();
    },
    refresh() {
      emitter.fire();
    },
  };
}

module.exports = {
  MCP_PROVIDER_ID,
  catalogFromPlugins,
  buildMcpServers,
  registerMcpServers,
};
