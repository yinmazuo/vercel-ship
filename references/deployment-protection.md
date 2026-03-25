# Deployment Protection Notes

Under current team defaults, a successful deployment does not guarantee anonymous access.

## Expected Behavior

- Vercel project may deploy successfully
- direct anonymous fetch may still return `401 Unauthorized`
- this is often caused by `Vercel Authentication`

## Validation Rule

Treat these as separate checks:

- control-plane success: deployment state is `READY`
- runtime access success: deployment URL or shareable URL returns the expected page content

## Recommended Validation Path

1. Read deployment status from Vercel.
2. Try the main deployment URL.
3. If it returns `401`, obtain a shareable URL through Vercel MCP.
4. Fetch the shareable URL and confirm the page content.
