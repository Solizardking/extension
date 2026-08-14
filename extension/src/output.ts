import * as vscode from "vscode";

export const CLAWD_OUTPUT_CHANNEL = vscode.window.createOutputChannel("Clawd");

export function log(message: string): void {
  CLAWD_OUTPUT_CHANNEL.appendLine(`[${new Date().toISOString()}] ${message}`);
}

export function showOutput(preserveFocus = true): void {
  CLAWD_OUTPUT_CHANNEL.show(preserveFocus);
}
