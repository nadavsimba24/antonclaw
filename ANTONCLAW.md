# ⛧ AntónClaw

```
    _    _   _ _____ ___  _   _  ____  _        _    __        __
   / \  | \ | |_   _/ _ \| \ | |/ ___|| |      / \   \ \      / /
  / _ \ |  \| | | || | | |  \| | |   | |     / _ \   \ \ /\ / /
 / ___ \| |\  | | || |_| | |\  | |___| |___ / ___ \   \ V  V /
/_/   \_\_| \_| |_| \___/|_| \_|\____|_____/_/   \_\   \_/\_/

              Gilfoyle's Unholy Daemon  ·  In Anton We Trust
```

**AntónClaw** is a fork of [OpenClaw](https://github.com/openclaw/openclaw) — the personal AI assistant platform — with three additions the original lacks:

| Added skill | What it does |
|---|---|
| **monday-com** | Full Monday.com read/write — boards, items, statuses, updates via GraphQL API |
| **n8n-workflows** | Trigger, monitor, and manage n8n automations via REST API |
| **qgis-postgis** | Spatial SQL queries, GIS analysis, GeoJSON export via PostGIS |

Everything else is pure upstream OpenClaw — all 20+ messaging channels (WhatsApp, Telegram, Discord, Slack, Teams...), the full skill registry, Canvas, voice, and the agent loop.

---

## Why fork?

OpenClaw is excellent. We wanted to run it against **DeepSeek, Groq, and Kimi** (already supported via OpenClaw's model config) and needed **Monday.com + n8n + QGIS** integrations that aren't in the upstream skill registry yet.

Named after Gilfoyle's server **Anton** from Silicon Valley — because this daemon works in the dark so you don't have to.

---

## Install

Same as OpenClaw:

```bash
npm install -g antonclaw@latest
# or
pnpm add -g antonclaw@latest

antonclaw onboard --install-daemon
```

The `openclaw` binary alias is preserved for compatibility.

---

## Enable the new skills

After onboarding, the skills are available immediately. Tell your agent:

```
Enable the monday-com skill
```

or add to your `~/.openclaw/skills/`:

```bash
antonclaw skills add monday-com
antonclaw skills add n8n-workflows
antonclaw skills add qgis-postgis
```

Set the required env vars:

```bash
# Monday.com
export MONDAY_API_KEY=your_api_key

# n8n
export N8N_BASE_URL=http://localhost:5678
export N8N_API_KEY=your_n8n_key

# PostGIS
export POSTGIS_CONNECTION_STRING=postgresql://user:pass@localhost:5432/geodata
```

---

## Provider freedom

AntónClaw inherits OpenClaw's full model config. To run on DeepSeek:

```json
{
  "model": "deepseek/deepseek-chat"
}
```

To run on Groq:
```json
{
  "model": "groq/llama-3.3-70b-versatile"
}
```

---

## Staying in sync with upstream

```bash
git remote add upstream https://github.com/openclaw/openclaw.git
git fetch upstream
git merge upstream/main
```

Our three skills live in `skills/monday-com/`, `skills/n8n-workflows/`, `skills/qgis-postgis/`. Everything else merges cleanly from upstream.

---

## Original OpenClaw README

See [README.md](README.md) for the full OpenClaw documentation.
