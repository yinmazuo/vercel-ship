#!/usr/bin/env node

import { readFileSync } from "node:fs";

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

function render(plan) {
  return `# Approval Plan

- project: ${plan.projectName}
- scenario: ${plan.scenario}
- starter: ${plan.starter}
- plan_tier: ${plan.planTier}
- capabilities: ${plan.capabilities.length > 0 ? plan.capabilities.join(", ") : "none"}

## Reasons

${plan.reasons.map((reason) => `- ${reason}`).join("\n")}

## Assumptions

${plan.assumptions.map((assumption) => `- ${assumption}`).join("\n")}

## Approval Gate

- approve if this starter and capability set matches the intended scenario
- edit the plan only if the modified capability set still satisfies validation rules
- cloud mutations begin only after approval
`;
}

function main() {
  const { plan } = parseArgs(process.argv);
  const payload = JSON.parse(readFileSync(plan, "utf8"));
  const content = render(payload.plan ?? payload);
  process.stdout.write(content);
}

main();
