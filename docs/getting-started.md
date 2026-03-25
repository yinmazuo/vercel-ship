# Getting Started

This repository supports two usage modes.

## Mode 1: Run the Scripts Directly

Use this mode if you want to validate plans, materialize starters, or publish demo projects with the bundled Node.js scripts.

### Prerequisites

- Node.js `20+`
- `npm install`
- a GitHub token
- a Vercel token
- a Vercel team or personal scope

### Configure Environment Variables

1. Copy the template:

```bash
cp .env.example .env.local
```

2. Load the values into your shell:

```bash
export $(grep -v '^#' .env.local | xargs)
```

Or export them manually:

```bash
export GITHUB_TOKEN=...
export GITHUB_OWNER=...
export VERCEL_TOKEN=...
export VERCEL_TEAM_ID=...
export VERCEL_SCOPE=...
```

### Minimal Flow

1. Install dependencies:

```bash
npm install
```

2. Run local validation:

```bash
npm run validate:local
```

3. Generate a plan:

```bash
node scripts/generate_recommended_plan.mjs --doc assets/demo-docs/saas-mvp.md
```

4. Publish a demo starter:

```bash
node scripts/ship_demo_to_cloud.mjs \
  --doc assets/demo-docs/marketing-site.md \
  --owner "$GITHUB_OWNER" \
  --repo vercel-ship-demo-marketing \
  --project vercel-ship-demo-marketing
```

5. Provision real resources when the plan requires them:

```bash
node scripts/provision_resources.mjs \
  --project-id <vercel-project-id> \
  --project-name <vercel-project-name> \
  --scope "$VERCEL_SCOPE" \
  --capability neon \
  --capability clerk
```

## Mode 2: Use It as a Codex Skill

Use this mode if you want an agent to read project code or demo docs, generate a reviewable plan, validate changes, and continue into deployment after approval.

### Install the Skill

The repository root is the skill folder. Install or copy it into your Codex skills directory as `vercel-ship`.

Example layout:

```text
$CODEX_HOME/skills/vercel-ship/
├── SKILL.md
├── assets/
├── references/
└── scripts/
```

### Recommended Agent Setup

- configure `GitHub MCP` for repository creation and repository inspection
- configure `Vercel MCP` for team discovery, project inspection, deployment inspection, and protected deployment verification
- keep the shell environment variables available if the agent will execute the bundled Node.js scripts

See [mcp-requirements.md](mcp-requirements.md) for details.

## Environment Variable Reference

### `GITHUB_TOKEN`

Used by `scripts/ship_demo_to_cloud.mjs` to:

- create the GitHub repository if it does not already exist
- commit starter files through the GitHub API

Use a token that can create repositories and write contents. A classic token with `repo` scope is the simplest option.

### `GITHUB_OWNER`

The GitHub user or organization name that owns the target repository.

Example:

```bash
export GITHUB_OWNER=your-github-login
```

### `VERCEL_TOKEN`

Used by:

- `scripts/ship_demo_to_cloud.mjs`
- `scripts/provision_resources.mjs`

The token must be able to create projects and attach integrations in the chosen Vercel account.

### `VERCEL_TEAM_ID`

Used for Vercel REST API calls and linked project context.

Example values:

- `team_xxx`
- a personal scope id if you are using a personal Vercel account

### `VERCEL_SCOPE`

Used by Vercel CLI integration commands in `scripts/provision_resources.mjs`.

This is usually the team slug or the scope name shown by Vercel CLI and the dashboard.

## Common Questions

### Do I need MCP just to run the local scripts?

No. Local planning and direct script execution only require the environment variables above.

### Do I need MCP for full agent-driven cloud execution?

Yes, that is the recommended setup. The skill can still run bundled scripts, but the best user experience comes from combining the scripts with GitHub MCP and Vercel MCP.

### Which flow should I try first?

Start with:

- `npm run validate:local`
- `node scripts/generate_recommended_plan.mjs --doc assets/demo-docs/marketing-site.md`

Then move to `ship_demo_to_cloud.mjs` once the local flow is clear.
