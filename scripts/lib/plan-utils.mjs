import { readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join, resolve } from "node:path";

export function parseScenarioDoc(content) {
  const facts = {};
  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (!line.startsWith("- ")) {
      continue;
    }
    const separator = line.indexOf(":");
    if (separator === -1) {
      continue;
    }
    const key = line.slice(2, separator).trim();
    const value = line.slice(separator + 1).trim();
    facts[key] = value;
  }
  return facts;
}

export function inferScenarioFromFacts(facts) {
  const body = Object.values(facts).join(" ").toLowerCase();
  if (body.includes("upload") || body.includes("gallery")) {
    return "upload";
  }
  if (body.includes("dashboard") || body.includes("sign in")) {
    return "saas";
  }
  return "marketing";
}

export function buildPlan(facts, docPath) {
  const scenario = facts.scenario ?? inferScenarioFromFacts(facts);
  const capabilities = [];
  const reasons = [];

  let starter = "nextjs-marketing-starter";
  if (scenario === "saas") {
    starter = "nextjs-saas-starter";
    capabilities.push("clerk", "neon");
    reasons.push("Detected dashboard-style SaaS requirements with auth and relational data.");
  } else if (scenario === "upload") {
    starter = "nextjs-blob-upload-starter";
    capabilities.push("blob");
    reasons.push("Detected upload workflow and public file listing requirements.");
    if (facts.auth === "required") {
      capabilities.push("clerk");
      reasons.push("Document says uploads belong to signed-in users.");
    }
  } else {
    starter = "nextjs-marketing-starter";
    reasons.push("Detected a content-first marketing scenario.");
  }

  if (facts.feature_flags === "yes") {
    capabilities.push("edge-config");
    reasons.push("Document requests runtime flags or maintenance toggles.");
  }

  return {
    projectName: facts.project_name ?? basename(docPath, ".md"),
    source: {
      type: "demo-doc",
      path: resolve(docPath)
    },
    scenario,
    starter,
    planTier: facts.free_default === "yes" ? "free-default" : "review-required",
    capabilities: [...new Set(capabilities)],
    assumptions: [
      "First version uses Next.js starters only.",
      "Plan must pass local starter build validation before cloud deployment.",
      "Cloud resources are created only after user approval."
    ],
    reasons
  };
}

export function loadPlanFromDoc(docPath) {
  const content = readFileSync(docPath, "utf8");
  const facts = parseScenarioDoc(content);
  return { facts, plan: buildPlan(facts, docPath) };
}

export function collectFilesRecursive(rootDir, currentDir = rootDir) {
  const entries = [];
  for (const name of readdirSync(currentDir)) {
    const abs = join(currentDir, name);
    const relative = abs.slice(rootDir.length + 1);
    const stats = statSync(abs);
    if (stats.isDirectory()) {
      entries.push(...collectFilesRecursive(rootDir, abs));
      continue;
    }
    entries.push({
      path: relative,
      content: readFileSync(abs, "utf8")
    });
  }
  return entries.sort((left, right) => left.path.localeCompare(right.path));
}
