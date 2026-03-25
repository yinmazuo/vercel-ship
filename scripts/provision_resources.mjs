#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const vercelCli = join(repoRoot, "node_modules", ".bin", "vercel");
const vercelApi = "https://api.vercel.com";

function parseArgs(argv) {
  const args = {
    projectId: null,
    projectName: null,
    scope: process.env.VERCEL_SCOPE ?? null,
    capabilities: [],
    edgeConfigId: null
  };

  for (let index = 2; index < argv.length; index += 1) {
    const current = argv[index];
    if (current === "--project-id") {
      args.projectId = argv[index + 1];
      index += 1;
    } else if (current === "--project-name") {
      args.projectName = argv[index + 1];
      index += 1;
    } else if (current === "--scope") {
      args.scope = argv[index + 1];
      index += 1;
    } else if (current === "--capability") {
      args.capabilities.push(argv[index + 1]);
      index += 1;
    } else if (current === "--edge-config-id") {
      args.edgeConfigId = argv[index + 1];
      index += 1;
    }
  }

  if (!args.projectId || !args.projectName) {
    throw new Error("Missing required --project-id or --project-name");
  }

  if (!process.env.VERCEL_TOKEN || !process.env.VERCEL_TEAM_ID) {
    throw new Error("Required env vars: VERCEL_TOKEN and VERCEL_TEAM_ID");
  }

  if (!args.scope) {
    throw new Error("Missing required VERCEL_SCOPE env var or --scope argument");
  }

  return args;
}

function runCommand(command, { cwd, interactiveInput } = {}) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn("/bin/zsh", ["-lc", command], {
      cwd,
      env: {
        ...process.env,
        HOME: "/tmp/vercel-ship-cli-home",
        XDG_CONFIG_HOME: "/tmp/vercel-ship-cli-config",
        VERCEL_ORG_ID: process.env.VERCEL_TEAM_ID,
        VERCEL_PROJECT_ID: process.env.VERCEL_PROJECT_ID ?? ""
      },
      stdio: ["pipe", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      stdout += text;
      if (interactiveInput) {
        interactiveInput(text, child.stdin);
      }
    });

    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      stderr += text;
      if (interactiveInput) {
        interactiveInput(text, child.stdin);
      }
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolvePromise({ stdout, stderr });
      } else {
        rejectPromise(new Error(`${command}\n${stdout}\n${stderr}`));
      }
    });
  });
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${options.method ?? "GET"} ${url} failed: ${response.status} ${text}`);
  }
  return text ? JSON.parse(text) : {};
}

async function getIntegrationResources(projectName, scope) {
  const command =
    `${vercelCli} integration list ${projectName}` +
    ` --scope ${scope} --token "$VERCEL_TOKEN" --format=json`;
  const { stdout } = await runCommand(command, { cwd: repoRoot });
  const json = JSON.parse(stdout.slice(stdout.indexOf("{")));
  return json.resources ?? [];
}

async function getProjectEnvKeys(projectDir, scope) {
  const command =
    `${vercelCli} env ls` +
    ` --scope ${scope} --token "$VERCEL_TOKEN" --format=json`;
  const { stdout } = await runCommand(command, { cwd: projectDir });
  const json = JSON.parse(stdout.slice(stdout.indexOf("{")));
  return new Set((json.envs ?? []).map((entry) => entry.key));
}

function toEdgeConfigSlug(projectName) {
  const slug = `${projectName}-flags`
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug.slice(0, 32).replace(/-+$/g, "") || "demo-flags";
}

async function listEdgeConfigs(teamId, token) {
  const payload = await requestJson(`${vercelApi}/v1/edge-config?teamId=${encodeURIComponent(teamId)}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return payload.edgeConfigs ?? [];
}

function formatEdgeConfigChoices(edgeConfigs) {
  if (edgeConfigs.length === 0) {
    return "No existing Edge Configs found.";
  }

  return edgeConfigs.map((entry) => `- ${entry.slug} (${entry.id})`).join("\n");
}

async function upsertProjectEnv({ projectId, key, value }) {
  return requestJson(
    `${vercelApi}/v10/projects/${encodeURIComponent(projectId)}/env?teamId=${encodeURIComponent(process.env.VERCEL_TEAM_ID)}&upsert=true`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify([
        {
          key,
          value,
          type: "sensitive",
          target: ["production", "preview"]
        }
      ])
    }
  );
}

