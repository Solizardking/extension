const vscode = require("vscode");
const { pluginStatuses, installCursorPlugins, cursorPluginsDir } = require("./plugins");
const { catalogFromPlugins } = require("./mcp");
const { isCursor } = require("./settings");
const { log, showOutput } = require("./output");
const { chat, health, listModels } = require("./mesh");
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

async function runMeshChat(settings, prompt) {
  try {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Clawd Mesh",
        cancellable: false,
      },
      async () => {
        const result = await chat(settings.meshUrl, {
          model: settings.meshModel,
          prompt,
          maxTokens: 512,
        });
        log(`Mesh (${result.model} via ${result.endpoint})\n${result.text}`);
        showOutput(true);
        const preview = result.text.length > 280 ? `${result.text.slice(0, 277)}…` : result.text;
        await vscode.window.showInformationMessage(preview || "Mesh returned an empty completion.");
      }
    );
  } catch (error) {
    log(`Mesh error: ${error.message}`);
    await vscode.window.showErrorMessage(`Clawd Mesh: ${error.message}`);
  }
}

function registerCommands(context, host) {
  context.subscriptions.push(
    vscode.commands.registerCommand("clawd.askMesh", async () => {
      const prompt = await vscode.window.showInputBox({
        title: "Clawd Mesh",
        prompt: "Ask the free Clawd Mesh (mesh.x402.wtf). No credential required.",
        ignoreFocusOut: true,
      });
      if (!prompt) {
        return;
      }
      await runMeshChat(host.settings(), prompt);
    }),
    vscode.commands.registerCommand("clawd.askMeshSelection", async () => {
      const editor = vscode.window.activeTextEditor;
      const selected = editor?.document.getText(editor.selection)?.trim();
      if (!selected) {
        await vscode.window.showInformationMessage("Select some text first, then run Clawd: Ask Mesh about Selection.");
        return;
      }
      await runMeshChat(host.settings(), selected);
    }),
    vscode.commands.registerCommand("clawd.meshStatus", async () => {
      const settings = host.settings();
      try {
        const [live, models] = await Promise.all([
          health(settings.meshUrl),
          listModels(settings.meshUrl),
        ]);
        log(
          [
            `Clawd Mesh: ${settings.meshUrl}`,
            `Health: ${live.ok ? "ok" : "down"}`,
            `Default model: ${settings.meshModel}`,
            `Models (${models.length}): ${models.slice(0, 12).join(", ")}`,
          ].join("\n")
        );
        showOutput(true);
      } catch (error) {
        await vscode.window.showErrorMessage(`Clawd Mesh: ${error.message}`);
      }
    }),
    vscode.commands.registerCommand("clawd.openMesh", async () => {
      await vscode.env.openExternal(vscode.Uri.parse(host.settings().meshUrl));
    }),
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
