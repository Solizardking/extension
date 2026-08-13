# Clawd

[![License: MIT](https://img.shields.io/badge/License-MIT-14F195.svg)](LICENSE)

Open-source Clawd pack for **VS Code**, **Cursor**, and **VSCodium**: Cursor plugins (Clawd, Clawd Code, Helius), Solana MCP servers, and agent skills.

**Source:** [github.com/solizardking/extension](https://github.com/solizardking/extension)

The VSIX reads `.cursor-plugin/marketplace.json` and ships the three production plugins (`clawd`, `clawd-code`, `helius`). Starter templates stay in the repo for authors and are not packaged.

## Debug

Press **F5** (`Run Extension`) to open an Extension Development Host with this folder loaded.

## Install from a `.vsix`

1. Run `npm install` then `npm run package` in this repo (creates `clawd-1.0.0.vsix`).
2. In the editor: **Extensions → ⋯ → Install from VSIX…** and pick that file.
3. Reload the window.

On Cursor, the extension copies marketplace plugins into `~/.cursor/plugins/local`. Re-run **Clawd: Install Cursor Plugins** from the Command Palette if they are missing. The **Clawd** activity bar lists marketplace plugins and MCP servers; the status bar badge opens the same status.

Public HTTP MCP servers (Solana docs, DFlow, ZK Compression, Cheshire Terminal, Phoenix, PayBox, Robinhood) register automatically from each plugin's `mcp.json`. Local stdio servers (Helius, Pump, Grok, Clawd Code, Zero, ClawdBrowser) start only when you set the matching Settings / env paths.

## Publish

This is JavaScript (no compile step). Publisher ID in `package.json` is `openclawd` — create that ID before the first upload.

### Microsoft Marketplace (VS Code + Cursor Extensions tab)

1. Create a publisher at the [Visual Studio Marketplace management portal](https://marketplace.visualstudio.com/manage).
2. Sign in to Azure DevOps, create a PAT with **Marketplace (Acquire & Publish)**.
3. Publish:

```bash
npx @vscode/vsce login openclawd
npx @vscode/vsce publish
```

Or upload `clawd-1.0.0.vsix` with **New Extension** on the marketplace site.

### Open VSX (VSCodium and other open editors)

```bash
npx ovsx publish clawd-1.0.0.vsix -p YOUR_OPEN_VSX_TOKEN
```

## Cursor plugin marketplace (separate from VSIX)

Cursor Plugins (rules, skills, agents, commands, hooks) can also be listed without a VSIX. Submit this public repo:

1. [cursor.directory/plugins/new](https://cursor.directory/plugins/new) (community, fastest)
2. [cursor.com/marketplace/publish](https://cursor.com/marketplace/publish) (official, manual review)

Repo URL: `https://github.com/solizardking/extension`

### Plugin authoring

1. `.cursor-plugin/marketplace.json`: set marketplace `name`, `owner`, and `metadata`.
2. `plugins/*/.cursor-plugin/plugin.json`: set `name` (lowercase kebab-case), `displayName`, `author`, `description`, `keywords`, `license`, and `version`.
3. Replace placeholder rules, skills, agents, commands, hooks, scripts, and logos.

To add more plugins, see `docs/add-a-plugin.md`. Validate with `npm run validate`.

Included Cursor plugins:

- **clawd**: six-law harness, ClawdBot Go, Cheshire Terminal MCP, OODA
- **clawd-code**: Solana coding agent, paper-gated perps, Helius/DFlow/Jupiter/Phantom, Agent Arena
- **helius**: Helius + core-ai (MCP, CLI, DAS/Sender, Pump, perps, Grok, Solana docs)
- **starter-simple** / **starter-advanced**: template starters (not bundled in the VSIX)

Based on the [Cursor plugin template](https://github.com/cursor/plugin-template).
