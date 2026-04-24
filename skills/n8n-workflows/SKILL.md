---
name: n8n-workflows
description: "n8n workflow automation — list, trigger, activate/deactivate, and monitor n8n workflows and executions. Use when the user wants to run automations, trigger workflows, check execution status, or connect external services through n8n. Supports both n8n.cloud and self-hosted."
metadata:
  {
    "openclaw":
      {
        "emoji": "⚡",
        "requires": { "env": ["N8N_BASE_URL", "N8N_API_KEY"] },
        "install": [],
      },
  }
allowed-tools: ["web_fetch", "bash"]
---

# n8n Workflow Automation

REST API access to your n8n instance (self-hosted or n8n.cloud).

## Setup

```
N8N_BASE_URL=http://localhost:5678    # or https://app.n8n.cloud/api/v1
N8N_API_KEY=your-api-key
```

## Auth header

All calls: `X-N8N-API-KEY: <N8N_API_KEY>`

## Core operations

### List workflows
```bash
curl -s "$N8N_BASE_URL/api/v1/workflows" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" | jq '.data[] | {id, name, active}'
```

### Get workflow detail
```bash
curl -s "$N8N_BASE_URL/api/v1/workflows/WORKFLOW_ID" \
  -H "X-N8N-API-KEY: $N8N_API_KEY"
```

### Trigger workflow (webhook)
```bash
# Get webhook URL from workflow, then:
curl -s -X POST "https://your-n8n.com/webhook/WEBHOOK_PATH" \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'
```

### Trigger manual workflow via execute endpoint
```bash
curl -s -X POST "$N8N_BASE_URL/api/v1/workflows/WORKFLOW_ID/execute" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### List recent executions
```bash
curl -s "$N8N_BASE_URL/api/v1/executions?workflowId=WORKFLOW_ID&limit=20" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" | jq '.data[] | {id, status, startedAt, stoppedAt}'
```

### Get execution detail + output
```bash
curl -s "$N8N_BASE_URL/api/v1/executions/EXECUTION_ID?includeData=true" \
  -H "X-N8N-API-KEY: $N8N_API_KEY"
```

### Activate / deactivate workflow
```bash
# Activate
curl -s -X PATCH "$N8N_BASE_URL/api/v1/workflows/WORKFLOW_ID" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" -H "Content-Type: application/json" \
  -d '{"active": true}'

# Deactivate
curl -s -X PATCH "$N8N_BASE_URL/api/v1/workflows/WORKFLOW_ID" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" -H "Content-Type: application/json" \
  -d '{"active": false}'
```

### Retry failed execution
```bash
curl -s -X POST "$N8N_BASE_URL/api/v1/executions/EXECUTION_ID/retry" \
  -H "X-N8N-API-KEY: $N8N_API_KEY"
```

## Execution status values

| Status | Meaning |
|--------|---------|
| `success` | Completed successfully |
| `error` | Failed with an error |
| `running` | Currently executing |
| `waiting` | Waiting for webhook/manual trigger |
| `canceled` | Manually stopped |

## Integration with Monday.com

A common pattern: trigger n8n → it processes data → updates Monday board:
```
Trigger the "Sync CRM to Monday" workflow, then check the execution output
to confirm what items were created on the Sales board.
```

## Rules

1. Confirm before activating/deactivating workflows in production
2. Never expose credential values from n8n — only names/types
3. For webhook-triggered workflows, get the webhook URL from the workflow nodes first
4. Poll `executions` endpoint to track long-running workflow status
