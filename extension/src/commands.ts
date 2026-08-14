import * as vscode from "vscode";
import { chat, health, listModels } from "./mesh";
import { log, showOutput } from "./output";
import { readSettings } from "./settings";
import { StatusBarManager } from "./statusBar";

function requireMeshUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) {
    throw new Error("Set openclawd.meshUrl in Settings, then try again.");
  }
  return trimmed;
}

async function runMeshChat(prompt: string): Promise<void> {
  const settings = readSettings();
  try {
    const meshUrl = requireMeshUrl(settings.meshUrl);
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "OpenClawd Mesh",
      },
      async () => {
        const result = await chat(meshUrl, {
          model: settings.meshModel,
          prompt,
          maxTokens: 512,
        });
        log(`Mesh (${result.model})\n${result.text}`);
        showOutput(true);
        const preview = result.text.length > 280 ? `${result.text.slice(0, 277)}…` : result.text;
        await vscode.window.showInformationMessage(preview || "Mesh returned an empty completion.");
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log(`Mesh error: ${message}`);
    await vscode.window.showErrorMessage(`OpenClawd: ${message}`);
  }
}

export default function registerCommands(
  context: vscode.ExtensionContext,
  statusBar: StatusBarManager
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("openclawd.askMesh", async () => {
      const prompt = await vscode.window.showInputBox({
        title: "OpenClawd Mesh",
        prompt: "Ask Mesh",
        ignoreFocusOut: true,
      });
      if (!prompt) {
        return;
      }
      await runMeshChat(prompt);
    }),
    vscode.commands.registerCommand("openclawd.askMeshSelection", async () => {
      const editor = vscode.window.activeTextEditor;
      const selected = editor?.document.getText(editor.selection)?.trim();
      if (!selected) {
        await vscode.window.showInformationMessage("Select some text first.");
        return;
      }
      await runMeshChat(selected);
    }),
    vscode.commands.registerCommand("openclawd.meshStatus", async () => {
      const settings = readSettings();
      try {
        const meshUrl = requireMeshUrl(settings.meshUrl);
        const [live, models] = await Promise.all([health(meshUrl), listModels(meshUrl)]);
        log(
          [
            `Mesh: ${meshUrl}`,
            `Health: ${live.ok ? "ok" : "down"}`,
            `Default model: ${settings.meshModel}`,
            `Models (${models.length}): ${models.slice(0, 12).join(", ")}`,
          ].join("\n")
        );
        showOutput(true);
        statusBar.refresh();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await vscode.window.showErrorMessage(`OpenClawd: ${message}`);
      }
    }),
    vscode.commands.registerCommand("openclawd.openMesh", async () => {
      try {
        const meshUrl = requireMeshUrl(readSettings().meshUrl);
        await vscode.env.openExternal(vscode.Uri.parse(meshUrl));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await vscode.window.showErrorMessage(`OpenClawd: ${message}`);
      }
    }),
    vscode.commands.registerCommand("openclawd.showOutput", () => {
      showOutput(false);
    })
  );
}
