const vscode = require("vscode");
const { pluginStatuses, installCursorPlugins, cursorPluginsDir } = require("./plugins");
const { catalogFromPlugins } = require("./mcp");
const { isCursor } = require("./settings");
const { log, showOutput } = require("./output");
const fs = require("node:fs");

function snapshot(extensionPath, settings) {
  const { plugins } = pluginStatuses(extensionPath);
  const mcp = catalogFromPlugins(extensionPath, settings);
  return {
    pluginCount: plugins.length,
    installedCount: plugins.filter((plugin) => plugin.installed).length,
    mcpReady: mcp.filter((server) => server.ready).length,
    mcpTotal: mcp.length,
    plugins,
    mcp,
  };
}

function formatStatus(extensionPath, settings) {
  const { marketplace, plugins } = pluginStatuses(extensionPath);
  const mcp = catalogFromPlugins(extensionPath, settings);
  const lines = [
    `Clawd marketplace: ${marketplace.name} (${marketplace.metadata?.version || "n/a"})`,
    `Host: ${vscode.env.appName}`,
    "",
    "Cursor plugins:",
    ...plugins.map(
      (plugin) =>
        `  ${plugin.installed ? "✓" : "·"} ${plugin.displayName} (${plugin.name}) v${plugin.version}`
    ),
    "",
    "MCP servers:",
    ...mcp.map(
      (server) =>
        `  ${server.ready ? "✓" : "·"} ${server.label} [${server.kind}] ${server.ready ? "" : server.reason}`
    ),
  ];
  return lines.join("\n");
}

function registerCommands(context, host) {
  context.subscriptions.push(
    vscode.commands.registerCommand("clawd.installCursorPlugins", async () => {
      const result = installCursorPlugins(context.extensionPath);
      host.refresh();
      if (result.ok) {
        await vscode.window.showInformationMessage(result.message);
      } else {
        await vscode.window.showErrorMessage(result.message);
      }
    }),
    vscode.commands.registerCommand("clawd.openCursorPluginsFolder", async () => {
      const folder = cursorPluginsDir();
      fs.mkdirSync(folder, { recursive: true });
      await vscode.env.openExternal(vscode.Uri.file(folder));
    }),
    vscode.commands.registerCommand("clawd.showStatus", async () => {
      const text = formatStatus(context.extensionPath, host.settings());
      log(text);
      showOutput(false);
      await vscode.window.showInformationMessage(
        isCursor()
          ? "Clawd status written to the Clawd output channel."
          : "Clawd MCP status written to the Clawd output channel."
      );
    }),
    vscode.commands.registerCommand("clawd.showOutput", () => {
      showOutput(false);
    }),
    vscode.commands.registerCommand("clawd.openSettings", () =>
      vscode.commands.executeCommand("workbench.action.openSettings", "clawd")
    ),
    vscode.commands.registerCommand("clawd.refresh", () => {
      host.refresh();
    }),
    vscode.commands.registerCommand("clawd.focusExplorer", () =>
      vscode.commands.executeCommand("clawd.explorer.focus")
    ),
    vscode.commands.registerCommand("clawd.showPlugin", async (name) => {
      const { plugins } = pluginStatuses(context.extensionPath);
      const plugin = plugins.find((item) => item.name === name);
      if (!plugin) {
        return;
      }
      const action = await vscode.window.showInformationMessage(
        `${plugin.displayName}: ${plugin.description}`,
        plugin.installed ? "Open installed folder" : "Install plugins",
        "Open settings"
      );
      if (action === "Open installed folder") {
        await vscode.env.openExternal(vscode.Uri.file(plugin.destDir));
      } else if (action === "Install plugins") {
        await vscode.commands.executeCommand("clawd.installCursorPlugins");
      } else if (action === "Open settings") {
        await vscode.commands.executeCommand("clawd.openSettings");
      }
    })
  );
}

module.exports = {
  snapshot,
  formatStatus,
  registerCommands,
};
