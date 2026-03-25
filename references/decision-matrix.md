# Decision Matrix

The first version supports 3 scenarios and 4 common capability groups only.

## Supported Capabilities

- `blob`
- `edge-config`
- `neon`
- `clerk`

## Default Rules

### marketing

Signals:

- content site
- landing page
- about / contact
- announcement or campaign toggles

Recommended starter:

- `nextjs-marketing-starter`

Recommended capabilities:

- `edge-config` only when the document mentions feature flags, announcements, redirects, or maintenance mode

### saas

Signals:

- user login
- dashboard
- relational data
- profile / workspace / team

Recommended starter:

- `nextjs-saas-starter`

Recommended capabilities:

- `neon`
- `clerk`
- `edge-config` only when the document mentions feature flags, maintenance mode, or runtime config

Provisioning defaults:

- `neon` -> `free_v3`, region `iad1`
- `clerk` -> `free_2022_06`

### upload

Signals:

- upload
- image
- avatar
- file
- gallery

Recommended starter:

- `nextjs-blob-upload-starter`

Recommended capabilities:

- `blob`
- optional `clerk` when the document explicitly says signed-in users own uploaded files

Provisioning defaults:

- `blob` -> public store, default region `iad1`

## Free-Default Policy

- Prefer capability sets that have a free starting path.
- Do not recommend paid-only paths in v1.
- If a requested combination needs a higher-cost path, mark it as a blocker rather than silently choosing it.

## First-Version Limits

- No production database migration
- No custom domain automation
- No enterprise SSO
- No monorepo routing
- No non-Next.js starter in v1
