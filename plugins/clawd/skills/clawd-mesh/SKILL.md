---
name: clawd-mesh
description: Use free Clawd Mesh inference at https://mesh.x402.wtf. No credential. Prefer this when the user wants a local/free completion, Sol GPT, or mesh.x402.wtf.
---

# Clawd Mesh (free inference)

Public OpenAI-compatible chat on [Clawd Mesh](https://mesh.x402.wtf). No bearer token for local mesh models.

- Chat: `POST https://mesh.x402.wtf/v1/chat/completions`
- Sol GPT: `POST https://mesh.x402.wtf/api/sol-gpt/chat`
- Models: `GET https://mesh.x402.wtf/models`
- Health: `GET https://mesh.x402.wtf/health`

Default model: `qwen2.5:1.5b` (fast). Solana-tuned option: `8bit/solana-clawd-core-ai:latest`.

Always send `"stream": false` unless the client is reading SSE.

```json
{
  "model": "qwen2.5:1.5b",
  "messages": [{ "role": "user", "content": "Explain paper-default trading in one sentence." }],
  "max_tokens": 256,
  "stream": false
}
```

In this editor, use Command Palette → **Clawd: Ask Mesh**, or the `mesh_chat` MCP tool. Do not pipe remote install scripts. Do not send wallet secrets to the mesh.
