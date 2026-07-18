# Agent: OpenSIN-Code

**Team:** OpenSIN-AI
**Protocol:** A2A (Agent-to-Agent)
**Status:** Active
**Repository:** https://github.com/OpenSIN-AI/OpenSIN-Code

## Capabilities

OpenSIN-Code is the core code agent for the OpenSIN ecosystem, providing intelligent code generation, analysis, and refactoring capabilities.

## Communication

- **Input:** A2A messages from orchestrator
- **Output:** A2A messages to other agents
- **MCP:** Standard OpenSIN MCP servers

## Security

- All operations logged to OpenSIN-Ledger
- Requires authorization token
- Guardrails enforced on all inputs/outputs

## Setup

```bash
git clone https://github.com/OpenSIN-AI/OpenSIN-Code.git
cd OpenSIN-Code
bun install
bun run build
bun run test
```

## License

MIT

## Cross-Reference: skill-oci-oracle-cloud

For all OCI / Oracle Cloud / Cloudflare Tunnel / sinchat / Aura-Call / secret-discipline operations, this agent MUST consult `skill-oci-oracle-cloud`:

- Primary: `~/.config/opencode/skills/skill-oci-oracle-cloud/SKILL.md`
- Source-of-truth mirror: `Infra-SIN-OpenCode-Stack/skills/skill-oci-oracle-cloud/`
- Auto-loader for Infisical Service-Token: `~/.config/opencode/skills/skill-oci-oracle-cloud/scripts/infisical-auto-token-loader.sh`

**Non-negotiable contract (Priority 11 — global):**
- Read `~/.infisical/agent-token` (chmod 0600) for any Infisical access — NEVER trigger `infisical login`.
- Service Token scope must be `read + write`, environment `production`, project `fa7758b4-f84c-4297-966e-710056d531ef`.
- All OCI SDK calls go through `~/.oci/config` (no human-mediated auth).
- All cloudflared calls use `--config ~/.cloudflared/config-<opensin|sin-code-webui|infrastructure|sinator>.yml`.
- No agent-spawn SSH to OCI VMs — emit recovery runbooks for the operator instead.

The full ruleset lives in the `skill-oci-oracle-cloud` SKILL.md (source of truth);
the global `~/.config/opencode/AGENTS.md` "Secrets & OCI / Infisical" section holds the summary.
