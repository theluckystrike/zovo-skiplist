#!/usr/bin/env node
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  cpSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  utimesSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { isAbsolute, join, relative, resolve } from "node:path";

const source = resolve(process.argv[2] || "dist");
const output = resolve(process.argv[3] || "Zovo-SkipList.zip");
if (!statSync(source).isDirectory()) throw new Error(`not a directory: ${source}`);

const stage = mkdtempSync(join(tmpdir(), "zovo-skiplist-package-"));
cpSync(source, stage, { recursive: true });
const fixedTime = new Date("1980-01-01T00:00:00.000Z");
const files = [];
const walk = (directory) => {
  const entries = readdirSync(directory).sort((a, b) => a.localeCompare(b, "en"));
  for (const name of entries) {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) {
      chmodSync(path, 0o755);
      walk(path);
      utimesSync(path, fixedTime, fixedTime);
    } else {
      chmodSync(path, 0o644);
      utimesSync(path, fixedTime, fixedTime);
      files.push(relative(stage, path).split("\\").join("/"));
    }
  }
};
walk(stage);
files.sort((a, b) => a.localeCompare(b, "en"));

rmSync(output, { force: true });
const zip = spawnSync("zip", ["-X", "-q", output, ...files], {
  cwd: stage,
  encoding: "utf8",
});
if (zip.status !== 0) throw new Error(zip.stderr || `zip exited ${zip.status}`);
const bytes = readFileSync(output);
const sha256 = createHash("sha256").update(bytes).digest("hex");
rmSync(stage, { recursive: true, force: true });
process.stdout.write(`${sha256}  ${isAbsolute(output) ? output : resolve(output)}\n`);
