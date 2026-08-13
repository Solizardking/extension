const vscode = require("vscode");

/** @type {vscode.OutputChannel | undefined} */
let channel;

function output() {
  if (!channel) {
    channel = vscode.window.createOutputChannel("Clawd");
  }
  return channel;
}

function log(message) {
  output().appendLine(`[${new Date().toISOString()}] ${message}`);
}

function showOutput(preserveFocus = true) {
  output().show(preserveFocus);
}

function disposeOutput() {
  channel?.dispose();
  channel = undefined;
}

module.exports = {
  output,
  log,
  showOutput,
  disposeOutput,
};
