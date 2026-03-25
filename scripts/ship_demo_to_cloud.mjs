#!/usr/bin/env node

import { collectFilesRecursive, loadPlanFromDoc } from "./lib/plan-utils.mjs";
import { basename, join, resolve } from "node:path";
import { existsSync } from "node:fs";

const GITHUB_API = "https://api.github.com";
const VERCEL_API = "https://api.vercel.com";

function parseArgs(argv) {
  const args = {
    doc: null,
    repo: null,
    project: null,
    owner: process.env.GITHUB_OWNER ?? process.env.GITHUB_USER ?? null,
    private: true
  };
  for (let index = 2; index < argv.length; index += 1) {
    const current = argv[index];
    if (current === "--doc") {
      args.doc = argv[index + 1];
      index += 1;
    } else if (current === "--repo") {
      args.repo = argv[index + 1];
      index += 1;
    } else if (current === "--project") {
      args.project = argv[index + 1];
      index += 1;
    } else if (current === "--owner") {
      args.owner = argv[index + 1];
      index += 1;
    } else if (current === "--public") {
      args.private = false;
    }
  }
  if (!args.doc) {
    throw new Error("Missing required --doc argument");
  }
  if (!args.owner) {
    throw new Error("Missing required --owner argument or GITHUB_OWNER/GITHUB_USER env var");
  }
  if (!process.env.GITHUB_TOKEN || !process.env.VERCEL_TOKEN || !process.env.VERCEL_TEAM_ID) {
    throw new Error("Required env vars: GITHUB_TOKEN, VERCEL_TOKEN, VERCEL_TEAM_ID");
  }
  return args;
}

async function request(url, options = {}, parser = "json") {
  const response = await fetch(url, options);
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${options.method ?? "GET"} ${url} failed: ${response.status} ${text}`);
  }
  if (parser === "text") {
    return text;
  }
  return text ? JSON.parse(text) : {};
}

async function findGitHubRepo(owner, repo, token) {
  const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28"
    }
  });
  if (response.status === 404) {
    return null;
  }
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`GET repo failed: ${response.status} ${text}`);
  }
  return text ? JSON.parse(text) : {};
}

async function ensureGitHubRepo(owner, repo, token, isPrivate) {
  const existing = await findGitHubRepo(owner, repo, token);
  if (existing) {
    return existing;
  }
  return request(`${GITHUB_API}/user/repos`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28"
    },
    body: JSON.stringify({
      name: repo,
      private: isPrivate,
      auto_init: true,
      description: "vercel-ship skill validation demo"
    })
  });
}

async function createBlob(owner, repo, token, content) {
  const payload = await request(`${GITHUB_API}/repos/${owner}/${repo}/git/blobs`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28"
    },
    body: JSON.stringify({
      content,
      encoding: "utf-8"
    })
  });
  return payload.sha;
}

async function commitFilesToRepo({ owner, repo, branch, token, message, files }) {
  const ref = await request(`${GITHUB_API}/repos/${owner}/${repo}/git/ref/heads/${branch}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28"
    }
  });
  const baseCommit = await request(`${GITHUB_API}/repos/${owner}/${repo}/git/commits/${ref.object.sha}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28"
    }
  });

  const tree = [];
  for (const file of files) {
    const sha = await createBlob(owner, repo, token, file.content);
    tree.push({
      path: file.path,
      mode: "100644",
      type: "blob",
      sha
    });
  }

  const createdTree = await request(`${GITHUB_API}/repos/${owner}/${repo}/git/trees`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28"
    },
    body: JSON.stringify({
      base_tree: baseCommit.tree.sha,
      tree
    })
  });

  const commit = await request(`${GITHUB_API}/repos/${owner}/${repo}/git/commits`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28"
    },
    body: JSON.stringify({
      message,
      tree: createdTree.sha,
      parents: [ref.object.sha]
    })
  });

  await request(`${GITHUB_API}/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
    method: "PATCH",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28"
    },
    body: JSON.stringify({
      sha: commit.sha,
      force: false
    })
  });

  return commit.sha;
}

async function createOrGetVercelProject({ name, repo, token, teamId }) {
  const existingResponse = await fetch(
    `${VERCEL_API}/v9/projects/${encodeURIComponent(name)}?teamId=${encodeURIComponent(teamId)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  if (existingResponse.ok) {
    return JSON.parse(await existingResponse.text());
  }
  if (existingResponse.status !== 404) {
    throw new Error(`Vercel project lookup failed: ${existingResponse.status} ${await existingResponse.text()}`);
  }

  return request(`${VERCEL_API}/v11/projects?teamId=${encodeURIComponent(teamId)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name,
      framework: "nextjs",
      gitRepository: {
        type: "github",
        repo
      }
    })
  });
}

async function main() {
  const args = parseArgs(process.argv);
  const { plan } = loadPlanFromDoc(args.doc);
  const starterDir = resolve(new URL("../assets/starters/", import.meta.url).pathname, plan.starter);
  if (!existsSync(starterDir)) {
    throw new Error(`Starter directory not found for ${plan.starter}`);
  }

  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const slugBase = plan.projectName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const repoName = args.repo ?? `vercel-ship-${slugBase}-${stamp}`;
  const projectName = args.project ?? repoName;

  const repoInfo = await ensureGitHubRepo(args.owner, repoName, process.env.GITHUB_TOKEN, args.private);
  const branch = repoInfo.default_branch || "main";

  const vercelProject = await createOrGetVercelProject({
    name: projectName,
    repo: `${args.owner}/${repoName}`,
    token: process.env.VERCEL_TOKEN,
    teamId: process.env.VERCEL_TEAM_ID
  });

  const files = collectFilesRecursive(starterDir);
  const commitSha = await commitFilesToRepo({
    owner: args.owner,
    repo: repoName,
    branch,
    token: process.env.GITHUB_TOKEN,
    message: `feat: add ${basename(args.doc, ".md")} starter via vercel-ship`,
    files
  });

  process.stdout.write(
    `${JSON.stringify(
      {
        plan,
        repo: {
          owner: args.owner,
          name: repoName,
          url: `https://github.com/${args.owner}/${repoName}`,
          branch,
          commitSha
        },
        vercel: {
          projectId: vercelProject.id,
          name: vercelProject.name
        }
      },
      null,
      2
    )}\n`
  );
}

main();
