---
name: ctap-access
description: How agents use Drive, Gmail, Render, and this Cloud VM computer. Use when deploying, connecting MCP, or Myke says he logged into Chrome.
---

# Access

Mailbox / Drive owner: `communitypizza2026@gmail.com`.

| Tool | Status to assume | Agent move |
|---|---|---|
| Google Drive MCP | Often already connected as communitypizza | Read. Do not invent. |
| Gmail MCP | Often `needsAuth` | Setup action. Parse fixtures / last Z. Do not stall. |
| Render MCP | Workspace may be unauthorized | Need `RENDER_API_KEY` or Dashboard Blueprint. |
| Cloud Agent Chrome | **Not laptop Chrome** | If Myke logged in on his laptop, this VM is still signed out. Ask him to sign into **this** desktop Chrome, or paste the key. |
| Document AI | Secrets often missing | HEICs stay photos. |

Standing computer permission is on. Use this VM's desktop when a dashboard session exists **here**. Never commit API keys.

Blueprint: https://dashboard.render.com/blueprint/new?repo=https://github.com/mykemueller1-ctrl/Agent-ctap-marketing  
Build `npm ci && npm run build` · publish `portal/dist` · branch `main`.
