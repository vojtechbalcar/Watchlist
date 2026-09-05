---
name: mcp-config-leading-space-gotcha
description: A GitHub MCP plugin token appeared ignored because the config file was named " .mcp.json" with a leading space; the real fix was an env var, not a .mcp.json.
metadata:
  type: reference
---

**Symptom** (2026-09-04): the `github@claude-plugins-official` plugin kept
erroring `Missing environment variables: GITHUB_PERSONAL_ACCESS_TOKEN` even
after the token was added to what looked like `.mcp.json`.

**Cause — two independent problems:**

1. The file was actually named `" .mcp.json"` with a **leading space**, so
   Claude Code's glob never matched it. `cat .mcp.json` returned empty and
   `git ls-files` reported no such path, which is the tell.
2. Even correctly named, a `.mcp.json` was the wrong mechanism. The `github`
   server is declared by the *plugin's own manifest*, which reads
   `${GITHUB_PERSONAL_ACCESS_TOKEN}` from the environment. Declaring a server
   in `.mcp.json` would have created a duplicate.

**Fix:** put the token in `.claude/settings.local.json` under `env`, then
restart the session (env is read at startup).

**What didn't work / near-misses:**

- Editing the file's contents to valid JSON — irrelevant while misnamed.
- `.gitignore` had the *same* leading-space typo (`" .mcp.json"`), so a
  correctly named `.mcp.json` would have been committable. Both that and
  `.claude/settings.local.json` are now properly ignored.
- The stray file had been `git add`-ed (`git status` showed `AD`), so the token
  was sitting in the index as a blob. Cleared with `git rm --cached`; verified
  never committed.

**Check first next time:** `ls | od -c` on the filename, and
`git check-ignore -v <path>` to confirm an ignore rule actually binds.
