#!/usr/bin/env node

import { loadPlanFromDoc } from "./lib/plan-utils.mjs";

function parseArgs(argv) {
  const args = { doc: null };
  for (let index = 2; index < argv.length; index += 1) {
    if (argv[index] === "--doc") {
      args.doc = argv[index + 1];
      index += 1;
    }
  }
  if (!args.doc) {
    throw new Error("Missing required --doc argument");
  }
  return args;
}

function main() {
  const { doc } = parseArgs(process.argv);
  process.stdout.write(`${JSON.stringify(loadPlanFromDoc(doc), null, 2)}\n`);
}

main();
