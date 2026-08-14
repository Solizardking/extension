import * as vscode from "vscode";
import registerCommands from "./commands";
import { StatusBarManager } from "./statusBar";

export function activate(context: vscode.ExtensionContext): void {
  const statusBar = new StatusBarManager();
  context.subscriptions.push(statusBar);
  registerCommands(context, statusBar);

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("openclawd")) {
        statusBar.refresh();
      }
    })
  );
}

export function deactivate(): void {}
