# vercel-ship

[English](README.md) | [简体中文](README.zh-CN.md)

`vercel-ship` is a delivery-oriented Codex skill that automatically generates a complete GitHub + Vercel release plan from project code or product docs, including starter, capability, and cloud service selection.

It lets an agent read project code or product docs, generate a reviewable GitHub + Vercel release plan, and only continue into real release actions after approval.

## When To Use It

Use this skill when you need:

- a default release plan before any cloud mutation happens
- starter and capability recommendations from code or structured docs
- a minimal GitHub + Vercel release path for demos or MVPs
- a clear approval gate before repository, project, or resource creation

The first version ships with three built-in demo scenarios:

- `marketing-site`
- `saas-mvp`
- `upload-app`

## What The Skill Covers

The current version supports:

- inferring a scenario from structured docs
- recommending a starter and capability set
- generating an approval-ready release plan
- validating user-edited plans
- creating a GitHub repository and publishing a starter after approval
- creating a Vercel project after approval
- provisioning real `Neon`, `Clerk`, and `Blob` resources when needed
- verifying protected deployments and runtime health

The current version does not cover:

- custom domain automation
- monorepo project selection
- production database migration
- enterprise SSO / compliance workflows
- broad application-layer provider wiring beyond the demo scope

Resource provisioning is real. Application-layer integration is intentionally minimal.

## How To Use This Skill

This repository is meant to be installed and used as a skill, not treated primarily as a standalone command-line tool.

Typical flow:

1. Install or copy `vercel-ship` into your local Codex skills directory.
2. Install dependencies:

```bash
npm install
```

3. Configure `GitHub MCP` and `Vercel MCP`.
4. Provide the required environment variables in the shell used by the agent.
5. Ask the agent to use `vercel-ship` with:
   - a project path, or
   - a design doc / PRD path, or
   - a demo doc under `assets/demo-docs`
6. Review the generated recommendation and approval plan.
7. Only after approval should the skill continue into GitHub and Vercel mutations.

Requests that fit this skill well look like:

- "Use `vercel-ship` to generate a release plan from this PRD"
- "Use `vercel-ship` and recommend the right starter and capabilities for this project"
- "Use `vercel-ship` to produce an approval-ready GitHub + Vercel release plan"

## MCPs And Environment

The first version depends on two MCPs:

- `GitHub MCP`
- `Vercel MCP`

Recommended official references:

- GitHub MCP Server: https://github.com/github/github-mcp-server
- GitHub Personal Access Token docs: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
- Vercel MCP: https://vercel.com/docs/ai-tooling/vercel-mcp
- MCP overview: https://vercel.com/docs/mcp

The agent shell also needs these environment variables:

| Variable | Required | Purpose |
| --- | --- | --- |
| `GITHUB_TOKEN` | Yes | GitHub authentication and repository actions |
| `GITHUB_OWNER` | Yes | Target GitHub user or organization |
| `VERCEL_TOKEN` | Yes | Vercel authentication and project actions |
| `VERCEL_TEAM_ID` | Yes | Team or personal scope id used by the Vercel API |
| `VERCEL_SCOPE` | Needed for provisioning | Used by Vercel CLI integration provisioning flows |

Use [.env.example](.env.example) as the template.

Related docs:

- Vercel Environment Variables: https://vercel.com/docs/environment-variables
- Managing environment variables: https://vercel.com/docs/environment-variables/managing-environment-variables
- Vercel Blob: https://vercel.com/docs/vercel-blob
- Edge Config: https://vercel.com/docs/edge-config/get-started
- Neon on Vercel Marketplace: https://vercel.com/marketplace/neon
- Clerk on Vercel Marketplace: https://vercel.com/marketplace/clerk

## Skill Workflow

`vercel-ship` follows this workflow:

1. Collect a project or doc input.
2. Generate the default recommended plan.
3. Explain the recommended starter, capabilities, assumptions, and risks.
4. Produce an approval-ready summary.
5. If the user edits the plan, validate the edited version.
6. Materialize the starter locally and run build validation.
7. Only after approval, perform GitHub and Vercel mutations.
8. If real resources are enabled, provision them and verify the deployment.

That approval boundary is part of the skill design:

- Before approval: read-only analysis, plan generation, plan validation, local starter validation
- After approval: repository creation, code publishing, Vercel project creation, resource injection, deployment

## Demo Scenarios

| Scenario | Recommended Starter | Default Capabilities | Notes |
| --- | --- | --- | --- |
| `marketing-site` | `nextjs-marketing-starter` | optional `edge-config` | landing pages, brand sites, content-first sites |
| `saas-mvp` | `nextjs-saas-starter` | `clerk`, `neon`, optional `edge-config` | dashboard-style SaaS MVP |
| `upload-app` | `nextjs-blob-upload-starter` | `blob`, optional `clerk` | upload, gallery, and media demos |

Relevant references:

- [references/demo-scenarios.md](references/demo-scenarios.md)
- [references/starter-catalog.md](references/starter-catalog.md)
- [references/decision-matrix.md](references/decision-matrix.md)
- [references/validation-rules.md](references/validation-rules.md)

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

Suggested reading order:

1. [SKILL.md](SKILL.md)
2. [references/demo-scenarios.md](references/demo-scenarios.md)
3. [references/starter-catalog.md](references/starter-catalog.md)
4. [references/decision-matrix.md](references/decision-matrix.md)
5. [references/validation-rules.md](references/validation-rules.md)

## About `scripts/`

The `scripts/` directory contains implementation entrypoints, validation helpers, and maintenance utilities for the skill.

The current scripts exist mainly to support:

- plan generation
- approval-plan rendering
- plan validation
- starter materialization
- local validation
- cloud demo validation

If you are maintaining this skill, or doing local validation and debugging, that is the right time to inspect `scripts/`.

## Validation

Two validation logs are included:

- [records/validation-2026-03-25.md](records/validation-2026-03-25.md)
- [records/cloud-validation-2026-03-25.md](records/cloud-validation-2026-03-25.md)

The first covers local validation. The second covers real GitHub, Vercel, Blob, Neon, and Clerk provisioning.

## Open Source Notes

This repository is prepared for public release:

- no secrets are committed
- no generated `.env.local` files are kept
- no `node_modules` directory is included
- validation records are sanitized and do not depend on personal share URLs

Before publishing, still verify:

- repository history contains no credentials
- any exposed tokens have been rotated
- cloud validation records do not contain org-specific names or sensitive links

## License

MIT. See [LICENSE](LICENSE).