async function provisionEdgeConfig({ projectId, projectName, scope, edgeConfigId }) {
  const envKeys = await getProjectEnvKeys(ensureLinkedTempDir(projectId), scope);
  if (envKeys.has("EDGE_CONFIG")) {
    return { skipped: true, key: "EDGE_CONFIG" };
  }

  const edgeConfigs = await listEdgeConfigs(process.env.VERCEL_TEAM_ID, process.env.VERCEL_TOKEN);
  let edgeConfig = null;

  if (edgeConfigId) {
    edgeConfig = edgeConfigs.find((entry) => entry.id === edgeConfigId);
    if (!edgeConfig) {
      throw new Error(
        [
          `Requested Edge Config not found: ${edgeConfigId}`,
          "Available Edge Configs:",
          formatEdgeConfigChoices(edgeConfigs)
        ].join("\n")
      );
    }
  } else {
    const slug = toEdgeConfigSlug(projectName);
    edgeConfig = edgeConfigs.find((entry) => entry.slug === slug) ?? null;

    if (!edgeConfig) {
      if (edgeConfigs.length > 0) {
        throw new Error(
          [
            `Cannot create a new Edge Config for ${projectName}: account limit reached.`,
            "Choose one of the existing Edge Configs to reuse explicitly, or delete an old one first.",
            "Existing Edge Configs:",
            formatEdgeConfigChoices(edgeConfigs),
            `If you want to reuse one explicitly, rerun with --edge-config-id <id>.`
          ].join("\n")
        );
      }

      edgeConfig = await requestJson(
        `${vercelApi}/v1/edge-config?teamId=${encodeURIComponent(process.env.VERCEL_TEAM_ID)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ slug })
        }
      );
    }
  }

  const tokenPayload = await requestJson(
    `${vercelApi}/v1/edge-config/${encodeURIComponent(edgeConfig.id)}/token?teamId=${encodeURIComponent(process.env.VERCEL_TEAM_ID)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ label: `${edgeConfig.slug}-read` })
    }
  );

  const connectionString = `https://edge-config.vercel.com/${edgeConfig.id}?token=${tokenPayload.token}`;
  await upsertProjectEnv({
    projectId,
    key: "EDGE_CONFIG",
    value: connectionString
  });

  return {
    skipped: false,
    edgeConfigId: edgeConfig.id,
    slug: edgeConfig.slug
  };
}

function ensureLinkedTempDir(projectId) {
  const dir = resolve(`/tmp/vercel-ship-link-${projectId}`);
  mkdirSync(join(dir, ".vercel"), { recursive: true });
  writeFileSync(
    join(dir, ".vercel", "project.json"),
    `${JSON.stringify({ projectId, orgId: process.env.VERCEL_TEAM_ID })}\n`
  );
  return dir;
}

async function provisionNeon({ projectName, scope }) {
  const resources = await getIntegrationResources(projectName, scope);
  const existing = resources.find((resource) => resource.product === "Neon");
  if (existing) {
    return { skipped: true, resource: existing };
  }

  const command =
    `${vercelCli} integration add neon` +
    ` --scope ${scope} --token "$VERCEL_TOKEN" --plan free_v3 --name ${projectName}-neon` +
    ` --format=json --no-env-pull -m region=iad1 -e production -e preview`;
  const { stdout } = await runCommand(command, { cwd: repoRoot });
  return JSON.parse(stdout.slice(stdout.indexOf("{")));
}

async function provisionClerk({ projectName, scope }) {
  const resources = await getIntegrationResources(projectName, scope);
  const existing = resources.find((resource) => resource.product === "Clerk");
  if (existing) {
    return { skipped: true, resource: existing };
  }

  const command =
    `${vercelCli} integration add clerk` +
    ` --scope ${scope} --token "$VERCEL_TOKEN" --plan free_2022_06 --name ${projectName}-clerk` +
    ` --format=json --no-env-pull -e production -e preview`;
  const { stdout } = await runCommand(command, { cwd: repoRoot });
  return JSON.parse(stdout.slice(stdout.indexOf("{")));
}

async function provisionBlob({ projectId, projectName, scope }) {
  const linkedDir = ensureLinkedTempDir(projectId);
  const envKeys = await getProjectEnvKeys(linkedDir, scope);
  if (envKeys.has("BLOB_READ_WRITE_TOKEN")) {
    return { skipped: true, key: "BLOB_READ_WRITE_TOKEN" };
  }

  let answeredLinkPrompt = false;
  let answeredEnvironmentPrompt = false;

  const command =
    `${vercelCli} blob create-store ${projectName}-blob` +
    ` --scope ${scope} --token "$VERCEL_TOKEN"`;
  const { stdout } = await runCommand(command, {
    cwd: linkedDir,
    interactiveInput(text, stdin) {
      if (!answeredLinkPrompt && text.includes("Would you like to link this blob store")) {
        stdin.write("y\n");
        answeredLinkPrompt = true;
      }
      if (!answeredEnvironmentPrompt && text.includes("Select environments")) {
        stdin.write("\n");
        answeredEnvironmentPrompt = true;
      }
    }
  });

  return {
    skipped: false,
    output: stdout
  };
}

async function main() {
  const args = parseArgs(process.argv);
  process.env.VERCEL_PROJECT_ID = args.projectId;
  const results = {};

  for (const capability of args.capabilities) {
    if (capability === "neon") {
      results.neon = await provisionNeon(args);
    } else if (capability === "clerk") {
      results.clerk = await provisionClerk(args);
    } else if (capability === "blob") {
      results.blob = await provisionBlob(args);
    } else if (capability === "edge-config") {
      results.edgeConfig = await provisionEdgeConfig(args);
    }
  }

  const linkedDir = ensureLinkedTempDir(args.projectId);
  results.envKeys = [...(await getProjectEnvKeys(linkedDir, args.scope))].sort();
  process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
}

main();
