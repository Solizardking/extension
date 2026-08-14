const vscode = require("vscode");
const { pluginStatuses } = require("./plugins");
const { catalogFromPlugins } = require("./mcp");
const { isCursor } = require("./settings");

class ClawdTreeItem extends vscode.TreeItem {
  constructor(label, collapsibleState, extra = {}) {
    super(label, collapsibleState);
    Object.assign(this, extra);
  }
}

class ClawdTreeProvider {
  /**
   * @param {() => { extensionPath: string, settings: object }} getState
   */
  constructor(getState) {
    this.getState = getState;
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element) {
    return element;
  }

  getChildren(element) {
    const { extensionPath, settings } = this.getState();
    const { marketplace, plugins } = pluginStatuses(extensionPath);
    const mcp = catalogFromPlugins(extensionPath, settings);

    if (!element) {
      return [
        new ClawdTreeItem("Marketplace", vscode.TreeItemCollapsibleState.Expanded, {
          contextValue: "clawd.section",
          iconPath: new vscode.ThemeIcon("globe"),
        }),
        new ClawdTreeItem("Free inference", vscode.TreeItemCollapsibleState.Expanded, {
          contextValue: "clawd.section",
          iconPath: new vscode.ThemeIcon("comment-discussion"),
        }),
        new ClawdTreeItem("Cursor plugins", vscode.TreeItemCollapsibleState.Expanded, {
          contextValue: "clawd.section",
          iconPath: new vscode.ThemeIcon("extensions"),
        }),
        new ClawdTreeItem("MCP servers", vscode.TreeItemCollapsibleState.Expanded, {
          contextValue: "clawd.section",
          iconPath: new vscode.ThemeIcon("server-process"),
        }),
      ];
    }

    if (element.label === "Marketplace") {
      const owner = marketplace.owner?.name || "OpenClawd";
      const version = marketplace.metadata?.version || "";
      return [
        new ClawdTreeItem(`${marketplace.name} · ${owner}`, vscode.TreeItemCollapsibleState.None, {
          description: version,
          tooltip: marketplace.metadata?.description || "",
          iconPath: new vscode.ThemeIcon("package"),
        }),
      ];
    }

    if (element.label === "Free inference") {
      const { settings } = this.getState();
      return [
        new ClawdTreeItem("Ask Mesh", vscode.TreeItemCollapsibleState.None, {
          description: settings.meshModel,
          tooltip: `${settings.meshUrl} · no credential`,
          iconPath: new vscode.ThemeIcon("comment-discussion"),
          command: { command: "clawd.askMesh", title: "Ask Mesh" },
        }),
        new ClawdTreeItem("Mesh status", vscode.TreeItemCollapsibleState.None, {
          description: "health + models",
          iconPath: new vscode.ThemeIcon("pulse"),
          command: { command: "clawd.meshStatus", title: "Mesh status" },
        }),
        new ClawdTreeItem("Open mesh.x402.wtf", vscode.TreeItemCollapsibleState.None, {
          iconPath: new vscode.ThemeIcon("link-external"),
          command: { command: "clawd.openMesh", title: "Open Mesh" },
        }),
      ];
    }

    if (element.label === "Cursor plugins") {
      if (plugins.length === 0) {
        return [
          new ClawdTreeItem("No bundled plugins in this VSIX", vscode.TreeItemCollapsibleState.None, {
            iconPath: new vscode.ThemeIcon("warning"),
          }),
        ];
      }

      return plugins.map((plugin) => {
        const item = new ClawdTreeItem(plugin.displayName, vscode.TreeItemCollapsibleState.None, {
          description: plugin.installed ? `v${plugin.version} · installed` : `v${plugin.version} · not installed`,
          tooltip: plugin.description,
          contextValue: plugin.installed ? "clawd.plugin.installed" : "clawd.plugin.missing",
          iconPath: new vscode.ThemeIcon(plugin.installed ? "check" : "cloud-download"),
          command: {
            command: "clawd.showPlugin",
            title: "Show plugin",
            arguments: [plugin.name],
          },
        });
        return item;
      });
    }

    if (element.label === "MCP servers") {
      if (mcp.length === 0) {
        return [
          new ClawdTreeItem("No MCP servers found", vscode.TreeItemCollapsibleState.None, {
            iconPath: new vscode.ThemeIcon("info"),
          }),
        ];
      }

      return mcp.map((server) => {
        const item = new ClawdTreeItem(server.label, vscode.TreeItemCollapsibleState.None, {
          description: server.ready ? server.kind : server.reason || "needs setup",
          tooltip: server.ready
            ? `${server.kind} · from ${server.plugin}`
            : `${server.reason}\nFrom plugin: ${server.plugin}`,
          contextValue: server.ready ? "clawd.mcp.ready" : "clawd.mcp.setup",
          iconPath: new vscode.ThemeIcon(
            server.ready ? (server.kind === "http" ? "globe" : "terminal") : "warning"
          ),
        });
        return item;
      });
    }

    return [];
  }

  dispose() {
    this._onDidChangeTreeData.dispose();
  }
}

function registerTree(context, getState) {
  const provider = new ClawdTreeProvider(getState);
  const view = vscode.window.createTreeView("clawd.explorer", {
    treeDataProvider: provider,
    showCollapseAll: true,
  });
  view.message = isCursor()
    ? "Clawd, Clawd Code, and Helius from the OpenClawd marketplace."
    : "MCP servers work here. Cursor plugins install into ~/.cursor/plugins/local.";
  context.subscriptions.push(view, provider);
  return provider;
}

module.exports = {
  ClawdTreeProvider,
  registerTree,
};
