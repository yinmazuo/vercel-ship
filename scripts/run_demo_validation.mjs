#!/usr/bin/env node

import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const skillRoot = resolve(dirname(new URL(import.meta.url).pathname), "..");
const docsRoot = join(skillRoot, "assets", "demo-docs");
const startersRoot = join(skillRoot, "assets", "starters");
const tempRoot = resolve("/tmp/vercel-ship-validation");

function runNodeScript(scriptPath, args) {
  const result = spawnSync("node", [scriptPath, ...args], { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(result.stderr || `Script failed: ${scriptPath}`);
  }
  return result.stdout;
}

function main() {
  rmSync(tempRoot, { recursive: true, force: true });
  mkdirSync(tempRoot, { recursive: true });

  const results = [];
  const docNames = readdirSync(docsRoot).filter((name) => name.endsWith(".md")).sort();
  for (const docName of docNames) {
    const docPath = join(docsRoot, docName);
    const generated = JSON.parse(
      runNodeScript(join(skillRoot, "scripts", "generate_recommended_plan.mjs"), ["--doc", docPath])
    );
    const planPath = join(tempRoot, `${docName.replace(/\.md$/, "")}.plan.json`);
    writeFileSync(planPath, `${JSON.stringify(generated.plan, null, 2)}\n`);

    const validation = JSON.parse(
      runNodeScript(join(skillRoot, "scripts", "validate_plan.mjs"), ["--plan", planPath])
    );

    const starterOutputDir = join(tempRoot, generated.plan.starter);
    cpSync(join(startersRoot, generated.plan.starter), starterOutputDir, { recursive: true });

    results.push({
      doc: docPath,
      projectName: generated.plan.projectName,
      starter: generated.plan.starter,
      capabilities: generated.plan.capabilities,
      validation,
      starterOutputDir,
      acceptance: readFileSync(docPath, "utf8").includes("acceptance:")
    });
  }

  process.stdout.write(`${JSON.stringify({ tempRoot, results }, null, 2)}\n`);
}

main();
