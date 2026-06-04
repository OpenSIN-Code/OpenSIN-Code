# OpenSIN-Code

> The autonomous OpenSIN CLI with full browser & computer-use capabilities.

> [!IMPORTANT]
> **SSOT:** Die kanonische OpenCode-Konfiguration liegt unter [Delqhi/upgraded-opencode-stack](https://github.com/Delqhi/upgraded-opencode-stack).
> Nach jeder Änderung MUSS `sin-sync` ausgeführt werden.

## 🚨 CI/CD MANDAT — ABSOLUTES VERBOT FÜR NORMALE GITHUB ACTIONS

**NIEMALS normale GitHub Actions Runner von GitHub nutzen!** GitHub Actions Billing blockiert unsere Pipelines. Dieses Repository nutzt **ausschließlich** n8n + sin-github-action für CI/CD. Alle Builds laufen auf dem kostenlosen OCI VM (Oracle Cloud Always-Free).

- **GitHub Action:** `OpenSIN-AI/sin-github-action` (curl-only, ~2s)
- **n8n Webhook:** `http://92.5.60.87:5678/webhook/opensin-ci`
- **CI Runner:** `opensin-ci-runner.py` als systemd Service auf OCI VM
- **Vollständige Doku:** [docs.opensin.ai/best-practices/ci-cd-n8n](https://docs.opensin.ai/best-practices/ci-cd-n8n)

**Setup für Repos:** Secret `N8N_CI_WEBHOOK_URL` setzen und `.github/workflows/ci.yml` aus der Doku übernehmen. Keine selbstgeschriebenen GitHub Workflows mit `runs-on: ubuntu-latest` für Build/Test/Lint — immer nur den Delegator verwenden!

## Features

- **AI-Powered Coding**: Autonomous code generation, refactoring, and debugging
- **sinInChrome Integration**: Browser automation via MCP (13 actions, 7 browsers)
- **sin-computer-use Integration**: macOS GUI automation (screen capture, input, app management)
- **MCP Server**: Full Model Context Protocol support
- **A2A Protocol**: Agent-to-Agent communication
- **Multi-Provider**: OpenAI, Google, NVIDIA NIM support

## Browser & Computer Use

OpenSIN-Code now includes enterprise-grade browser and desktop automation:

### sinInChrome (Browser Automation)
- Navigate, click, type, screenshot, read pages
- Console access and network monitoring
- Tab management and tracking
- Multi-browser: Chrome, Brave, Arc, Chromium, Edge, Vivaldi, Opera

### sin-computer-use (macOS GUI Automation)
- Full macOS screen capture via SCContentFilter
- System-wide mouse and keyboard input
- App management (open, close, hide, enumerate)
- Clipboard operations with round-trip verification
- Mouse animation (ease-out-cubic at 60fps)
- ESC abort mechanism via CGEventTap

## Quick Start

```bash
npm install
npm run build
opensin-code
```

## Documentation

Full documentation: **[docs.opensin.ai](https://docs.opensin.ai)**

| Section | Link |
|---------|------|
| Getting Started | [Guide](https://docs.opensin.ai/guide/getting-started) |
| Browser Automation | [sinInChrome](https://docs.opensin.ai/sin-in-chrome) |
| Computer Use | [sin-computer-use](https://docs.opensin.ai/sin-computer-use) |
| API Reference | [API](https://docs.opensin.ai/api/overview) |
# OpenSIN-Code

> The autonomous OpenSIN CLI with full browser & computer-use capabilities.

## Features

- **AI-Powered Coding**: Autonomous code generation, refactoring, and debugging
- **sinInChrome Integration**: Browser automation via MCP (13 actions, 7 browsers)
- **sin-computer-use Integration**: macOS GUI automation (screen capture, input, app management)
- **MCP Server**: Full Model Context Protocol support
- **A2A Protocol**: Agent-to-Agent communication
- **Multi-Provider**: OpenAI, Google, NVIDIA NIM support

## Browser & Computer Use

OpenSIN-Code now includes enterprise-grade browser and desktop automation:

### sinInChrome (Browser Automation)
- Navigate, click, type, screenshot, read pages
- Console access and network monitoring
- Tab management and tracking
- Multi-browser: Chrome, Brave, Arc, Chromium, Edge, Vivaldi, Opera

### sin-computer-use (macOS GUI Automation)
- Full macOS screen capture via SCContentFilter
- System-wide mouse and keyboard input
- App management (open, close, hide, enumerate)
- Clipboard operations with round-trip verification
- Mouse animation (ease-out-cubic at 60fps)
- ESC abort mechanism via CGEventTap

## Quick Start

```bash
bun install
bun run build
opensin-code
```

## Documentation

Full documentation: **[docs.opensin.ai](https://docs.opensin.ai)**

| Section | Link |
|---------|------|
| Getting Started | [Guide](https://docs.opensin.ai/guide/getting-started) |
| Browser Automation | [sinInChrome](https://docs.opensin.ai/sin-in-chrome) |
| Computer Use | [sin-computer-use](https://docs.opensin.ai/sin-computer-use) |
| API Reference | [API](https://docs.opensin.ai/api/overview) |

## 📚 Documentation

This repository follows the [Global Dev Docs Standard](https://github.com/OpenSIN-AI/Global-Dev-Docs-Standard).

For contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).
For security policy, see [SECURITY.md](SECURITY.md).
For the complete OpenSIN ecosystem, see [OpenSIN-AI Organization](https://github.com/OpenSIN-AI).

## 🔗 See Also

- [OpenSIN Core](https://github.com/OpenSIN-AI/OpenSIN) — Main platform
- [OpenSIN-Code](https://github.com/OpenSIN-AI/OpenSIN-Code) — CLI
- [OpenSIN-backend](https://github.com/OpenSIN-AI/OpenSIN-backend) — Backend
- [OpenSIN-Infrastructure](https://github.com/OpenSIN-AI/OpenSIN-Infrastructure) — Deploy
- [Global Dev Docs Standard](https://github.com/OpenSIN-AI/Global-Dev-Docs-Standard) — Docs
