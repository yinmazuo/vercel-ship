# Troubleshooting

## `Missing required --owner argument or GITHUB_OWNER/GITHUB_USER env var`

Set the repository owner before running `ship_demo_to_cloud.mjs`.

Example:

```bash
export GITHUB_OWNER=your-github-login
```

## `Required env vars: GITHUB_TOKEN, VERCEL_TOKEN, VERCEL_TEAM_ID`

At least one required variable is missing from your shell. Load `.env.local` again or export the variables manually.

Check quickly:

```bash
env | grep -E '^(GITHUB_TOKEN|GITHUB_OWNER|VERCEL_TOKEN|VERCEL_TEAM_ID|VERCEL_SCOPE)='
```

## `Missing required VERCEL_SCOPE env var or --scope argument`

`provision_resources.mjs` uses Vercel CLI integration commands, so it needs the team slug or scope name in addition to `VERCEL_TEAM_ID`.

Set it with:

```bash
export VERCEL_SCOPE=your-team-slug
```

## GitHub push succeeds but the Vercel deployment does not appear

Check the following:

- the GitHub repository is connected to the intended Vercel project
- the Vercel project was created before publishing starter files
- the default branch in GitHub matches the branch used by the script

Use Vercel MCP or the Vercel dashboard to inspect deployments.

## Deployment returns `401` even though the build succeeded

The deployment may be protected by `Vercel Authentication`.

Use:

- Vercel MCP shareable URL access
- Vercel MCP protected fetch

See [../references/deployment-protection.md](../references/deployment-protection.md).

## Resource provisioning fails for `neon`, `clerk`, or `blob`

Check the following:

- `VERCEL_TOKEN` belongs to an account that can create integrations
- `VERCEL_TEAM_ID` points to the correct Vercel scope
- `VERCEL_SCOPE` matches the team slug or scope name used by Vercel CLI
- the selected free plan is still available in the target account

If the project already has the expected environment variables, the script will skip duplicate provisioning.

## Git commands fail because of a local proxy

If your environment injects `HTTP_PROXY`, `HTTPS_PROXY`, or `ALL_PROXY`, Git may try to use a local proxy that is not available.

Retry without proxy variables:

```bash
env -u HTTPS_PROXY -u HTTP_PROXY -u ALL_PROXY git push origin main
```
