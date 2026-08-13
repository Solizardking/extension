const vscode = require("vscode");
const { readSettings, isCursor } = require("./lib/settings");
const { installCursorPlugins } = require("./lib/plugins");
const { registerMcpServers, catalogFromPlugins } = require("./lib/mcp");
const { StatusBarManager } = require("./lib/statusBar");
const { registerTree } = require("./lib/treeView");
const { registerCommands, snapshot } = require("./lib/commands");
const { log, disposeOutput } = require("./lib/output");

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

  if (settings.installOnActivate) {
    const result = installCursorPlugins(context.extensionPath);
    if (!result.ok) {
      log(result.message);
    } else {
      log(result.message);
    }
    refresh();
  }

  const mcpCatalog = catalogFromPlugins(context.extensionPath, settings);
  log(
    `Activated on ${vscode.env.appName}. Plugins install ${
      isCursor() ? "into Cursor" : "to ~/.cursor/plugins/local"
    }. MCP ready ${mcpCatalog.filter((item) => item.ready).length}/${mcpCatalog.length}.`
  );
}

function deactivate() {
  disposeOutput();
}

module.exports = {
  activate,
  deactivate,
};
