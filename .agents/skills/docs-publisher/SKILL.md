---
name: docs-publisher
description: Use when updating public MyCoding Book HTML learning pages, reference pages, update notes, or search/navigation metadata from verified sources. Use for Codex, agentic coding, MCP, skills, hooks, browser verification, and legacy-to-public-doc maintenance. Do not use for private playbook-only notes or unpublished personal research.
---

# Docs Publisher

## Purpose

Maintain MyCoding Book as a public HTML learning site. Keep pages readable, source-grounded, linkable, and deployable.

## Default Workflow

1. Identify the public page or metadata that should change.
2. Check current local content before editing.
3. Verify unstable facts against official or primary sources.
4. Keep private notes, personal paths, credentials, customer data, and unpublished research out of public HTML and skill assets.
5. Edit the smallest relevant HTML, config, reference, or update file.
6. Update navigation, search metadata, content audit, legacy map, and next queue items when the change affects them.
7. Validate the changed surface with the narrowest useful checks.
8. Report changed pages, source links, validation results, deployment status if pushed, and the next queue item.

## Source Rules

- Prefer official documentation for Codex, OpenAI APIs, Cloudflare, Vercel, GitHub, or other tool behavior.
- For current product behavior, changelogs, model names, feature maturity, pricing, or deployment state, verify before writing.
- Clearly separate source-backed facts from personal operating policy.
- Do not copy long passages from sources. Summarize and link.

## Editing Rules

- Public reading pages are HTML, not Markdown.
- Keep legacy Claude material labeled as legacy unless it has been rewritten against current Codex or official sources.
- Preserve existing visual structure: header, `page-shell`, `page-header`, `content-section`, tables, and `doc-toc.js`.
- When adding a new page, update the lightweight catalog used for cards/search/navigation.
- When moving a task from queue to done, update the audit page and any page that repeats the queue.
- Do not create a new planning document for a small follow-up; use existing audit, roadmap, update routine, or legacy map pages.

## Validation

Run the narrowest checks that match the change:

- JavaScript metadata changed: `node --check` for touched JS files.
- HTML links changed: check local `href` and `src` targets for touched HTML files.
- Public content changed: search for accidental private paths, secrets, local-only project names, and unpublished notes.
- Browser-facing layout changed: verify key page text at local or deployed URL, and use browser/MCP evidence when layout risk is meaningful.
- Before reporting completion: `git diff --check`.

## Completion Format

Report:

- Pages or skill files changed.
- Official or primary sources used.
- Validation checks run.
- Deployment status and public URL when pushed.
- Remaining risk or next queue item.

## Escalation Boundary

This skill may recommend staging, committing, pushing, or checking deployment status, but it must not assume those actions are already approved. Follow the active environment approval rules.
