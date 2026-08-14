import * as vscode from "vscode";
import { DEFAULT_MODEL, DEFAULT_URL } from "./mesh";

export interface ClawdSettings {
  meshUrl: string;
  meshModel: string;
}

export function readSettings(): ClawdSettings {
  const config = vscode.workspace.getConfiguration("openclawd");
  const meshUrl = config.get<string>("meshUrl")?.trim() || DEFAULT_URL;
  const meshModel = config.get<string>("meshModel")?.trim() || DEFAULT_MODEL;
  return { meshUrl, meshModel };
}
