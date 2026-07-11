#!/usr/bin/env node
// Local test harness for Widgy "JavaScript" text-data scripts.
//
// Widgy's editor gives you a script's *body* — you never write your own
// `function main() { ... }` wrapper. Instead it wraps whatever you type in
// a function it calls for you, then displays whatever you `return`:
//   - "async" mode  -> your code runs inside an async function (top-level
//                      `await fetch(...)` works).
//   - "script" mode -> your code runs inside a plain sync function.
//
// This runner reproduces that by reading the target file as raw text and
// wrapping it the same way, so you can iterate on a widget script from a
// normal editor/terminal before pasting it into the app.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const [, , scriptPath, ...rest] = process.argv;

if (!scriptPath) {
  console.error("Usage: node runner.js <script.js> [--mode async|script]");
  process.exit(1);
}

const modeFlagIndex = rest.indexOf("--mode");
const mode = modeFlagIndex !== -1 ? rest[modeFlagIndex + 1] : "async";

if (mode !== "async" && mode !== "script") {
  console.error(`Unknown mode "${mode}", expected "async" or "script"`);
  process.exit(1);
}

const source = fs.readFileSync(path.resolve(scriptPath), "utf8");

// Only the globals Widgy is known to expose get into the sandbox — this
// keeps the test environment honest about what a pasted script can rely on.
const sandbox = {
  console,
  fetch,
  btoa: (str) => Buffer.from(str, "binary").toString("base64"),
  atob: (str) => Buffer.from(str, "base64").toString("binary"),
};
vm.createContext(sandbox);

const wrapped =
  mode === "script"
    ? `(function () {\n${source}\n})()`
    : `(async function () {\n${source}\n})()`;

Promise.resolve(vm.runInContext(wrapped, sandbox, { filename: path.resolve(scriptPath) }))
  .then((value) => {
    console.log(`\n--- Widgy text output (${mode} mode) ---`);
    console.log(typeof value === "string" ? value : JSON.stringify(value, null, 2));
  })
  .catch((err) => {
    console.error(`\nScript threw in ${mode} mode:`, err);
    process.exitCode = 1;
  });
