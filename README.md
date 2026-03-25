# vercel-ship

[English](README.md) | [简体中文](README.zh-CN.md)

`vercel-ship` is an open skill bundle for Codex-style agents that turns a deployment request into a controlled release workflow:

- analyze a project or demo specification
- recommend a starter and capability set
- render an approval-ready plan
- validate user edits
- publish a starter to GitHub
- create a Vercel project
- provision real Vercel resources when required
- verify the deployed result

The current first public version ships with three built-in demo scenarios:

- `marketing-site`
- `saas-mvp`
- `upload-app`

## What It Covers

`vercel-ship` currently supports:

- starter recommendation from structured docs
- local starter materialization and build validation
- GitHub repository creation and file publishing
- Vercel project creation
- real `Neon` provisioning for database-backed demos
- real `Clerk` provisioning for auth-backed demos
- real `Blob` provisioning for upload demos
- protected deployment verification through Vercel share links
- runtime health checks for provisioned resources

## What It Does Not Yet Cover

- custom domains
- monorepo project selection
- production migration workflows
- advanced enterprise SSO and compliance flows
- full application-layer provider wiring beyond the current demo scope

Resource provisioning is real. Application-layer business integration is still intentionally minimal.

## Repository Layout

```text
vercel-ship/
├── SKILL.md
├── README.md
├── README.zh-CN.md
├── LICENSE
├── docs/
├── agents/
├── assets/
│   ├── demo-docs/
│   └── starters/
├── references/
├── records/
└── scripts/
```

## Usage Modes

You can use this repository in two ways:

- `script mode`: run the bundled Node.js scripts directly
- `skill mode`: install the repository as a Codex skill and let the agent use the bundled references and scripts

For first-time setup, start with [docs/getting-started.md](docs/getting-started.md).

## Requirements

- Node.js `20+`
- GitHub access token with repository write permission
- Vercel access token
- A Vercel team or personal scope where projects and integrations can be created

## Environment Variables

Required environment variables for cloud actions:

- `GITHUB_TOKEN`
- `GITHUB_OWNER` or `--owner`
- `VERCEL_TOKEN`
- `VERCEL_TEAM_ID`

Optional:

- `VERCEL_SCOPE`

Use the included template:

```bash
cp .env.example .env.local
export $(grep -v '^#' .env.local | xargs)
```

Variable meaning:

- `GITHUB_TOKEN`: used by `ship_demo_to_cloud.mjs` to create repositories and commit starter files
- `GITHUB_OWNER`: target GitHub user or organization
- `VERCEL_TOKEN`: used by Vercel API and CLI actions
- `VERCEL_TEAM_ID`: target Vercel team id or personal scope id
- `VERCEL_SCOPE`: team slug or scope name used by Vercel CLI integration commands

## MCP Requirements

For direct script execution, no MCP is required.

For agent-driven end-to-end usage, configure:

- `GitHub MCP`
- `Vercel MCP`

See [docs/mcp-requirements.md](docs/mcp-requirements.md) for the exact split between script-only and agent-driven workflows.

## Install

Install dependencies:

```bash
npm install
```

The repository intentionally does not vendor `node_modules`.

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env.local
export $(grep -v '^#' .env.local | xargs)
```

3. Run local validation:

```bash
npm run validate:local
```

4. Generate a plan:

```bash
node scripts/generate_recommended_plan.mjs --doc assets/demo-docs/marketing-site.md
```

5. Publish a demo starter when you are ready for cloud actions:

```bash
node scripts/ship_demo_to_cloud.mjs \
  --doc assets/demo-docs/marketing-site.md \
  --owner "$GITHUB_OWNER" \
  --repo vercel-ship-demo-marketing \
  --project vercel-ship-demo-marketing
```

## Local Usage

Generate a recommended plan from a demo doc:

```bash
node scripts/generate_recommended_plan.mjs --doc assets/demo-docs/saas-mvp.md
```

Render an approval summary:

```bash
node scripts/render_approval_plan.mjs --plan /tmp/vercel-ship-validation/marketing-site.plan.json
```

Run local validation for all demos:

```bash
node scripts/run_demo_validation.mjs
```

Provision resources for an existing Vercel project:

```bash
node scripts/provision_resources.mjs \
  --project-id <vercel-project-id> \
  --project-name <vercel-project-name> \
  --scope <vercel-scope> \
  --capability neon \
  --capability clerk
```

Publish a demo starter to GitHub and Vercel:

```bash
node scripts/ship_demo_to_cloud.mjs \
  --doc assets/demo-docs/marketing-site.md \
  --owner <github-owner> \
  --repo <github-repo-name> \
  --project <vercel-project-name>
```

## Demo Scenarios

### marketing-site

- recommended starter: `nextjs-marketing-starter`
- default capabilities: optional `edge-config`

### saas-mvp

- recommended starter: `nextjs-saas-starter`
- default capabilities: `neon`, `clerk`, optional `edge-config`

### upload-app

- recommended starter: `nextjs-blob-upload-starter`
- default capabilities: `blob`

## Open Source Notes

This repository is designed for public release:

- no secrets are committed
- no generated `.env.local` files are kept
- no `node_modules` directory is included
- validation records are sanitized and do not depend on live personal share URLs

Before publishing:

- verify your repository history does not contain credentials
- rotate any tokens used during validation if they were ever exposed outside your machine
- review cloud validation records and replace any organization-specific names if needed

## Validation

Two validation logs are included:

- [records/validation-2026-03-25.md](records/validation-2026-03-25.md)
- [records/cloud-validation-2026-03-25.md](records/cloud-validation-2026-03-25.md)

The first covers local validation. The second covers real GitHub, Vercel, Blob, Neon, and Clerk provisioning.

## License

MIT. See [LICENSE](LICENSE).

## Additional Reading

- [docs/getting-started.md](docs/getting-started.md)
- [docs/mcp-requirements.md](docs/mcp-requirements.md)
- [docs/command-reference.md](docs/command-reference.md)
- [docs/troubleshooting.md](docs/troubleshooting.md)
