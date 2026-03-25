#!/usr/bin/env node

import { readFileSync } from "node:fs";

const STARTER_RULES = {
  "nextjs-marketing-starter": { scenario: "marketing", required: [], optional: ["edge-config"] },
  "nextjs-saas-starter": { scenario: "saas", required: ["clerk", "neon"], optional: ["edge-config"] },
  "nextjs-blob-upload-starter": { scenario: "upload", required: ["blob"], optional: ["clerk"] }
};

function parseArgs(argv) {
  const args = { plan: null };
  for (let index = 2; index < argv.length; index += 1) {
    if (argv[index] === "--plan") {
      args.plan = argv[index + 1];
      index += 1;
    }
  }
  if (!args.plan) {
    throw new Error("Missing required --plan argument");
  }
  return args;
}

function validate(plan) {
  const starterRule = STARTER_RULES[plan.starter];
  const warnings = [];
  const errors = [];

  if (!starterRule) {
    errors.push(`Unknown starter: ${plan.starter}`);
  } else {
    if (starterRule.scenario !== plan.scenario) {
      errors.push(`Starter ${plan.starter} does not match scenario ${plan.scenario}.`);
    }
    for (const capability of starterRule.required) {
      if (!plan.capabilities.includes(capability)) {
        errors.push(`Starter ${plan.starter} requires capability ${capability}.`);
      }
    }
    if (plan.scenario === "marketing") {
      if (plan.capabilities.includes("clerk")) {
        warnings.push("Marketing scenario rarely needs auth in v1.");
      }
      if (plan.capabilities.includes("neon")) {
        warnings.push("Marketing scenario rarely needs a relational database in v1.");
      }
    }
    if (plan.scenario === "upload" && plan.capabilities.includes("neon")) {
      warnings.push("Upload scenario enables a database even though the v1 demo does not require it.");
    }
  }

  const status = errors.length > 0 ? "invalid" : warnings.length > 0 ? "valid_with_warnings" : "valid";
  return { status, errors, warnings };
}

function main() {
  const { plan } = parseArgs(process.argv);
  const payload = JSON.parse(readFileSync(plan, "utf8"));
  const result = validate(payload.plan ?? payload);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

main();
