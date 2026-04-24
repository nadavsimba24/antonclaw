---
name: monday-com
description: "Full Monday.com integration — create, update, read boards/items/subitems/groups, set statuses, post updates, search. Use when the user asks to manage projects, track tasks, update Monday boards, create items, change statuses, or link work to Monday."
metadata:
  {
    "openclaw":
      {
        "emoji": "📋",
        "requires": { "env": ["MONDAY_API_KEY"] },
        "install": [],
      },
  }
allowed-tools: ["web_fetch", "bash"]
---

# Monday.com

Full read/write access via the Monday.com GraphQL API (`https://api.monday.com/v2`).

## Auth

All calls need:
```
Authorization: <MONDAY_API_KEY>
API-Version: 2024-01
Content-Type: application/json
```

## Core Queries

### List boards
```graphql
{ boards(limit: 50) { id name description } }
```

### Get board + items
```graphql
{
  boards(ids: [BOARD_ID]) {
    id name
    columns { id title type }
    groups { id title }
    items_page(limit: 50) {
      items { id name group { id title } column_values { id text value } }
    }
  }
}
```

### Create item
```graphql
mutation {
  create_item(board_id: BOARD_ID, group_id: "GROUP_ID", item_name: "Task name",
    column_values: "{\"status\": {\"label\": \"In Progress\"}, \"date\": {\"date\": \"2026-04-24\"}}") {
    id name
  }
}
```

### Update item column
```graphql
mutation {
  change_multiple_column_values(board_id: BOARD_ID, item_id: ITEM_ID,
    column_values: "{\"status\": {\"label\": \"Done\"}, \"text\": \"completed\"}") {
    id
  }
}
```

### Post update (comment)
```graphql
mutation {
  create_update(item_id: ITEM_ID, body: "Your comment here") { id }
}
```

### Search items
```graphql
{ items_by_column_values(board_id: BOARD_ID, column_id: "name", column_value: "search term") { id name } }
```

### Move item to group
```graphql
mutation { move_item_to_group(item_id: ITEM_ID, group_id: "NEW_GROUP_ID") { id } }
```

### Create subitem
```graphql
mutation { create_subitem(parent_item_id: ITEM_ID, item_name: "Sub task") { id } }
```

## Column Types

| Type | JSON value |
|------|-----------|
| status | `{"label": "Done"}` |
| date | `{"date": "2026-04-24"}` |
| text | `"plain string"` |
| numbers | `"42"` |
| checkbox | `{"checked": "true"}` |
| dropdown | `{"labels": ["Option 1"]}` |
| timeline | `{"from": "2026-01-01", "to": "2026-03-31"}` |
| people | `{"personsAndTeams": [{"id": 12345, "kind": "person"}]}` |

## Make a call (bash example)
```bash
curl -s -X POST https://api.monday.com/v2 \
  -H "Authorization: $MONDAY_API_KEY" \
  -H "API-Version: 2024-01" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ boards(limit: 10) { id name } }"}'
```

## Rules

1. Call `boards` first to discover board IDs and column IDs before updates
2. Always confirm before deleting items
3. Status labels must match exactly what's configured in the board
4. Use `items_page` with cursor for boards with >500 items
