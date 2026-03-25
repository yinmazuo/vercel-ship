# Cloud Validation Log — 2026-03-25

## Scope

Sanitized GitHub + Vercel validation summary for all built-in `vercel-ship` demo scenarios:

- `marketing-site`
- `saas-mvp`
- `upload-app`

Validated chain:

- parse demo document
- generate recommended plan
- create GitHub repository
- create or confirm Vercel project
- publish starter files to GitHub default branch
- provision real Blob / Neon / Clerk resources where required
- trigger Vercel deployment from GitHub integration
- wait for deployment to become `READY`
- validate runtime access
- validate runtime health endpoints for provisioned resources

## Final Outcome

Status on March 25, 2026:

- all 3 built-in scenarios completed the full cloud chain successfully
- each demo produced a dedicated GitHub repository and Vercel project during validation
- each GitHub publish triggered a production deployment
- real Neon and Clerk resources were provisioned and connected to the SaaS project
- a real Blob store was provisioned and linked to the upload project
- all 3 deployments reached `READY`
- direct anonymous fetches were blocked by Vercel Authentication
- shareable Vercel access URLs returned `200` and the expected homepage content for all 3 demos
- resource-specific `/api/health` checks returned `200`

## Scenario Results

### marketing-site

GitHub repository:

- dedicated validation repository created

Vercel project:

- dedicated validation project created

Deployment:

- production deployment reached `READY`

Runtime validation:

- shareable URL returned `200`
- visible markers:
  - `VERCEL SHIP DEMO`
  - `Launch a story-shaped site before the rest of the stack lands.`
  - `Narrative-first landing page`

### saas-mvp

GitHub repository:

- dedicated validation repository created

Vercel project:

- dedicated validation project created

Deployment:

- production deployment reached `READY`

Runtime validation:

- shareable URL returned `200`
- visible markers:
  - `DEFAULT SAAS STARTER`
  - `OrbitDesk keeps the dashboard shell intact while auth and data wiring land later.`
  - `Auth: Clerk`
  - `Database: Neon`
- health endpoint:
  - returned `{"hasDatabaseUrl":true,"hasClerkSecretKey":true,"hasClerkPublishableKey":true,"dbOk":true,"dbError":null}`

Provisioned resources:

- Neon resource: `vercel-ship-neon-20260325`
- Clerk resource: `vercel-ship-clerk-20260325`
- Verified env keys:
  - `DATABASE_URL`
  - `CLERK_SECRET_KEY`
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

### upload-app

GitHub repository:

- dedicated validation repository created

Vercel project:

- dedicated validation project created

Deployment:

- production deployment reached `READY`

Runtime validation:

- shareable URL returned `200`
- visible markers:
  - `PixelDrop turns uploads into a product surface, not a generic form.`
  - `Storage: Vercel Blob`
  - `Drop files here once Blob is provisioned.`
- health endpoint:
  - returned `{"hasBlobReadWriteToken":true}`

Provisioned resources:

- Blob store: `vercel-ship-pixeldrop-store-final-20260325`
- Verified env key:
  - `BLOB_READ_WRITE_TOKEN`

## Issues Found And Fixed

### Issue 1: Project creation happened after the first GitHub publish

Observed:

- the initial implementation created the GitHub commit before the Vercel project existed
- result: no deployment was triggered for the first marketing attempt

Fix:

- changed `ship_demo_to_cloud.mjs` to create or confirm the Vercel project before publishing starter files
- reran the script to generate a new GitHub commit after project linkage

Result:

- later publishes triggered deployments immediately for all scenarios

### Issue 2: Successful deployment was still protected by Vercel Authentication

Observed:

- deployment state was `READY`
- direct fetch returned `401 Unauthorized`

Fix:

- documented deployment protection behavior in `references/deployment-protection.md`
- used Vercel MCP shareable URL flow for runtime verification

Result:

- protected deployment content was fetched successfully with status `200`

### Issue 3: Blob provisioning required a project-context link confirmation

Observed:

- `vercel blob create-store` created the store first
- it then prompted for project linking and environment selection
- this prompt did not fit a naive fire-and-forget automation path

Fix:

- validated the exact interactive sequence
- encoded Blob provisioning in `provision_resources.mjs` as a linked-project flow with prompt handling
- added explicit env validation for `BLOB_READ_WRITE_TOKEN`

Result:

- upload project now has a real linked Blob store and runtime-visible token

### Issue 4: Integration provisioning pulled `.env.local` into the skill workspace

Observed:

- default `vercel integration add` behavior pulled project env vars into the current directory
- this created an unwanted `.env.local` inside the skill root

Fix:

- removed the generated file
- changed the automated provisioning path to use `--no-env-pull`

Result:

- provisioning remains functional without polluting the skill workspace

## Commands And Tools Used

Local scripts:

```bash
node scripts/ship_demo_to_cloud.mjs --doc assets/demo-docs/marketing-site.md --repo <repo-name> --project <project-name>
node scripts/ship_demo_to_cloud.mjs --doc assets/demo-docs/saas-mvp.md --repo <repo-name> --project <project-name>
node scripts/ship_demo_to_cloud.mjs --doc assets/demo-docs/upload-app.md --repo <repo-name> --project <project-name>
node scripts/provision_resources.mjs --project-id <project-id> --project-name <project-name> --capability neon --capability clerk
node scripts/provision_resources.mjs --project-id <project-id> --project-name <project-name> --capability blob
```

Control-plane and verification tools:

- GitHub API through local script
- Vercel API through local script
- Vercel MCP for deployment status and protected runtime fetch

## Current Status

`vercel-ship` now has:

- local validation
- approval-plan rendering
- remote GitHub repo creation
- remote Vercel project creation
- real Neon / Clerk / Blob provisioning
- GitHub-triggered deployment validation
- deployment protection handling guidance
- real cloud validation across all built-in demo scenarios
- runtime health verification for provisioned resources
