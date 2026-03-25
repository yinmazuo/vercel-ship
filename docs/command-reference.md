# Command Reference

This repository ships with a small set of focused scripts. Use them in this order.

## Planning

### `scripts/generate_recommended_plan.mjs`

Generates a default plan from a demo doc or a structured project description.

Example:

```bash
node scripts/generate_recommended_plan.mjs --doc assets/demo-docs/saas-mvp.md
```

### `scripts/render_approval_plan.mjs`

Renders a human-readable summary from a generated plan JSON file.

Example:

```bash
node scripts/render_approval_plan.mjs --plan /tmp/vercel-ship-validation/marketing-site.plan.json
```

### `scripts/validate_plan.mjs`

Validates a plan after the user edits it.

Example:

```bash
node scripts/validate_plan.mjs --plan /tmp/vercel-ship-validation/marketing-site.plan.json
```

## Starter Preparation

### `scripts/materialize_starter.mjs`

Copies a starter template into a target directory so it can become a real project.

Example:

```bash
node scripts/materialize_starter.mjs \
  --starter nextjs-marketing-starter \
  --out /tmp/vercel-ship-demo
```

### `scripts/run_demo_validation.mjs`

Runs the local end-to-end validation flow against the built-in demo scenarios.

Example:

```bash
node scripts/run_demo_validation.mjs
```

## Cloud Release

### `scripts/ship_demo_to_cloud.mjs`

Creates or reuses a GitHub repository, creates or reuses a Vercel project, and publishes starter files so the GitHub push triggers deployment.

Required env vars:

- `GITHUB_TOKEN`
- `GITHUB_OWNER` or `--owner`
- `VERCEL_TOKEN`
- `VERCEL_TEAM_ID`

Example:

```bash
node scripts/ship_demo_to_cloud.mjs \
  --doc assets/demo-docs/marketing-site.md \
  --owner "$GITHUB_OWNER" \
  --repo vercel-ship-demo-marketing \
  --project vercel-ship-demo-marketing
```

### `scripts/provision_resources.mjs`

Attaches real Vercel-side resources to an existing project.

Required env vars:

- `VERCEL_TOKEN`
- `VERCEL_TEAM_ID`
- `VERCEL_SCOPE` or `--scope`

Example:

```bash
node scripts/provision_resources.mjs \
  --project-id <vercel-project-id> \
  --project-name <vercel-project-name> \
  --scope "$VERCEL_SCOPE" \
  --capability neon \
  --capability clerk
```

Supported capabilities:

- `neon`
- `clerk`
- `blob`
