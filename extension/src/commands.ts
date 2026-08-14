import * as vscode from "vscode";
import { chat, health, listModels } from "./mesh";
import { log, showOutput } from "./output";
import { readSettings } from "./settings";
import { StatusBarManager } from "./statusBar";

async function runMeshChat(prompt: string): Promise<void> {
  const settings = readSettings();
  try {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Clawd Mesh",
      },
      async () => {
        const result = await chat(settings.meshUrl, {
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
    await vscode.window.showErrorMessage(`Clawd Mesh: ${message}`);
  }
}

export default function registerCommands(
  context: vscode.ExtensionContext,
  statusBar: StatusBarManager
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("clawd.askMesh", async () => {
      const prompt = await vscode.window.showInputBox({
        title: "Clawd Mesh",
        prompt: "Ask Clawd Mesh",
        ignoreFocusOut: true,
      });
      if (!prompt) {
        return;
      }
      await runMeshChat(prompt);
    }),
    vscode.commands.registerCommand("clawd.askMeshSelection", async () => {
      const editor = vscode.window.activeTextEditor;
      const selected = editor?.document.getText(editor.selection)?.trim();
      if (!selected) {
        await vscode.window.showInformationMessage("Select some text first.");
        return;
      }
      await runMeshChat(selected);
    }),
    vscode.commands.registerCommand("clawd.meshStatus", async () => {
      const settings = readSettings();
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
        statusBar.refresh();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await vscode.window.showErrorMessage(`Clawd Mesh: ${message}`);
      }
    }),
    vscode.commands.registerCommand("clawd.openMesh", async () => {
      await vscode.env.openExternal(vscode.Uri.parse(readSettings().meshUrl));
    }),
    vscode.commands.registerCommand("clawd.showOutput", () => {
      showOutput(false);
    })
  );
}
