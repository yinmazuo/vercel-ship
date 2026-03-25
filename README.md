# vercel-ship

[English](README.md) | [简体中文](README.zh-CN.md)

`vercel-ship` is a Codex skill that helps an agent turn project code or docs into a reviewable GitHub + Vercel release plan, then continue into deployment after approval:

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
├── .env.example
├── agents/
├── assets/
│   ├── demo-docs/
│   └── starters/
├── references/
├── records/
└── scripts/
```

## How To Use

This repository is meant to be used as a Codex skill.

Typical flow:

1. install `vercel-ship` into your Codex skills directory
2. prepare the required MCPs and credentials
3. ask the agent to use `vercel-ship` with your project path or a demo doc
4. review the generated plan
5. approve the plan
6. let the agent continue into GitHub and Vercel actions

## Requirements

- Node.js `20+`
- a Codex environment that supports local skills
- a GitHub account that can create repositories
- a Vercel account or team that can create projects and integrations

## Manual Prerequisites

Before you use the skill for real cloud actions, prepare these items manually:

- configure `GitHub MCP`
- configure `Vercel MCP`
- provide these environment variables in the shell used by the agent:
  - `GITHUB_TOKEN`
  - `GITHUB_OWNER`
  - `VERCEL_TOKEN`
  - `VERCEL_TEAM_ID`
- if your Vercel CLI integration flow needs it, also provide:
  - `VERCEL_SCOPE`

The repository includes [.env.example](.env.example) as a template, but you are expected to fill in your own values locally.

## Required MCPs

- `GitHub MCP`
- `Vercel MCP`

These are the only MCPs required for the current first version.

## Installation

Install dependencies:

```bash
npm install
```

The repository does not vendor `node_modules`.

Install or copy the repository into your Codex skills directory as `vercel-ship`, then let the agent trigger it by name.

## What The User Needs To Provide

At minimum, the user should provide one of these:

- a project path
- a design doc or PRD path
- a demo doc under `assets/demo-docs`

For cloud execution, the user should also be ready to approve:

- GitHub repository creation
- GitHub code publishing
- Vercel project creation
- Vercel resource provisioning when required

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
