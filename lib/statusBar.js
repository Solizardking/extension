const vscode = require("vscode");
const { isCursor } = require("./settings");

class StatusBarManager {
  /**
   * @param {() => { pluginCount: number, installedCount: number, mcpReady: number, mcpTotal: number }} getSnapshot
   */
  constructor(getSnapshot) {
    this.getSnapshot = getSnapshot;
    this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    this.item.name = "Clawd";
    this.item.command = "clawd.showStatus";
    this.item.show();
    this.refresh();
  }

  refresh() {
    const snapshot = this.getSnapshot();
    const cursor = isCursor();
    const pluginsOk = snapshot.installedCount === snapshot.pluginCount && snapshot.pluginCount > 0;
    const mcpOk = snapshot.mcpReady > 0;

    if (cursor && !pluginsOk) {
      this.item.text = "$(warning) Clawd";
      this.item.backgroundColor = new vscode.ThemeColor("statusBarItem.warningBackground");
    } else {
      this.item.text = "$(zap) Clawd";
      this.item.backgroundColor = undefined;
    }

    const tooltip = new vscode.MarkdownString();
    tooltip.isTrusted = true;
    tooltip.appendMarkdown("### Clawd\n\n");
    tooltip.appendMarkdown(
      cursor
        ? `**Cursor plugins:** ${snapshot.installedCount}/${snapshot.pluginCount} installed\n\n`
        : `**Bundled plugins:** ${snapshot.pluginCount} (install applies on Cursor)\n\n`
    );
    tooltip.appendMarkdown(`**MCP servers:** ${snapshot.mcpReady}/${snapshot.mcpTotal} ready\n\n`);
    tooltip.appendMarkdown("---\n\n");
    tooltip.appendMarkdown("[Show status](command:clawd.showStatus)\n\n");
    tooltip.appendMarkdown("[Install Cursor plugins](command:clawd.installCursorPlugins)\n\n");
    tooltip.appendMarkdown("[Open Clawd view](command:clawd.focusExplorer)\n");
    this.item.tooltip = tooltip;

    if (!mcpOk && snapshot.mcpTotal > 0) {
      this.item.text = cursor && !pluginsOk ? "$(warning) Clawd" : "$(zap) Clawd";
    }
  }

  dispose() {
    this.item.dispose();
  }
}

module.exports = { StatusBarManager };
