# Validation Rules

`validate_plan.mjs` should classify results as:

- `valid`
- `valid_with_warnings`
- `invalid`

## Hard Invalid Cases

- `saas` plan without `clerk`
- `saas` plan without `neon`
- `upload` plan without `blob`
- Starter name not found
- Starter scenario does not match plan scenario

## Warning Cases

- `marketing` plan enables `clerk`
- `marketing` plan enables `neon`
- `upload` plan enables both `clerk` and `neon`
- A capability is enabled but the document does not contain a matching signal

## Build Validation Gate

A plan can move into deployment only if:

- starter materialization succeeded
- `npm install` succeeded
- `npm run build` succeeded

For plans with real resources enabled, post-provision validation also requires:

- required project env keys exist
- required integration resources are connected to the intended project
- a fresh deployment runs after env injection
- runtime health checks return success for the enabled capability set

## User Edit Policy

Allow edits to:

- `starter`
- `capabilities`
- `github.repo`
- `vercel.project`
- `deploy.mode`

Reject edits that make the selected starter unable to satisfy the scenario's required capabilities.
