#!/usr/bin/env node

import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

function parseArgs(argv) {
  const args = { starter: null, out: null };
  for (let index = 2; index < argv.length; index += 1) {
    if (argv[index] === "--starter") {
      args.starter = argv[index + 1];
      index += 1;
    } else if (argv[index] === "--out") {
      args.out = argv[index + 1];
      index += 1;
    }
  }
  if (!args.starter || !args.out) {
    throw new Error("Missing required --starter or --out argument");
  }
  return args;
}

function main() {
  const { starter, out } = parseArgs(process.argv);
  const sourceDir = resolve(new URL("../assets/starters/", import.meta.url).pathname, starter);
  const outputDir = resolve(out);
  if (!existsSync(sourceDir)) {
    throw new Error(`Starter not found: ${starter}`);
  }
  mkdirSync(dirname(outputDir), { recursive: true });
  cpSync(sourceDir, outputDir, { recursive: true });
  process.stdout.write(`${outputDir}\n`);
}

main();
