const vscode = require("vscode");

function fromConfigOrEnv(config, key, envName) {
  const value = config.get(key);
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return process.env[envName] || "";
}

function readSettings() {
  const config = vscode.workspace.getConfiguration("clawd");
  const solanaRpcUrl =
    fromConfigOrEnv(config, "solanaRpcUrl", "SOLANA_RPC_URL") ||
    "https://api.mainnet-beta.solana.com";

  return {
    installOnActivate: config.get("installCursorPluginsOnActivate", true),
    heliusApiKey: fromConfigOrEnv(config, "heliusApiKey", "HELIUS_API_KEY"),
    solanaRpcUrl,
    cheshireApiKey: fromConfigOrEnv(config, "cheshireApiKey", "CHESHIRE_API_KEY"),
    xaiApiKey: fromConfigOrEnv(config, "xaiApiKey", "XAI_API_KEY"),
    coreAiRoot: fromConfigOrEnv(config, "coreAiRoot", "CORE_AI_ROOT"),
    cheshireTerminalRoot: fromConfigOrEnv(config, "cheshireTerminalRoot", "CHESHIRE_TERMINAL_ROOT"),
    clawdCodeRoot: fromConfigOrEnv(config, "clawdCodeRoot", "CLAWD_CODE_ROOT"),
    zeroClawdRoot: fromConfigOrEnv(config, "zeroClawdRoot", "ZERO_CLAWD_ROOT"),
    clawdBrowserRoot: fromConfigOrEnv(config, "clawdBrowserRoot", "CLAWDBROWSER_ROOT"),
  };
}

function envVars(settings) {
  return {
    HELIUS_API_KEY: settings.heliusApiKey,
    SOLANA_RPC_URL: settings.solanaRpcUrl,
    CHESHIRE_API_KEY: settings.cheshireApiKey,
    XAI_API_KEY: settings.xaiApiKey,
    CORE_AI_ROOT: settings.coreAiRoot,
    CHESHIRE_TERMINAL_ROOT: settings.cheshireTerminalRoot,
    CLAWD_CODE_ROOT: settings.clawdCodeRoot,
    ZERO_CLAWD_ROOT: settings.zeroClawdRoot,
    CLAWDBROWSER_ROOT: settings.clawdBrowserRoot,
  };
}

function isCursor() {
  const name = vscode.env.appName || "";
  return /cursor/i.test(name);
}

module.exports = {
  readSettings,
  envVars,
  isCursor,
};
