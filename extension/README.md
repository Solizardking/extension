# Clawd

[![Visual Studio Marketplace](https://img.shields.io/visual-studio-marketplace/v/clawd.clawd?colorA=061117&colorB=14F195&style=flat)](https://marketplace.visualstudio.com/items?itemName=clawd.clawd)
[![License](https://img.shields.io/badge/license-MIT-14F195?colorA=061117&style=flat)](LICENSE)

![Header](assets/header.png)

VS Code extension for [Clawd Mesh](https://mesh.x402.wtf). Ask a local Mesh model from the command palette, the status bar, or the current editor selection. No Mesh credential is required for the default local models.

## Features

- **Ask Mesh**: send a prompt to `https://mesh.x402.wtf/v1/chat/completions`
- **Ask Mesh about Selection**: send the current editor selection
- **Mesh Status**: health check and available model list
- Status bar entry with Mesh reachability

Default model is `qwen2.5:1.5b`. A Solana-tuned option is `8bit/solana-clawd-core-ai:latest`.

## Commands

- `clawd: Ask Mesh`
- `clawd: Ask Mesh about Selection`
- `clawd: Show Mesh Status`
- `clawd: Open Mesh`
- `clawd: Show Output`

## Requirements

- Visual Studio Code 1.96.0 or newer

## Getting Started

1. Install the extension from the Visual Studio Code Marketplace
2. Open the command palette (Ctrl+Shift+P / Cmd+Shift+P)
3. Run `clawd: Ask Mesh`

## Extension Settings

- `clawd.meshUrl`: Clawd Mesh base URL (default `https://mesh.x402.wtf`)
- `clawd.meshModel`: Default Mesh model id (default `qwen2.5:1.5b`)

## Feedback

Source and issues: [github.com/solizardking/extension](https://github.com/solizardking/extension)
