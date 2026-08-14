const vscode = require("vscode");
const { readSettings } = require("./lib/settings");
const { registerMcpServers, catalogFromPlugins } = require("./lib/mcp");
const { StatusBarManager } = require("./lib/statusBar");
const { registerTree } = require("./lib/treeView");
const { registerCommands, snapshot } = require("./lib/commands");
const { log, disposeOutput } = require("./lib/output");
const { health } = require("./lib/mesh");

function activate(context) {
  let settings = readSettings();

  const getState = () => ({
    extensionPath: context.extensionPath,
    settings,
  });

  const tree = registerTree(context, getState);
  const mcp = registerMcpServers(context, getState);
  const statusBar = new StatusBarManager(() => snapshot(context.extensionPath, settings));

  const refresh = () => {
    settings = readSettings();
    tree.refresh();
    mcp.refresh();
    statusBar.refresh();
  };

  registerCommands(context, {
    refresh,
    settings: () => settings,
  });

  context.subscriptions.push(
    statusBar,
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("clawd")) {
        refresh();
        log("Reloaded Clawd settings.");
      }
    })
  );

  const mcpCatalog = catalogFromPlugins(context.extensionPath, settings);
  log(
    `Activated on ${vscode.env.appName}. Use Clawd: Ask Mesh for free inference, or Clawd: Install Cursor Plugins to copy bundled plugins. MCP ready ${
      mcpCatalog.filter((item) => item.ready).length
    }/${mcpCatalog.length}.`
  );

  health(settings.meshUrl)
    .then((live) => {
      log(
        live.ok
          ? `Clawd Mesh ready at ${settings.meshUrl} (${live.body.node || "ok"}). Default model ${settings.meshModel}.`
          : `Clawd Mesh not ready at ${settings.meshUrl}.`
      );
    })
    .catch((error) => {
      log(`Clawd Mesh health check failed: ${error.message}`);
    });
}

function deactivate() {
  disposeOutput();
}

module.exports = {
  activate,
  deactivate,
};
