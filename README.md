<p align="center">
  <img src="media/banner.png" alt="Clawd" width="100%"/>
</p>

# Clawd

Editor pack for VS Code, Cursor, and VSCodium. It ships three Cursor plugins (Clawd, Clawd Code, Helius), a Solana MCP catalog, and agent skills.

Source: [github.com/solizardking/extension](https://github.com/solizardking/extension)

## Features

- **Free Mesh inference** — [mesh.x402.wtf](https://mesh.x402.wtf) chat with no credential (`qwen2.5:1.5b` by default)
- **Clawd** — agent harness, Cheshire Terminal MCP, Solana catalog
- **Clawd Code** — Solana coding agent, paper-default trading helpers
- **Helius** — Helius MCP/CLI, DAS/Sender, Solana docs MCP

Command Palette → **Clawd: Ask Mesh**. In Cursor, **Clawd: Install Cursor Plugins** copies the bundled plugins into your local Cursor plugins folder. The extension does not copy files on startup.

In VS Code and VSCodium you still get the MCP provider, settings, status bar, and activity bar.

## Commands

| Command | Purpose |
| --- | --- |
| Clawd: Ask Mesh | Free completion via mesh.x402.wtf |
| Clawd: Ask Mesh about Selection | Send the current editor selection to Mesh |
| Clawd: Mesh Status | Health check and model list |
| Clawd: Open Mesh | Open the Mesh dashboard |
| Clawd: Install Cursor Plugins | Copy bundled plugins into the local Cursor plugins folder |
| Clawd: Open Cursor Plugins Folder | Open that folder |
| Clawd: Show Status | Write plugin and MCP status to the Clawd output channel |
| Clawd: Show Output | Focus the log |
| Clawd: Open Settings | Open `clawd.*` settings |
| Clawd: Refresh | Reload the tree and MCP definitions |

## Settings

Optional credentials and local checkout paths. Leave them empty unless you use the matching MCP server.

| Setting | Environment |
| --- | --- |
| `clawd.meshUrl` | `CLAWD_MESH_URL` |
| `clawd.meshModel` | `CLAWD_MESH_MODEL` |
| `clawd.heliusCredential` | `HELIUS_API_KEY` |
| `clawd.solanaRpcUrl` | `SOLANA_RPC_URL` |
| `clawd.cheshireCredential` | `CHESHIRE_API_KEY` |
| `clawd.xaiCredential` | `XAI_API_KEY` |
| `clawd.coreAiRoot` | `CORE_AI_ROOT` |
| `clawd.cheshireTerminalRoot` | `CHESHIRE_TERMINAL_ROOT` |
| `clawd.clawdCodeRoot` | `CLAWD_CODE_ROOT` |
| `clawd.zeroClawdRoot` | `ZERO_CLAWD_ROOT` |
| `clawd.clawdBrowserRoot` | `CLAWDBROWSER_ROOT` |

HTTP MCP servers register from the bundled catalogs. Local stdio servers wait until the matching path or credential is set.

## License

MIT. Based on the [Cursor plugin template](https://github.com/cursor/plugin-template).
