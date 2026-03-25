---
name: vercel-ship
description: Generate a default GitHub + Vercel release plan from project code, technical design docs, or demo docs, choose an appropriate starter and Vercel capability set, and run pre-deployment validation before executing after approval. Use when the user wants a reviewable plan first, may edit the plan, and then continue into deployment.
---

# vercel-ship

Use this skill when:

- the user wants to release a finished or starter-ready web project to GitHub and Vercel
- the user wants a default plan based on stack, design docs, or demo docs
- the user wants free-tier-first defaults where possible
- the user wants to start from a starter and continue development after deployment
- the user allows GitHub / Vercel mutations after approval

First-version scope:

- scenarios: `marketing`, `saas`, `upload`
- starters: `nextjs-marketing-starter`, `nextjs-saas-starter`, `nextjs-blob-upload-starter`
- capabilities: `blob`, `edge-config`, `neon`, `clerk`
- default strategy: prefer free starting plans and only enable capabilities supported by rules and detected facts
- real resource provisioning: `blob`, `neon`, `clerk`

## Workflow

1. Collect inputs first:
   - a project path, or
   - a design doc / PRD path, or
   - a demo doc under `assets/demo-docs`
2. Run `scripts/generate_recommended_plan.mjs` to build the default plan.
3. Present the recommended plan and explain:
   - recommended starter
   - recommended capabilities
   - why they were chosen
   - free-tier assumptions
   - risks and missing pieces
4. If the user edits the plan, run `scripts/validate_plan.mjs`.
5. Continue only if the result is `valid` or an accepted `valid_with_warnings`.
6. For immediate demos, use `scripts/materialize_starter.mjs` to copy the starter into a target directory.
7. Run local build validation for the target directory before cloud release actions.
8. If the plan includes real resources, run `scripts/provision_resources.mjs`.
9. Trigger a fresh deployment after resources are connected and run runtime health checks.

## Required Outputs

Every execution should produce at least:

- `analysis-summary.md` or an equivalent summary
- `recommended-plan.json`
- `approval-plan.md` or an equivalent approval summary
- `validated-plan.json` if the user edits the plan
- a real starter directory if a starter is used

## Approval Policy

Before approval, only do the following:

- read code and documents
- generate the default plan
- validate user edits
- copy the starter into a new directory
- run local build validation

Only after approval may the skill perform external mutations, such as:

- create a GitHub repository
- push code
- create a Vercel project
- deploy to Vercel
- configure project-level environment variables

## Safety Rules

- do not force-push by default
- do not delete remote repositories or projects by default
- do not assume production domains are already prepared
- do not write secrets into repository files
- stop and report when the starter is incompatible with the edited capability set

## Demo Assets

For direct demos, prefer these resources:

- scenario docs: `assets/demo-docs`
- starter templates: `assets/starters`

Read these first:

- `references/demo-scenarios.md`
- `references/starter-catalog.md`
- `references/decision-matrix.md`
- `references/validation-rules.md`

## Validation

Local end-to-end validation entry point:

- `scripts/run_demo_validation.mjs`

Real cloud release entry points:

- `scripts/ship_demo_to_cloud.mjs`
- `scripts/provision_resources.mjs`

The validation flow:

- reads demo docs
- generates a default plan
- validates the plan
- copies the starter into a temp directory
- optionally runs `npm install` and `npm run build`

For real cloud execution, also enforce:

- create the GitHub repo first
- create or confirm the Vercel project first
- publish starter code to the default branch afterward so GitHub push triggers deployment
- use `vercel integration add ... --plan <free plan> --no-env-pull` for `neon` and `clerk`
- create `blob` stores from a linked project context and attach `BLOB_READ_WRITE_TOKEN` to the project
- if the deployment is protected by `Vercel Authentication`, verify it through a Vercel MCP shareable URL or protected fetch path

Treat a passing local validation run as the prerequisite for real GitHub / Vercel release actions.
