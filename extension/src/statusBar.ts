import * as vscode from "vscode";
import { health } from "./mesh";
import { readSettings } from "./settings";

export class StatusBarManager implements vscode.Disposable {
  private item: vscode.StatusBarItem;

  constructor() {
    this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    this.item.name = "OpenClawd";
    this.item.command = "openclawd.askMesh";
    this.item.text = "$(zap) OpenClawd";
    this.item.tooltip = this.tooltip("Ready");
    this.item.show();
    this.refresh();
  }

  refresh(): void {
    const settings = readSettings();
    if (!settings.meshUrl) {
      this.item.text = "$(zap) OpenClawd";
      this.item.tooltip = this.tooltip("Set openclawd.meshUrl to enable Mesh");
      return;
    }
    health(settings.meshUrl)
      .then((live) => {
        this.item.text = live.ok ? "$(zap) OpenClawd" : "$(warning) OpenClawd";
        this.item.tooltip = this.tooltip(
          live.ok ? `Mesh ready · ${settings.meshModel}` : "Mesh not reachable"
        );
      })
      .catch(() => {
        this.item.text = "$(warning) OpenClawd";
        this.item.tooltip = this.tooltip("Mesh not reachable");
      });
  }

  private tooltip(status: string): vscode.MarkdownString {
    const settings = readSettings();
    const tooltip = new vscode.MarkdownString();
    tooltip.isTrusted = true;
    tooltip.appendMarkdown("### OpenClawd\n\n");
    tooltip.appendMarkdown(`${status}\n\n`);
    if (settings.meshUrl) {
      tooltip.appendMarkdown(`**Endpoint:** ${settings.meshUrl}\n\n`);
    }
    tooltip.appendMarkdown(`**Model:** ${settings.meshModel}\n\n`);
    tooltip.appendMarkdown("---\n\n");
    tooltip.appendMarkdown("[Ask Mesh](command:openclawd.askMesh)\n\n");
    tooltip.appendMarkdown("[Show status](command:openclawd.meshStatus)\n\n");
    tooltip.appendMarkdown("[Open Mesh](command:openclawd.openMesh)\n");
    return tooltip;
  }

  dispose(): void {
    this.item.dispose();
  }
}
