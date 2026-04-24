---
name: llm-wiki
description: "Persistent evolving knowledge base (Karpathy LLM Wiki pattern) — Anton incrementally builds and maintains a structured wiki of markdown files from files, notes, and web sources. Use when the user wants to ingest a source, query accumulated knowledge, or health-check the wiki. Anton owns the wiki entirely; the user curates sources and asks questions."
metadata: { "openclaw": { "emoji": "🧠", "requires": { "env": [] }, "install": [] } }
allowed-tools: ["bash", "web_fetch"]
---

# LLM Wiki — Persistent Agent Knowledge Base

Based on Andrej Karpathy's LLM Wiki pattern (gist: karpathy/442a6bf555914893e9891c11519de94f).

The core idea: instead of RAG (retrieve raw chunks at query time), Anton **incrementally builds
and maintains a persistent wiki** — a structured, interlinked collection of markdown files.
When a new source arrives, Anton reads it, extracts key information, and integrates it into the
existing wiki: updating entity pages, revising summaries, noting contradictions, strengthening synthesis.

**The wiki is a persistent, compounding artifact.** It grows richer with every source and question.
Anton never loses knowledge to chat history.

---

## Storage layout

```
~/.openclaw/wiki/
  schema.md         # conventions, page types, workflow rules (co-evolved with user)
  index.md          # content-oriented catalog — every page, one-line summary, by category
  log.md            # append-only chronological record of ingests, queries, lint passes
  sources/          # raw sources (articles, files, PDFs) — immutable, Anton reads only
  pages/            # LLM-generated wiki pages — Anton owns, creates, and updates these
    overview.md
    <entity>.md
    <concept>.md
    ...
```

---

## Three layers

**Raw sources** (`sources/`) — immutable. Articles, papers, data files. Anton reads but never modifies.

**The wiki** (`pages/`) — Anton owns entirely. Summaries, entity pages, concept pages, comparisons, synthesis.

**The schema** (`schema.md`) — tells Anton how the wiki is structured and how to maintain it. Co-evolved over time.

---

## Page format

```markdown
---
title: <Title>
type: entity | concept | summary | comparison | analysis | overview
tags: [tag1, tag2]
sources: [source-file-or-url]
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# <Title>

## Summary

One paragraph synthesis.

## Key Facts

- Fact one
- Fact two

## Connections

- [[other-page]] — why they're related
- [[another-page]] — relationship

## Contradictions / Open Questions

Any conflicts with other wiki pages, or gaps to fill.

## Source Notes

Direct quotes or key data points from sources.
```

---

## Operations

### Ingest a source

When the user adds a source (file, URL, pasted text):

1. Read the source
2. Discuss key takeaways with the user
3. Write a summary page in `pages/`
4. Update `index.md` — add the new page with one-line summary
5. Update any existing entity/concept pages touched by this source
6. Append to `log.md`: `## [YYYY-MM-DD] ingest | <Source Title>`
7. A single source typically touches 5–15 wiki pages

```bash
# Read a local file
cat ~/.openclaw/wiki/sources/<filename>

# List existing pages to find what needs updating
ls ~/.openclaw/wiki/pages/
cat ~/.openclaw/wiki/pages/index.md
```

### Query the wiki

When the user asks a question:

1. Read `index.md` to identify relevant pages
2. Read those pages
3. Synthesize an answer with citations to page names
4. If the answer reveals new synthesis worth keeping, offer to file it as a new page

```bash
# Search for relevant pages
grep -r "$QUERY" ~/.openclaw/wiki/pages/ --include="*.md" -l
grep -r "$QUERY" ~/.openclaw/wiki/pages/ --include="*.md" -C2
cat ~/.openclaw/wiki/pages/index.md
```

### Lint the wiki

Health-check on request:

```bash
# Find orphan pages (no inbound links)
for page in ~/.openclaw/wiki/pages/*.md; do
  name=$(basename "$page" .md)
  count=$(grep -r "\[\[$name\]\]" ~/.openclaw/wiki/pages/ --include="*.md" | wc -l)
  echo "$count $name"
done | sort -n | head -20

# Find pages not listed in index
ls ~/.openclaw/wiki/pages/ | grep -v "^index\|^overview\|^log\|^schema" | while read f; do
  grep -q "${f%.md}" ~/.openclaw/wiki/pages/index.md || echo "Missing from index: $f"
done
```

Check for:

- Contradictions between pages
- Stale claims
- Orphan pages with no inbound links
- Important concepts missing their own page
- Missing cross-references

### Initialize wiki (first run)

```bash
mkdir -p ~/.openclaw/wiki/pages ~/.openclaw/wiki/sources

cat > ~/.openclaw/wiki/pages/index.md << 'EOF'
# Wiki Index

## Overview
- [[overview]] — High-level summary of this knowledge base

EOF

cat > ~/.openclaw/wiki/log.md << 'EOF'
# Wiki Log

EOF

cat > ~/.openclaw/wiki/schema.md << 'EOF'
# Wiki Schema

Page types: entity, concept, summary, comparison, analysis, overview
Link syntax: [[page-name]]
Source files go in: sources/
Wiki pages go in: pages/
EOF

echo "Wiki initialized at ~/.openclaw/wiki/"
```

---

## Rules Anton follows

1. **Read index.md first** before answering any knowledge question
2. **Touch all relevant pages** on every ingest — one source may update 10+ pages
3. **Bidirectional links** — when linking A→B, also add B→A
4. **Never delete** — mark outdated content with `> ⚠️ Outdated as of YYYY-MM-DD` and note what supersedes it
5. **Log everything** — every ingest, query, and lint gets an entry in `log.md`
6. **File valuable synthesis** — if a query produces useful analysis, offer to save it as a wiki page
7. **Flag contradictions** — when new info conflicts with existing pages, note it in both

---

## Why this works (from Karpathy)

> "The tedious part of maintaining a knowledge base is bookkeeping. Updating cross-references,
> keeping summaries current, noting when new data contradicts old claims. Humans abandon wikis
> because maintenance burden grows faster than value. LLMs don't get bored, don't forget to
> update a cross-reference, and can touch 15 files in one pass."
>
> "The human's job: curate sources, direct analysis, ask good questions.
> The LLM's job: everything else."

This is Vannevar Bush's 1945 Memex vision — a personal, curated knowledge store with
associative trails. The part Bush couldn't solve was maintenance. Anton handles that.
