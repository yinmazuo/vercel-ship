# Validation Log — 2026-03-25

## Scope

Local end-to-end validation of the first `vercel-ship` slice:

- demo document parsing
- recommended plan generation
- rule-based plan validation
- starter materialization
- starter dependency install
- starter production build
- negative-path validation for user-edited plans

This validation intentionally stops before live GitHub or Vercel mutations. It proves the decision and pre-deployment chain the skill depends on.

## Final Outcome

Status on March 25, 2026:

- all 3 built-in demo scenarios generated valid recommended plans
- all 3 starters materialized successfully into `/tmp/vercel-ship-validation`
- all 3 starters completed `npm install`
- all 3 starters completed `npm run build`
- an intentionally broken SaaS plan was rejected as `invalid`

## Demo Scenarios Verified

### marketing-site

- recommended starter: `nextjs-marketing-starter`
- recommended capabilities: `edge-config`
- validation result: `valid`
- build result: passed

### saas-mvp

- recommended starter: `nextjs-saas-starter`
- recommended capabilities: `clerk`, `neon`, `edge-config`
- validation result: `valid`
- build result: passed

### upload-app

- recommended starter: `nextjs-blob-upload-starter`
- recommended capabilities: `blob`
- validation result: `valid`
- build result: passed

## Negative Validation Check

Input:

- scenario: `saas`
- starter: `nextjs-saas-starter`
- capabilities: `["neon"]`

Result:

- status: `invalid`
- error: `Starter nextjs-saas-starter requires capability clerk.`

This confirms that user modifications are not accepted silently when they break deployment requirements.

## Adjustments Made During Validation

### Next.js security warning

Observed:

- initial starter version used `next@15.2.2`
- `npm install` surfaced a security warning

Fix:

- updated all starters to `next@15.2.8`
- reran validation from a clean temp directory

## Commands Used

Plan chain:

```bash
node scripts/run_demo_validation.mjs
node scripts/generate_recommended_plan.mjs --doc assets/demo-docs/saas-mvp.md
node scripts/validate_plan.mjs --plan /tmp/vercel-ship-invalid-plan.json
```

Starter build chain:

```bash
npm install
npm run build
```

Executed in:

- `/tmp/vercel-ship-validation/nextjs-marketing-starter`
- `/tmp/vercel-ship-validation/nextjs-saas-starter`
- `/tmp/vercel-ship-validation/nextjs-blob-upload-starter`

## Current Status

The local validation slice is ready for:

- document-driven demo analysis
- starter recommendation
- user-edit validation
- starter materialization
- local build verification
