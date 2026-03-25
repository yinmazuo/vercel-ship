# MCP Requirements

This repository can be used in two different ways:

- as a script bundle
- as a Codex skill used by an agent

MCP is only needed for the second mode.

## Summary

### No MCP Required

These actions work with Node.js scripts and environment variables only:

- generate a recommended plan
- render an approval summary
- validate a plan
- materialize a starter
- run local starter validation
- publish a starter through the bundled GitHub and Vercel API scripts
- provision Vercel resources through the bundled Vercel CLI script

### Recommended MCPs for Agent-Driven Usage

- `GitHub MCP`
- `Vercel MCP`

No other MCP is required for the current first version.

## GitHub MCP

Use GitHub MCP when the agent needs to:

- inspect an existing repository
- create a repository
- inspect pull requests or issues
- verify repository state during a guided release flow

Typical GitHub MCP capabilities used around this skill:

- repository discovery
- repository creation
- file inspection
- pull request inspection

The bundled `ship_demo_to_cloud.mjs` script can create and populate repositories without GitHub MCP, but GitHub MCP makes the interactive agent workflow easier to audit and reason about.

## Vercel MCP

Use Vercel MCP when the agent needs to:

- list teams and projects
- inspect deployments
- inspect build logs
- inspect runtime logs
- access protected deployments through shareable URLs

Typical Vercel MCP capabilities used around this skill:

- `list_teams`
- `list_projects`
- `get_project`
- `list_deployments`
- `get_deployment`
- `get_deployment_build_logs`
- `get_runtime_logs`
- `get_access_to_vercel_url`
- `web_fetch_vercel_url`

The bundled scripts still rely on `VERCEL_TOKEN` for direct REST API and CLI actions. Vercel MCP complements that flow by making agent-side inspection and verification much better.

## Recommended Setup Matrix

### Plan-only workflow

- MCP: none
- env vars: none

### Local validation workflow

- MCP: none
- env vars: none

### Script-driven cloud publishing workflow

- MCP: none
- env vars: `GITHUB_TOKEN`, `GITHUB_OWNER`, `VERCEL_TOKEN`, `VERCEL_TEAM_ID`
- optional env vars: `VERCEL_SCOPE`

### Agent-driven end-to-end workflow

- MCP: `GitHub MCP` and `Vercel MCP`
- env vars: same as script-driven cloud workflow if the agent will execute the bundled scripts

## What Is Still Outside MCP Scope

The current first version does not require MCP for:

- Neon provisioning logic
- Clerk provisioning logic
- Blob store creation logic

Those actions are currently executed by the bundled Node.js and Vercel CLI scripts.
